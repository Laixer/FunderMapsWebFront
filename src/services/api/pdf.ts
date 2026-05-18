import { apiBasePath } from "@/config"
import { getAuthHeader, hasToken } from "@/services/token"
import { trimTrailingChar } from "@/utils/string"

// Sync render against the API's Gotenberg-backed /api/pdf/:id endpoint. The
// API holds the request while Gotenberg renders the report front-end, then
// streams `application/pdf` bytes back. We wrap them in an object URL so the
// caller (anchor href / window.open) can treat it like a hosted link.
//
// Returned URL is owned by the caller — `URL.revokeObjectURL` it when the
// view is torn down to avoid leaking blob memory.
export const getPdf = async (buildingId: string): Promise<string> => {
  if (!hasToken()) throw new Error("Missing access token")

  const url = `${trimTrailingChar(apiBasePath, "/")}/api/pdf/${encodeURIComponent(buildingId)}`
  const response = await fetch(url, {
    method: "POST",
    headers: { ...getAuthHeader() },
  })
  if (!response.ok) throw new Error(`PDF generation failed (HTTP ${response.status})`)

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export default {
  getPdf,
}
