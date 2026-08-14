import { normalizePhone } from '@/lib/format'

// Structured extraction of Name + Phone from a free-form transcript (spec §7).
// A lightweight, explainable heuristic — the production path would send the
// transcript to a backend NLP/AI step, but the confirmation UX is identical.

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', oh: '0', o: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', double: '', triple: '',
}

const NAME_STOPWORDS = new Set([
  'my', 'name', 'is', 'the', 'customer', 'this', 'here', "i'm", 'im', 'am', 'and', 'her', 'his', 'call', 'number', 'phone', 'mobile', 'momo', 'please', 'add', 'register', 'his', 'a',
])

function wordsToDigits(text: string): string {
  const tokens = text.toLowerCase().replace(/[-]/g, ' ').split(/\s+/)
  let digits = ''
  let repeat = 1
  for (const tok of tokens) {
    if (tok === 'double') { repeat = 2; continue }
    if (tok === 'triple') { repeat = 3; continue }
    if (tok in NUMBER_WORDS && NUMBER_WORDS[tok] !== '') {
      digits += NUMBER_WORDS[tok].repeat(repeat)
      repeat = 1
    } else if (/^\d+$/.test(tok)) {
      digits += tok
      repeat = 1
    } else {
      repeat = 1
    }
  }
  return digits
}

export interface Extracted {
  name: string
  phone: string
}

export function extractCustomer(transcript: string): Extracted {
  const raw = transcript.trim()

  // ---- phone ----
  const directDigits = raw.replace(/[^\d]/g, '')
  const spoken = wordsToDigits(raw)
  const candidate = directDigits.length >= spoken.length ? directDigits : spoken
  let phone = ''
  const match = candidate.match(/(0\d{9}|\d{9,10})/)
  if (match) phone = normalizePhone(match[1])

  // ---- name ----
  // Prefer text after "name is" / "this is" / "i am".
  let namePart = raw
  const cue = raw.match(/(?:name is|this is|i am|i'm|call(?:ed)?)\s+([a-zA-Z ]{2,40})/i)
  if (cue) namePart = cue[1]
  const nameTokens = namePart
    .replace(/[^a-zA-Z ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !NAME_STOPWORDS.has(t.toLowerCase()))
    .slice(0, 3)
  const name = nameTokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join(' ')

  return { name, phone }
}

// Scripted transcripts for the mock fallback (spec §16 — mock when API not connected).
export const MOCK_TRANSCRIPTS = [
  'My name is Ama Serwaa and my number is 024 665 1180',
  'This is Kwesi Appiah, phone zero two zero five five one four four seven eight',
  'Register Nana Adjei, mobile 055 210 9963',
  'Customer name is Efua Mensima, number 027 884 3312',
]
