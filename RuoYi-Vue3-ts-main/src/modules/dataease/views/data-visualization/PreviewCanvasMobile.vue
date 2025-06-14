<script setup lang="ts">
import { dvMainStoreWithOut } from '@de/store/modules/data-visualization/dvMain'
import { onMounted, reactive } from 'vue'
import DePreview from '@de/components/data-visualization/canvas/DePreview.vue'
import router from '@de/router/mobile'
import { initCanvasDataMobile, initCanvasData } from '@de/utils/canvasUtils'
import { queryTargetVisualizationJumpInfo } from '@de/api/visualization/linkJump'
import { Base64 } from 'js-base64'
import { getOuterParamsInfo } from '@de/api/visualization/outerParams'
import { ElMessage } from 'element-plus-secondary'
import { useEmbedded } from '@de/store/modules/embedded'
import { useI18n } from '@de/hooks/web/useI18n'
import { XpackComponent } from '@de/components/plugin'
import { propTypes } from '@de/utils/propTypes'
import { setTitle } from '@de/utils/utils'
import EmptyBackground from '../../components/empty-background/src/EmptyBackground.vue'
import { filterEnumMapSync } from '@de/utils/componentUtils'
import CanvasOptBar from '@de/components/visualization/CanvasOptBar.vue'

const dvMainStore = dvMainStoreWithOut()
const { t } = useI18n()
const embeddedStore = useEmbedded()
const state = reactive({
  canvasDataPreview: null,
  canvasStylePreview: null,
  canvasViewInfoPreview: null,
  dvInfo: null,
  curPreviewGap: 0,
  initState: true
})

const props = defineProps({
  publicLinkStatus: {
    type: Boolean,
    required: false,
    default: false
  },
  isSelector: {
    type: Boolean,
    default: false
  },
  ticketArgs: propTypes.string.def(null)
})

const loadCanvasDataAsync = async (dvId, dvType) => {
  const jumpInfoParam = embeddedStore.jumpInfoParam || router.currentRoute.value.query.jumpInfoParam
  let jumpParam
  // 获取外部跳转参数
  if (jumpInfoParam) {
    jumpParam = JSON.parse(Base64.decode(decodeURIComponent(jumpInfoParam as string)))
    const jumpRequestParam = {
      sourceDvId: jumpParam.sourceDvId,
      sourceViewId: jumpParam.sourceViewId,
      sourceFieldId: null,
      targetDvId: dvId
    }
    try {
      // 刷新跳转目标仪表板联动信息
      await queryTargetVisualizationJumpInfo(jumpRequestParam).then(rsp => {
        dvMainStore.setNowTargetPanelJumpInfo(rsp.data)
      })
    } catch (e) {
      console.error(e)
    }
  }
  let argsObject = null
  try {
    argsObject = JSON.parse(props.ticketArgs)
  } catch (error) {
    console.error(error)
  }
  const hasTicketArgs = argsObject && Object.keys(argsObject)

  // 添加外部参数
  let attachParam
  await getOuterParamsInfo(dvId).then(rsp => {
    dvMainStore.setNowPanelOuterParamsInfoV2(rsp.data, dvId)
  })

  // 外部参数（iframe 或者 iframe嵌入）
  const attachParamsEncode = router.currentRoute.value.query.attachParams
  if (attachParamsEncode || hasTicketArgs) {
    try {
      if (!!attachParamsEncode) {
        attachParam = JSON.parse(Base64.decode(decodeURIComponent(attachParamsEncode as string)))
      }
      if (hasTicketArgs) {
        attachParam = Object.assign({}, attachParam, argsObject)
      }
    } catch (e) {
      console.error(e)
      ElMessage.error(t('visualization.outer_param_decode_error'))
      return
    }
  }

  const req = dvType === 'dashboard' ? initCanvasDataMobile : initCanvasData
  req(
    dvId,
    { busiFlag: dvType },
    async function ({
      canvasDataResult,
      canvasStyleResult,
      dvInfo,
      canvasViewInfoPreview,
      curPreviewGap
    }) {
      if (!dvInfo.mobileLayout && dvType === 'dashboard') {
        await router.push('/DashboardEmpty')
        return
      }
      state.dvInfo = dvInfo
      if (state.dvInfo.status) {
        if (jumpParam || attachParam) {
          await filterEnumMapSync(canvasDataResult)
        }
      }
      state.canvasDataPreview = canvasDataResult
      state.canvasStylePreview = canvasStyleResult
      state.canvasViewInfoPreview = canvasViewInfoPreview
      state.curPreviewGap = curPreviewGap
      if (state.dvInfo.status) {
        if (jumpParam) {
          dvMainStore.addViewTrackFilter(jumpParam)
        }

        state.initState = false
        dvMainStore.addOuterParamsFilter(attachParam)
        state.initState = true
      }
      if (props.publicLinkStatus) {
        // 设置浏览器title为当前仪表板名称
        document.title = dvInfo.name
        setTitle(dvInfo.name)
      }
      initBrowserTimer()
    }
  )
}

let p = null
const XpackLoaded = () => p(true)
onMounted(async () => {
  await new Promise(r => (p = r))
  dvMainStore.setMobileInPc(true)
  dvMainStore.setInMobile(true)
  const dvId = embeddedStore.dvId || router.currentRoute.value.query.dvId
  const { dvType, callBackFlag } = router.currentRoute.value.query
  if (dvId) {
    loadCanvasDataAsync(dvId, dvType)
    return
  }
  dvMainStore.setEmbeddedCallBack(callBackFlag || 'no')
  dvMainStore.setPublicLinkStatus(props.publicLinkStatus)
})

const initBrowserTimer = () => {
  if (state.canvasStylePreview.refreshBrowserEnable) {
    const gap = state.canvasStylePreview.refreshBrowserUnit === 'minute' ? 60 : 1
    const browserRefreshTime = state.canvasStylePreview.refreshBrowserTime * gap * 1000
    setTimeout(() => {
      window.location.reload()
    }, browserRefreshTime)
  }
}

defineExpose({
  loadCanvasDataAsync
})
</script>

<template>
  <div class="content" v-if="state.initState">
    <canvas-opt-bar
      canvas-id="canvas-main"
      :canvas-style-data="state.canvasStylePreview || {}"
      :component-data="state.canvasDataPreview || []"
    ></canvas-opt-bar>
    <de-preview
      ref="dvPreview"
      v-if="state.canvasStylePreview"
      :component-data="state.canvasDataPreview"
      :canvas-style-data="state.canvasStylePreview"
      :canvas-view-info="state.canvasViewInfoPreview"
      :dv-info="state.dvInfo"
      :cur-gap="state.curPreviewGap"
      :show-linkage-button="false"
      :is-selector="props.isSelector"
    ></de-preview>
  </div>
  <empty-background
    v-if="!state.initState"
    :description="t('visualization.no_params_tips')"
    img-type="noneWhite"
  />
  <XpackComponent
    jsname="L2NvbXBvbmVudC9lbWJlZGRlZC1pZnJhbWUvTmV3V2luZG93SGFuZGxlcg=="
    @loaded="XpackLoaded"
    @load-fail="XpackLoaded"
  />
</template>

<style lang="less" scoped>
.content {
  background-color: #ffffff;
  width: 100vw;
  height: 100vh;
  align-items: center;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  ::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
  }
}
</style>
