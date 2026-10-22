import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'

export default function VerificationCard() {
    const { user, profile } = useAuth()
    const ids =
        profile.role === 'poster'
            ? ['Shop / business licence', 'Aadhaar', 'Other government ID']
            : ['College ID', 'Aadhaar', 'Other government ID']
    const [idType, setIdType] = useState(ids[0])
    const [consent, setConsent] = useState(false)

    const ref = doc(db, 'users', user.uid)
    const submit = () => updateDoc(ref, { idStatus: 'pending', idType })
    const demoApprove = () => updateDoc(ref, { idStatus: 'verified', verified: true })

    if (profile.verified)
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                ✓ Your identity is verified. Others will see the Verified badge on your profile.
            </div>
        )

    if (profile.idStatus === 'pending')
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm space-y-2">
                <p className="text-yellow-800">⏳ Verification pending review ({profile.idType}).</p>
                <button onClick={demoApprove} className="text-xs bg-gray-800 text-white rounded px-2 py-1">
                    Demo only: approve me
                </button>
            </div>
        )

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-2">
            <p className="font-semibold">Get verified</p>
            <p className="text-xs text-gray-500">Verified users get more trust and more responses.</p>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                {ids.map((i) => <option key={i}>{i}</option>)}
            </select>
            <label className="flex gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                I agree to GigCampus checking my ID for verification.
            </label>
            <button
                onClick={submit}
                disabled={!consent}
                className="bg-indigo-600 text-white rounded-lg px-3 py-1 text-sm disabled:opacity-50"
            >
                Submit for verification
            </button>
        </div>
    )
}