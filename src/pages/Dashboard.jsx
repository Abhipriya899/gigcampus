import { useState } from 'react'
import { useAuth } from '../AuthContext'
import Icon from '../components/Icon'
import AreaSelect from '../components/AreaSelect'
import ExploreGigs from '../components/ExploreGigs'
import MyApplications from '../components/MyApplications'
import MyPostedGigs from '../components/MyPostedGigs'
import PosterWorkspace from '../components/PosterWorkspace'
import VerificationCard from '../components/VerificationCard'

export default function Dashboard() {
    const { profile, logout } = useAuth()
    const [tab, setTab] = useState(null)
    const [manageId, setManageId] = useState(null)

    if (!profile) return <span className="loading loading-spinner loading-lg m-10" />

    const isPoster = profile.role === 'poster'
    const tabs = isPoster
        ? [['post', 'Post a Gig'], ['mine', 'My Gigs']]
        : [['find', 'Explore Gigs'], ['apps', 'My Applications']]
    const active = tab ?? tabs[0][0]
    const activeLabel = tabs.find(([k]) => k === active)[1]
    const initial = (profile.name || '?').trim().charAt(0).toUpperCase()

    const manage = (id) => {
        setManageId(id)
        setTab('post')
    }

    return (
        <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <div className="h-20 max-w-[1280px] mx-auto px-margin md:px-margin-desktop flex items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm flex-shrink-0">
                        <Icon name="work" fill className="text-primary text-3xl" />
                        <span className="hidden sm:inline font-headline-md text-headline-md font-bold tracking-tight text-primary">
                            GigCampus
                        </span>
                    </div>

                    <nav className="flex items-center gap-space-xs font-button-text text-button-text">
                        {tabs.map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`px-space-md py-2 transition-all rounded-xl whitespace-nowrap ${active === key
                                        ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-space-md flex-shrink-0">
                        <div className="hidden sm:block text-right leading-tight">
                            <p className="font-body-md text-body-md font-semibold">{profile.name}</p>
                            <p className="font-body-sm text-body-sm text-outline">{isPoster ? 'Gig Poster' : 'Student'}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container grid place-items-center font-bold ring-2 ring-primary-fixed">
                            {initial}
                        </div>
                        <button
                            onClick={logout}
                            title="Log out"
                            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        >
                            <Icon name="logout" className="text-xl" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full pt-20 bg-background min-h-screen">
                {/* Breadcrumb + location */}
                <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-sm flex items-center justify-between gap-space-sm flex-wrap">
                    <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
                        <span>Campus Hub</span>
                        <Icon name="chevron_right" className="text-sm" />
                        <span className="text-on-surface-variant font-medium">{activeLabel}</span>
                    </nav>
                    <AreaSelect />
                </div>

                <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-md space-y-space-lg">
                    <VerificationCard />
                    {active === 'post' && <PosterWorkspace focusId={manageId} />}
                    {active === 'mine' && <MyPostedGigs onManage={manage} onNew={() => setTab('post')} />}
                    {active === 'find' && <ExploreGigs goToApps={() => setTab('apps')} />}
                    {active === 'apps' && <MyApplications />}
                </div>
            </main>

            <footer className="w-full bg-surface-container-lowest mt-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
                <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">GigCampus</span>
                        <span className="text-outline">•</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Verified micro-work network for college students
                        </span>
                    </div>
                    <div className="font-body-sm text-body-sm text-outline">© 2026 GigCampus. Built for Hack-A-Throne.</div>
                </div>
            </footer>
        </div>
    )
}