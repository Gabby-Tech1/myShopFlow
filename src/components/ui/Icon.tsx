import { icons, type LucideProps } from 'lucide-react'
import { HelpCircle } from 'lucide-react'

interface IconProps extends LucideProps {
  name: string
}

// lucide renamed a batch of icons; map any old names we (or persisted data) use
// to their current names so name-based lookups keep resolving.
const ALIASES: Record<string, string> = {
  Home: 'House',
  HelpCircle: 'CircleHelp',
  CheckCircle2: 'CircleCheckBig',
  XCircle: 'CircleX',
  AlertTriangle: 'TriangleAlert',
  BarChart3: 'ChartColumnBig',
  LineChart: 'ChartLine',
  PieChart: 'ChartPie',
  AreaChart: 'ChartArea',
}

/** Render a lucide icon by its name (used for nav, categories, insights). */
export function Icon({ name, ...rest }: IconProps) {
  const key = ALIASES[name] ?? name
  const registry = icons as Record<string, React.ComponentType<LucideProps>>
  const Cmp = registry[key] ?? registry[name] ?? HelpCircle
  return <Cmp {...rest} />
}
