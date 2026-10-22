import { useEffect, useState } from 'react'
import {
    collection, onSnapshot, query, where,
    doc, setDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { CheckCircle2, Inbox } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import GigCard from './GigCard'
import TrustBadge from './TrustBadge'
import RatingForm from './RatingForm'

export default function GigList({ mode }) {
    const { user, profile } = useAuth()
    const [gigs, setGigs] = useState([])
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q =
            mode === 'mine'
                ? query(collection(db, 'gigs'), where('posterId', '==', user.uid))
                : query(collection(db, 'gigs'), where('status', '==', 'open'))

        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                list.sort((a, b) => (b.createdAt?.seconds ?? 9e9) - (a.createdAt?.seconds ?? 9e9))
                setGigs(list)
                setLoading(false)
            },
            (err) => {
                console.error(err)
                setLoading(false)
            }
        )
    }, [mode, user.uid])

    useEffect(() => {
        const field = mode === 'mine' ? 'posterId' : 'workerId'
        const q = query(collection(db, 'applications'), where(field, '==', user.uid))
        return onSnapshot(
            q,
            (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error(err)
        )
    }, [mode, user.uid])

    const apply = async (gig) => {
        try {
            await setDoc(doc(db, 'applications', `${gig.id}_${user.uid}`), {
                gigId: gig.id,
                gigTitle: gig.title,
                posterId: gig.posterId,
                posterName: gig.posterName,
                workerId: user.uid,
                workerName: profile.name,
                status: 'pending',
                createdAt: serverTimestamp(),
            })
        } catch (err) {
            alert('Could not apply: ' + err.message)
        }
    }

    const accept = async (gig, app) => {
        try {
            const batch = writeBatch(db)
            batch.update(doc(db, 'gigs', gig.id), {
                status: 'filled',
                acceptedWorkerId: app.workerId,
                acceptedWorkerName: app.workerName,
            })
            apps
                .filter((a) => a.gigId === gig.id)
                .forEach((a) => {
                    batch.update(doc(db, 'applications', a.id), {
                        status: a.id === app.id ? 'accepted' : 'rejected',
                    })
                })
            await batch.commit()
        } catch (err) {
            alert('Could not accept: ' + err.message)
        }
    }

    if (loading) return <span className="loading loading-spinner loading-md" />

    if (gigs.length === 0)
        return (
            <div className="text-center py-10 opacity-60">
                <Inbox className="mx-auto mb-2" size={36} />
                <p>{mode === 'mine' ? "You haven't posted any gigs yet." : 'No open gigs right now. Check back soon!'}</p>
            </div>
        )

    return (
        <div className="space-y-3">
            {gigs.map((g) => {
                const gigApps = apps.filter((a) => a.gigId === g.id)

                if (mode === 'open') {
                    const applied = gigApps.length > 0
                    return (
                        <GigCard key={g.id} gig={g}>
                            {applied ? (
                                <div className="badge badge-info badge-lg gap-1">
                                    <CheckCircle2 size={14} /> Applied. Waiting for the poster
                                </div>
                            ) : (
                                <button onClick={() => apply(g)} className="btn btn-primary btn-block">
                                    Apply for this gig
                                </button>
                            )}
                        </GigCard>
                    )
                }

                return (
                    <GigCard key={g.id} gig={g}>
                        {g.status === 'filled' ? (
                            <div className="space-y-2">
                                <div className="badge badge-success badge-lg gap-1">
                                    <CheckCircle2 size={14} /> Filled by {g.acceptedWorkerName}
                                </div>
                                <RatingForm gigId={g.id} toUserId={g.acceptedWorkerId} toName={g.acceptedWorkerName} />
                            </div>
                        ) : (
                            <div className="border-t border-base-200 pt-3 space-y-2">
                                <p className="text-sm font-semibold">Applicants ({gigApps.length})</p>
                                {gigApps.length === 0 && <p className="text-xs opacity-60">No applicants yet.</p>}
                                {gigApps.map((a) => (
                                    <div key={a.id} className="flex justify-between items-center gap-2 bg-base-200 rounded-lg p-2">
                                        <TrustBadge userId={a.workerId} name={a.workerName} />
                                        <button onClick={() => accept(g, a)} className="btn btn-success btn-sm">Accept</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GigCard>
                )
            })}
        </div>
    )
}