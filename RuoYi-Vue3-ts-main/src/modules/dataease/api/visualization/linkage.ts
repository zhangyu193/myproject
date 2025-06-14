import request from '@de/config/axios'

export const getViewLinkageGather = data =>
  request.post({ url: '/linkage/getViewLinkageGather', data })

export const getViewLinkageGatherArray = data =>
  request.post({ url: '/linkage/getViewLinkageGatherArray', data })

export const saveLinkage = data => request.post({ url: '/linkage/saveLinkage', data })

export const getPanelAllLinkageInfo = (dvId, resourceTable = 'snapshot') =>
  request.get({ url: '/linkage/getVisualizationAllLinkageInfo/' + dvId + '/' + resourceTable })

export const updateLinkageActive = data =>
  request.post({ url: '/linkage/updateLinkageActive', data })

export const removeLinkage = data => request.post({ url: '/linkage/removeLinkage', data })
