import { ProductUiMock } from "@/components/marketing/product-ui-mock"

/**
 * Product section — live React mock (sharp). GPT collage kept commented.
 */
export default function ProductBandImage() {
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <ProductUiMock density="band" />
      <figcaption className="sr-only">
        TeamHub workspaces, channels, chat, profiles, and Channel AI
      </figcaption>
    </figure>
  )

  // return (
  //   <figure className="mx-auto w-full max-w-[768px]">
  //     {/* eslint-disable-next-line @next/next/no-img-element */}
  //     <img
  //       src="/marketing/product-hero.png?v=4"
  //       alt="TeamHub AI — workspaces, channels, chat, profiles, and Channel AI"
  //       className="h-auto w-full rounded-xl object-contain ring-1 ring-border/60 shadow-[0_24px_60px_-28px_rgba(3,105,161,0.32)]"
  //       width={1024}
  //       height={576}
  //       decoding="async"
  //     />
  //     <figcaption className="sr-only">
  //       TeamHub workspaces, channels, chat, profiles, and Channel AI
  //     </figcaption>
  //   </figure>
  // )
}
