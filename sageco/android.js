import Head from "next/head"
import Link from "next/link"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useState } from "react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sageco-evergreen.vercel.app"

export default function AndroidComingSoon() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = (e) => {
    e.preventDefault()
    if (!email) return
    // TODO: wire to Supabase notify list
    setSubmitted(true)
    setEmail("")
  }

  return (
    <>
      <Head>
        <title>Android App Coming Soon | SAGECO EVERGREEN</title>
        <meta name="description" content="The SAGECO EVERGREEN Android app is coming soon. Browse properties, book viewings, and connect with brokers — all from your phone." />
        <meta property="og:title" content="SAGECO EVERGREEN Android App — Coming Soon" />
        <meta property="og:description" content="Uganda's premier real estate platform, now on Android. Coming soon." />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <link rel="canonical" href={`${SITE_URL}/android`} />
      </Head>

      <Navbar />

      <main className="min-h-[85vh] bg-gradient-to-br from-primary to-green-900 text-white flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-secondary font-semibold text-xs px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
            🤖 Android App — Coming Soon
          </div>

          {/* Android icon */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-white/10 border-2 border-white/20 rounded-3xl flex items-center justify-center text-6xl shadow-xl">
              📱
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            SAGECO EVERGREEN<br />
            <span className="text-secondary">on Android</span>
          </h1>

          <p className="text-green-100 text-lg mb-4 max-w-lg mx-auto">
            We're building the ultimate real estate app for Uganda — find properties, book viewings, and connect with top brokers, all from your phone.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10 text-sm">
            {[
              { icon: "🏠", label: "Browse Listings", desc: "Search properties by location, type & price" },
              { icon: "📅", label: "Book Viewings", desc: "Schedule visits directly from your phone" },
              { icon: "🤝", label: "Find Brokers", desc: "Connect with verified brokers near you" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-2xl p-4">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-bold text-white">{label}</div>
                <div className="text-green-200 text-xs mt-1">{desc}</div>
              </div>
            ))}
          </div>

          {/* Notify form */}
          {!submitted ? (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full text-dark text-sm outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="bg-secondary text-dark font-bold px-6 py-3 rounded-full hover:opacity-90 text-sm whitespace-nowrap"
              >
                Notify Me 🔔
              </button>
            </form>
          ) : (
            <div className="bg-white/10 border border-secondary/40 text-secondary font-semibold px-6 py-3 rounded-full inline-block text-sm">
              ✅ You're on the list! We'll let you know when it launches.
            </div>
          )}

          <p className="text-green-300 text-xs mt-4">No spam. Just one email when the app goes live.</p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              href="/"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-primary transition text-sm"
            >
              ← Back to Home
            </Link>
            <Link
              href="/properties"
              className="bg-secondary text-dark font-bold px-8 py-3 rounded-full hover:opacity-90 text-sm"
            >
              Browse Properties
            </Link>
          </div>

          {/* Dots */}
          <div className="mt-14 flex gap-2 justify-center opacity-20">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`rounded-full bg-white ${i === 3 ? "w-4 h-2" : "w-2 h-2"}`} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
