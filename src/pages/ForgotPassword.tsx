import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const valid = /^\S+@\S+\.\S+$/.test(email.trim())

  return (
    <div className="grid min-h-[100dvh] bg-white lg:grid-cols-[0.9fr_1.1fr] lg:bg-[#F8F8F6]">
      <main className="flex flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-12">
        <div className="mx-auto w-full max-w-xl lg:p-7">
          <Link to="/"><Logo /></Link>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-12 lg:mt-10">
            {!submitted ? (
              <>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-canary-50 text-canary-700"><KeyRound className="h-6 w-6" /></span>
                <p className="eyebrow mt-6">Admin account recovery</p>
                <h1 className="mt-2 text-3xl font-extrabold text-ink">Reset your password</h1>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">Enter the email address used for your owner account. Recovery instructions will be prepared for that account.</p>
                <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); if (valid) setSubmitted(true) }}>
                  <div><label className="label" htmlFor="recovery-email">Admin email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" /><input id="recovery-email" type="email" autoFocus className="input h-12 pl-11" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@business.com" autoComplete="email" /></div></div>
                  <Button type="submit" size="lg" className="w-full text-white" disabled={!valid}>Continue <ArrowRight className="h-5 w-5" /></Button>
                </form>
                <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
              </>
            ) : (
              <div className="py-8">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-inflow"><CheckCircle2 className="h-8 w-8" /></span>
                <p className="eyebrow mt-6">Request received</p>
                <h1 className="mt-2 text-3xl font-extrabold text-ink">Recovery request ready</h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">The password recovery request for <strong className="text-ink">{email}</strong> has been accepted. Email delivery will be activated when the authentication service is connected.</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/login"><Button size="lg" className="w-full text-white sm:w-auto">Return to login</Button></Link><Button size="lg" variant="outline" onClick={() => setSubmitted(false)}>Use another email</Button></div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <aside className="relative m-3 hidden overflow-hidden rounded-[28px] bg-sidebar lg:block">
        <img src="/images/landing-shop-owner.png" alt="Shop owner managing her MyShopFlow account" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/75 to-sidebar/30" />
        <div className="relative flex h-full items-center px-16 xl:px-24"><div className="max-w-md"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-canary text-white"><ShieldCheck className="h-6 w-6" /></span><p className="eyebrow mb-3 mt-7 text-canary">Protected owner access</p><h2 className="text-4xl font-extrabold leading-tight text-white">Get back to running your business securely.</h2><p className="mt-4 text-white/60">Password recovery is reserved for the owner account. Staff PINs are reset by an administrator from Settings.</p></div></div>
      </aside>
    </div>
  )
}
