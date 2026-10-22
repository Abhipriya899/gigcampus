import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import {
    CalendarDays, Clock, MapPin, IndianRupee, Inbox,
    XCircle, Hourglass, CheckCircle2,
} from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import RatingForm from './RatingForm'
import TrustBadge from './TrustBadge'

const STATUS = {
    pending: {
        label: 'Under review',
        pill: 'bg-warning/20 text-warning-content',
        bar: 'bg-warning',
        Icon: Hourglass,
    },
    accepted: {
        label: 'Accepted',
        pill: 'bg-success/10 text-success',
        bar: 'bg-success',
        Icon: CheckCircle2,
    },
    rejected: {
        label: 'Not selected',
        pill: 'bg-base-200 opacity-70',
        bar: 'bg-base-300',
        Icon: XCircle,
    },
}

function ApplicationCard({ a }) {
    const [gig, setGig] = useState(null)
    const s = STATUS[a.status] ?? STATUS.pending

    // Live gig details (date, pay, location) so the card is always up to date
    useEffect(
        () => onSnapshot(doc(db, 'gigs', a.gigId), (snap) => setGig(snap.exists() ? snap.data() : null), () => { }),
        [a.gigId]
    )

    const withdraw = async () => {
        if (!window.confirm('Withdraw this application?')) return
        try {
            await deleteDoc(doc(db, 'applications', a.id))
        } catch (err) {
            alert('Could not withdraw: ' + err.message)
        }
    }

    return (
        <div className="card bg-base-100 shadow-md relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.bar}`} />

            <div className="card-body gap-3 p-5 pl-6">
                {/* Status row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.pill}`}>
                        <s.Icon size={14} /> {s.label}
                    </span>
                    {gig?.date && (
                        <span className="text-xs opacity-60">Shift: {gig.date} at {gig.startTime}</span>
                    )}
                </div>

                {/* Title + pay */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display font-bold text-lg leading-snug">{a.gigTitle}</h3>
                        <div className="text-sm opacity-70 mt-1 flex items-center gap-1 flex-wrap">
                            Posted by <TrustBadge userId={a.posterId} name={a.posterName} />
                        </div>
                    </div>

                    {gig && (
                        <div className="bg-base-200 rounded-xl px-4 py-2 sm:text-right shrink-0">
                            <p className="font-display font-extrabold text-xl flex items-center sm:justify-end">
                                <IndianRupee size={18} />{gig.hourlyRate}
                                <span className="text-xs font-normal opacity-60">/hr</span>
                            </p>
                            <p className="text-xs opacity-70">Up to ₹{gig.hourlyRate * gig.maxHours} for {gig.maxHours} hrs</p>
                        </div>
                    )}
                </div>

                {/* Schedule + location */}
                {gig && (
                    <div className="grid sm:grid-cols-3 gap-2 bg-base-200 rounded-xl p-3 text-sm">
                        <span className="flex items-center gap-2"><CalendarDays size={16} className="text-primary" /> {gig.date}</span>
                        <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {gig.startTime}, up to {gig.maxHours}h</span>
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {gig.location}</span>
                    </div>
                )}

                {/* Status-specific footer */}
                {a.status === 'pending' && (
                    <div className="flex items-center justify-between pt-1">
                        <button onClick={withdraw} className="btn btn-ghost btn-sm text-error">
                            <XCircle size={16} /> Withdraw application
                        </button>
                        <span className="text-xs opacity-60">Waiting for the poster to decide</span>
                    </div>
                )}

                {a.status === 'accepted' && (
                    <div className="space-y-2">
                        <p className="text-sm text-success font-medium">
                            You got this gig. Show up on time and do your best.
                        </p>
                        <RatingForm gigId={a.gigId} toUserId={a.posterId} toName={a.posterName} />
                    </div>
                )}

                {a.status === 'rejected' && (
                    <p className="text-xs opacity-60">The poster chose another applicant. Plenty more gigs are waiting.</p>
                )}
            </div>
        </div>
    )
}

export default function MyApplications() {
    const { user } = useAuth()
    const [apps, setApps] = useState([])
    const [earnings, setEarnings] = useState(0)
    const [tab, setTab] = useState('active')

    useEffect(() => {
        const q = query(collection(db, 'applications'), where('workerId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                list.sort((a, b) => (b.createdAt?.seconds ?? 9e9) - (a.createdAt?.seconds ?? 9e9))
                setApps(list)
            },
            (err) => console.error(err)
        )
    }, [user.uid])

    // Potential earnings from gigs this student was accepted for
    useEffect(() => {
        const q = query(collection(db, 'gigs'), where('acceptedWorkerId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => setEarnings(snap.docs.reduce((sum, d) => sum + d.data().hourlyRate * d.data().maxHours, 0)),
            (err) => console.error(err)
        )
    }, [user.uid])

    const pending = apps.filter((a) => a.status === 'pending').length
    const accepted = apps.filter((a) => a.status === 'accepted').length
    const rejected = apps.filter((a) => a.status === 'rejected')
    const active = apps.filter((a) => a.status !== 'rejected')
    const shown = tab === 'active' ? active : rejected

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-100">
                <div className="stat">
                    <div className="stat-title">Applied</div>
                    <div className="stat-value text-primary">{apps.length}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Under review</div>
                    <div className="stat-value text-warning">{pending}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Accepted</div>
                    <div className="stat-value text-success">{accepted}</div>
                    <div className="stat-desc">Up to ₹{earnings} potential earnings</div>
                </div>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-box w-fit">
                <button role="tab" onClick={() => setTab('active')} className={`tab ${tab === 'active' ? 'tab-active' : ''}`}>
                    Active ({active.length})
                </button>
                <button role="tab" onClick={() => setTab('rejected')} className={`tab ${tab === 'rejected' ? 'tab-active' : ''}`}>
                    Not selected ({rejected.length})
                </button>
            </div>

            {/* List */}
            {shown.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                    <Inbox className="mx-auto mb-2" size={36} />
                    <p>{apps.length === 0 ? "You haven't applied to any gigs yet." : 'Nothing here yet.'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map((a) => <ApplicationCard key={a.id} a={a} />)}
                </div>
            )}
        </div>
    )
}