export const CATEGORIES = [
    { name: 'Event staffing', label: 'Event Staffing', icon: 'celebration', emoji: '🎪' },
    { name: 'Cafe / Restaurant help', label: 'Cafe & Food Help', icon: 'local_cafe', emoji: '☕' },
    { name: 'Moving / Shifting help', label: 'Moving & Shifting', icon: 'local_shipping', emoji: '📦' },
    { name: 'Delivery & errands', label: 'Deliveries', icon: 'moped', emoji: '🛵' },
    { name: 'Tutoring', label: 'Tutoring', icon: 'school', emoji: '📚' },
    { name: 'Other', label: 'Other', icon: 'store', emoji: '🧰' },
]

export const catOf = (name) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[5]

export const PERKS = ['Free meal included', 'College ID required', 'Basic Bengali/Hindi']

export const todayStr = () => new Date().toLocaleDateString('en-CA')

export const startOf = (g) =>
    g?.date && g?.startTime ? new Date(`${g.date}T${g.startTime}`) : null

export const endOf = (g) => {
    const s = startOf(g)
    return s ? new Date(s.getTime() + (g.maxHours ?? 0) * 3600000) : null
}

export const fmtTime = (d) =>
    d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

export const fmtDate = (d) =>
    d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : ''

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export function timeAgo(seconds) {
    if (!seconds) return 'just now'
    const mins = Math.max(0, Math.round((Date.now() / 1000 - seconds) / 60))
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} mins ago`
    const h = Math.round(mins / 60)
    if (h < 24) return `${h} hrs ago`
    return `${Math.round(h / 24)} days ago`
}