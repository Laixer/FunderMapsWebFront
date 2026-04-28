export interface IOrg {
  id: string
  name: string
  role: string
}

export interface IUser {
  name: string
  email: string
  organizations: IOrg[]
}

export interface IUserProfile {
  givenName: string
  lastName: string
  email: string
  jobTitle: string
  phoneNumber: string
}