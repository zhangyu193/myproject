import request from '@de/config/axios'

export const queryVisualizationBackground = () =>
  request.get({ url: '/visualizationBackground/findAll' })
