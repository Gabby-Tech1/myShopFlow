import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, Mic, Wallet, BarChart3, ShoppingCart, ShieldCheck, TrendingUp,
  Package, Coins, HandCoins, CheckCircle2, Play, Zap, Menu, X,
  Store, UserCog, LockKeyhole, ChevronDown, Building2, Mail,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { money } from '@/lib/format'

const FEATURES = [
  { icon: <ShoppingCart className="h-5 w-5" />, title: 'Point of Sale', desc: 'Ring up sales in seconds - stock, cash and customer balances update themselves.' },
  { icon: <Wallet className="h-5 w-5" />, title: 'Real Cash Flow', desc: 'See money actually entering and leaving, explained in plain language.' },
  { icon: <Mic className="h-5 w-5" />, title: 'Voice Registration', desc: 'Add a customer just by speaking their name and phone number.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Reports that answer', desc: 'Every report answers a real business question, not a wall of numbers.' },
  { icon: <Coins className="h-5 w-5" />, title: 'Live FX Rates', desc: 'Convert GHS, USD, EUR and more with historical reference rates.' },
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'Roles & Access', desc: 'Owners see the full picture; staff see only what they need.' },
]

const STEPS = [
  { n: '01', title: 'Track Everything', desc: 'Sales, stock, customers and expenses - captured once, everywhere.', icon: <Package className="h-5 w-5" /> },
  { n: '02', title: 'Understand Your Business', desc: 'Plain-language insights and cash flow you can actually read.', icon: <TrendingUp className="h-5 w-5" /> },
  { n: '03', title: 'Grow Smarter', desc: 'Know your best sellers, your margins and who owes you.', icon: <HandCoins className="h-5 w-5" /> },
]

const PLANS = [
  { name: 'Starter', price: '₵0', cadence: 'free for one owner', description: 'For an owner running the counter themselves.', action: 'Start free', features: ['Products, stock and sales', 'Daily takings and profit', 'One owner account', 'Customer debt tracking'] },
  { name: 'Shop', price: '₵60', cadence: 'per month after beta', description: 'For a shop with people behind the counter.', action: 'Start free', popular: true, features: ['Everything in Starter', 'Staff accounts with individual PINs', 'Per-person audit logs', 'Suppliers, expenses and cash flow', 'Full reports'] },
  { name: 'Multi-shop', price: 'Coming soon', cadence: 'for growing businesses', description: 'For owners preparing to manage more than one location.', action: 'Join the waitlist', features: ['Everything in Shop', 'Multiple locations on one account', 'Side-by-side performance', 'Priority support'] },
]

const FAQS = [
  ['How do I get started?', 'Choose Get Started, add your business details and MyShopFlow will prepare a starter catalogue before guiding you through the dashboard.'],
  ['Can my staff use it without my password?', 'Yes. Admins create staff profiles and issue individual PINs, so each action is recorded under the person who performed it.'],
  ['A staff member forgot their PIN. What now?', 'An admin can open Users and Staff in Settings and generate a new PIN without sharing the owner login.'],
  ['Can another shop see my figures?', 'No. Business information is kept within the signed-in workspace and staff only see areas allowed by their role.'],
  ['Which currency does it use?', 'Ghana cedis are the base currency. You can also view supported foreign currencies using reference exchange rates.'],
  ['Can I log in with my phone number?', 'The current version supports the available owner and staff login methods shown on the login screen. Phone login is planned for a later release.'],
]

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#F8F8F6]/85 backdrop-blur-xl">
        <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#features" className="transition-colors hover:text-ink">Features</a>
            <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
            <a href="#about" className="transition-colors hover:text-ink">About</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link to="/get-started"><Button size="sm" className="text-white">
              Get Started
            </Button></Link>
          </div>
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.08] bg-white text-ink shadow-xs transition-colors hover:bg-canvas md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation"
                className="fixed inset-0 top-[68px] z-[-1] bg-ink/20 backdrop-blur-[2px] md:hidden"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="absolute inset-x-3 top-[76px] overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-2 shadow-pop md:hidden"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <nav className="space-y-1 p-1">
                  <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-canvas">How it works <ArrowRight className="h-4 w-4 text-ink-faint" /></a>
                  <a href="#features" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-canvas">Features <ArrowRight className="h-4 w-4 text-ink-faint" /></a>
                  <a href="#pricing" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-canvas">Pricing <ArrowRight className="h-4 w-4 text-ink-faint" /></a>
                  <a href="#about" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-canvas">About <ArrowRight className="h-4 w-4 text-ink-faint" /></a>
                </nav>
                <div className="mt-1 grid grid-cols-2 gap-2 border-t border-hair p-2 pt-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="inline-flex h-11 items-center justify-center rounded-xl border border-hair text-sm font-bold text-ink">Log in</Link>
                  <Link to="/get-started" onClick={() => setMenuOpen(false)} className="inline-flex h-11 items-center justify-center rounded-xl bg-canary px-3 text-sm font-bold text-white shadow-canary">Get started</Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-canary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brick/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-canary/25 bg-canary-50 px-3 py-1.5 text-xs font-bold text-canary-700">
              <Zap className="h-3.5 w-3.5" /> Built for growing businesses
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[68px]">
              Smart Inventory.<br /><span className="text-canary-600">Smarter</span> Cash Flow.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              The inventory and operations platform for any business that sells physical products - retail or wholesale, one shop or many branches. Enter a business action once, and everything updates automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/get-started"><Button size="lg" className='text-white'>Get Started <ArrowRight className="h-5 w-5" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline"><Play className="h-4 w-4" /> Explore demo</Button></Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              {['No accounting jargon', 'Retail & wholesale', 'Scales to many branches'].map((t) => (
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
          {[['One action', 'updates everything'], ['Real-time', 'stock and cash'], ['Owner + staff', 'permission controls'], ['Multi-branch', 'stock & warehouses']].map(([value, label]) => (
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
              {['Live inventory on every sale', 'Clear roles for owners and staff', 'One source of truth across every branch'].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-semibold text-white/80"><CheckCircle2 className="h-5 w-5 text-canary" />{item}</p>)}
            </div>
            <Link to="/get-started" className="mt-8"><Button size="lg" className='text-white'>Set up your shop <ArrowRight className="h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">Everything your business needs</h2>
          <p className="mt-2 text-ink-soft">One connected system - not six disconnected tools.</p>
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

      {/* Roles */}
      <section className="border-y border-black/[0.06] bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="eyebrow mb-2">Built for every role</p><h2 className="text-3xl font-extrabold text-ink sm:text-4xl">The right access for every person.</h2><p className="mt-3 text-ink-soft">Owners keep control while staff get a focused workspace for daily operations.</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[28px] bg-sidebar p-7 text-white shadow-pop sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-canary text-white"><Store className="h-6 w-6" /></span><h3 className="mt-5 text-2xl text-white font-extrabold">Business Owner / Admin</h3><p className="mt-2 text-white/65">Full access to manage the business, staff, inventory, sales and finances.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{['Manage every workspace', 'Add staff and control access', 'View reports and cash flow', 'Review complete audit logs'].map((item) => <p key={item} className="flex items-center gap-2 text-sm font-semibold text-white/85"><CheckCircle2 className="h-4 w-4 text-canary" />{item}</p>)}</div></div>
            <div className="rounded-[28px] bg-paper p-7 ring-1 ring-black/[0.07] shadow-card sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-canary-50 text-canary-700"><UserCog className="h-6 w-6" /></span><h3 className="mt-5 text-2xl font-extrabold text-ink">Staff</h3><p className="mt-2 text-ink-soft">Focused access to perform daily work without exposing sensitive owner information.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{['Record sales quickly', 'Manage products and stock', 'Register customers', 'View allowed data only'].map((item) => <p key={item} className="flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-inflow" />{item}</p>)}</div></div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-[32px] bg-canary-50 p-7 ring-1 ring-canary/15 sm:p-10 lg:grid-cols-[.8fr_1.2fr] lg:p-14">
          <div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-canary"><LockKeyhole className="h-7 w-7" /></span><p className="eyebrow mb-2 mt-6">Your data is safe with us</p><h2 className="text-3xl font-extrabold text-ink">Security that fits how your team works.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3">{[['Individual access', 'Every staff member uses their own profile and PIN.'], ['Clear permissions', 'Sensitive reports and settings remain admin-only.'], ['Accountability', 'Audit logs show who performed each recorded action.']].map(([title, text]) => <div key={title} className="rounded-2xl bg-white p-5 shadow-xs"><ShieldCheck className="h-5 w-5 text-canary-600" /><h3 className="mt-3 font-bold text-ink">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p></div>)}</div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="eyebrow mb-2">Simple pricing</p><h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Pricing that fits any business.</h2><p className="mt-3 text-ink-soft">Start free during beta. No card is required while we refine MyShopFlow with early businesses.</p></div>
          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => <div key={plan.name} className={`relative flex flex-col rounded-[28px] p-7 ${plan.popular ? 'bg-sidebar text-white shadow-pop ring-2 ring-canary' : 'bg-paper text-ink ring-1 ring-black/[0.07] shadow-card'}`}>{plan.popular && <span className="absolute right-5 top-5 rounded-full bg-canary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">Most popular</span>}<p className={`text-sm font-bold ${plan.popular ? 'text-canary' : 'text-canary-700'}`}>{plan.name}</p><p className="mt-4 text-4xl font-extrabold">{plan.price}</p><p className={`mt-1 text-xs ${plan.popular ? 'text-white/55' : 'text-ink-soft'}`}>{plan.cadence}</p><p className={`mt-5 min-h-12 text-sm ${plan.popular ? 'text-white/65' : 'text-ink-soft'}`}>{plan.description}</p><ul className="my-7 flex-1 space-y-3">{plan.features.map((feature) => <li key={feature} className={`flex gap-2.5 text-sm ${plan.popular ? 'text-white/85' : 'text-ink'}`}><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? 'text-canary' : 'text-inflow'}`} />{feature}</li>)}</ul><Link to="/get-started"><Button className={`w-full ${plan.popular ? 'text-white' : ''}`} variant={plan.popular ? 'primary' : 'outline'}>{plan.action}</Button></Link></div>)}
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-ink-soft">Every current feature is available during beta. The paid plan amounts show the intended pricing direction and may be refined before billing begins.</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="eyebrow mb-2">Built for the shop</p><h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Built for the shop, not the spreadsheet.</h2><p className="mt-5 leading-relaxed text-ink-soft">MyShopFlow is made for small retail businesses where the owner knows the customers, understands the shelves and needs clearer information without changing how the shop already works.</p><p className="mt-4 leading-relaxed text-ink-soft">Record a sale in a few taps, understand what a slow week cost, see who owes you and know which items need restocking before a customer has to ask.</p></div><div className="grid gap-4">{[[Coins, 'Cedis first', 'Your business figures begin in Ghana cedis. Convert only when you need another currency.'], [UserCog, 'Your staff, their own login', 'Each staff member gets a profile and PIN, while every recorded action stays attributable.'], [Building2, 'Your workspace stays focused', 'Roles keep sensitive owner data separate from the daily tools staff need.']].map(([Icon, title, text]) => { const ItemIcon = Icon as typeof Coins; return <div key={title as string} className="flex gap-4 rounded-2xl bg-paper p-5 ring-1 ring-black/[0.06] shadow-card"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canary-50 text-canary-700"><ItemIcon className="h-5 w-5" /></span><div><h3 className="font-bold text-ink">{title as string}</h3><p className="mt-1 text-sm leading-relaxed text-ink-soft">{text as string}</p></div></div>})}</div></div>
      </section>

      {/* FAQ */}
      <section className="border-y border-black/[0.06] bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="eyebrow mb-2">Questions, answered</p><h2 className="text-3xl font-extrabold text-ink">Everything important, one answer away.</h2><p className="mt-3 text-ink-soft">Practical answers for owners preparing to run their business with MyShopFlow.</p></div><div className="divide-y divide-hair overflow-hidden rounded-2xl border border-hair bg-paper">{FAQS.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-ink"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-ink-soft transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{answer}</p></motion.div>}</AnimatePresence></div>)}</div></div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-sidebar px-6 py-14 text-center shadow-pop sm:px-12">
          <h2 className="text-3xl font-bold text-white">Ready to run a smarter business?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">Try the full MyShopFlow demo - no sign-up friction, real data you can play with.</p>
          <Link to="/get-started" className="mt-6 inline-block"><Button size="lg" className='text-white'>Get Started <ArrowRight className="h-5 w-5" /></Button></Link>
        </div>
      </section>

      <footer className="bg-sidebar py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.7fr_1.2fr]">
            <div><Logo dark /><p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">Smart inventory, smarter cash flow. All in one simple place.</p></div>
            <div><p className="text-sm font-bold">Product</p><div className="mt-4 space-y-3 text-sm text-white/55"><a className="block hover:text-white" href="#features">Features</a><a className="block hover:text-white" href="#pricing">Pricing</a><Link className="block hover:text-white" to="/login">Explore demo</Link></div></div>
            <div><p className="text-sm font-bold">Company</p><div className="mt-4 space-y-3 text-sm text-white/55"><a className="block hover:text-white" href="#about">About us</a><a className="block hover:text-white" href="#how-it-works">How it works</a><a className="block hover:text-white" href="mailto:hello@myshopflow.app">Contact</a></div></div>
            <div><p className="text-sm font-bold">Stay updated</p><p className="mt-2 text-sm text-white/55">Get practical tips and product updates for your business.</p><form className="mt-4 flex gap-2" onSubmit={(event) => event.preventDefault()}><div className="relative min-w-0 flex-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input type="email" aria-label="Email address" className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-canary" placeholder="Email address" /></div><button className="rounded-xl bg-canary px-4 text-sm font-bold text-white">Subscribe</button></form></div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 MyShopFlow. All rights reserved.</p><div className="flex gap-5"><a href="#" className="hover:text-white">Privacy</a><a href="#" className="hover:text-white">Terms</a></div></div>
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
