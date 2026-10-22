import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { BadgeCheck, Star } from 'lucide-react'
import { db } from '../firebase'

export default function TrustBadge({ userId, name }) {
    const [u, setU] = useState(null)

    useEffect(
        () => onSnapshot(doc(db, 'users', userId), (s) => setU(s.data() ?? null), () => { }),
        [userId]
    )

    return (
        <span className="inline-flex items-center gap-1 flex-wrap">
            <span className="font-medium">{name}</span>
            {u?.verified ? (
                <span className="badge badge-success badge-sm gap-1"><BadgeCheck size={12} /> Verified</span>
            ) : (
                <span className="badge badge-ghost badge-sm">Unverified</span>
            )}
            {u?.ratingCount > 0 ? (
                <span className="badge badge-warning badge-outline badge-sm gap-1">
                    <Star size={12} /> {u.rating} ({u.ratingCount})
                </span>
            ) : (
                <span className="badge badge-ghost badge-sm">New</span>
            )}
        </span>
    )
}