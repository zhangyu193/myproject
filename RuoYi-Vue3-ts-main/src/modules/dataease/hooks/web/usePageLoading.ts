import { useAppStoreWithOut } from '@de/store/modules/app'

const appStore = useAppStoreWithOut()

export const usePageLoading = () => {
  const loadStart = () => {
    appStore.setPageLoading(true)
  }

  const loadDone = () => {
    appStore.setPageLoading(false)
  }

  return {
    loadStart,
    loadDone
  }
}
