import request from '@de/config/axios'

export const validateApi = data => request.post({ url: '/license/validate', data })
export const buildVersionApi = () => request.get({ url: '/license/version' })
export const updateInfoApi = data => request.post({ url: '/license/update', data })
export const revertApi = () => request.post({ url: '/license/revert' })
