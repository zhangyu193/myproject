import { useCache } from '@de/hooks/web/useCache'
const { wsCache } = useCache()

export const isDesktop = () => {
  const desktop = wsCache.get('app.desktop')
  return desktop
}
