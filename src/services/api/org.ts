import { type IOrg } from "@/datastructures/interfaces"
import { get } from "../apiClient"

interface OrgListItem {
  id: string
  name: string
  active: boolean
}

export const getOrgs = async (): Promise<OrgListItem[]> => {
  const response = await get({ endpoint: '/organization' })

  // Currently only 1 org is returned as object
  const orgs = Array.isArray(response) ? response : [response]

  return orgs.map((org: IOrg) => ({
    id: org.id,
    name: org.name,
    active: true
  }))
}

export default {
  getOrgs
}
