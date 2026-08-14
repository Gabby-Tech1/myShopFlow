import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductImage({ imageIndex, imageUrl, alt, className }: { imageIndex?: number; imageUrl?: string; alt: string; className?: string }) {
  if (imageUrl) return <img src={imageUrl} alt={alt} className={cn('bg-canvas object-cover', className)} />
  if (imageIndex === undefined || imageIndex < 0 || imageIndex > 15) {
    return <div role="img" aria-label={alt} className={cn('grid place-items-center bg-canvas text-ink-faint', className)}><Package className="h-6 w-6" /></div>
  }
  const col = imageIndex % 4
  const row = Math.floor(imageIndex / 4)
  return <div role="img" aria-label={alt} className={cn('bg-[#f7f6f3] bg-no-repeat', className)} style={{ backgroundImage: "url('/images/product-catalogue-sprite.png')", backgroundSize: '400% 400%', backgroundPosition: `${col * 33.3333}% ${row * 33.3333}%` }} />
}
