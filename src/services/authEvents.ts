// Auth-failure event channel. apiClient detects unauthenticated state
// (missing token, server 401) and emits; the app shell subscribes and
// decides how to react (clear session, navigate to login). Keeps the
// API client free of router/store imports.

type Listener = () => void

const listeners = new Set<Listener>()

export const onAuthExpired = (fn: Listener): (() => void) => {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export const emitAuthExpired = (): void => {
  for (const fn of listeners) fn()
}
