import request from '@/config/axios'
import { FeatureCollection } from '@antv/l7plot/dist/esm/plots/choropleth/types'

export const getWorldTree = (): Promise<IResponse<AreaNode>> => {
  return request.get({ url: '/map/worldTree' })
}

export const getGeoJson = (areaId: string): Promise<IResponse<FeatureCollection>> => {
  let prefix = '/map'
  let areaCode = areaId
  if (isCustomGeo(areaId)) {
    prefix = '/geo'
    areaCode = getBusiGeoCode(areaId)
  }
  const realCountry = areaCode.substring(0, 3)
  const url = `${prefix}/${realCountry}/${areaCode}.json`
  return request.get({ url })
}

const isCustomGeo = (id: string) => {
  return id.startsWith('geo_')
}
const getBusiGeoCode = (id: string) => {
  return id.substring(4)
}

export const listCustomGeoArea = (): Promise<IResponse<CustomGeoArea[]>> => {
  return request.get({ url: '/customGeo/geoArea/list' })
}

export const getCustomGeoArea = (id: string): Promise<IResponse<CustomGeoSubArea[]>> => {
  return request.get({ url: `/customGeo/geoArea/${id}` })
}

export const deleteCustomGeoArea = (id: string) => {
  return request.delete({ url: `/customGeo/geoArea/${id}` })
}

export const saveCustomGeoArea = (area: CustomGeoArea) => {
  return request.post({ url: '/customGeo/geoArea/save', data: area })
}

export const deleteCustomGeoSubArea = (id: string) => {
  return request.delete({ url: `/customGeo/geoSubArea/${id}` })
}

export const saveCustomGeoSubArea = (area: CustomGeoSubArea) => {
  return request.post({ url: '/customGeo/geoSubArea/save', data: area })
}

export const listSubAreaOptions = (): Promise<IResponse<AreaNode[]>> => {
  return request.get({ url: '/customGeo/geoSubArea/options' })
}
