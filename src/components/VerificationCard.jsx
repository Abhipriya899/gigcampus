import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { ShieldCheck, Hourglass } from 'lucide-react'
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
            <div role="alert" className="alert alert-success py-2 text-sm">
                <ShieldCheck size={18} /> Your identity is verified. Others see the Verified badge on your profile.
            </div>
        )

    if (profile.idStatus === 'pending')
        return (
            <div role="alert" className="alert alert-warning text-sm">
                <Hourglass size={18} />
                <span>Verification pending review ({profile.idType}).</span>
                <button onClick={demoApprove} className="btn btn-xs btn-neutral">Demo only: approve me</button>
            </div>
        )

    return (
        <div className="card bg-base-100 shadow-md">
            <div className="card-body gap-2 p-4">
                <p className="font-semibold flex items-center gap-2"><ShieldCheck size={18} /> Get verified</p>
                <p className="text-xs opacity-60">Verified users earn more trust and more responses.</p>
                <select value={idType} onChange={(e) => setIdType(e.target.value)} className="select select-sm w-full">
                    {ids.map((i) => <option key={i}>{i}</option>)}
                </select>
                <label className="flex items-start gap-2 text-xs cursor-pointer">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={consent}
                        onChange={(e) => setConsent(e.target.checked)} />
                    I agree to GigCampus checking my ID for verification.
                </label>
                <button onClick={submit} disabled={!consent} className="btn btn-primary btn-sm">
                    Submit for verification
                </button>
            </div>
        </div>
    )
}