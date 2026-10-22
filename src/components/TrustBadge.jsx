import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function TrustBadge({ userId, name }) {
    const [u, setU] = useState(null)

    useEffect(
        () => onSnapshot(doc(db, 'users', userId), (s) => setU(s.data() ?? null), () => { }),
        [userId]
    )

    return (
        <span className="inline-flex items-center gap-1 flex-wrap text-sm">
            <span className="font-medium">{name}</span>
            {u?.verified ? (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
            ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unverified</span>
            )}
            {u?.ratingCount > 0 ? (
                <span className="text-xs text-yellow-600">★ {u.rating} ({u.ratingCount})</span>
            ) : (
                <span className="text-xs text-gray-400">New</span>
            )}
        </span>
    )
}