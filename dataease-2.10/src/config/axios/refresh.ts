import { useCache } from '@/hooks/web/useCache'
// 不再调用 DataEase 自身的刷新登录接口，直接复用若依的 token
import { getToken } from '@/utils/auth'

import { isLink } from '@/utils/utils'
const { wsCache } = useCache()

export const configHandler = config => {
  const desktop = wsCache.get('app.desktop')
  if (desktop || isLink()) {
    return config
  }
  const token = getToken()
  if (token) {
    config.headers['X-DE-TOKEN'] = token
  }
  return config
}
