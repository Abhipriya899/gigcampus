import { useEffect, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'
import { AREAS, CATEGORIES, PERKS, todayStr, inr } from '../constants'

const DURATIONS = [
    [2, '2 hours'],
    [3, '3 hours'],
    [4, '4 hours'],
    [6, '6 hours'],
    [8, '8 hours (Full day)'],
]

const empty = () => ({
    title: '',
    category: CATEGORIES[0].name,
    description: '',
    date: todayStr(),
    startTime: '',
    maxHours: 4,
    location: '',
    hourlyRate: 150,
    spots: 1,
    perks: [],
})

const inputCls =
    'w-full py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-sm'

export default function PostGigForm({ onPosted }) {
    const { user, profile } = useAuth()
    const [form, setForm] = useState(() => ({
        ...empty(),
        area: profile.area && profile.area !== 'all' ? profile.area : AREAS[0],
    }))
    const [busy, setBusy] = useState(false)
    const [toast, setToast] = useState(null)

    // Follow the location dropdown in the page header
    useEffect(() => {
        if (profile.area && profile.area !== 'all') {
            setForm((f) => ({ ...f, area: profile.area }))
        }
    }, [profile.area])

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
    const update = (e) => set(e.target.name, e.target.value)
    const togglePerk = (p) =>
        setForm((f) => ({
            ...f,
            perks: f.perks.includes(p) ? f.perks.filter((x) => x !== p) : [...f.perks, p],
        }))

    const showToast = (type, text) => {
        setToast({ type, text })
        setTimeout(() => setToast(null), 4500)
    }

    const perStudent = (Number(form.hourlyRate) || 0) * Number(form.maxHours)
    const total = perStudent * Number(form.spots)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setBusy(true)
        try {
            const ref = await addDoc(collection(db, 'gigs'), {
                title: form.title.trim(),
                category: form.category,
                description: form.description.trim(),
                date: form.date,
                startTime: form.startTime,
                location: `${form.location.trim()}, ${form.area}`,
                area: form.area,
                hourlyRate: Number(form.hourlyRate),
                maxHours: Number(form.maxHours),
                spots: Number(form.spots),
                perks: form.perks,
                acceptedCount: 0,
                acceptedWorkerIds: [],
                posterId: user.uid,
                posterName: profile.name,
                status: 'open',
                createdAt: serverTimestamp(),
            })
            setForm({ ...empty(), area: form.area })
            onPosted?.(ref.id)
            showToast('ok', 'Gig published! Students can see it right now.')
        } catch (err) {
            showToast('error', err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-1 pb-space-md mb-space-md bg-gradient-to-r from-transparent via-primary-fixed/30 to-transparent p-space-sm rounded-xl">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-badge text-label-badge font-bold tracking-wide uppercase">
                        ⚡ Quick Hire
                    </span>
                    <span className="text-on-surface-variant font-body-sm text-body-sm">
                        Students see your gig the moment you post it
                    </span>
                </div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface font-extrabold tracking-tight">
                    Need trusted student help today? Post in 2 minutes.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Students looking for short-shift event, cafe, moving and errand work.
                </p>
            </div>

            <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-button-text text-button-text text-on-surface font-semibold flex items-center justify-between">
                        <span>
                            Gig Title <span className="text-error">*</span>
                        </span>
                        <span className="font-body-sm text-body-sm text-outline font-normal">Be specific (role + event)</span>
                    </label>
                    <div className="relative">
                        <Icon name="campaign" className="absolute left-3.5 top-3.5 text-outline text-xl" />
                        <input
                            name="title"
                            required
                            value={form.title}
                            onChange={update}
                            placeholder="e.g. Puja Mela handicraft stall assistant"
                            className={`${inputCls} pl-11 pr-4`}
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-button-text text-button-text text-on-surface font-semibold">
                        Category <span className="text-error">*</span>{' '}
                        <span className="font-body-sm text-body-sm text-outline font-normal">
                            (No childcare or hazardous work permitted)
                        </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => set('category', c.name)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-button-text text-button-text text-center transition-all ${form.category === c.name
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                                    }`}
                            >
                                <Icon name={c.icon} className="text-base" />
                                <span>{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-button-text text-button-text text-on-surface font-semibold">
                        What will the student do? <span className="text-error">*</span>
                    </label>
                    <textarea
                        name="description"
                        required
                        rows={3}
                        value={form.description}
                        onChange={update}
                        placeholder="e.g. Handle the evening rush, take orders, pack rolls and momos."
                        className={`${inputCls} px-4`}
                    />
                </div>

                {/* Date / time / duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">Date</label>
                        <div className="relative">
                            <Icon name="calendar_today" className="absolute left-3 top-3 text-outline text-lg" />
                            <input
                                type="date"
                                name="date"
                                required
                                min={todayStr()}
                                value={form.date}
                                onChange={update}
                                className={`${inputCls} pl-9 pr-3 py-2.5`}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">Start Time</label>
                        <div className="relative">
                            <Icon name="schedule" className="absolute left-3 top-3 text-outline text-lg" />
                            <input
                                type="time"
                                name="startTime"
                                required
                                value={form.startTime}
                                onChange={update}
                                className={`${inputCls} pl-9 pr-3 py-2.5`}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">Duration</label>
                        <div className="relative">
                            <select
                                name="maxHours"
                                value={form.maxHours}
                                onChange={update}
                                className={`${inputCls} pl-3 pr-8 py-2.5 appearance-none`}
                            >
                                {DURATIONS.map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                            <Icon name="expand_more" className="absolute right-3 top-3 text-outline pointer-events-none text-lg" />
                        </div>
                    </div>
                </div>

                {/* Location: area + landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">Area</label>
                        <div className="relative">
                            <Icon name="location_on" className="absolute left-3.5 top-3.5 text-outline text-xl pointer-events-none" />
                            <select
                                name="area"
                                value={form.area}
                                onChange={update}
                                className={`${inputCls} pl-11 pr-8 appearance-none`}
                            >
                                {AREAS.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                            <Icon name="expand_more" className="absolute right-3 top-3.5 text-outline pointer-events-none text-lg" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">
                            Landmark / Shop name
                        </label>
                        <div className="relative">
                            <Icon name="pin_drop" className="absolute left-3.5 top-3.5 text-outline text-xl" />
                            <input
                                name="location"
                                required
                                value={form.location}
                                onChange={update}
                                placeholder="e.g. Near Big Bazaar"
                                className={`${inputCls} pl-11 pr-4`}
                            />
                        </div>
                    </div>
                </div>

                {/* Pay + students */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold flex items-center justify-between">
                            <span>Pay Rate per Student</span>
                            <span className="text-tertiary font-label-badge text-label-badge font-bold">Suggested: ₹150+</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3.5 font-headline-sm text-headline-sm text-on-surface font-bold">₹</span>
                            <input
                                type="number"
                                name="hourlyRate"
                                required
                                min="50"
                                step="10"
                                value={form.hourlyRate}
                                onChange={update}
                                className={`${inputCls} pl-9 pr-16 font-label-currency-md text-label-currency-md font-bold`}
                            />
                            <span className="absolute right-3 text-outline font-body-sm text-body-sm">/ hour</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm mt-0.5">
                            <Icon name="trending_up" className="text-sm" />
                            <span>Better pay gets more applicants, faster.</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-button-text text-button-text text-on-surface font-semibold">
                            Required Student Count
                        </label>
                        <div className="relative">
                            <Icon name="group" className="absolute left-3.5 top-3.5 text-outline text-xl" />
                            <select
                                name="spots"
                                value={form.spots}
                                onChange={update}
                                className={`${inputCls} pl-11 pr-8 font-semibold appearance-none`}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n} Student{n > 1 ? 's' : ''} needed
                                    </option>
                                ))}
                            </select>
                            <Icon name="expand_more" className="absolute right-3 top-3.5 text-outline pointer-events-none text-lg" />
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            You accept applicants one by one until all spots are filled.
                        </p>
                    </div>
                </div>

                {/* Perks */}
                <div className="flex flex-col gap-2 pt-1">
                    <span className="font-button-text text-button-text text-on-surface font-semibold">
                        Requirements &amp; Perks
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {PERKS.map((p) => (
                            <label
                                key={p}
                                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={form.perks.includes(p)}
                                    onChange={() => togglePerk(p)}
                                    className="w-4 h-4 rounded accent-primary"
                                />
                                <span className="font-body-sm text-body-sm text-on-surface font-medium">{p}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Payout summary */}
                <div className="bg-surface-container p-space-md rounded-2xl flex flex-col gap-space-sm mt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon name="receipt_long" className="text-primary text-xl" />
                            <span className="font-button-text text-button-text text-on-surface font-bold">Payout Summary</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-label-badge text-label-badge font-bold">
                            No platform fee
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1 text-on-surface-variant font-body-sm text-body-sm">
                        <div className="flex justify-between items-center">
                            <span>
                                Pay per student ({inr(form.hourlyRate)} × {form.maxHours} hrs):
                            </span>
                            <span className="font-semibold text-on-surface">{inr(perStudent)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Students needed:</span>
                            <span className="font-semibold text-on-surface">× {form.spots}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 font-headline-sm text-headline-sm text-on-surface font-bold">
                            <span>Maximum total payout:</span>
                            <span className="text-primary font-extrabold">{inr(total)}</span>
                        </div>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Pay is agreed up front and settled directly with each student after the shift. In-app payments are on
                        our roadmap.
                    </p>

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-primary text-on-primary font-button-text text-button-text font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                    >
                        <Icon name={busy ? 'progress_activity' : 'bolt'} className={`text-xl ${busy ? 'animate-spin' : ''}`} />
                        <span>{busy ? 'Publishing...' : 'Publish Gig'}</span>
                    </button>
                </div>
            </form>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm">
                        <Icon
                            name={toast.type === 'ok' ? 'verified' : 'error'}
                            className={`text-xl ${toast.type === 'ok' ? 'text-tertiary-fixed' : 'text-error-container'}`}
                        />
                        <span className="font-body-md text-body-md font-medium">{toast.text}</span>
                    </div>
                </div>
            )}
        </section>
    )
}