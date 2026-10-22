import { useAuth } from '../AuthContext'
import PostGigForm from '../components/PostGigForm'
import GigList from '../components/GigList'
import MyApplications from '../components/MyApplications'
import VerificationCard from '../components/VerificationCard'

export default function Dashboard() {
    const { profile, logout } = useAuth()

    if (!profile) return <p className="p-6">Loading your profile...</p>

    const isPoster = profile.role === 'poster'

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-600">GigCampus</h1>
                    <div className="text-sm text-right">
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-gray-500">{isPoster ? 'Gig Poster' : 'Student Worker'}</p>
                    </div>
                    <button onClick={logout} className="text-sm text-red-600">Log out</button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 space-y-6">
                <VerificationCard />
                {isPoster ? (
                    <>
                        <PostGigForm />
                        <section>
                            <h2 className="text-lg font-bold mb-3">Your gigs</h2>
                            <GigList mode="mine" />
                        </section>
                    </>
                ) : (
                    <>
                        <section>
                            <h2 className="text-lg font-bold mb-3">My applications</h2>
                            <MyApplications />
                        </section>
                        <section>
                            <h2 className="text-lg font-bold mb-3">Open gigs near you</h2>
                            <GigList mode="open" />
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}