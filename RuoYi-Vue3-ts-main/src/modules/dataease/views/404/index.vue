<template>
  <div class="page-not-found">
    <Icon className="login-logo-icon" name="403"><Four class="svg-icon login-logo-icon" /></Icon>
    <span class="span-403">{{ t('common.no_auth_tips') }}</span>
  </div>
</template>

<script lang="ts" setup>
import Four from '@de/assets/svg/403.svg'
import { Icon } from '@de/components/icon-custom'
import { useI18n } from '@de/hooks/web/useI18n'
const { t } = useI18n()
</script>
<style lang="less">
.page-not-found {
  width: 100%;
  top: calc(50% - 100px);
  position: absolute;
  text-align: center;
}
.span-403 {
  display: block;
  margin: 0;
  font-size: var(--ed-font-size-base);
  color: var(--ed-text-color-secondary);
}
</style>
