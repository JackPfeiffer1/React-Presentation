import { siAirbnb, siDiscord, siFacebook, siInstagram, siNetflix, siWhatsapp } from 'simple-icons'

type Icon = { title: string; path: string }

export const LOGOS = {
  instagram: siInstagram,
  netflix: siNetflix,
  discord: siDiscord,
  facebook: siFacebook,
  whatsapp: siWhatsapp,
  airbnb: siAirbnb,
} satisfies Record<string, Icon>

export type LogoName = keyof typeof LOGOS

export function Logo({ name, size, className }: { name: LogoName; size: number; className?: string }) {
  const icon = LOGOS[name]
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={icon.title} fill="currentColor">
      <path d={icon.path} />
    </svg>
  )
}
