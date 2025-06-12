import { useCache } from '@de/hooks/web/useCache'
import { isLink } from '@de/utils/utils'
const { wsCache } = useCache()
export const configHandler = config => {
  const desktop = wsCache.get('app.desktop')
  if (desktop || isLink()) {
    return config
  }
  if (wsCache.get('user.token')) {
    config.headers['X-DE-TOKEN'] = wsCache.get('user.token')
  }
  return config
}
