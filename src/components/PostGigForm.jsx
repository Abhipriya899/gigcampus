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
    const [msg, setMsg] = useState(null)

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setBusy(true)
        setMsg(null)
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
            setMsg({ type: 'success', text: 'Gig posted! Students can see it now.' })
        } catch (err) {
            setMsg({ type: 'error', text: err.message })
        } finally {
            setBusy(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
            <div className="card-body gap-3">
                <h2 className="card-title">Post a new gig</h2>

                <input name="title" placeholder="e.g. Cafe helper for Puja rush" required
                    value={form.title} onChange={update} className="input w-full" />

                <select name="category" value={form.category} onChange={update} className="select w-full">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>

                <textarea name="description" placeholder="What will the student do?" required rows={3}
                    value={form.description} onChange={update} className="textarea w-full" />

                <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs opacity-70">Date
                        <input name="date" type="date" required value={form.date} onChange={update} className="input w-full mt-1" />
                    </label>
                    <label className="text-xs opacity-70">Start time
                        <input name="startTime" type="time" required value={form.startTime} onChange={update} className="input w-full mt-1" />
                    </label>
                    <label className="text-xs opacity-70">Pay (₹ per hour)
                        <input name="hourlyRate" type="number" min="1" required value={form.hourlyRate}
                            onChange={update} className="input w-full mt-1" />
                    </label>
                    <label className="text-xs opacity-70">Max hours
                        <input name="maxHours" type="number" min="1" max="12" required value={form.maxHours}
                            onChange={update} className="input w-full mt-1" />
                    </label>
                </div>

                <input name="location" placeholder="Area / address" required
                    value={form.location} onChange={update} className="input w-full" />

                {msg && (
                    <div role="alert" className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} py-2 text-sm`}>
                        {msg.text}
                    </div>
                )}

                <button disabled={busy} className="btn btn-primary">
                    {busy ? <span className="loading loading-spinner loading-sm" /> : 'Post gig'}
                </button>
            </div>
        </form>
    )
}