<template>

  <Icon class="cursor-pointer" size="24" color="#1aad19" @click="showQrCode = true">
    <Weixin></Weixin>
  </Icon>

  <el-dialog v-model="showQrCode" title="微信分享" width="360">
    <div class="flex flex-col justify-content-center items-center">
      <vue-qrcode :value="shareUrl" :options="qrOptions" class="qr-code" tag="svg" />
      <p class="text-gray-500">打开手机微信，扫描二维码分享</p>
      <div v-if="showUrl">
        <span>链接：</span>
        <a :href="shareUrl" target="_blank" class="text-blue-500 hover:underline" rel="noopener noreferrer">{{
          displayUrl }}</a>
        <el-icon class="ml-2 cursor-pointer" title="复制" @click="copyUrl">
          <CopyDocument />
        </el-icon>
      </div>
    </div>

    <template #footer>

    </template>
  </el-dialog>

</template>

<script setup>
import { useClipboard } from '@vueuse/core'
import VueQrcode from '@chenfengyuan/vue-qrcode'

import { Weixin } from '@vicons/fa'
import { Icon } from '@vicons/utils'
import { CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  // 要分享的链接
  shareUrl: {
    type: String,
    required: true,
    default: () => window.location.href
  },
  // 二维码宽度
  width: {
    type: Number,
    default: 160
  },
  // 二维码高度
  height: {
    type: Number,
    default: 160
  },
  // 是否显示URL
  showUrl: {
    type: Boolean,
    default: true
  },
  // 二维码颜色
  colorDark: {
    type: String,
    default: '#000000'
  },
  // 背景颜色
  colorLight: {
    type: String,
    default: '#ffffff'
  },
  // 是否缩短显示URL
  shortenUrl: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['open', 'close', 'copy'])

const showQrCode = ref(false)

// 二维码配置
const qrOptions = computed(() => ({
  width: props.width,
  height: props.height,
  color: {
    dark: props.colorDark,
    light: props.colorLight
  },
  margin: 1,
  errorCorrectionLevel: 'H'
}))

// 显示URL处理
const displayUrl = computed(() => {
  if (!props.shortenUrl || props.shareUrl.length < 40) {
    return props.shareUrl
  }
  return `${props.shareUrl.substring(0, 20)}...${props.shareUrl.substring(props.shareUrl.length - 20)}`
})

// 复制URL
const { copy } = useClipboard()
const copyUrl = async () => {
  try {
    await copy(props.shareUrl)
    // 使用Element Plus的提示或原生alert
    ElMessage.success('链接已复制')
    emit('copy', props.shareUrl)
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 关闭弹窗
const closeModal = () => {
  showQrCode.value = false
  emit('close')
}
</script>

<style lang="scss" scoped></style>