import request from '@de/config/axios'

export function queryAll() {
  return request.get({
    url: '/pdf-template/queryAll',
    loading: false
  })
}
