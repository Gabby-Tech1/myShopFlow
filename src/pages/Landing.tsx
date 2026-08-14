import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Mic, Wallet, BarChart3, ShoppingCart, ShieldCheck, TrendingUp,
  Package, Coins, HandCoins, CheckCircle2, Play, Zap,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { money } from '@/lib/format'

const FEATURES = [
  { icon: <ShoppingCart className="h-5 w-5" />, title: 'Point of Sale', desc: 'Ring up sales in seconds — stock, cash and customer balances update themselves.' },
  { icon: <Wallet className="h-5 w-5" />, title: 'Real Cash Flow', desc: 'See money actually entering and leaving, explained in plain language.' },
  { icon: <Mic className="h-5 w-5" />, title: 'Voice Registration', desc: 'Add a customer just by speaking their name and phone number.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Reports that answer', desc: 'Every report answers a real business question, not a wall of numbers.' },
  { icon: <Coins className="h-5 w-5" />, title: 'Live FX Rates', desc: 'Convert GHS, USD, EUR and more with historical reference rates.' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Roles & Access', desc: 'Owners see the full picture; staff see only what they need.' },
]

const STEPS = [
  { n: '01', title: 'Track Everything', desc: 'Sales, stock, customers and expenses — captured once, everywhere.', icon: <Package className="h-5 w-5" /> },
  { n: '02', title: 'Understand Your Business', desc: 'Plain-language insights and cash flow you can actually read.', icon: <TrendingUp className="h-5 w-5" /> },
  { n: '03', title: 'Grow Smarter', desc: 'Know your best sellers, your margins and who owes you.', icon: <HandCoins className="h-5 w-5" /> },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#F8F8F6]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#features" className="transition-colors hover:text-ink">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link to="/get-started"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-canary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brick/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-canary/25 bg-canary-50 px-3 py-1.5 text-xs font-bold text-canary-700">
              <Zap className="h-3.5 w-3.5" /> Built for ambitious local businesses
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[68px]">
              Smart Inventory.<br /><span className="text-canary-600">Smarter</span> Cash Flow.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              MyShopFlow runs your inventory, sales, customers and cash flow from one place — enter a business action once, and everything updates automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/get-started"><Button size="lg">Get Started <ArrowRight className="h-5 w-5" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline"><Play className="h-4 w-4" /> Explore demo</Button></Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              {['No accounting jargon', 'Works on any device', 'Built for Ghana first'].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-inflow" /> {t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
            <PhotoHero />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white/70">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-black/[0.06] px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[['One action', 'updates everything'], ['Real-time', 'stock and cash'], ['Owner + staff', 'permission controls'], ['Ghana-first', 'currency and workflows']].map(([value, label]) => (
            <div key={value} className="px-4 py-6 text-center"><p className="text-lg font-extrabold text-ink">{value}</p><p className="mt-0.5 text-xs text-ink-soft">{label}</p></div>
          ))}
        </div>
      </section>

      {/* Value steps */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-9 max-w-xl"><p className="eyebrow mb-2">A connected workflow</p><h2 className="text-3xl font-extrabold text-ink sm:text-4xl">From daily operations to confident decisions.</h2></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="group rounded-3xl bg-paper p-7 ring-1 ring-black/[0.06] shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-canary-100 text-canary-700">{s.icon}</span>
                <span className="text-2xl font-bold text-hair">{s.n}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[32px] bg-sidebar shadow-pop lg:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[480px]">
            <img src="/images/landing-inventory-team.png" alt="Retail staff checking inventory together" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sidebar/60 via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="eyebrow text-canary">Built for the whole team</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">Everyone knows what to do next.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/60">Give staff the tools to sell and manage stock quickly, while owners keep visibility over performance, permissions and cash.</p>
            <div className="mt-7 space-y-3">
              {['Live inventory on every sale', 'Clear roles for owners and staff', 'One source of truth across the shop'].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-semibold text-white/80"><CheckCircle2 className="h-5 w-5 text-canary" />{item}</p>)}
            </div>
            <Link to="/get-started" className="mt-8"><Button size="lg">Set up your shop <ArrowRight className="h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Everything your shop needs</h2>
          <p className="mt-2 text-ink-soft">One connected system — not six disconnected tools.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-3xl bg-paper p-6 ring-1 ring-black/[0.06] shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-canary transition-transform duration-300 group-hover:scale-110">{f.icon}</span>
              <h3 className="mt-4 text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-sidebar px-6 py-14 text-center shadow-pop sm:px-12">
          <h2 className="text-3xl font-bold text-white">Ready to run a smarter shop?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">Try the full MyShopFlow demo — no sign-up friction, real data you can play with.</p>
          <Link to="/get-started" className="mt-6 inline-block"><Button size="lg">Get Started <ArrowRight className="h-5 w-5" /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-hair py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-sm text-ink-soft">MyShopFlow — Smart Inventory. Smarter Cash Flow.</p>
        </div>
      </footer>
    </div>
  )
}

function PhotoHero() {
  return (
    <div className="relative mx-auto max-w-[620px] pb-8 sm:pl-8">
      <div className="relative h-[500px] overflow-hidden rounded-[32px] bg-sidebar shadow-pop ring-1 ring-black/10 sm:h-[560px]">
        <img src="/images/landing-shop-owner.png" alt="Ghanaian shop owner using MyShopFlow at her counter" className="h-full w-full object-cover object-[58%_center]" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/55 via-transparent to-transparent" />
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-sidebar/75 p-4 text-white shadow-xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Today's performance</p><p className="mt-1 text-2xl font-extrabold tnum">{money(1840)}</p></div><span className="flex items-center gap-1 rounded-full bg-inflow/20 px-2.5 py-1 text-xs font-bold text-emerald-300"><TrendingUp className="h-3.5 w-3.5" /> 12%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-canary" /></div>
        </div>
      </div>
      <div className="absolute left-0 top-8 hidden rounded-2xl bg-white p-3.5 shadow-pop ring-1 ring-black/[0.06] sm:block"><p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Cash balance</p><p className="mt-1 text-lg font-extrabold text-ink tnum">{money(28450)}</p></div>
      <div className="absolute bottom-0 right-5 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-pop ring-1 ring-black/[0.06]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-canary text-ink"><Mic className="h-5 w-5" /></span><div><p className="text-sm font-bold text-ink">Voice-ready</p><p className="text-xs text-ink-soft">Faster customer capture</p></div></div>
    </div>
  )
}

function HeroCard() {
  return (
    <div className="rounded-3xl border border-hair bg-paper p-5 shadow-pop">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft">Cash Balance</p>
          <p className="text-2xl font-bold text-ink tnum">{money(28450)}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><TrendingUp className="h-3.5 w-3.5" /> +12%</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Today's Sales", value: money(1840), tone: 'bg-canary-50 text-canary-700' },
          { label: 'Outstanding', value: money(2350), tone: 'bg-brick-50 text-brick-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-canvas p-3.5">
            <p className="text-xs text-ink-soft">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-ink tnum">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-1.5 rounded-2xl bg-canvas p-4">
        {[40, 62, 48, 78, 56, 90, 72].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-canary" style={{ height: `${h}px`, opacity: 0.35 + i * 0.09 }} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-hair p-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-canary"><Mic className="h-5 w-5" /></span>
        <div><p className="text-sm font-semibold text-ink">“Register Yaw Darko, 055 209 6634”</p><p className="text-xs text-ink-soft">Customer captured by voice</p></div>
      </div>
    </div>
  )
}
