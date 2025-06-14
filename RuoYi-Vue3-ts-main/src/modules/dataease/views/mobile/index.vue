<script lang="ts" setup>
import mobileIcon_dashboard_filled from '@de/assets/svg/mobile/icon_dashboard_filled.svg'
import mobileIcon_dashboard_outlined from '@de/assets/svg/mobile/icon_dashboard_outlined.svg'
import mobileIcon_home_filled from '@de/assets/svg/mobile/icon_home_filled.svg'
import mobileIcon_home_outlined from '@de/assets/svg/mobile/icon_home_outlined.svg'
import mobileIcon_member_filled from '@de/assets/svg/mobile/icon_member_filled.svg'
import mobileIcon_member_outlined from '@de/assets/svg/mobile/icon_member_outlined.svg'
import { ref, onBeforeMount } from 'vue'
import Home from './home/index.vue'
import Directory from './directory/index.vue'
import { useCache } from '@de/hooks/web/useCache'
import Personal from './personal/index.vue'
import VanTabbar from 'vant/es/tabbar'
import VanTabbarItem from 'vant/es/tabbar-item'
import VanOverlay from 'vant/es/overlay'
import VanLoading from 'vant/es/loading'
import 'vant/es/tabbar-item/style'
import 'vant/es/tabbar/style'
import 'vant/es/overlay/style'
import 'vant/es/loading/style'
import { useI18n } from '@de/hooks/web/useI18n'

const activeTabbar = ref('home')
const showLoading = ref(false)
const hiddenTabbar = ref(false)
const { wsCache } = useCache('sessionStorage')
const { t } = useI18n()

onBeforeMount(() => {
  activeTabbar.value = wsCache.get('activeTabbar') || 'home'
})
</script>

<template>
  <div class="mobile-index">
    <Home v-if="activeTabbar === 'home'" @setLoading="val => (showLoading = val)"></Home>
    <Directory
      v-else-if="activeTabbar === 'direct'"
      @setLoading="val => (showLoading = val)"
      @hiddenTabbar="val => (hiddenTabbar = val)"
    ></Directory>
    <Personal v-else-if="activeTabbar === 'user'"> </Personal>
    <van-tabbar safe-area-inset-bottom v-if="!hiddenTabbar" v-model="activeTabbar">
      <van-tabbar-item name="home">
        <template #icon="{ active }">
          <el-icon>
            <Icon
              ><component
                :is="active ? mobileIcon_home_filled : mobileIcon_home_outlined"
              ></component
            ></Icon>
          </el-icon>
        </template>
        工作台
      </van-tabbar-item>
      <van-tabbar-item name="direct"
        ><template #icon="{ active }">
          <el-icon>
            <Icon
              ><component
                :is="active ? mobileIcon_dashboard_filled : mobileIcon_dashboard_outlined"
              ></component
            ></Icon>
          </el-icon>
        </template>
        {{ t('work_branch.dashboard') }}</van-tabbar-item
      >
      <van-tabbar-item name="user"
        ><template #icon="{ active }">
          <el-icon>
            <Icon
              ><component
                :is="active ? mobileIcon_member_filled : mobileIcon_member_outlined"
              ></component
            ></Icon>
          </el-icon> </template
        >我的</van-tabbar-item
      >
    </van-tabbar>
    <van-overlay v-model:show="showLoading">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%">
        <van-loading type="spinner" />
      </div>
    </van-overlay>
  </div>
</template>

<style lang="less">
.mobile-index {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  --van-nav-bar-height: 44px;
  --van-nav-bar-arrow-size: 20px;
  --van-nav-bar-icon-color: #1f2329;
  --van-nav-bar-title-text-color: #1f2329;
  --van-font-bold: 500;
  --van-nav-bar-title-font-size: 17px;
  --van-tabs-line-height: 40px;
  --van-tabs-bottom-bar-width: 56px;
  --van-tabs-bottom-bar-color: var(--ed-color-primary);
  --van-tab-active-text-color: var(--ed-color-primary);
  --van-border-width: 0;
  --van-tab-text-color: #646a73;
  --van-tabbar-item-text-color: #8f959e;
  .van-hairline--top-bottom:after {
    bottom: auto;
    top: auto;
  }
  .van-tabbar-item--active {
    .van-tabbar-item__icon {
      .ed-icon {
        color: var(--ed-color-primary, #3370ff);
      }
    }
  }

  .van-tabbar-item {
    .ed-icon {
      font-size: 22px !important;
    }
    .van-tabbar-item__text {
      color: #646a73;
      font-size: 10px;
      font-weight: 400;
      line-height: 10px;
    }

    &.van-tabbar-item--active {
      .van-tabbar-item__text {
        color: var(--ed-color-primary);
        font-size: 10px;
        font-weight: 400;
        line-height: 10px;
      }
    }
  }
}
</style>
