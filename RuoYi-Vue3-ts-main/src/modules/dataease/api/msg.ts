import request from '@de/config/axios'

export const msgCountApi = () => request.post({ url: '/msg-center/count', data: {} })
