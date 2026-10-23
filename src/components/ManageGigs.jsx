import { useEffect, useState } from 'react'
import {
    arrayUnion, collection, doc, onSnapshot, query, updateDoc, where, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import Icon from './Icon'
import RatingForm from './RatingForm'
import { fmtDate, fmtTime, endOf, inr, startOf, timeAgo } from '../constants'

function ApplicantCard({ app, full, onAccept, onDecline }) {
    const [u, setU] = useState(null)
    const [open, setOpen] = useState(false)
    const [reviews, setReviews] = useState(null)

    useEffect(
        () => onSnapshot(doc(db, 'users', app.workerId), (s) => setU(s.data() ?? null), () => { }),
        [app.workerId]
    )

    useEffect(() => {
        if (!open) return
        const q = query(collection(db, 'reviews'), where('toUserId', '==', app.workerId))
        return onSnapshot(
            q,
            (s) => {
                const list = s.docs.map((d) => d.data())
                list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
                setReviews(list.slice(0, 3))
            },
            () => setReviews([])
        )
    }, [open, app.workerId])

    return (
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all duration-300">
            <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary font-bold grid place-items-center shadow-sm">
                        {(app.workerName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h5 className="font-headline-sm text-headline-sm text-on-surface font-bold">{app.workerName}</h5>
                            {u?.verified && <Icon name="verified" className="text-tertiary text-base" />}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Applied {timeAgo(app.createdAt?.seconds)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {u?.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-badge text-label-badge font-semibold">
                        <Icon name="school" className="text-xs" /> ID Verified
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-badge text-label-badge font-semibold">
                        Not verified yet
                    </span>
                )}
                {u?.ratingCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-badge text-label-badge font-bold">
                        ⭐ {u.rating} ({u.ratingCount} {u.ratingCount === 1 ? 'rating' : 'ratings'})
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-badge text-label-badge font-semibold">
                        ✨ New to GigCampus
                    </span>
                )}
            </div>

            {open && (
                <div className="bg-surface-container-low p-2.5 rounded-xl mt-3 flex flex-col gap-1.5">
                    <div className="font-body-sm text-body-sm text-outline font-medium">Recent feedback from posters:</div>
                    {reviews === null ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : reviews.length === 0 ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">No reviews yet.</p>
                    ) : (
                        reviews.map((r, i) => (
                            <div key={i} className="text-on-surface font-body-sm text-body-sm">
                                <span className="font-bold text-secondary">⭐ {r.stars}</span>{' '}
                                <span className="italic">{r.comment ? `"${r.comment}"` : 'No comment'}</span>
                                <span className="text-outline"> — {r.fromName}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 mt-space-md pt-1">
                <button
                    type="button"
                    disabled={full}
                    onClick={onAccept}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-tertiary text-on-tertiary font-button-text text-button-text font-bold hover:bg-tertiary-container transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <Icon name="check_circle" className="text-base" />
                    <span>Accept &amp; Lock Spot</span>
                </button>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="py-2.5 px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-button-text text-button-text hover:bg-surface-container transition-all"
                >
                    {open ? 'Hide reviews' : 'View reviews'}
                </button>
                <button
                    type="button"
                    onClick={onDecline}
                    className="py-2.5 px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-button-text text-button-text hover:bg-surface-container hover:text-error transition-all"
                >
                    Decline
                </button>
            </div>
        </div>
    )
}

export default function ManageGigs({ gigs, apps, selectedId, onSelect }) {
    const gig = gigs.find((g) => g.id === selectedId) ?? gigs[0]

    if (!gig)
        return (
            <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm text-center">
                <Icon name="campaign" className="text-5xl text-outline" />
                <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Your live gig shows up here</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Publish your first gig on the left. Applicants appear here as soon as students apply.
                </p>
            </div>
        )

    const gigApps = apps.filter((a) => a.gigId === gig.id)
    const pending = gigApps.filter((a) => a.status === 'pending')
    const accepted = gigApps.filter((a) => a.status === 'accepted')
    const spots = gig.spots ?? 1
    const filled = Math.max(gig.acceptedCount ?? 0, accepted.length)
    const full = gig.status === 'filled' || filled >= spots
    const start = startOf(gig)
    const end = endOf(gig)
    const perHead = gig.hourlyRate * gig.maxHours

    const accept = async (app) => {
        try {
            const filledAfter = filled + 1
            const nowFull = filledAfter >= spots
            const batch = writeBatch(db)
            batch.update(doc(db, 'applications', app.id), { status: 'accepted' })
            batch.update(doc(db, 'gigs', gig.id), {
                acceptedCount: filledAfter,
                acceptedWorkerIds: arrayUnion(app.workerId),
                status: nowFull ? 'filled' : 'open',
            })
            if (nowFull) {
                pending
                    .filter((a) => a.id !== app.id)
                    .forEach((a) => batch.update(doc(db, 'applications', a.id), { status: 'rejected' }))
            }
            await batch.commit()
        } catch (err) {
            alert('Could not accept: ' + err.message)
        }
    }

    const decline = async (app) => {
        try {
            await updateDoc(doc(db, 'applications', app.id), { status: 'rejected' })
        } catch (err) {
            alert('Could not decline: ' + err.message)
        }
    }

    return (
        <div className="flex flex-col gap-space-lg">
            {/* Active gig header */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                    <div className="flex items-center gap-2">
                        {full ? (
                            <Icon name="check_circle" fill className="text-tertiary text-base" />
                        ) : (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                            </span>
                        )}
                        <span
                            className={`font-label-badge text-label-badge uppercase tracking-wider font-bold ${full ? 'text-tertiary' : 'text-secondary'
                                }`}
                        >
                            {full ? 'All spots filled' : 'Active live gig'}
                        </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-badge text-label-badge font-bold">
                        ID #GC-{gig.id.slice(-4).toUpperCase()}
                    </span>
                </div>

                <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">{gig.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                    <Icon name="schedule" className="text-base text-outline" />
                    <span>
                        {fmtDate(start)}, {fmtTime(start)} – {fmtTime(end)} • {gig.location}
                    </span>
                </p>

                {gigs.length > 1 && (
                    <div className="relative mt-space-sm">
                        <select
                            value={gig.id}
                            onChange={(e) => onSelect(e.target.value)}
                            className="w-full appearance-none bg-surface-container-low pl-3 pr-8 py-2 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {gigs.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.title} ({g.date})
                                </option>
                            ))}
                        </select>
                        <Icon name="expand_more" className="text-sm text-outline absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 mt-space-md p-3 rounded-xl bg-surface-container-low text-center">
                    <div>
                        <div className="font-label-currency-md text-label-currency-md text-primary font-extrabold">
                            {gigApps.length}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Applicants</div>
                    </div>
                    <div>
                        <div className="font-label-currency-md text-label-currency-md text-on-surface font-extrabold">
                            {filled}/{spots}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Positions</div>
                    </div>
                    <div>
                        <div className="font-label-currency-md text-label-currency-md text-tertiary font-extrabold">
                            {inr(perHead)}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant font-medium">Pay / head</div>
                    </div>
                </div>
            </div>

            {/* Candidate queue */}
            <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between px-1">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                        <span>Candidate Queue</span>
                        <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-badge text-label-badge flex items-center justify-center">
                            {pending.length}
                        </span>
                    </h4>
                    <span className="font-body-sm text-body-sm text-outline">Newest applicants first</span>
                </div>

                {pending.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm text-center font-body-sm text-body-sm text-on-surface-variant">
                        {full ? 'All spots are filled. No pending applicants.' : 'No applicants yet. Students will show up here.'}
                    </div>
                ) : (
                    [...pending]
                        .sort((a, b) => (b.createdAt?.seconds ?? 9e9) - (a.createdAt?.seconds ?? 9e9))
                        .map((a) => (
                            <ApplicantCard
                                key={a.id}
                                app={a}
                                full={full}
                                onAccept={() => accept(a)}
                                onDecline={() => decline(a)}
                            />
                        ))
                )}
            </div>

            {/* Confirmed workers */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon name="group_add" className="text-tertiary text-xl" />
                        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Confirmed Workers</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-badge text-label-badge font-bold">
                        {filled} / {spots} Confirmed
                    </span>
                </div>

                {accepted.length === 0 ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Nobody confirmed yet. Accept an applicant to lock the spot.
                    </p>
                ) : (
                    accepted.map((a) => (
                        <div key={a.id} className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-space-sm">
                                    <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold grid place-items-center">
                                        {(a.workerName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-button-text text-button-text text-on-surface font-bold">{a.workerName}</span>
                                        <span className="px-1.5 rounded bg-surface-container-high text-tertiary font-label-badge text-label-badge font-semibold">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                                <span className="font-label-currency-md text-label-currency-md text-on-surface font-extrabold">
                                    {inr(perHead)}
                                </span>
                            </div>
                            <RatingForm gigId={gig.id} toUserId={a.workerId} toName={a.workerName} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}