import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'
import TrustBadge from './TrustBadge'
import { CATEGORIES, catOf, endOf, fmtDate, fmtTime, inr, matchesArea, startOf, todayStr } from '../constants'

const selectCls =
    'appearance-none bg-surface-container-low text-on-surface-variant pl-3 pr-8 py-1.5 rounded-lg hover:bg-surface-container focus:outline-none cursor-pointer'

function Select({ value, onChange, children }) {
    return (
        <div className="relative inline-flex items-center">
            <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
                {children}
            </select>
            <Icon name="expand_more" className="text-outline text-sm absolute right-2 pointer-events-none" />
        </div>
    )
}

export default function ExploreGigs({ goToApps }) {
    const { user, profile } = useAuth()
    const [gigs, setGigs] = useState([])
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [cat, setCat] = useState('all')
    const [pay, setPay] = useState('all')
    const [dur, setDur] = useState('all')
    const [timing, setTiming] = useState('all')

    // Area comes from the location dropdown in the page header (saved on the profile)
    const area = profile.area ?? 'all'

    useEffect(() => {
        const q = query(collection(db, 'gigs'), where('status', '==', 'open'))
        return onSnapshot(
            q,
            (snap) => {
                setGigs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
                setLoading(false)
            },
            (err) => {
                console.error(err)
                setLoading(false)
            }
        )
    }, [])

    useEffect(() => {
        const q = query(collection(db, 'applications'), where('workerId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error(err)
        )
    }, [user.uid])

    const today = todayStr()

    const upcoming = useMemo(
        () =>
            gigs
                .filter((g) => (g.date ?? '') >= today)
                .sort((a, b) => (startOf(a)?.getTime() ?? 9e15) - (startOf(b)?.getTime() ?? 9e15)),
        [gigs, today]
    )

    const urgentCount = upcoming.filter((g) => g.date === today).length

    const visible = useMemo(() => {
        const s = search.trim().toLowerCase()
        return upcoming.filter((g) => {
            if (cat === 'today' && g.date !== today) return false
            if (cat !== 'all' && cat !== 'today' && g.category !== cat) return false
            if (
                s &&
                !`${g.title} ${g.description} ${g.posterName} ${g.location} ${g.category}`.toLowerCase().includes(s)
            )
                return false
            if (!matchesArea(g, area)) return false
            if (pay !== 'all' && g.hourlyRate < Number(pay)) return false
            if (dur === 'short' && g.maxHours > 4) return false
            if (dur === 'long' && g.maxHours < 5) return false
            const hour = Number((g.startTime ?? '0').split(':')[0])
            if (timing === 'morning' && hour >= 12) return false
            if (timing === 'evening' && hour < 16) return false
            if (timing === 'weekend') {
                const day = new Date(`${g.date}T00:00`).getDay()
                if (day !== 0 && day !== 6) return false
            }
            return true
        })
    }, [upcoming, cat, search, area, pay, dur, timing, today])

    const appliedIds = new Set(apps.map((a) => a.gigId))
    const pending = apps.filter((a) => a.status === 'pending').length
    const accepted = apps.filter((a) => a.status === 'accepted').length

    const apply = async (g) => {
        try {
            await setDoc(doc(db, 'applications', `${g.id}_${user.uid}`), {
                gigId: g.id,
                gigTitle: g.title,
                posterId: g.posterId,
                posterName: g.posterName,
                workerId: user.uid,
                workerName: profile.name,
                status: 'pending',
                createdAt: serverTimestamp(),
            })
        } catch (err) {
            alert('Could not apply: ' + err.message)
        }
    }

    const clearFilters = () => {
        setSearch('')
        setCat('all')
        setPay('all')
        setDur('all')
        setTiming('all')
    }

    const chips = [
        ['all', '✨ All Gigs', upcoming.length],
        ['today', '🔥 Urgent Today', urgentCount],
        ...CATEGORIES.map((c) => [c.name, `${c.emoji} ${c.label}`, null]),
    ]

    return (
        <div className="w-full">
            {/* Command & filter panel */}
            <section className="pb-space-lg">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md lg:p-space-lg flex flex-col gap-space-md">
                    {/* Search */}
                    <div className="relative flex items-center">
                        <Icon name="search" className="absolute left-4 text-outline text-xl" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search gigs (e.g. cafe helper, puja stall, tutoring)..."
                            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                        />
                    </div>

                    {/* Category chips */}
                    <div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-0.5">
                        {chips.map(([key, label, count]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCat(key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-button-text text-button-text whitespace-nowrap transition-all ${cat === key
                                        ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                                    }`}
                            >
                                <span>{label}</span>
                                {count !== null && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest/80 text-on-secondary-container font-label-badge text-label-badge">
                                        {count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Dropdown filters */}
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs text-body-sm font-body-sm">
                        <div className="flex flex-wrap items-center gap-space-xs">
                            <Select value={pay} onChange={setPay}>
                                <option value="all">Pay Rate: All</option>
                                <option value="150">₹150+ / hr</option>
                                <option value="200">₹200+ / hr</option>
                                <option value="300">₹300+ / hr</option>
                            </Select>
                            <Select value={dur} onChange={setDur}>
                                <option value="all">Duration: Any</option>
                                <option value="short">2 - 4 hrs (Micro shift)</option>
                                <option value="long">Long shift (5+ hrs)</option>
                            </Select>
                            <Select value={timing} onChange={setTiming}>
                                <option value="all">Timing: Flexible</option>
                                <option value="morning">Morning (Before 12 PM)</option>
                                <option value="evening">Evening (From 4 PM)</option>
                                <option value="weekend">Weekend Only</option>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 text-outline">
                            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                            <span className="text-on-surface-variant font-medium">
                                {visible.length} live gig{visible.length === 1 ? '' : 's'} right now
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feed + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                {/* Gig feed */}
                <div className="lg:col-span-8 flex flex-col gap-space-md">
                    {loading ? (
                        <span className="loading loading-spinner loading-md" />
                    ) : visible.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm text-center">
                            <Icon name="inbox" className="text-5xl text-outline" />
                            <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No gigs match right now</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                Try clearing your filters, or pick "All Siliguri areas" in the location dropdown.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="mt-space-md px-space-md py-2 rounded-xl bg-surface-container text-primary font-button-text text-button-text hover:bg-surface-container-high"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        visible.map((g) => {
                            const c = catOf(g.category)
                            const start = startOf(g)
                            const end = endOf(g)
                            const urgent = g.date === today
                            const spots = g.spots ?? 1
                            const filled = g.acceptedCount ?? 0
                            const total = g.hourlyRate * g.maxHours
                            const applied = appliedIds.has(g.id)

                            return (
                                <article
                                    key={g.id}
                                    className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-all p-space-md lg:p-space-lg relative overflow-hidden group"
                                >
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>

                                    <div className="flex flex-col gap-space-md relative z-10">
                                        {/* Pills */}
                                        <div className="flex flex-wrap items-center gap-space-xs">
                                            <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-badge text-label-badge flex items-center gap-1">
                                                <Icon name={c.icon} className="text-xs" /> {c.emoji} {c.label}
                                            </span>
                                            {urgent ? (
                                                <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-badge text-label-badge font-bold flex items-center gap-1">
                                                    <Icon name="local_fire_department" className="text-xs" />
                                                    URGENT: Today, {fmtTime(start)} - {fmtTime(end)}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-badge text-label-badge flex items-center gap-1">
                                                    <Icon name="schedule" className="text-xs" />
                                                    {fmtDate(start)}, {fmtTime(start)} - {fmtTime(end)} ({g.maxHours} hrs)
                                                </span>
                                            )}
                                        </div>

                                        {/* Title + poster */}
                                        <div className="space-y-1">
                                            <h2 className="font-headline-md text-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">
                                                {g.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-space-sm pt-1 text-on-surface-variant font-body-sm text-body-sm">
                                                <TrustBadge userId={g.posterId} name={g.posterName} />
                                                <span className="text-outline">•</span>
                                                <div className="flex items-center gap-1 text-outline">
                                                    <Icon name="location_on" className="text-xs" />
                                                    <span>{g.location}</span>
                                                </div>
                                            </div>
                                            <p className="font-body-md text-body-md text-on-surface-variant pt-2">{g.description}</p>
                                        </div>

                                        {/* Pay + apply */}
                                        <div className="pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-low/60 p-space-md rounded-xl">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-label-currency-lg text-label-currency-lg text-secondary font-extrabold">
                                                        {inr(total)}
                                                    </span>
                                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                        / shift ({inr(g.hourlyRate)}/hr)
                                                    </span>
                                                </div>
                                                {g.perks?.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                        {g.perks.map((p) => (
                                                            <span
                                                                key={p}
                                                                className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-badge text-label-badge font-bold"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-space-sm">
                                                <div className="text-right hidden sm:block">
                                                    <div
                                                        className={`font-label-badge text-label-badge font-semibold ${filled > 0 ? 'text-error' : 'text-on-surface-variant'
                                                            }`}
                                                    >
                                                        {filled} of {spots} spot{spots > 1 ? 's' : ''} filled
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="bg-error h-full rounded-full"
                                                            style={{ width: `${Math.min(100, (filled / spots) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {applied ? (
                                                    <span className="px-space-md py-3 rounded-xl bg-surface-container text-tertiary font-button-text text-button-text font-bold flex items-center gap-1.5">
                                                        <Icon name="check_circle" fill className="text-lg" /> Applied
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => apply(g)}
                                                        className="px-space-md py-3 rounded-xl bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-container font-button-text text-button-text font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                                                    >
                                                        <Icon name="bolt" className="text-lg" />
                                                        <span>Apply in 1-Click</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-24">
                    {/* Profile trust */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md">
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.verified ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container text-outline'
                                    }`}
                            >
                                <Icon name="verified_user" className="text-2xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                    {profile.verified ? 'Verified Student' : 'Not verified yet'}
                                </span>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                    {profile.ratingCount > 0
                                        ? `⭐ ${profile.rating} from ${profile.ratingCount} rating${profile.ratingCount > 1 ? 's' : ''}`
                                        : 'No ratings yet. Finish a gig to earn your first.'}
                                </p>
                                <div
                                    className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md ${profile.verified
                                            ? 'text-tertiary bg-tertiary-fixed/30'
                                            : 'text-secondary bg-secondary-fixed/40'
                                        }`}
                                >
                                    <Icon name="shield" className="text-xs" />
                                    <span>{profile.verified ? 'Posters see your Verified badge' : 'Get verified to win more gigs'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md relative overflow-hidden">
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Your Activity</span>
                            <span className="px-2 py-0.5 rounded bg-surface-container font-label-badge text-label-badge text-primary font-bold">
                                Live
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="font-label-currency-lg text-label-currency-lg text-on-surface font-extrabold tracking-tight">
                                {apps.length}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">applications sent</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-surface-container-low rounded-xl py-2">
                                <div className="font-label-currency-md text-label-currency-md text-secondary font-extrabold">
                                    {pending}
                                </div>
                                <div className="font-body-sm text-body-sm text-on-surface-variant">Under review</div>
                            </div>
                            <div className="bg-surface-container-low rounded-xl py-2">
                                <div className="font-label-currency-md text-label-currency-md text-tertiary font-extrabold">
                                    {accepted}
                                </div>
                                <div className="font-body-sm text-body-sm text-on-surface-variant">Accepted</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={goToApps}
                            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-tertiary-container hover:bg-tertiary text-on-tertiary font-button-text text-button-text font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Icon name="assignment" className="text-lg" />
                            <span>View My Applications</span>
                        </button>
                    </div>

                    {/* Safety tips */}
                    <div className="bg-surface-container-low rounded-2xl p-space-md space-y-2">
                        <div className="flex items-center gap-2 text-on-surface">
                            <Icon name="lightbulb" className="text-secondary text-lg" />
                            <span className="font-headline-sm text-headline-sm font-bold">Stay Safe on Gigs</span>
                        </div>
                        <ul className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed list-disc pl-4 space-y-1">
                            <li>Check the poster's Verified badge and ratings first.</li>
                            <li>Meet at public, well-known places and tell a friend where you are going.</li>
                            <li>Never pay anything upfront to take a gig.</li>
                            <li>Confirm pay and hours match the listing before you start.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    )
}