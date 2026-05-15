import Head from "next/head"
import Link from "next/link"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function ComingSoon({ title = "Coming Soon", subtitle = "We're working on something great. Stay tuned!" }) {
  return (
    <>
      <Head>
        <title>{title} | SAGECO EVERGREEN</title>
        <meta name="description" content={subtitle} />
      </Head>
      <Navbar />

      <main className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary to-green-800 text-white px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-secondary font-semibold text-sm px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
          🚧 Coming Soon
        </div>

        {/* Icon */}
        <div className="text-7xl mb-6">🌿</div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl">{title}</h1>
        <p className="text-lg md:text-xl text-green-100 max-w-xl mb-10">{subtitle}</p>

        {/* CTA */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="bg-secondary text-dark font-bold px-8 py-3 rounded-full hover:opacity-90 text-base"
          >
            ← Back to Home
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-primary text-base transition"
          >
            Contact Us
          </Link>
        </div>

        {/* Decorative dots */}
        <div className="mt-16 flex gap-2 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full" />
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
