import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API (not in the default DOM lib).
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface SpeechState {
  supported: boolean
  listening: boolean
  transcript: string
  error?: string
  start: () => void
  stop: () => void
  reset: () => void
  /** Feed a transcript directly (used by the scripted mock fallback). */
  setTranscript: (t: string) => void
}

export function useSpeech(lang = 'en-GH'): SpeechState {
  const [supported] = useState(() => getRecognitionCtor() !== null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string>()
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
      setTranscript(text)
    }
    rec.onerror = (e: unknown) => {
      const err = (e as { error?: string })?.error
      setError(err === 'not-allowed' ? 'Microphone permission was blocked.' : 'Could not capture audio.')
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    return () => rec.abort()
  }, [lang])

  const start = useCallback(() => {
    setError(undefined)
    setTranscript('')
    try {
      recRef.current?.start()
      setListening(true)
    } catch {
      /* already started */
    }
  }, [])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError(undefined)
  }, [])

  return { supported, listening, transcript, error, start, stop, reset, setTranscript }
}
