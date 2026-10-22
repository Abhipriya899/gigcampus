import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default function Signup() {
    const [params] = useSearchParams()
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        role: params.get('role') === 'poster' ? 'poster' : 'worker',
    })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const navigate = useNavigate()

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
            await setDoc(doc(db, 'users', cred.user.uid), {
                name: form.name,
                email: form.email,
                role: form.role, // "worker" or "poster"
                verified: false,
                idStatus: 'none',
                rating: 0,
                ratingCount: 0,
                createdAt: serverTimestamp(),
            })
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    const roleBtn = (value, label) => (
        <button
            type="button"
            onClick={() => setForm({ ...form, role: value })}
            className={`flex-1 rounded-lg border p-3 text-sm font-medium ${form.role === value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-300'
                }`}
        >
            {label}
        </button>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4">
                <h1 className="text-2xl font-bold">Join GigCampus</h1>

                <div className="flex gap-2">
                    {roleBtn('worker', "I'm a Student")}
                    {roleBtn('poster', 'I want to Post Gigs')}
                </div>

                <input name="name" placeholder="Full name" required onChange={update}
                    className="w-full border rounded-lg p-2" />
                <input name="email" type="email" placeholder="Email" required onChange={update}
                    className="w-full border rounded-lg p-2" />
                <input name="password" type="password" placeholder="Password (min 6 chars)" required minLength={6}
                    onChange={update} className="w-full border rounded-lg p-2" />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button disabled={busy} className="w-full bg-indigo-600 text-white rounded-lg p-2 font-medium disabled:opacity-50">
                    {busy ? 'Creating...' : 'Sign up'}
                </button>
                <p className="text-sm text-center">
                    Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
                </p>
            </form>
        </div>
    )
}