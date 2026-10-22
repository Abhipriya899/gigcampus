import TrustBadge from './TrustBadge'
import RatingForm from './RatingForm'
import { useEffect, useState } from 'react'
import {
    collection, onSnapshot, query, where,
    doc, setDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import GigCard from './GigCard'

export default function GigList({ mode }) {
    const { user, profile } = useAuth()
    const [gigs, setGigs] = useState([])
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)

    // Gigs: poster sees their own, student sees open ones
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

    // Applications: poster sees applicants to their gigs, student sees their own
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
            // Same ID every time = a student can't apply twice to the same gig
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

    if (loading) return <p className="text-gray-500">Loading gigs...</p>
    if (gigs.length === 0)
        return (
            <p className="text-gray-500">
                {mode === 'mine' ? "You haven't posted any gigs yet." : 'No open gigs right now. Check back soon!'}
            </p>
        )

    return (
        <div className="space-y-3">
            {gigs.map((g) => {
                const gigApps = apps.filter((a) => a.gigId === g.id)

                // ---------- STUDENT VIEW ----------
                if (mode === 'open') {
                    const applied = gigApps.length > 0
                    return (
                        <GigCard key={g.id} gig={g}>
                            {applied ? (
                                <p className="text-sm text-indigo-600 font-medium">✅ Applied. Waiting for the poster.</p>
                            ) : (
                                <button
                                    onClick={() => apply(g)}
                                    className="w-full bg-indigo-600 text-white rounded-lg p-2 font-medium"
                                >
                                    Apply for this gig
                                </button>
                            )}
                        </GigCard>
                    )
                }

                // ---------- POSTER VIEW ----------
                return (
                    <GigCard key={g.id} gig={g}>
                        {g.status === 'filled' ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-green-700">
                                    ✅ Filled by {g.acceptedWorkerName}
                                </p>
                                <RatingForm gigId={g.id} toUserId={g.acceptedWorkerId} toName={g.acceptedWorkerName} />
                            </div>
                        ) : (
                            <div className="border-t pt-2 space-y-2">
                                <p className="text-sm font-medium">Applicants ({gigApps.length})</p>
                                {gigApps.length === 0 && (
                                    <p className="text-xs text-gray-500">No applicants yet.</p>
                                )}
                                {gigApps.map((a) => (
                                    <div key={a.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
                                        <TrustBadge userId={a.workerId} name={a.workerName} />
                                        <button
                                            onClick={() => accept(g, a)}
                                            className="text-sm bg-green-600 text-white rounded-lg px-3 py-1"
                                        >
                                            Accept
                                        </button>
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