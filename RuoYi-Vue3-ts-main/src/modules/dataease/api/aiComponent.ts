import request from '@de/config/axios'

export const findBaseParams = async () => request.get({ url: '/aiBase/findTargetUrl' })
