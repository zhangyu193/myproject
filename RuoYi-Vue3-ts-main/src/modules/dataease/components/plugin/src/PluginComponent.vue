<script lang="ts" setup>
import noLic from './nolic.vue'
import { ref, useAttrs, onMounted } from 'vue'
import { execute, randomKey, formatArray } from './convert'
import { loadPluginApi, xpackModelApi } from '@de/api/plugin'
import { useCache } from '@de/hooks/web/useCache'
import { i18n } from '@de/plugins/vue-i18n'
import * as Vue from 'vue'
import axios from 'axios'
import * as Pinia from 'pinia'
import router from '@de/router'
import { useEmitt } from '@de/hooks/web/useEmitt'
import request from '@de/config/axios'
const { wsCache } = useCache()
import { isNull } from '@de/utils/utils'

const plugin = ref()

const loading = ref(false)

const attrs = useAttrs()

const showNolic = () => {
  plugin.value = noLic
  loading.value = false
}
const generateRamStr = (len: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomStr = ''
  for (var i = 0; i < len; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return randomStr
}

const importProxy = (bytesArray: any[]) => {
  const promise = import(
    `../../../../../../../extensions/${formatArray(bytesArray[8])}/${formatArray(
      bytesArray[9]
    )}/${formatArray(bytesArray[10])}/${formatArray(bytesArray[11])}/${formatArray(
      bytesArray[12]
    )}.vue`
  )
  promise
    .then((res: any) => {
      plugin.value = res.default
    })
    .catch(e => {
      console.error(e)
      showNolic()
    })
}

const getModuleName = () => {
  const jsPath = window.atob(attrs.jsname.toString())
  return jsPath.split('/')[0]
}
const loadComponent = () => {
  const moduleName = getModuleName()
  loading.value = true
  const byteArray = wsCache.get(`de-plugin-proxy-${moduleName}`)
  if (byteArray) {
    importProxy(JSON.parse(byteArray))
    loading.value = false
    return
  }
  const key = generateRamStr(randomKey())
  const moduleNameKey = window.btoa(moduleName)
  const saltKey = `${key},${moduleNameKey}`
  loadPluginApi(saltKey)
    .then(response => {
      let code = response.data
      const byteArray = execute(code, key)
      storeCacheProxy(byteArray)
      importProxy(byteArray)
    })
    .catch(() => {
      emits('loadFail')
      showNolic()
    })
    .finally(() => {
      loading.value = false
    })
}
const storeCacheProxy = byteArray => {
  const result = []
  byteArray.forEach(item => {
    result.push([...item])
  })
  const moduleName = getModuleName()
  wsCache.set(`de-plugin-proxy-${moduleName}`, JSON.stringify(result))
}
const pluginProxy = ref(null)
const invokeMethod = param => {
  if (pluginProxy.value['invokeMethod']) {
    pluginProxy.value['invokeMethod'](param)
  } else {
    pluginProxy.value[param.methodName]?.(...param.args)
  }
}

onMounted(async () => {
  const key = 'xpack-model-distributed'
  let distributed = false
  if (wsCache.get(key) === null) {
    const res = await xpackModelApi()
    wsCache.set('xpack-model-distributed', isNull(res.data) ? 'null' : res.data)
    distributed = res.data
  } else {
    distributed = wsCache.get(key)
  }
  if (isNull(distributed)) {
    setTimeout(() => {
      emits('loadFail')
      loading.value = false
    }, 1000)
    return
  }
  if (distributed) {
    const moduleName = getModuleName()
    if (window[moduleName]) {
      const xpack = await window[moduleName].mapping[attrs.jsname]
      plugin.value = xpack.default
    } else {
      window['VueDe'] = Vue
      window['AxiosDe'] = axios
      window['PiniaDe'] = Pinia
      window['vueRouterDe'] = router
      window['MittAllDe'] = useEmitt().emitter.all
      window['I18nDe'] = i18n
      const url = `/xpackComponent/pluginStaticInfo/${moduleName}`
      request.get({ url }).then(async res => {
        new Function(res.data || res)()
        const xpack = await window[moduleName].mapping[attrs.jsname]
        plugin.value = xpack.default
      })
    }
  } else {
    loadComponent()
  }
})

const emits = defineEmits(['loadFail'])
defineExpose({
  invokeMethod
})
</script>

<template>
  <component
    :key="attrs.jsname"
    ref="pluginProxy"
    :is="plugin"
    v-loading="loading"
    v-bind="attrs"
  ></component>
</template>

<style lang="less" scoped></style>
