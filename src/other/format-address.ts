import trim from 'lodash/trim'

export type Address = {
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
}
export const formatAddress = (address: Address) =>
  trim(`${address.street ?? ''}
  ${address.city ?? ''} ${address.state ? `, ${address.state}` : ''} ${address.zip ?? ''}`)
