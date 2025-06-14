<script lang="ts" setup>
import logo from '@de/assets/svg/logo.svg'
import aboutBg from '@de/assets/img/about-bg.png'
import { ref, reactive, onMounted } from 'vue'
import { useUserStoreWithOut } from '@de/store/modules/user'
import { F2CLicense } from './index'
import { validateApi, buildVersionApi, updateInfoApi, revertApi } from '@de/api/about'
import { ElMessage, ElMessageBox } from 'element-plus-secondary'
import { useI18n } from '@de/hooks/web/useI18n'
import { useEmitt } from '@de/hooks/web/useEmitt'
import { useCache } from '@de/hooks/web/useCache'
import { logoutApi } from '@de/api/login'
import { logoutHandler } from '@de/utils/logout'
const dialogVisible = ref(false)
const { wsCache } = useCache('localStorage')
const { t } = useI18n()
const userStore = useUserStoreWithOut()
const license: F2CLicense = reactive({
  status: '',
  corporation: '',
  expired: '',
  count: 0,
  version: '',
  edition: '',
  serialNo: '',
  remark: '',
  isv: ''
})
const tipsSuffix = ref('')
const build = ref('')
const isAdmin = ref(false)
const fileList = reactive([])
const dynamicCardClass = ref('')
const loading = ref(false)
onMounted(() => {
  isAdmin.value = userStore.getUid === '1'
  initVersion()
  getLicenseInfo()
  useEmitt({
    name: 'open-about-dialog',
    callback: function () {
      dialogVisible.value = true
    }
  })
})

const initVersion = () => {
  buildVersionApi().then(res => {
    build.value = res.data
  })
}
const beforeUpload = file => {
  importLic(file)
  return false
}

const support = () => {
  const url = 'https://support.fit2cloud.com/'
  const openType = wsCache.get('open-backend') === '1' ? '_self' : '_blank'
  window.open(url, openType)
}
const back2Community = () => {
  ElMessageBox.confirm(t('about.confirm_tips'), {
    confirmButtonType: 'danger',
    type: 'warning',
    confirmButtonText: t('common.sure'),
    cancelButtonText: t('dataset.cancel'),
    autofocus: false,
    showClose: false
  })
    .then(() => {
      revertApi().then(() => {
        ElMessage.success(t('about.update_success'))
        logout()
      })
    })
    .catch(e => {
      console.error(e)
    })
}
const logout = async () => {
  await logoutApi()
  logoutHandler()
}
const getLicenseInfo = () => {
  validateHandler({}, res => {
    const info = getLicense(res.data)
    setLicense(info)
  })
}
const setLicense = lic => {
  for (const key in license) {
    if (Object.prototype.hasOwnProperty.call(license, key)) {
      license[key] = lic[key]
    }
  }
  if (license?.serialNo && license?.remark) {
    dynamicCardClass.value = 'about-card-max'
  } else if (!license?.serialNo && !license?.remark) {
    dynamicCardClass.value = ''
  } else {
    dynamicCardClass.value = 'about-card-medium'
  }
}
const removeDistributeModule = () => {
  const key = 'xpack-model-distributed'
  localStorage.removeItem(key)
}
const importLic = file => {
  removeDistributeModule()
  const reader = new FileReader()
  reader.onload = function (e) {
    const licKey = e.target.result
    validateHandler({ license: licKey }, () => {
      update(licKey)
    })
  }.bind(this)
  reader.readAsText(file)
}
const validateHandler = (param, success) => {
  validateApi(param).then(success)
}
const getLicense = result => {
  if (result.status === 'valid') {
    tipsSuffix.value = result?.license?.edition === 'Embedded' ? '套' : '个账号'
  }
  return {
    status: result.status,
    corporation: result.license ? result.license.corporation : '',
    expired: result.license ? result.license.expired : '',
    count: result.license ? result.license.count : 0,
    version: result.license ? result.license.version : '',
    edition: result.license ? result.license.edition : '',
    serialNo: result.license ? result.license.serialNo : '',
    remark: result.license ? result.license.remark : '',
    isv: result.license ? result.license.isv : ''
  }
}
const update = (licKey: string) => {
  const param = { license: licKey }
  loading.value = true
  updateInfoApi(param).then(response => {
    loading.value = false
    if (response.data.status === 'valid') {
      ElMessage.success(t('about.update_success'))
      const info = getLicense(response.data)
      setLicense(info)
    } else {
      ElMessage.warning(response.data.message)
    }
  })
}
</script>

<template>
  <el-dialog
    :append-to-body="true"
    :title="t('common.about')"
    width="840px"
    v-model="dialogVisible"
    class="about-dialog"
  >
    <img width="792" height="180" :src="aboutBg" />
    <div class="color-overlay"></div>
    <el-icon class="logo">
      <icon name="logo"><logo class="svg-icon" /></icon>
    </el-icon>
    <div class="content">
      <div class="item">
        <div class="label">{{ $t('about.auth_to') }}</div>
        <div class="value">{{ license.corporation }}</div>
      </div>
      <div class="item" v-if="license.isv">
        <div class="label">ISV</div>
        <div class="value">{{ license.isv }}</div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.expiration_time') }}</div>
        <div class="value" :class="{ 'expired-mark': license.status === 'expired' }">
          {{ license.expired }}
        </div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.auth_num') }}</div>
        <div class="value">
          {{ license.status === 'valid' ? `${license.count} ${tipsSuffix}` : '' }}
        </div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.version') }}</div>
        <div class="value">
          {{
            !license?.edition
              ? $t('about.standard')
              : license.edition === 'Embedded'
              ? $t('about.Embedded')
              : license.edition === 'Professional'
              ? $t('about.Professional')
              : $t('about.enterprise')
          }}
        </div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.version_num') }}</div>
        <div class="value">{{ build }}</div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.serial_no') }}</div>
        <div class="value">{{ license.serialNo || '-' }}</div>
      </div>
      <div class="item">
        <div class="label">{{ $t('about.remark') }}</div>
        <div class="value ellipsis">{{ license.remark || '-' }}</div>
      </div>

      <div v-if="isAdmin" style="margin-top: 24px" class="lic_rooter">
        <el-upload
          action=""
          :multiple="false"
          :show-file-list="false"
          :file-list="fileList"
          accept=".key"
          name="file"
          :before-upload="beforeUpload"
        >
          <el-button plain> {{ $t('about.update_license') }} </el-button>
        </el-upload>
        <el-button plain @click="support"> {{ $t('about.support') }} </el-button>
        <el-button v-if="license.status === 'expired'" plain @click="back2Community">
          {{ $t('about.back_community') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="less">
.about-dialog {
  img {
    border-radius: 4px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .color-overlay {
    position: absolute;
    border-radius: 4px;
    width: 792px;
    height: 180px;
    top: 72px;
    background-color: #7394f0;
    mix-blend-mode: multiply;
  }
  .logo {
    font-size: 400px;
    position: absolute;
    top: -40px;
    left: 228px;
    color: #fff;
  }

  .content {
    border-radius: 4px;
    border: 1px solid #dee0e3;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 24px 40px;
    margin-top: -7px;

    .item {
      font-family: var(--de-custom_font, 'PingFang');
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px;
      margin-bottom: 16px;
      display: flex;
      .expired-mark {
        color: red;
      }
      .label {
        color: #646a73;
        width: 300px;
      }

      .value {
        margin-left: 24px;
        max-width: 388px;
      }
    }
  }
}
.lic_rooter {
  flex-direction: row;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  align-content: center;
  width: fit-content;
  justify-content: space-between;
  column-gap: 12px;
}
</style>
