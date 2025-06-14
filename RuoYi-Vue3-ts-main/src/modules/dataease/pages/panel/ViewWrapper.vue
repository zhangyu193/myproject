<script lang="ts" setup>
import { ref, onBeforeMount, reactive, inject, nextTick } from 'vue'
import { initCanvasData, onInitReady } from '@de/utils/canvasUtils'
import { interactiveStoreWithOut } from '@de/store/modules/interactive'
import { useEmbedded } from '@de/store/modules/embedded'
import { check } from '@de/utils/CrossPermission'
import { useCache } from '@de/hooks/web/useCache'
import { getOuterParamsInfo } from '@de/api/visualization/outerParams'
import { ElMessage } from 'element-plus-secondary'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { useI18n } from '@de/hooks/web/useI18n'
import { XpackComponent } from '@de/components/plugin'
import EmptyBackground from '../../components/empty-background/src/EmptyBackground.vue'
import exeRequest from '@de/config/axios'
const { wsCache } = useCache()
const interactiveStore = interactiveStoreWithOut()
const embeddedStore = useEmbedded()
const embeddedParamsDiv = inject('embeddedParams') as object
const config = ref()
const viewInfo = ref()
const userViewEnlargeRef = ref()
const dvMainStore = dvMainStoreWithOut()
const { t } = useI18n()
const openHandler = ref(null)
const state = reactive({
  canvasDataPreview: null,
  canvasStylePreview: null,
  canvasViewInfoPreview: null,
  dvInfo: null,
  dvId: null,
  suffixId: 'common',
  initState: true
})

const embeddedParams = embeddedParamsDiv?.chartId ? embeddedParamsDiv : embeddedStore

// 目标校验： 需要校验targetSourceId 是否是当前可视化资源ID
const winMsgHandle = event => {
  const msgInfo = event.data

  // 校验targetSourceId
  if (
    msgInfo &&
    msgInfo.type === 'attachParams' &&
    msgInfo.targetSourceId === state.dvId + '' &&
    (!msgInfo.suffixId || msgInfo.suffixId === state.suffixId)
  ) {
    const attachParams = msgInfo.params
    state.initState = false
    dvMainStore.addOuterParamsFilter(attachParams, state.canvasDataPreview, 'outer')
    state.initState = true
  }
}

const checkPer = async resourceId => {
  if (!window.DataEaseBi || !resourceId) {
    return true
  }
  const request = { busiFlag: embeddedParams.busiFlag, resourceTable: 'core' }
  await interactiveStore.setInteractive(request)
  const key = embeddedParams.busiFlag === 'dataV' ? 'screen-weight' : 'panel-weight'
  return check(wsCache.get(key), resourceId, 1)
}
onBeforeMount(async () => {
  const checkResult = await checkPer(embeddedParams.dvId)
  if (!checkResult) {
    return
  }
  state.dvId = embeddedParams.dvId
  state.suffixId = embeddedParams.suffixId || 'common'
  window.addEventListener('message', winMsgHandle)

  let tokenInfo = null
  if (embeddedStore.getToken && !Object.keys((tokenInfo = embeddedStore.getTokenInfo)).length) {
    const res = await exeRequest.get({ url: '/embedded/getTokenArgs' })
    embeddedStore.setTokenInfo(res.data)
    tokenInfo = embeddedStore.getTokenInfo
  }

  // 添加外部参数
  let attachParams
  await getOuterParamsInfo(embeddedParams.dvId).then(rsp => {
    dvMainStore.setNowPanelOuterParamsInfoV2(rsp.data, embeddedParams.dvId)
  })

  // div嵌入
  if (embeddedParams.outerParams) {
    try {
      const outerPramsParse = JSON.parse(embeddedParams.outerParams)
      attachParams = outerPramsParse.attachParams
      dvMainStore.setEmbeddedCallBack(outerPramsParse.callBackFlag || 'no')
    } catch (e) {
      console.error(e)
      ElMessage.error(t('visualization.outer_param_decode_error'))
      return
    }
  }
  if (tokenInfo && Object.keys(tokenInfo).length) {
    attachParams = Object.assign({}, attachParams, tokenInfo)
  }
  const chartId = embeddedParams?.chartId

  initCanvasData(
    embeddedParams.dvId,
    { busiFlag: embeddedParams.busiFlag },
    function ({ canvasDataResult, canvasStyleResult, dvInfo, canvasViewInfoPreview }) {
      state.canvasDataPreview = canvasDataResult
      state.canvasStylePreview = canvasStyleResult
      state.canvasViewInfoPreview = canvasViewInfoPreview
      state.dvInfo = dvInfo
      state.initState = false
      dvMainStore.addOuterParamsFilter(attachParams, canvasDataResult)
      state.initState = true

      viewInfo.value = canvasViewInfoPreview[chartId]
      ;(
        (canvasDataResult as unknown as Array<{
          id: string
          component: string
          propValue: Array<{ id: string }>
        }>) || []
      ).some(ele => {
        if (ele.id === chartId) {
          config.value = ele
          return true
        } else if (ele.component === 'Group') {
          return (ele.propValue || []).some(itx => {
            if (itx.id === chartId) {
              config.value = itx
              return true
            }
            return false
          })
        } else if (ele.component === 'DeTabs') {
          ele.propValue.forEach(tabItem => {
            return (tabItem.componentData || []).some(itx => {
              if (itx.id === chartId) {
                config.value = itx
                return true
              }
              return false
            })
          })
        }
        return false
      })
      nextTick(() => {
        onInitReady({ resourceId: chartId })
      })
    }
  )
})
const userViewEnlargeOpen = opt => {
  userViewEnlargeRef.value.dialogInit(state.canvasStylePreview, viewInfo.value, config.value, opt)
}

const onPointClick = param => {
  try {
    console.info('de_inner_params send')
    if (window['dataease-embedded-host'] && openHandler?.value) {
      const pm = {
        methodName: 'embeddedInteractive',
        args: {
          eventName: 'de_inner_params',
          args: param
        }
      }
      openHandler.value.invokeMethod(pm)
    } else {
      console.info('de_inner_params send to host')
      const targetPm = {
        type: 'dataease-embedded-interactive',
        eventName: 'de_inner_params',
        args: param
      }
      window.parent.postMessage(targetPm, '*')
    }
  } catch (e) {
    console.warn('de_inner_params send error')
  }
}
</script>

<template>
  <div class="de-view-wrapper" v-if="!!config && state.initState">
    <ComponentWrapper
      style="width: 100%; height: 100%"
      :view-info="viewInfo"
      :config="config"
      :canvas-style-data="state.canvasStylePreview"
      :dv-info="state.dvInfo"
      :canvas-view-info="state.canvasViewInfoPreview"
      @userViewEnlargeOpen="userViewEnlargeOpen"
      @onPointClick="onPointClick"
      :suffix-id="state.suffixId"
    />
    <user-view-enlarge ref="userViewEnlargeRef"></user-view-enlarge>
  </div>
  <empty-background v-if="!state.initState" description="参数不能为空" img-type="noneWhite" />
  <XpackComponent ref="openHandler" jsname="L2NvbXBvbmVudC9lbWJlZGRlZC1pZnJhbWUvT3BlbkhhbmRsZXI=" />
</template>

<style lang="less" scoped>
.de-view-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
