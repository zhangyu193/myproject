<script lang="ts" setup>
import { ref, reactive, onBeforeMount, nextTick, inject } from 'vue'
import { initCanvasData, initCanvasDataMobile, onInitReady } from '@de/utils/canvasUtils'
import { interactiveStoreWithOut } from '@de/store/modules/interactive'
import { useEmbedded } from '@de/store/modules/embedded'
import { isMobile } from '@de/utils/utils'
import { check } from '@de/utils/CrossPermission'
import { useEmitt } from '@de/hooks/web/useEmitt'
import { useCache } from '@de/hooks/web/useCache'
import { getOuterParamsInfo } from '@de/api/visualization/outerParams'
import { ElMessage } from 'element-plus-secondary'
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { useI18n } from '@de/hooks/web/useI18n'
import request from '@de/config/axios'
import 'vant/es/nav-bar/style'
import 'vant/es/sticky/style'
import EmptyBackground from '../../components/empty-background/src/EmptyBackground.vue'
const { wsCache } = useCache()
const interactiveStore = interactiveStoreWithOut()
const embeddedStore = useEmbedded()
const dashboardPreview = ref(null)
const embeddedParamsDiv = inject('embeddedParams') as object

const embeddedParams = embeddedParamsDiv?.dvId ? embeddedParamsDiv : embeddedStore
const { t } = useI18n()
const state = reactive({
  canvasDataPreview: null,
  canvasStylePreview: null,
  canvasViewInfoPreview: null,
  dvInfo: null,
  curPreviewGap: 0,
  initState: true
})
const dvMainStore = dvMainStoreWithOut()

const checkPer = async resourceId => {
  if (!window.DataEaseBi || !resourceId) {
    return true
  }
  const request = { busiFlag: embeddedParams.busiFlag }
  await interactiveStore.setInteractive(request)
  const key = embeddedParams.busiFlag === 'dataV' ? 'screen-weight' : 'panel-weight'
  return check(wsCache.get(key), resourceId, 1)
}
const isPc = ref(true)
onBeforeMount(async () => {
  const checkResult = await checkPer(embeddedParams.dvId)
  if (!checkResult) {
    return
  }
  let tokenInfo = null
  if (embeddedStore.getToken && !Object.keys((tokenInfo = embeddedStore.getTokenInfo)).length) {
    const res = await request.get({ url: '/embedded/getTokenArgs' })
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

  isPc.value = !isMobile()
  const req = isPc.value ? initCanvasData : initCanvasDataMobile

  req(
    embeddedParams.dvId,
    { busiFlag: embeddedParams.busiFlag },
    function ({
      canvasDataResult,
      canvasStyleResult,
      dvInfo,
      canvasViewInfoPreview,
      curPreviewGap
    }) {
      if (!isPc.value) {
        if (!dvInfo.mobileLayout) {
          useEmitt().emitter.emit('changeCurrentComponent', 'DashboardEmpty')
          return
        } else {
          dvMainStore.setMobileInPc(true)
          dvMainStore.setInMobile(true)
        }
      }
      state.canvasDataPreview = canvasDataResult
      state.canvasStylePreview = canvasStyleResult
      state.canvasViewInfoPreview = canvasViewInfoPreview
      state.dvInfo = dvInfo
      state.curPreviewGap = curPreviewGap
      nextTick(() => {
        dashboardPreview.value.restore()
        onInitReady({ resourceId: embeddedParams.dvId })
      })
      state.initState = false
      dvMainStore.addOuterParamsFilter(attachParams, canvasDataResult, 'outer')
      state.initState = true
    }
  )
})
</script>

<template>
  <div
    :class="isPc ? 'dashboard-preview' : 'dv-common-layout-mobile_embedded'"
    v-if="state.canvasStylePreview && state.initState"
  >
    <de-preview
      ref="dashboardPreview"
      :dv-info="state.dvInfo"
      :cur-gap="state.curPreviewGap"
      :component-data="state.canvasDataPreview"
      :canvas-style-data="state.canvasStylePreview"
      :canvas-view-info="state.canvasViewInfoPreview"
      show-position="preview"
    ></de-preview>
  </div>
  <empty-background v-if="!state.initState" description="参数不能为空" img-type="noneWhite" />
</template>

<style lang="less" scoped>
.dashboard-preview {
  width: 100%;
  height: 100%;
}
</style>
<style lang="less">
.dv-common-layout-mobile_embedded {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  --van-nav-bar-height: 44px;
  --van-nav-bar-arrow-size: 20px;
  --van-nav-bar-icon-color: #1f2329;
  --van-nav-bar-title-text-color: #1f2329;
  --van-font-bold: 500;
  --van-nav-bar-title-font-size: 17px;
}
</style>
