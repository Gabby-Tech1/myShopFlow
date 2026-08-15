import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, User, Mail, Lock, CheckCircle2, BarChart3, PackageCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { toast } from '@/store/toast'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState('ama@amasvariety.gh')
  const [password, setPassword] = useState('demo1234')

  // Login automatically determines Admin vs Staff (spec §3). For the demo we
  // pick the role by which quick-login the user chooses, or default to Admin.
  const signIn = (role: 'admin' | 'staff') => {
    login(role)
    toast.success('Welcome back', `Signed in as ${role === 'admin' ? 'Owner (Admin)' : 'Staff'}.`)
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-screen bg-[#F8F8F6] lg:grid-cols-[0.9fr_1.1fr]">
      {/* Form */}
      <div className="flex flex-col justify-center py-8  lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-xl p-7">
          <Link to="/"><Logo /></Link>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="eyebrow mt-10">Secure workspace</p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-soft">Log in to your MyShopFlow account.</p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                  <input id="email" className="input pl-11" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                  <input id="password" type="password" className="input pl-11" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-ink-soft"><input type="checkbox" className="accent-canary" /> Remember me</label><button className="font-semibold text-ink hover:text-canary-700">Forgot password?</button></div>
              <Button className="w-full" size="lg" onClick={() => signIn('admin')}>Log In securely <ArrowRight className="h-5 w-5" /></Button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
              <div className="h-px flex-1 bg-hair" /> quick demo login <div className="h-px flex-1 bg-hair" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => signIn('admin')} className="flex flex-col items-start gap-1 rounded-xl border border-hair p-3.5 text-left transition-colors hover:border-canary hover:bg-canary-50 cursor-pointer">
                <ShieldCheck className="h-5 w-5 text-canary-600" />
                <span className="text-sm font-semibold text-ink">Owner / Admin</span>
                <span className="text-xs text-ink-soft">Full access</span>
              </button>
              <button onClick={() => signIn('staff')} className="flex flex-col items-start gap-1 rounded-xl border border-hair p-3.5 text-left transition-colors hover:border-brick hover:bg-brick-50 cursor-pointer">
                <User className="h-5 w-5 text-brick" />
                <span className="text-sm font-semibold text-ink">Staff</span>
                <span className="text-xs text-ink-soft">Limited access</span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-ink-soft">
              New here? <Link to="/get-started" className="font-semibold text-canary-700 hover:underline">Create a business</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative m-3 hidden overflow-hidden rounded-[28px] bg-sidebar lg:block">
        <img src="/images/onboarding-team.png" alt="Ghanaian shop team using MyShopFlow" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar/70 via-transparent to-sidebar/15" />
        <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-canary/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center px-16 xl:px-24">
          <p className="eyebrow mb-3 text-canary">One connected workspace</p>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white">Run the whole shop with clarity and control.</h2>
          <p className="mt-4 max-w-sm text-white/60">Inventory, POS, customers, cash flow and reports - connected so you enter each action just once.</p>
          <div className="mt-8 space-y-3">
            {['Enter a sale once - stock, cash and reports all update', 'Understand your money without the jargon', 'Register customers just by speaking'].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/80">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-canary text-ink">✓</span> {t}
              </div>
            ))}
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><BarChart3 className="h-5 w-5 text-canary" /><p className="mt-3 text-xl font-extrabold text-white">Live insight</p><p className="mt-1 text-xs text-white/50">Know what is moving and why.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><PackageCheck className="h-5 w-5 text-canary" /><p className="mt-3 text-xl font-extrabold text-white">Always in sync</p><p className="mt-1 text-xs text-white/50">Sales, stock and cash together.</p></div>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs font-medium text-white/45"><CheckCircle2 className="h-4 w-4 text-inflow" /> Secure role-based access for owners and staff</p>
        </div>
      </div>
    </div>
  )
}
