'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { z } from 'zod'

/**
 * Wrapper autour de `useObject` (Vercel AI SDK) qui réessaie automatiquement
 * et en silence une génération qui échoue, avant d'exposer la moindre erreur.
 *
 * - `failed` ne passe à `true` qu'une fois toutes les tentatives épuisées.
 * - `isLoading` reste vrai pendant le délai entre un échec et le ré-essai,
 *   pour éviter tout flash de l'UI (skeleton ininterrompu).
 */
export function useAiObject<S extends z.ZodType>({
  api,
  schema,
  maxRetries = 1,
  retryDelayMs = 500,
}: {
  api: string
  schema: S
  maxRetries?: number
  retryDelayMs?: number
}) {
  const lastInput = useRef<unknown>(null)
  const retries = useRef(0)
  const submitRef = useRef<(input: unknown) => void>(() => {})
  const mounted = useRef(true)
  const [retrying, setRetrying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => () => { mounted.current = false }, [])

  const obj = useObject({
    api,
    schema,
    onError: () => {
      if (!mounted.current) return
      if (retries.current < maxRetries) {
        retries.current++
        setRetrying(true)
        setTimeout(() => {
          if (!mounted.current) return
          submitRef.current(lastInput.current)
          setRetrying(false)
        }, retryDelayMs)
      } else {
        setRetrying(false)
        setFailed(true)
      }
    },
  })
  // Re-bind après chaque rendu (l'identité de submit peut changer) sans
  // écrire la ref pendant le rendu.
  useEffect(() => {
    submitRef.current = obj.submit as (input: unknown) => void
  })

  const submit = useCallback((input: unknown) => {
    lastInput.current = input
    retries.current = 0
    setFailed(false)
    setRetrying(false)
    ;(obj.submit as (input: unknown) => void)(input)
  }, [obj])

  const clear = useCallback(() => {
    retries.current = 0
    setFailed(false)
    setRetrying(false)
    obj.stop()
    obj.clear()
  }, [obj])

  return {
    object: obj.object,
    isLoading: obj.isLoading || retrying,
    failed,
    submit,
    stop: obj.stop,
    clear,
  }
}
