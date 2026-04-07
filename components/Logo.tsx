import Image from 'next/image'

interface LogoProps {
  /** altura em px (largura calculada automaticamente pela proporção 555/550 ≈ 1) */
  size?: number
  /** 'white' | 'pink' | 'dark' — aplica filter CSS para mudar a cor */
  color?: 'white' | 'pink' | 'dark'
  className?: string
}

// Proporção original: 555x550 — quase quadrado
export function Logo({ size = 32, color = 'dark', className = '' }: LogoProps) {
  const filter =
    color === 'white'
      ? 'brightness(0) invert(1)'
      : color === 'pink'
      ? 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(310deg) brightness(101%) contrast(101%)'
      : 'none' // 'dark' = preto original

  return (
    <Image
      src="/logo.svg"
      alt="KMundo Warehouse"
      width={size}
      height={size}
      style={{ filter, objectFit: 'contain' }}
      className={className}
      priority
    />
  )
}
