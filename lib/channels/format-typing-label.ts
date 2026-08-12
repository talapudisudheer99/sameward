/**
 * Subject only for TypingIndicator (which appends " is typing…").
 * Input: full names of *other* people currently typing (not you).
 *
 * 0 → null
 * 1 → "Sudheer"
 * 2 → "Sudheer and Sai"
 * 3 → "Sudheer, Sai and Rahul"
 * 4+ → "N people"
 */
export function formatTypingLabel(fullNames: string[]): string | null {
  const names = [
    ...new Set(fullNames.map((n) => n.trim()).filter((n) => n.length > 0)),
  ]

  const n = names.length
  if (n === 0) return null
  if (n === 1) return names[0]!
  if (n === 2) return `${names[0]} and ${names[1]}`
  if (n === 3) return `${names[0]}, ${names[1]} and ${names[2]}`
  return `${n} people`
}
