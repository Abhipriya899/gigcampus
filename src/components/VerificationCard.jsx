import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'

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
            <div className="flex items-center gap-space-sm bg-tertiary/10 text-tertiary rounded-2xl p-space-md">
                <Icon name="verified" fill className="text-2xl" />
                <p className="font-body-md text-body-md font-medium">
                    Your identity is verified. Others see the Verified badge next to your name.
                </p>
            </div>
        )

    if (profile.idStatus === 'pending')
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-secondary-fixed/40 rounded-2xl p-space-md">
                <div className="flex items-center gap-space-sm text-secondary">
                    <Icon name="hourglass_empty" className="text-2xl" />
                    <p className="font-body-md text-body-md font-medium">
                        Verification pending review ({profile.idType}).
                    </p>
                </div>
                <button
                    onClick={demoApprove}
                    className="px-space-md py-2 rounded-xl bg-inverse-surface text-inverse-on-surface font-button-text text-button-text"
                >
                    Demo only: approve me
                </button>
            </div>
        )

    return (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md flex flex-col lg:flex-row lg:items-center gap-space-md">
            <div className="flex items-start gap-space-sm lg:flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
                    <Icon name="verified_user" className="text-2xl" />
                </div>
                <div>
                    <p className="font-headline-sm text-headline-sm font-bold text-on-surface">Get verified</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Verified users earn more trust and win more gigs.
                    </p>
                </div>
            </div>

            <div className="relative lg:w-56">
                <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full appearance-none bg-surface-container-low pl-3 pr-8 py-2.5 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {ids.map((i) => (
                        <option key={i}>{i}</option>
                    ))}
                </select>
                <Icon name="expand_more" className="absolute right-2 top-2.5 text-outline text-lg pointer-events-none" />
            </div>

            <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant cursor-pointer lg:max-w-[220px]">
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary flex-shrink-0"
                />
                I agree to GigCampus checking my ID for verification.
            </label>

            <button
                onClick={submit}
                disabled={!consent}
                className="px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-button-text text-button-text font-bold shadow-sm hover:bg-primary-container transition-all disabled:opacity-50"
            >
                Submit for verification
            </button>
        </div>
    )
}