import { Link } from 'react-router-dom'
import {
    Zap, GraduationCap, Store, ShieldCheck, Star, MapPin, Clock,
    IndianRupee, Briefcase, ArrowRight, BadgeCheck, ClipboardList,
    Search, CheckCircle2,
} from 'lucide-react'

const sampleGigs = [
    { title: 'Cafe helper for Puja rush', tag: 'Cafe / Restaurant help', place: 'Sevoke Road, Siliguri', rate: 200, hours: 4 },
    { title: 'Event setup and stall staff', tag: 'Event staffing', place: 'Vega Circle, Siliguri', rate: 150, hours: 6 },
    { title: 'Help with house shifting', tag: 'Moving / Shifting help', place: 'Hakim Para, Siliguri', rate: 180, hours: 3 },
]

const steps = [
    { icon: ClipboardList, title: 'Post or browse', text: 'Businesses post a gig with pay, hours and location. Students browse open gigs in one feed.' },
    { icon: Search, title: 'Apply and accept', text: 'Students apply in one tap. The poster checks each applicant\'s Verified badge and rating, then accepts one.' },
    { icon: Star, title: 'Work and rate', text: 'After the gig, both sides rate each other, so trust builds with every job.' },
]

const trust = [
    { icon: BadgeCheck, title: 'Verified badges', text: 'Students and posters can verify their identity. Everyone sees who is verified.' },
    { icon: Star, title: 'Two-way ratings', text: 'Posters rate students and students rate posters, so both sides are accountable.' },
    { icon: IndianRupee, title: 'Pay shown upfront', text: 'Hourly rate and maximum hours are fixed in the listing before anyone applies.' },
    { icon: ShieldCheck, title: 'Sensitive work excluded', text: 'No childcare or in-home care categories until real background checks exist.' },
]

export default function Landing() {
    return (
        <div className="min-h-screen bg-base-200 text-base-content">
            {/* Navbar */}
            <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl text-primary">
                        <Briefcase size={22} /> GigCampus
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute -top-24 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 -left-20 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-12">
                    <div className="inline-flex items-center gap-2 badge badge-lg bg-base-100 border-base-300 mb-5">
                        <Zap size={14} className="text-secondary" /> Urgent one-day gigs for college students
                    </div>

                    <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-tight max-w-3xl">
                        Work today.{' '}
                        <span className="bg-linear-to-r from-primary to-info bg-clip-text text-transparent">
                            Earn pocket money fast.
                        </span>
                    </h1>

                    <p className="mt-5 text-lg opacity-70 max-w-2xl">
                        Cafes, event organizers, shops and households post short, same-day jobs.
                        Verified, rated students pick them up. Pay and hours are clear before you start.
                    </p>

                    <div className="mt-10 grid md:grid-cols-2 gap-5">
                        {/* Student card */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body">
                                <span className="badge badge-primary badge-soft gap-1 w-fit">
                                    <GraduationCap size={14} /> For students
                                </span>
                                <h2 className="card-title font-display text-2xl">I want gigs</h2>
                                <p className="opacity-70">
                                    Find short jobs near you that fit around classes. Build a verified work
                                    history with every rating you earn.
                                </p>
                                <div className="card-actions mt-2">
                                    <Link to="/signup?role=worker" className="btn btn-primary">
                                        Sign up as a student <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Poster card */}
                        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="card-body">
                                <span className="badge badge-secondary badge-soft gap-1 w-fit">
                                    <Store size={14} /> For businesses and event teams
                                </span>
                                <h2 className="card-title font-display text-2xl">I need help today</h2>
                                <p className="opacity-70">
                                    Short on hands for a festival rush or a one-day event? Post a gig in a
                                    minute and choose from verified, rated students.
                                </p>
                                <div className="card-actions mt-2">
                                    <Link to="/signup?role=poster" className="btn btn-secondary">
                                        Post a gig <Zap size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sample gigs */}
            <section className="bg-base-100 py-14">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-sm font-semibold text-secondary uppercase tracking-wide">Example gigs</p>
                    <h2 className="font-display font-bold text-3xl mt-1 mb-8">The kind of work you will find</h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {sampleGigs.map((g) => (
                            <div key={g.title} className="card bg-base-100 border border-base-300 shadow-sm">
                                <div className="card-body gap-3">
                                    <span className="badge badge-primary badge-outline w-fit">{g.tag}</span>
                                    <h3 className="font-display font-bold text-lg">{g.title}</h3>
                                    <div className="text-sm opacity-70 space-y-1">
                                        <p className="flex items-center gap-1"><MapPin size={14} /> {g.place}</p>
                                        <p className="flex items-center gap-1"><Clock size={14} /> Up to {g.hours} hours</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-base-200">
                                        <p className="font-display font-extrabold text-primary text-xl flex items-center">
                                            <IndianRupee size={18} />{g.rate}<span className="text-sm font-normal opacity-60">/hr</span>
                                        </p>
                                        <span className="text-sm font-semibold text-success">Up to ₹{g.rate * g.hours}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-14">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <h2 className="font-display font-bold text-3xl">How GigCampus works</h2>
                        <p className="opacity-70 mt-2">No CV screening and no long waits. Three simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {steps.map((s, i) => (
                            <div key={s.title} className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <div className="flex items-center gap-3">
                                        <span className="w-11 h-11 rounded-xl bg-primary text-primary-content grid place-items-center">
                                            <s.icon size={20} />
                                        </span>
                                        <span className="font-display font-extrabold text-3xl opacity-20">0{i + 1}</span>
                                    </div>
                                    <h3 className="font-display font-bold text-lg mt-2">{s.title}</h3>
                                    <p className="text-sm opacity-70">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust */}
            <section className="bg-base-100 py-14">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="font-display font-bold text-3xl">Built on trust</h2>
                    <p className="opacity-70 mt-2 max-w-2xl">
                        Letting a stranger into your cafe or event needs trust. GigCampus puts it
                        in front of every decision.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                        {trust.map((t) => (
                            <div key={t.title} className="flex gap-4 p-5 rounded-2xl bg-base-200">
                                <span className="w-11 h-11 shrink-0 rounded-xl bg-base-100 text-success grid place-items-center shadow-sm">
                                    <t.icon size={20} />
                                </span>
                                <div>
                                    <h3 className="font-display font-bold">{t.title}</h3>
                                    <p className="text-sm opacity-70 mt-1">{t.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-5 rounded-2xl border border-dashed border-base-300">
                        <p className="font-display font-bold mb-2">Coming next</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {['UPI payments', 'DigiLocker ID check', 'In-app chat', 'Background checks for sensitive work'].map((x) => (
                                <span key={x} className="badge badge-ghost gap-1">
                                    <CheckCircle2 size={12} /> {x}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-14 px-4">
                <div className="max-w-6xl mx-auto rounded-3xl bg-primary text-primary-content p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h2 className="font-display font-extrabold text-3xl">Hiring or looking for work today?</h2>
                        <p className="mt-2 opacity-80">Set up your account in a couple of minutes.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/signup?role=worker" className="btn bg-base-100 text-primary border-none">Join as a student</Link>
                        <Link to="/signup?role=poster" className="btn bg-secondary-container text-on-secondary-container border-none">Post a gig</Link>
                    </div>
                </div>
            </section>

            <footer className="bg-base-100 py-6 text-center text-sm opacity-70">
                GigCampus · Quick gigs. Trusted people. · Built for Hack-A-Throne
            </footer>
        </div>
    )
}