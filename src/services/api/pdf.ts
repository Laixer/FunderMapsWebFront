import { get, post } from "../apiClient"

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export const getPdf = async (buildingId: string): Promise<string> => {
  const submission = await post({ endpoint: `/pdf/${buildingId}` }) as { jobId: string }
  const { jobId } = submission

  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const status = await get({ endpoint: `/pdf/job/${jobId}` }) as {
      status: 'working' | 'success' | 'failed'
      accessLink?: string
    }
    if (status.status === 'success' && status.accessLink) return status.accessLink
    if (status.status === 'failed') throw new Error('PDF generation failed')
    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('PDF generation timed out')
}

export default {
  getPdf
}
