import { useEffect, useState } from 'react'
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'

const CHIPS = ['✨ Polite & Respectful', '⏰ On Time', '💬 Clear Communication', '🤝 Would Work Again']

function Stars({ value, onPick }) {
    return (
        <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-inner">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={!onPick}
                    onClick={() => onPick?.(n)}
                    className={`${n <= value ? 'text-secondary-container' : 'text-outline'} ${onPick ? 'hover:scale-110' : ''} transition-transform`}
                >
                    <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: `'FILL' ${n <= value ? 1 : 0}` }}
                    >
                        star
                    </span>
                </button>
            ))}
            <span className="ml-2 font-headline-sm text-headline-sm font-bold text-on-surface">
                {Number(value).toFixed(1)}
            </span>
        </div>
    )
}

export default function RatingForm({ gigId, toUserId, toName }) {
    const { user, profile } = useAuth()
    const reviewId = `${gigId}_${user.uid}`
    const [existing, setExisting] = useState(undefined)
    const [stars, setStars] = useState(5)
    const [tags, setTags] = useState([])
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        getDoc(doc(db, 'reviews', reviewId))
            .then((s) => setExisting(s.exists() ? s.data() : null))
            .catch(() => setExisting(null))
    }, [reviewId])

    const toggleTag = (t) =>
        setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))

    const submit = async () => {
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
                    tags,
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
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div>
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">
                        Your feedback for {toName}
                    </span>
                    <div className="mt-1 text-xs text-tertiary font-semibold flex items-center gap-1">
                        <Icon name="done_all" className="text-sm" /> Feedback recorded on {toName}'s profile!
                    </div>
                </div>
                <Stars value={existing.stars} />
            </div>
        )

    return (
        <div className="bg-surface-container-low rounded-xl p-space-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md mb-space-sm">
                <div>
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">
                        Rate {toName}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Ratings help build the trust score for future gigs.
                    </p>
                </div>
                <Stars value={stars} onPick={setStars} />
            </div>

            <div className="flex flex-wrap items-center gap-space-xs mb-space-sm">
                {CHIPS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => toggleTag(c)}
                        className={`px-space-md py-1 rounded-full font-label-badge text-label-badge transition-colors ${tags.includes(c) ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-space-sm">
                <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Add an optional comment for ${toName}...`}
                    className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
                <button
                    onClick={submit}
                    disabled={busy}
                    className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-button-text text-button-text shadow-sm hover:opacity-95 transition-all flex items-center gap-1 flex-shrink-0 disabled:opacity-60"
                >
                    <Icon name={busy ? 'progress_activity' : 'send'} className={`text-base ${busy ? 'animate-spin' : ''}`} />
                    <span>Submit Feedback</span>
                </button>
            </div>
        </div>
    )
}