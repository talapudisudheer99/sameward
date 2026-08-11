"use client"

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Marketing motion locks (PO + design):
 * - Teach the product (order, hierarchy, cause→effect) — never decorate for its own sake
 * - Opacity-led fades; tiny travel — no hard pops
 * - One quiet entrance per block; play once
 * - prefer-reduced-motion → instant show
 */

/** Soft ease-out — opacity dissolves in, not snaps */
export const marketingEase = [0.33, 0.05, 0.2, 1] as const

export function useMarketingMotion() {
  const reduce = useReducedMotion()
  return {
    reduce: Boolean(reduce),
    duration: reduce ? 0 : 0.35,
    stagger: reduce ? 0 : 0.06,
  }
}

/**
 * Calm absolute-delay clock — readable fades without feeling lazy.
 * Default ~0.3s fade / ~0.05s between siblings.
 */
export function useBeatClock(options?: { step?: number; duration?: number }) {
  const { reduce } = useMarketingMotion()
  const step = reduce ? 0 : (options?.step ?? 0.05)
  const duration = reduce ? 0 : (options?.duration ?? 0.3)
  const at = (groupStart: number, index = 0) =>
    reduce ? 0 : groupStart + index * step
  return { reduce, duration, step, at }
}

type BeatProps = {
  delay: number
  duration: number
  children?: ReactNode
  className?: string
  y?: number
  x?: number
  as?: "div" | "li" | "p" | "span" | "section" | "h2" | "h3" | "ul" | "ol"
}

/** Opacity-first dissolve — optional whisper of travel. */
export function Beat({
  delay,
  duration,
  children,
  className,
  y = 4,
  x = 0,
  as: Tag = "div",
}: BeatProps) {
  const MotionTag = motion[Tag]
  const travelY = x ? 0 : y
  const travelX = x

  return (
    <MotionTag
      className={className}
      initial={
        duration === 0
          ? false
          : { opacity: 0, y: travelY, x: travelX, filter: "blur(1.5px)" }
      }
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -3% 0px" }}
      transition={{
        duration,
        delay,
        ease: marketingEase,
        opacity: { duration, delay, ease: marketingEase },
        filter: { duration: duration * 0.85, delay, ease: marketingEase },
      }}
    >
      {children}
    </MotionTag>
  )
}

type RevealProps = HTMLMotionProps<"div"> & {
  y?: number
  delay?: number
  onMount?: boolean
}

/** Fade + soft rise — section headers, CTAs, figure wraps. */
export function Reveal({
  children,
  className,
  y = 10,
  delay = 0,
  onMount = false,
  ...props
}: RevealProps) {
  const { reduce, duration } = useMarketingMotion()
  const hidden = reduce
    ? false
    : { opacity: 0, y, filter: "blur(2px)" }
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" }
  const transition = {
    duration,
    delay: reduce ? 0 : delay,
    ease: marketingEase,
    opacity: { duration, delay: reduce ? 0 : delay, ease: marketingEase },
  }

  if (onMount) {
    return (
      <motion.div
        className={className}
        initial={hidden}
        animate={shown}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.22, margin: "0px 0px -6% 0px" }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: "div" | "ul" | "ol"
}

/** Parent for staggered list items — pairs with StaggerItem. */
export function Stagger({
  children,
  className,
  delay = 0,
  as = "div",
}: StaggerProps) {
  const { reduce, stagger } = useMarketingMotion()
  const Tag = motion[as]

  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren: reduce ? 0 : delay,
      },
    },
  }

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -5% 0px" }}
    >
      {children}
    </Tag>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  as?: "li" | "div"
}

export function StaggerItem({
  children,
  className,
  as = "li",
}: StaggerItemProps) {
  const { reduce, duration } = useMarketingMotion()

  const variants: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: marketingEase },
    },
  }

  if (as === "div") {
    return (
      <motion.div className={className} variants={variants}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.li className={className} variants={variants}>
      {children}
    </motion.li>
  )
}

type StoryRevealProps = {
  children: ReactNode
  className?: string
  step?: number
}

/** Sequential beats inside a product demo — teaches cause → effect. */
export function StoryBeat({
  children,
  className,
  step = 0,
}: StoryRevealProps) {
  const { reduce, duration } = useMarketingMotion()

  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: reduce ? 0 : duration * 0.9,
        delay: reduce ? 0 : 0.12 + step * 0.18,
        ease: marketingEase,
      }}
    >
      {children}
    </motion.div>
  )
}
