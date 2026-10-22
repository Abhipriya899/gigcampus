import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/')
        } catch {
            setError('Wrong email or password')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <input type="email" placeholder="Email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-2" />
                <input type="password" placeholder="Password" required value={password}
                    onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-2" />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button className="w-full bg-indigo-600 text-white rounded-lg p-2 font-medium">Log in</button>
                <p className="text-sm text-center">
                    New here? <Link to="/signup" className="text-indigo-600">Sign up</Link>
                </p>
            </form>
        </div>
    )
}