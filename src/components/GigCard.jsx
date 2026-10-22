import TrustBadge from './TrustBadge'
export default function GigCard({ gig, children }) {
    const total = gig.hourlyRate * gig.maxHours

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-2">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-lg">{gig.title}</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {gig.category}
                </span>
            </div>

            <p className="text-sm text-gray-600">{gig.description}</p>

            <div className="text-sm text-gray-700 grid grid-cols-2 gap-1">
                <span>📅 {gig.date} at {gig.startTime}</span>
                <span>📍 {gig.location}</span>
                <span>💰 ₹{gig.hourlyRate}/hr</span>
                <span>⏱️ Up to {gig.maxHours} hrs</span>
            </div>

            <p className="text-sm font-medium text-green-700">Earn up to ₹{total}</p>
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                Posted by <TrustBadge userId={gig.posterId} name={gig.posterName} />
            </div>

            {children}
        </div>
    )
}