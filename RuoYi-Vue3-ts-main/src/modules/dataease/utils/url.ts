import { useEmbedded } from '@de/store/modules/embedded'
const embeddedStore = useEmbedded()
export const formatDataEaseBi = (url: string) => {
  return embeddedStore.baseUrl ? `${embeddedStore.baseUrl}${url}` : url
}
