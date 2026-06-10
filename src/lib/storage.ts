export const STORAGE_PREFIX = 'axiom_v1_'

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}${name}`
}
