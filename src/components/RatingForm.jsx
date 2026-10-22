import { useEffect, useState } from 'react'
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'

export default function RatingForm({ gigId, toUserId, toName }) {
    const { user, profile } = useAuth()
    const reviewId = `${gigId}_${user.uid}` // one review per person per gig
    const [existing, setExisting] = useState(undefined) // undefined = still loading
    const [stars, setStars] = useState(0)
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        getDoc(doc(db, 'reviews', reviewId))
            .then((s) => setExisting(s.exists() ? s.data() : null))
            .catch(() => setExisting(null))
    }, [reviewId])

    const submit = async () => {
        if (!stars) return
        setBusy(true)
        try {
            const userRef = doc(db, 'users', toUserId)
            const reviewRef = doc(db, 'reviews', reviewId)
            await runTransaction(db, async (tx) => {
                const [uSnap, rSnap] = await Promise.all([tx.get(userRef), tx.get(reviewRef)])
                if (rSnap.exists()) throw new Error('You already rated this gig')
                const u = uSnap.data()
                const count = u.ratingCount ?? 0
                const total = (u.rating ?? 0) * count + stars
                tx.update(userRef, {
                    ratingCount: count + 1,
                    rating: Math.round((total / (count + 1)) * 10) / 10,
                })
                tx.set(reviewRef, {
                    gigId,
                    fromUserId: user.uid,
                    fromName: profile.name,
                    toUserId,
                    stars,
                    comment,
                    createdAt: serverTimestamp(),
                })
            })
            setExisting({ stars, comment })
        } catch (err) {
            alert(err.message)
        } finally {
            setBusy(false)
        }
    }

    if (existing === undefined) return null

    if (existing)
        return (
            <p className="text-sm text-gray-600">
                You rated {toName}: <span className="text-yellow-600">{'★'.repeat(existing.stars)}</span>
            </p>
        )

    return (
        <div className="border-t pt-2 space-y-2">
            <p className="text-sm font-medium">Rate {toName}</p>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setStars(n)}
                        className={`text-2xl ${n <= stars ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                        ★
                    </button>
                ))}
            </div>
            <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Short comment (optional)"
                className="w-full border rounded-lg p-2 text-sm"
            />
            <button
                onClick={submit}
                disabled={busy || !stars}
                className="bg-indigo-600 text-white rounded-lg px-3 py-1 text-sm disabled:opacity-50"
            >
                {busy ? 'Submitting...' : 'Submit rating'}
            </button>
        </div>
    )
}