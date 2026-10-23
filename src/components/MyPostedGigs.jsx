import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, query, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../AuthContext'
import Icon from './Icon'
import { catOf, endOf, fmtDate, fmtTime, inr, startOf, todayStr } from '../constants'

const STATUS = {
  open: { label: 'Open', pill: 'bg-secondary-fixed/50 text-secondary', bar: 'bg-secondary-container' },
  filled: { label: 'Filled', pill: 'bg-tertiary/10 text-tertiary', bar: 'bg-tertiary' },
  closed: { label: 'Closed', pill: 'bg-surface-container-high text-on-surface-variant', bar: 'bg-outline-variant' },
  expired: { label: 'Expired', pill: 'bg-error-container text-on-error-container', bar: 'bg-error' },
}

function statusOf(g, today) {
  if (g.status === 'closed') return 'closed'
  if (g.status === 'filled') return 'filled'
  if ((g.date ?? '') < today) return 'expired'
  return 'open'
}

export default function MyPostedGigs({ onManage, onNew }) {
  const { user } = useAuth()
  const [gigs, setGigs] = useState([])
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const today = todayStr()

  useEffect(() => {
    const q = query(collection(db, 'gigs'), where('posterId', '==', user.uid))
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds ?? 9e9) - (a.createdAt?.seconds ?? 9e9))
        setGigs(list)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setLoading(false)
      }
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

  const rows = useMemo(
    () => gigs.map((g) => ({ g, st: statusOf(g, today), gApps: apps.filter((a) => a.gigId === g.id) })),
    [gigs, apps, today]
  )

  const count = (fn) => rows.filter(fn).length
  const tabs = [
    ['all', 'All Gigs', rows.length],
    ['open', 'Open', count((r) => r.st === 'open')],
    ['filled', 'Filled', count((r) => r.st === 'filled')],
    ['closed', 'Closed / Past', count((r) => r.st === 'closed' || r.st === 'expired')],
  ]

  const visible = rows.filter((r) => {
    if (tab === 'all') return true
    if (tab === 'closed') return r.st === 'closed' || r.st === 'expired'
    return r.st === tab
  })

  const pendingTotal = apps.filter((a) => a.status === 'pending').length

  const close = async (g) => {
    try {
      await updateDoc(doc(db, 'gigs', g.id), { status: 'closed' })
    } catch (err) {
      alert('Could not close: ' + err.message)
    }
  }

  const reopen = async (g) => {
    const full = (g.acceptedCount ?? 0) >= (g.spots ?? 1)
    try {
      await updateDoc(doc(db, 'gigs', g.id), { status: full ? 'filled' : 'open' })
    } catch (err) {
      alert('Could not reopen: ' + err.message)
    }
  }

  const remove = async (g, gApps) => {
    if (!window.confirm(`Delete "${g.title}"? Its applications will be removed too. This cannot be undone.`)) return
    try {
      const batch = writeBatch(db)
      gApps.forEach((a) => batch.delete(doc(db, 'applications', a.id)))
      batch.delete(doc(db, 'gigs', g.id))
      await batch.commit()
    } catch (err) {
      alert('Could not delete: ' + err.message)
    }
  }

  return (
    <div className="w-full">
      {/* Stats banner */}
      <div className="bg-surface-container-low rounded-2xl p-space-md mb-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md">
            <Icon name="campaign" className="text-2xl" />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Your posted gigs</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Every gig you have posted, with its status and applicants.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-lg self-end md:self-auto">
          <div className="text-right">
            <span className="font-body-sm text-body-sm text-outline block">Total posted</span>
            <span className="font-label-currency-lg text-label-currency-lg text-on-surface">{rows.length}</span>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div className="text-right">
            <span className="font-body-sm text-body-sm text-outline block">Open</span>
            <span className="font-label-currency-lg text-label-currency-lg text-secondary">
              {count((r) => r.st === 'open')}
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container-highest"></div>
          <div className="text-right">
            <span className="font-body-sm text-body-sm text-outline block">New applicants</span>
            <span className="font-label-currency-lg text-label-currency-lg text-tertiary">{pendingTotal}</span>
          </div>
        </div>
      </div>

      {/* Tabs + new gig */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg border-b border-surface-container pb-space-sm">
        <div className="inline-flex p-1 bg-surface-container rounded-xl shadow-inner gap-1 overflow-x-auto max-w-full" role="tablist">
          {tabs.map(([key, label, n]) => (
            <button
              key={key}
              role="tab"
              onClick={() => setTab(key)}
              className={`px-space-md py-2 rounded-lg font-button-text text-button-text flex items-center gap-space-xs transition-all whitespace-nowrap ${
                tab === key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === key
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {n}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onNew}
          className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-button-text text-button-text hover:bg-secondary-fixed-dim transition-all shadow-[0_2px_8px_rgba(254,166,25,0.25)]"
        >
          <Icon name="bolt" className="text-lg" />
          <span>Post a new gig</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <span className="loading loading-spinner loading-md" />
      ) : visible.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm text-center">
          <Icon name="inbox" className="text-5xl text-outline" />
          <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">
            {rows.length === 0 ? "You haven't posted any gigs yet" : 'Nothing in this tab'}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Post a gig and students will start applying right away.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          {visible.map(({ g, st, gApps }) => {
            const s = STATUS[st]
            const c = catOf(g.category)
            const start = startOf(g)
            const end = endOf(g)
            const spots = g.spots ?? 1
            const filled = g.acceptedCount ?? 0
            const pending = gApps.filter((a) => a.status === 'pending').length

            return (
              <article
                key={g.id}
                className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col gap-space-md"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.bar}`}></div>

                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-label-badge text-label-badge font-semibold ${s.pill}`}
                    >
                      {s.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-badge text-label-badge flex items-center gap-1">
                      <Icon name={c.icon} className="text-xs" /> {c.label}
                    </span>
                  </div>
                  <span className="font-label-badge text-label-badge text-outline">
                    ID #GC-{g.id.slice(-4).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                    {g.title}
                  </h3>
                  <div className="mt-2 space-y-1 font-body-sm text-body-sm text-on-surface-variant">
                    <p className="flex items-center gap-1.5">
                      <Icon name="event_upcoming" className="text-primary text-base" />
                      {fmtDate(start)}, {fmtTime(start)} – {fmtTime(end)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Icon name="location_on" className="text-primary text-base" />
                      {g.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-container-low text-center">
                  <div>
                    <div className="font-label-currency-md text-label-currency-md text-primary font-extrabold">
                      {gApps.length}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Applicants</div>
                  </div>
                  <div>
                    <div className="font-label-currency-md text-label-currency-md text-on-surface font-extrabold">
                      {filled}/{spots}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Filled</div>
                  </div>
                  <div>
                    <div className="font-label-currency-md text-label-currency-md text-tertiary font-extrabold">
                      {inr(g.hourlyRate)}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Per hour</div>
                  </div>
                </div>

                {pending > 0 && (
                  <div className="flex items-center gap-2 bg-secondary-fixed/30 text-secondary rounded-xl px-3 py-2 font-body-sm text-body-sm font-semibold">
                    <Icon name="notifications_active" className="text-base" />
                    {pending} applicant{pending > 1 ? 's' : ''} waiting for your decision
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-auto">
                  <button
                    onClick={() => onManage(g.id)}
                    className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-primary text-on-primary font-button-text text-button-text font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Icon name="groups" className="text-base" />
                    <span>Manage applicants</span>
                  </button>

                  {st === 'closed' ? (
                    <button
                      onClick={() => reopen(g)}
                      className="py-2.5 px-4 rounded-xl bg-surface-container text-on-surface font-button-text text-button-text hover:bg-surface-container-high transition-all"
                    >
                      Reopen
                    </button>
                  ) : (
                    st !== 'expired' && (
                      <button
                        onClick={() => close(g)}
                        className="py-2.5 px-4 rounded-xl bg-surface-container text-on-surface font-button-text text-button-text hover:bg-surface-container-high transition-all"
                      >
                        Close
                      </button>
                    )
                  )}

                  <button
                    onClick={() => remove(g, gApps)}
                    title="Delete gig"
                    className="py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                  >
                    <Icon name="delete" className="text-lg" />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}