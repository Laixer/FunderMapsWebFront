import { get, put } from "../apiClient"

// The TS API stores user metadata as a jsonb column on application_user and
// returns the whole row: { userId, applicationId, metadata, updateDate }. The
// payload we care about is the inner `metadata` object.
//
// Production data is corrupted: earlier client versions sent the row envelope
// back as the body of PUT requests, so each save wrapped the previous one and
// the stored value now looks like
//   { userId, metadata: { userId, metadata: { userId, metadata: { ... } } } }
// nested ~7 levels deep. We unwrap recursively on GET so existing users see
// their actual data, and we send only the leaf object on PUT so the rot stops
// compounding.

const isEnvelope = (v: unknown): v is { metadata: unknown } =>
  !!v && typeof v === 'object' && 'metadata' in v

const unwrap = (v: unknown): Record<string, unknown> => {
  let cur: unknown = v
  while (isEnvelope(cur)) cur = cur.metadata
  return (cur && typeof cur === 'object') ? cur as Record<string, unknown> : {}
}

export const getMetadata = async (): Promise<Record<string, unknown>> => {
  const response = await get({ endpoint: '/user/metadata' })
  return unwrap(response)
}

export const setMetadata = (body: Record<string, unknown>): Promise<unknown> => {
  return put({ endpoint: '/user/metadata', body: { metadata: body } })
}

export default {
  getMetadata,
  setMetadata,
}
