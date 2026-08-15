import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Package, TrendingUp, HandCoins, Check, Store, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { toast } from '@/store/toast'
import { Icon } from '@/components/ui/Icon'
import { BUSINESS_TEMPLATES } from '@/lib/templates'
import type { CurrencyCode } from '@/types'
import { cn } from '@/lib/utils'

const VALUE_STEPS = [
  { icon: <Package className="h-6 w-6" />, title: 'Track Everything', desc: 'Every sale, product, customer and expense - captured once and reflected everywhere.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Understand Your Business', desc: 'Plain-language insights and real cash flow, with no accounting jargon.' },
  { icon: <HandCoins className="h-6 w-6" />, title: 'Grow Smarter', desc: 'Spot your best sellers, protect your margins and collect what you’re owed.' },
]

const TYPES = ['Retail Shop', 'Provisions Store', 'Boutique', 'Electronics', 'Pharmacy', 'Wholesale', 'Other']
const CURRENCIES: CurrencyCode[] = ['GHS', 'USD', 'EUR', 'XOF']
const ONBOARDING_VISUALS = [
  { image: '/images/landing-shop-owner.png', title: 'See the whole business clearly.', text: 'Sales, stock, customers and cash stay connected from the first day.' },
  { image: '/images/onboarding-team.png', title: 'Set your team up for success.', text: 'Secure owner and staff access keeps everyone focused on the right work.' },
  { image: '/images/landing-inventory-team.png', title: 'Start with accurate operations.', text: 'Choose the essentials now and MyShopFlow will guide you through the rest.' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const updateProfile = useStore((s) => s.updateBusinessProfile)
  const updateSettings = useStore((s) => s.updateSettings)
  const applyBusinessTemplate = useStore((s) => s.applyBusinessTemplate)
  const startDashboardTutorial = useStore((s) => s.startDashboardTutorial)

  const [step, setStep] = useState(0) // 0 value-carousel, 1 account, 2 business
  const [valueIdx, setValueIdx] = useState(0)
  const [owner, setOwner] = useState('')
  const [biz, setBiz] = useState({ name: '', type: 'Retail Shop', template: 'general-retail', currency: 'GHS' as CurrencyCode })

  const finish = () => {
    const tpl = BUSINESS_TEMPLATES.find((t) => t.id === biz.template)
    if (biz.name.trim()) updateProfile({ name: biz.name.trim(), type: tpl?.profileType ?? 'Retail Shop', ownerName: owner.trim() || 'Owner', baseCurrency: biz.currency })
    updateSettings({})
    // Load the starter catalogue for the chosen industry.
    applyBusinessTemplate(biz.template)
    startDashboardTutorial()
    login('admin')
    toast.success('You’re all set!', `${biz.name.trim() || 'Your business'} is ready with a ${tpl?.name ?? 'starter'} catalogue.`)
    navigate('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8F8F6]">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-canary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-brick/[0.07] blur-3xl" />
      <header className="relative border-b border-black/[0.06] bg-white/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/"><Logo /></Link>
          <Link to="/login" className="text-sm font-semibold text-ink-soft hover:text-ink">Log in instead</Link>
        </div>
      </header>

      {/* Progress */}
      <div className="relative mx-auto w-full max-w-5xl px-4 pt-7 sm:px-6">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-canary' : 'bg-hair')} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-ink-soft"><span>Step {step + 1} of 3</span><span>{step === 0 ? 'Discover' : step === 1 ? 'Your account' : 'Your business'}</span></div>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
        <aside className="relative order-2 hidden h-[650px] overflow-hidden rounded-[32px] bg-sidebar shadow-pop lg:block">
          <AnimatePresence mode="wait">
            <motion.img key={ONBOARDING_VISUALS[step].image} src={ONBOARDING_VISUALS[step].image} alt="MyShopFlow onboarding" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 h-full w-full object-cover" />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-canary" /> Set up in minutes</span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white">{ONBOARDING_VISUALS[step].title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{ONBOARDING_VISUALS[step].text}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-sidebar/60 p-3 backdrop-blur"><Package className="h-4 w-4 text-canary" /><p className="mt-2 text-sm font-bold">Stock in sync</p></div>
              <div className="rounded-2xl border border-white/10 bg-sidebar/60 p-3 backdrop-blur"><ShieldCheck className="h-4 w-4 text-canary" /><p className="mt-2 text-sm font-bold">Team in control</p></div>
            </div>
          </div>
        </aside>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="v" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="mx-auto max-w-xl rounded-[32px] bg-sidebar p-8 text-center shadow-pop sm:p-12 lg:bg-white lg:text-ink lg:ring-1 lg:ring-black/[0.06]">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.18em] text-canary">Welcome to MyShopFlow</p>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-canary text-ink shadow-canary">{VALUE_STEPS[valueIdx].icon}</div>
                <h1 className="mt-6 text-3xl font-extrabold text-white lg:text-ink">{VALUE_STEPS[valueIdx].title}</h1>
                <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/60 lg:text-ink-soft">{VALUE_STEPS[valueIdx].desc}</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {VALUE_STEPS.map((_, i) => (
                    <button key={i} onClick={() => setValueIdx(i)} className={cn('h-2 rounded-full transition-all', i === valueIdx ? 'w-6 bg-canary' : 'w-2 bg-white/20 lg:bg-hair')} aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  {valueIdx < VALUE_STEPS.length - 1 ? (
                    <>
                      <Button className="text-white hover:bg-white/10 lg:text-ink lg:hover:bg-canvas" variant="ghost" onClick={() => setStep(1)}>Skip</Button>
                      <Button onClick={() => setValueIdx((i) => i + 1)} className='text-white'>Next <ArrowRight className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <Button size="lg" onClick={() => setStep(1)} className='text-white'>Get started <ArrowRight className="h-5 w-5" /></Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto w-full max-w-xl rounded-3xl bg-white p-7 ring-1 ring-black/[0.06] shadow-pop sm:p-10">
              <h1 className="text-2xl font-bold text-ink">Create your account</h1>
              <p className="mt-1 text-sm text-ink-soft">You’re registering as the business owner. You can invite staff later.</p>
              <div className="mt-6 space-y-4">
                <div><label className="label">Your name</label><input className="input" placeholder="e.g. Ama Owusu" value={owner} onChange={(e) => setOwner(e.target.value)} autoFocus /></div>
                <div><label className="label">Email</label><input className="input" placeholder="you@business.gh" /></div>
                <div><label className="label">Password</label><input type="password" className="input" placeholder="Create a password" /></div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button onClick={() => setStep(2)} className='text-white'>Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto w-full max-w-xl rounded-3xl bg-white p-7 ring-1 ring-black/[0.06] shadow-pop sm:p-10">
              <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-ink text-canary"><Store className="h-6 w-6" /></div>
              <h1 className="text-2xl font-bold text-ink">Set up your business</h1>
              <p className="mt-1 text-sm text-ink-soft">A few details so MyShopFlow fits your shop.</p>
              <div className="mt-6 space-y-4">
                <div><label className="label">Business name</label><input className="input" placeholder="e.g. Ama's Variety Store" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} autoFocus /></div>
                <div>
                  <label className="label">What do you sell? <span className="font-normal text-ink-faint">— we’ll load a starter catalogue</span></label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {BUSINESS_TEMPLATES.map((t) => {
                      const active = biz.template === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => setBiz({ ...biz, template: t.id })}
                          className={cn(
                            'flex flex-col items-start gap-1.5 rounded-2xl p-3 text-left ring-1 transition-all duration-200',
                            active ? 'bg-canary-50 ring-canary' : 'bg-paper ring-hair hover:ring-ink/25',
                          )}
                        >
                          <span className={cn('grid h-8 w-8 place-items-center rounded-lg', active ? 'bg-canary text-ink' : 'bg-canvas text-ink-soft')}><Icon name={t.icon} className="h-4 w-4" strokeWidth={2} /></span>
                          <span className="text-[13px] font-bold leading-tight text-ink">{t.name}</span>
                          <span className="text-[11px] leading-snug text-ink-soft">{t.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="label">Base currency</label>
                  <div className="flex gap-2">
                    {CURRENCIES.map((c) => (
                      <button key={c} onClick={() => setBiz({ ...biz, currency: c })} className={cn('chip border', biz.currency === c ? 'bg-canary-50 border-canary text-ink' : 'bg-paper border-hair text-ink-soft')}>{biz.currency === c && <Check className="h-3.5 w-3.5" />}{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button size="lg" onClick={finish} className='text-white'>Enter MyShop<ArrowRight className="h-5 w-5" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
