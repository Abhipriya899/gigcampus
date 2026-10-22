import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Briefcase } from 'lucide-react'
import { auth } from '../firebase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/')
        } catch {
            setError('Wrong email or password')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <Briefcase className="mx-auto text-primary" size={40} />
                    <h1 className="text-3xl font-bold mt-2">GigCampus</h1>
                    <p className="opacity-70 text-sm mt-1">Quick gigs. Trusted people. Pocket money, today.</p>
                </div>

                <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                    <div className="card-body gap-3">
                        <h2 className="card-title">Welcome back</h2>
                        <input type="email" placeholder="Email" required value={email}
                            onChange={(e) => setEmail(e.target.value)} className="input w-full" />
                        <input type="password" placeholder="Password" required value={password}
                            onChange={(e) => setPassword(e.target.value)} className="input w-full" />
                        {error && <div role="alert" className="alert alert-error py-2 text-sm">{error}</div>}
                        <button disabled={busy} className="btn btn-primary w-full">
                            {busy ? <span className="loading loading-spinner loading-sm" /> : 'Log in'}
                        </button>
                        <p className="text-sm text-center">
                            New here? <Link to="/signup" className="link link-primary">Create an account</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}