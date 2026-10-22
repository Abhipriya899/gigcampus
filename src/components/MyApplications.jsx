import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import RatingForm from './RatingForm'

const STATUS = {
    pending: { label: '⏳ Pending', style: 'bg-yellow-50 text-yellow-700' },
    accepted: { label: '🎉 Accepted', style: 'bg-green-50 text-green-700' },
    rejected: { label: '❌ Not selected', style: 'bg-gray-100 text-gray-600' },
}

export default function MyApplications() {
    const { user } = useAuth()
    const [apps, setApps] = useState([])

    useEffect(() => {
        const q = query(collection(db, 'applications'), where('workerId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error(err)
        )
    }, [user.uid])

    if (apps.length === 0)
        return <p className="text-gray-500">You haven't applied to any gigs yet.</p>

    return (
        <div className="space-y-2">
            {apps.map((a) => {
                const s = STATUS[a.status] ?? STATUS.pending
                return (
                    <div key={a.id} className="bg-white rounded-xl shadow p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{a.gigTitle}</p>
                                <p className="text-xs text-gray-500">Posted by {a.posterName}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${s.style}`}>{s.label}</span>
                        </div>
                        {a.status === 'accepted' && (
                            <RatingForm gigId={a.gigId} toUserId={a.posterId} toName={a.posterName} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}