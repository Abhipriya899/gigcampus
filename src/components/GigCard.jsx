import { MapPin, CalendarDays, Clock, IndianRupee } from 'lucide-react'
import TrustBadge from './TrustBadge'

export default function GigCard({ gig, children }) {
    const total = gig.hourlyRate * gig.maxHours

    return (
        <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body gap-3 p-5">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="card-title text-lg">{gig.title}</h3>
                    <span className="badge badge-primary badge-outline whitespace-nowrap">{gig.category}</span>
                </div>

                <p className="text-sm opacity-70">{gig.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-1"><CalendarDays size={14} /> {gig.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {gig.startTime} · up to {gig.maxHours}h</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {gig.location}</span>
                    <span className="flex items-center gap-1 font-semibold text-success">
                        <IndianRupee size={14} /> {gig.hourlyRate}/hr · up to ₹{total}
                    </span>
                </div>

                <div className="text-xs opacity-70 flex items-center gap-1 flex-wrap">
                    Posted by <TrustBadge userId={gig.posterId} name={gig.posterName} />
                </div>

                {children}
            </div>
        </div>
    )
}