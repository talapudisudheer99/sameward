/** Decorative product preview for the marketing hero. */
export function HeroProductPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border shadow-[0_16px_40px_rgba(16,24,40,0.12)] ring-1 ring-primary/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/marketing/product-hero.jpg"
        alt="TeamHub AI — workspaces, channels, chat, profiles, and Channel AI"
        className="aspect-[3/2] w-full object-cover object-center"
        width={1024}
        height={682}
      />
    </div>
  )
}
