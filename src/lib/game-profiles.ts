import { idbGet, idbSet } from '@/lib/idb-store'

const ACTION_PROFILES_KEY = 'action-profiles'
const ELEMENT_PROFILES_KEY = 'element-profiles'

export interface GameProfile {
  id: string
  title: string
}

export function createGameProfile(title: string): GameProfile {
  return { id: crypto.randomUUID(), title: title.trim() }
}

async function getProfiles(key: string): Promise<GameProfile[]> {
  const profiles = await idbGet<GameProfile[]>(key)
  if (profiles) return profiles

  const defaultProfiles = [createGameProfile('Profil 1')]
  await idbSet(key, defaultProfiles)
  return defaultProfiles
}

export function getActionProfiles(): Promise<GameProfile[]> {
  return getProfiles(ACTION_PROFILES_KEY)
}

export function getElementProfiles(): Promise<GameProfile[]> {
  return getProfiles(ELEMENT_PROFILES_KEY)
}

export function setActionProfiles(profiles: GameProfile[]): Promise<void> {
  return idbSet(ACTION_PROFILES_KEY, profiles)
}

export function setElementProfiles(profiles: GameProfile[]): Promise<void> {
  return idbSet(ELEMENT_PROFILES_KEY, profiles)
}
