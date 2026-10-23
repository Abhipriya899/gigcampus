import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'
import PostGigForm from './PostGigForm'
import ManageGigs from './ManageGigs'

export default function PosterWorkspace({ focusId }) {
    const { user, profile } = useAuth()
    const [gigs, setGigs] = useState([])
    const [apps, setApps] = useState([])
    const [selectedId, setSelectedId] = useState(focusId ?? null)

    useEffect(() => {
        if (focusId) setSelectedId(focusId)
    }, [focusId])

    useEffect(() => {
        const q = query(collection(db, 'gigs'), where('posterId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                list.sort((a, b) => (b.createdAt?.seconds ?? 9e9) - (a.createdAt?.seconds ?? 9e9))
                setGigs(list)
            },
            (err) => console.error(err)
        )
    }, [user.uid])

    useEffect(() => {
        const q = query(collection(db, 'applications'), where('posterId', '==', user.uid))
        return onSnapshot(
            q,
            (snap) => setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error(err)
        )
    }, [user.uid])

    const open = gigs.filter((g) => g.status === 'open').length
    const filled = gigs.filter((g) => g.status === 'filled').length

    return (
        <div className="w-full">
            {/* Top bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-lg bg-surface-container-low p-space-md rounded-2xl shadow-sm">
                <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                        <Icon name="storefront" className="text-2xl" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-space-xs">
                            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                                {profile.name}
                            </h1>
                            {profile.verified ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-badge text-label-badge font-semibold">
                                    <Icon name="verified" className="text-xs" /> Verified Poster
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-badge text-label-badge font-semibold">
                                    Unverified
                                </span>
                            )}
                            {profile.ratingCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-badge text-label-badge font-bold">
                                    ⭐ {profile.rating} ({profile.ratingCount})
                                </span>
                            )}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Gig poster account • Verified posters get more applicants
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-space-lg w-full lg:w-auto justify-around lg:justify-end bg-surface-container-lowest px-space-md py-2.5 rounded-xl shadow-sm">
                    <div className="text-center">
                        <span className="font-body-sm text-body-sm text-outline block">Posted</span>
                        <span className="font-label-currency-md text-label-currency-md text-on-surface">{gigs.length}</span>
                    </div>
                    <div className="w-px h-8 bg-surface-container-highest"></div>
                    <div className="text-center">
                        <span className="font-body-sm text-body-sm text-outline block">Open</span>
                        <span className="font-label-currency-md text-label-currency-md text-secondary">{open}</span>
                    </div>
                    <div className="w-px h-8 bg-surface-container-highest"></div>
                    <div className="text-center">
                        <span className="font-body-sm text-body-sm text-outline block">Filled</span>
                        <span className="font-label-currency-md text-label-currency-md text-tertiary">{filled}</span>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                <div className="lg:col-span-7">
                    <PostGigForm onPosted={setSelectedId} />
                </div>
                <div className="lg:col-span-5">
                    <ManageGigs gigs={gigs} apps={apps} selectedId={selectedId} onSelect={setSelectedId} />
                </div>
            </div>
        </div>
    )
}