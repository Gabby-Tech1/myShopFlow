import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Sparkles, CheckCircle2, Volume2, AudioLines } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Segmented } from '@/components/ui/Segmented'
import { useStore } from '@/store/useStore'
import { useUi } from '@/store/ui'
import { toast } from '@/store/toast'
import { useSpeech } from '@/components/voice/useSpeech'
import { extractCustomer, MOCK_TRANSCRIPTS } from '@/components/voice/extract'
import { normalizePhone } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PriceTier } from '@/types'

type Mode = 'manual' | 'voice'
type VoiceStage = 'idle' | 'listening' | 'review'

export function RegisterCustomerModal() {
  const open = useUi((s) => s.modal === 'registerCustomer')
  const close = useUi((s) => s.closeModal)
  const voiceLocale = useStore((s) => s.settings.voiceLocale)
  const voiceEnabled = useStore((s) => s.settings.voiceEnabled)
  const customerSettings = useStore((s) => s.settings.customers)
  const customers = useStore((s) => s.customers)
  const registerCustomer = useStore((s) => s.registerCustomer)

  const [mode, setMode] = useState<Mode>('manual')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState<PriceTier>('retail')
  const [company, setCompany] = useState('')
  const [stage, setStage] = useState<VoiceStage>('idle')
  const [method, setMethod] = useState<'manual' | 'voice'>('manual')

  const speech = useSpeech(voiceLocale)
  const mockTimer = useRef<number | null>(null)

  const reset = () => {
    setName('')
    setPhone('')
    setType('retail')
    setCompany('')
    setStage('idle')
    setMethod('manual')
    speech.reset()
    if (mockTimer.current) window.clearInterval(mockTimer.current)
  }

  useEffect(() => {
    if (!open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // When real speech transcript updates during listening, keep it visible.
  const liveTranscript = speech.transcript

  const startReal = () => {
    setStage('listening')
    speech.start()
  }

  const stopReal = () => {
    speech.stop()
    const { name: n, phone: p } = extractCustomer(speech.transcript)
    setName(n)
    setPhone(p)
    setMethod('voice')
    setStage('review')
  }

  // Mock: stream a scripted transcript word-by-word, then extract.
  const [mockText, setMockText] = useState('')
  const startMock = () => {
    const script = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)]
    const words = script.split(' ')
    setMockText('')
    setStage('listening')
    let i = 0
    mockTimer.current = window.setInterval(() => {
      i++
      setMockText(words.slice(0, i).join(' '))
      if (i >= words.length) {
        if (mockTimer.current) window.clearInterval(mockTimer.current)
        setTimeout(() => {
          const { name: n, phone: p } = extractCustomer(script)
          setName(n)
          setPhone(p)
          setMethod('voice')
          setStage('review')
        }, 400)
      }
    }, 220)
  }

  const beginListening = () => (speech.supported ? startReal() : startMock())
  const stopListening = () => (speech.supported ? stopReal() : (mockTimer.current && window.clearInterval(mockTimer.current), setStage('review')))

  const save = () => {
    if (!name.trim()) return
    const savedPhone = customerSettings.formatGhanaPhones ? (normalizePhone(phone) || phone) : phone.trim()
    const comparablePhone = normalizePhone(savedPhone).replace(/\s/g, '')
    if (customerSettings.warnDuplicatePhone && comparablePhone && customers.some((customer) => normalizePhone(customer.phone).replace(/\s/g, '') === comparablePhone)) {
      toast.info('Customer already exists', 'A customer with this phone number is already registered.')
      return
    }
    registerCustomer(name.trim(), savedPhone, method, undefined, {
      type,
      company: type === 'wholesale' ? company.trim() || undefined : undefined,
    })
    toast.success(
      method === 'voice' ? 'Customer registered by voice' : 'Customer registered',
      `${name.trim()} added as a ${type} customer.`,
    )
    close()
  }

  const transcript = speech.supported ? liveTranscript : mockText

  return (
    <Modal
      open={open}
      onClose={close}
      title="Register customer"
      description="Add a customer manually, or capture their details by voice."
      footer={
        stage === 'review' || mode === 'manual' ? (
          <>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={!name.trim()}>
              <CheckCircle2 className="h-4 w-4" /> Confirm &amp; save
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {voiceEnabled && <Segmented
          options={[
            { value: 'manual', label: 'Manual' },
            { value: 'voice', label: '🎙 By Voice' },
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v)
            reset()
          }}
          className="w-full [&>button]:flex-1"
        />}

        {/* Customer type — wholesale accounts get bulk pricing at the POS. */}
        <div>
          <label className="label">Customer type</label>
          <Segmented
            options={[
              { value: 'retail', label: 'Retail' },
              { value: 'wholesale', label: 'Wholesale' },
            ]}
            value={type}
            onChange={(v) => setType(v as PriceTier)}
            className="w-full [&>button]:flex-1"
          />
          {type === 'wholesale' && (
            <input
              className="input mt-2.5"
              placeholder="Business name (optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          )}
        </div>

        {mode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="cust-name">Full name</label>
              <input id="cust-name" className="input" placeholder="e.g. Kwame Mensah" value={name} onChange={(e) => { setName(e.target.value); setMethod('manual') }} autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="cust-phone">Phone number</label>
              <input id="cust-phone" className="input tnum" inputMode="tel" placeholder="e.g. 024 118 4420" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={(e) => customerSettings.formatGhanaPhones && setPhone(normalizePhone(e.target.value))} />
            </div>
          </div>
        )}

        {mode === 'voice' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone={speech.supported ? 'inflow' : 'warn'} dot>
                {speech.supported ? `Live mic · ${voiceLocale}` : 'Demo voice (mic not available)'}
              </Badge>
              <span className="text-xs text-ink-soft">Speak the name and phone number.</span>
            </div>

            {stage === 'idle' && (
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-canvas py-8">
                <button
                  onClick={beginListening}
                  className="group relative grid h-20 w-20 place-items-center rounded-full bg-canary text-ink shadow-canary transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Start listening"
                >
                  <Mic className="h-8 w-8" />
                </button>
                <p className="text-sm font-medium text-ink-soft">Tap to start listening</p>
              </div>
            )}

            {stage === 'listening' && (
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-canvas py-8">
                <div className="relative grid h-20 w-20 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-brick/30 animate-pulse-ring" />
                  <span className="absolute inset-0 rounded-full bg-brick/20 animate-pulse-ring" style={{ animationDelay: '0.6s' }} />
                  <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brick text-white">
                    <AudioLines className="h-8 w-8" />
                  </span>
                </div>
                <p className="flex items-center gap-2 text-sm font-semibold text-brick">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brick" /> Listening…
                </p>
                <div className="min-h-[48px] w-full rounded-xl bg-paper px-4 py-3 text-center text-sm text-ink">
                  {transcript || <span className="text-ink-soft">Waiting for speech…</span>}
                </div>
                <Button variant="dark" onClick={stopListening}>
                  <Square className="h-4 w-4" /> Stop &amp; read details
                </Button>
              </div>
            )}

            {stage === 'review' && (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl bg-canary-50 px-3.5 py-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-canary-700" />
                  <p className="text-sm font-medium text-ink">
                    We picked out the name and phone number below. Please check and correct them before saving.
                  </p>
                </div>
                {transcript && (
                  <div className="flex items-start gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-sm text-ink-soft">
                    <Volume2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>“{transcript}”</span>
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="v-name">Name</label>
                  <input id="v-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name not detected - type it" />
                </div>
                <div>
                  <label className="label" htmlFor="v-phone">Phone number</label>
                  <input id="v-phone" className="input tnum" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone not detected - type it" />
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <Badge tone="canary" dot>Registration method: Voice</Badge>
                  <button onClick={() => setStage('idle')} className="font-semibold text-canary-700 hover:underline cursor-pointer">Try again</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
