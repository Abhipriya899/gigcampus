import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'

const CATEGORIES = [
    'Cafe / Restaurant help',
    'Event staffing',
    'Moving / Shifting help',
    'Delivery & errands',
    'Tutoring',
    'Other',
]

const empty = {
    title: '',
    category: CATEGORIES[0],
    description: '',
    date: '',
    startTime: '',
    hourlyRate: '',
    maxHours: '',
    location: '',
}

export default function PostGigForm() {
    const { user, profile } = useAuth()
    const [form, setForm] = useState(empty)
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState('')

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setBusy(true)
        setMsg('')
        try {
            await addDoc(collection(db, 'gigs'), {
                ...form,
                hourlyRate: Number(form.hourlyRate),
                maxHours: Number(form.maxHours),
                posterId: user.uid,
                posterName: profile.name,
                status: 'open',
                createdAt: serverTimestamp(),
            })
            setForm(empty)
            setMsg('Gig posted! ✅')
        } catch (err) {
            setMsg('Error: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    const input = 'w-full border rounded-lg p-2'

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="text-xl font-bold">Post a gig</h2>

            <input name="title" placeholder="e.g. Cafe helper for Puja rush" required
                value={form.title} onChange={update} className={input} />

            <select name="category" value={form.category} onChange={update} className={input}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <textarea name="description" placeholder="What will the student do?" required rows={3}
                value={form.description} onChange={update} className={input} />

            <div className="grid grid-cols-2 gap-2">
                <input name="date" type="date" required value={form.date} onChange={update} className={input} />
                <input name="startTime" type="time" required value={form.startTime} onChange={update} className={input} />
                <input name="hourlyRate" type="number" min="1" placeholder="₹ per hour" required
                    value={form.hourlyRate} onChange={update} className={input} />
                <input name="maxHours" type="number" min="1" max="12" placeholder="Max hours" required
                    value={form.maxHours} onChange={update} className={input} />
            </div>

            <input name="location" placeholder="Area / address" required
                value={form.location} onChange={update} className={input} />

            {msg && <p className="text-sm">{msg}</p>}

            <button disabled={busy}
                className="w-full bg-indigo-600 text-white rounded-lg p-2 font-medium disabled:opacity-50">
                {busy ? 'Posting...' : 'Post gig'}
            </button>
        </form>
    )
}