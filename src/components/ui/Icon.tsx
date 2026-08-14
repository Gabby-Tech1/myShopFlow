import { icons, type LucideProps } from 'lucide-react'
import { HelpCircle } from 'lucide-react'

interface IconProps extends LucideProps {
  name: string
}

/** Render a lucide icon by its name (used for nav, categories, insights). */
export function Icon({ name, ...rest }: IconProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? HelpCircle
  return <Cmp {...rest} />
}
