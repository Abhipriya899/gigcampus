import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'
import { AREAS } from '../constants'

export default function AreaSelect() {
    const { user, profile } = useAuth()
    const value = profile?.area ?? 'all'

    const change = async (e) => {
        try {
            await updateDoc(doc(db, 'users', user.uid), { area: e.target.value })
        } catch (err) {
            alert('Could not change location: ' + err.message)
        }
    }

    return (
        <div className="relative inline-flex items-center">
            <Icon name="location_on" className="absolute left-3 text-primary text-base pointer-events-none" />
            <select
                value={value}
                onChange={change}
                className="appearance-none bg-surface-container text-on-surface font-label-badge text-label-badge pl-9 pr-8 py-2 rounded-full hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
                <option value="all">All Siliguri areas</option>
                {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                ))}
            </select>
            <Icon name="expand_more" className="absolute right-2 text-outline text-sm pointer-events-none" />
        </div>
    )
}