import { useCallback } from 'react'
import { useProfile } from '../store/useProfile'
import { translate, type Params, type StringKey } from './strings'

export function useLang() {
  return useProfile((s) => s.lang)
}

export function useT() {
  const lang = useLang()
  return useCallback((key: StringKey, params?: Params) => translate(lang, key, params), [lang])
}

/** Non-React access, for messages built inside the game store. */
export function currentLang() {
  return useProfile.getState().lang
}
