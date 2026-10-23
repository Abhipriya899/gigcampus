import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import Icon from '../components/Icon'
import { AREAS } from '../constants'

const MESSAGES = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/invalid-email': 'That email address does not look right.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase (Authentication → Sign-in method).',
    'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase API key is wrong. Check src/firebase.js.',
}

export default function Signup() {
    const [params] = useSearchParams()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        area: 'all',
        role: params.get('role') === 'poster' ? 'poster' : 'worker',
    })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const navigate = useNavigate()

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const isPoster = form.role === 'poster'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setBusy(true)

        let cred
        try {
            cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
        } catch (err) {
            console.error(err)
            setError(MESSAGES[err.code] ?? err.message)
            setBusy(false)
            return
        }

        try {
            await setDoc(doc(db, 'users', cred.user.uid), {
                name: form.name.trim(),
                email: form.email.trim(),
                role: form.role,
                area: form.area,
                verified: false,
                idStatus: 'none',
                rating: 0,
                ratingCount: 0,
                createdAt: serverTimestamp(),
            })
            navigate('/')
        } catch (err) {
            console.error(err)
            // Roll back the half-created account so the person can try again with the same email
            try {
                await deleteUser(cred.user)
            } catch {
                /* ignore */
            }
            setError(
                `Could not save your profile (${err.code ?? err.message}). ` +
                'Check that Firestore Database is created and in test mode, then try again.'
            )
        } finally {
            setBusy(false)
        }
    }

    const roleBtn = (value, label, icon) => (
        <button
            type="button"
            onClick={() => setForm({ ...form, role: value })}
            className={`flex-1 py-2.5 rounded-lg font-button-text text-button-text text-center transition-all flex items-center justify-center gap-1.5 ${form.role === value
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
        >
            <Icon name={icon} className="text-lg" />
            {label}
        </button>
    )

    const field =
        'w-full px-3 py-2.5 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary'

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body-md text-on-surface">
            <div className="w-full max-w-md">
                <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary">
                    <Icon name="work" fill className="text-4xl" />
                    <span className="font-headline-lg text-headline-lg font-bold">GigCampus</span>
                </Link>

                <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-container-lowest shadow-xl p-space-lg">
                    <h1 className="font-headline-md text-headline-md font-bold">Get started on GigCampus</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Choose your profile type and create your account.
                    </p>

                    <div className="flex rounded-xl bg-surface-container-high p-1 mb-space-md">
                        {roleBtn('worker', 'Student', 'school')}
                        {roleBtn('poster', 'Business / Poster', 'storefront')}
                    </div>

                    <div className="space-y-space-md">
                        <div className="space-y-1">
                            <label className="font-body-sm text-body-sm font-semibold">
                                {isPoster ? 'Business or organizer name' : 'Full name'}
                            </label>
                            <input
                                name="name"
                                required
                                value={form.name}
                                onChange={update}
                                placeholder={isPoster ? 'e.g. Royal Chai, Sevoke Road' : 'As shown on your college ID'}
                                className={field}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-body-sm text-body-sm font-semibold">
                                {isPoster ? 'Your business area' : 'Preferred area for gigs'}
                            </label>
                            <div className="relative">
                                <Icon name="location_on" className="absolute left-3 top-3 text-outline text-lg pointer-events-none" />
                                <select name="area" value={form.area} onChange={update} className={`${field} pl-10 appearance-none`}>
                                    <option value="all">All Siliguri areas</option>
                                    {AREAS.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <Icon name="expand_more" className="absolute right-3 top-3 text-outline text-lg pointer-events-none" />
                            </div>
                            <p className="font-body-sm text-body-sm text-outline">You can change this any time from the dashboard.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="font-body-sm text-body-sm font-semibold">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={update}
                                placeholder="you@example.com"
                                className={field}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-body-sm text-body-sm font-semibold">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={update}
                                placeholder="At least 6 characters"
                                className={field}
                            />
                        </div>

                        {error && (
                            <div role="alert" className="rounded-xl bg-error-container text-on-error-container p-3 font-body-sm text-body-sm">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={busy}
                            className={`w-full py-3 rounded-xl font-button-text text-button-text font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${isPoster
                                    ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim'
                                    : 'bg-primary text-on-primary hover:bg-primary-container'
                                }`}
                        >
                            <Icon name={busy ? 'progress_activity' : 'arrow_forward'} className={`text-base ${busy ? 'animate-spin' : ''}`} />
                            {busy ? 'Creating account...' : 'Create account'}
                        </button>

                        <p className="font-body-sm text-body-sm text-center">
                            Already have an account? <Link to="/login" className="text-primary font-semibold">Log in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}