<template>
  <div class="plan-container" ref="planContainer">

    <div class="btn-tools">
      <div class="inline-block float-left">
        <span v-show="showloading" class="whitespace-nowrap text-xl font-bold color-blue-500">{{ loadingText }}</span>
      </div>

      <div class="inline-block float-right h-full flex flex-row justify-center items-center space-x-3">
        <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="保存" v-show="editorVisible"
          @click="handleSave">
          <FolderChecked />
        </el-icon>
        <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="编辑模式" v-show="!editorVisible"
          @click="openEditor">
          <Edit />
        </el-icon>
        <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="重新生成" @click="handleRefresh">
          <Refresh />
        </el-icon>
        <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="下载页面" @click="handleDownload">
          <Download />
        </el-icon>
        <!--  <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="分享" v-loading="shortLoading"
          @click="handleShare">
          <Share />
        </el-icon> -->
        <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="分享">
          <Share />
        </el-icon>
      </div>
    </div>

    <div class="flex flex-row space-x-2" style="height: calc(100% - 32px);">
      <iframe ref="iframeRef" :src="relativeFilePath + `?t=${t}`" loading="lazy"
        :class="editorVisible ? 'w-1/2' : 'w-full'" class="h-full overflow-auto" @load="closeLoadingText"></iframe>
      <div ref="editorContainer" :class="editorVisible ? 'w-1/2' : 'hidden'" class="h-full overflow-auto"></div>
    </div>

    <el-dialog v-model="shareVisible" title="分享" align-center>
      <div class="w-full h-full">
        <img :src="screenshotUrl" class="w-full h-full"></img>
        <img :src="huichuang" class="absolute top-[100px] right-0 w-[160px] h-[160px]"></img>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript'
import { Base64 } from 'js-base64'
import { updatePlan } from '@/api/plan'
import html2canvas from 'html2canvas';
import huichuang from './huichuang.jpg'

const iframeRef = ref(null)
const planContainer = ref(null)
const screenshotUrl = ref('')
const shortLoading = ref(false)

const showloading = ref(false)
const loadingText = ref('正在为您拼命加载页面中.....')
const t = ref('')

const updateTime = () => {
  t.value = new Date().getTime()
}

updateTime()

const showLoadingText = () => {
  showloading.value = true
}

const closeLoadingText = async () => {
  showloading.value = false
  await nextTick()
  setTimeout(async () => {
    await short()
  }, 3000)
}

const route = useRoute()
const relativeFilePath = ref('')
const fileName = ref('')
const id = ref(null)
relativeFilePath.value = route.query.filePath
fileName.value = route.query.fileName
id.value = route.query.id


const editorVisible = ref(false)
const editorContainer = ref(null)
let editorState = null
let editorView = null
const textValue = ref('')

const createEditor = (text) => {
  editorState = EditorState.create({
    doc: text,
    extensions: [
      basicSetup,
      css(),
      html(),
      javascript(),
      oneDark,
    ],
  });

  editorView = new EditorView({
    state: editorState,
    parent: editorContainer.value
  })

}

// 打开关闭编辑器
const openEditor = () => {
  editorVisible.value = true
}

const closeEditor = () => {
  editorVisible.value = false
}


// 下载文件
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = relativeFilePath.value;
  link.download = fileName.value;
  link.click();
}

// 保存文件
const handleSave = () => {
  closeEditor();

  const content = editorView.state.doc.toString()
  const base64Content = Base64.encode(content)
  updatePlan({
    id: id.value,
    htmlContentBase64: base64Content
  }).then(res => {
    ElMessage.success('保存成功')
    showLoadingText()
    updateTime()
  })
}

// 刷新页面
const handleRefresh = () => {
  showLoadingText()
  updateTime()
}


// 分享功能
const shareVisible = ref(false)
const handleShare = async () => {
  shortLoading.value = true

  if (screenshotUrl.value === '') {
    console.log('截图失败>>>>>>>>>>>')
    await short();
  }
  shareVisible.value = true
  shortLoading.value = false
}

const short = async () => {
  console.log('截图开始>>>>>>>>>>>')
  let iframe = iframeRef.value
  const doc = iframe.contentDocument

  // 阶段1：等待基础DOM就绪
  await waitForDOMReady(iframe)

  // 阶段2：等待CSS/JS资源
  // await waitForAssets(iframe)

  // 阶段3：等待动态内容
  await waitForDynamicContent(iframe)
  // 强制展开滚动区域
  doc.body.style.overflow = 'visible'
  doc.body.style.height = 'auto'

  const canvas = await html2canvas(iframe.contentWindow.document.body, {
    useCORS: true,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    windowWidth: iframe.contentDocument.documentElement.scrollWidth,
    windowHeight: iframe.contentDocument.documentElement.scrollHeight
  });
  screenshotUrl.value = canvas.toDataURL('image/png');
}

// 等待DOM就绪
const waitForDOMReady = (iframe) => {
  return new Promise(resolve => {
    if (iframe.contentDocument.readyState === 'complete') {
      resolve()
    } else {
      iframe.contentDocument.addEventListener('DOMContentLoaded', resolve)
    }
  })
}

// 等待CSS/JS资源
const waitForAssets = async (iframe) => {
  const doc = iframe.contentDocument
  const scripts = Array.from(doc.querySelectorAll('script'));
  const links = Array.from(doc.querySelectorAll('link'));

  const scriptPromises = scripts.map((script) => {
    return new Promise((resolve, reject) => {
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
    });
  });

  const linkPromises = links.map((link) => {
    return new Promise((resolve, reject) => {
      link.addEventListener('load', resolve);
      link.addEventListener('error', reject);
    });
  });

  await Promise.all(...scriptPromises, ...linkPromises);
}

// 等待动态内容
const waitForDynamicContent = (iframe) => {
  return new Promise(resolve => {
    // const observer = new MutationObserver(() => {
    //   resolve()
    // })
    // observer.observe(iframe.contentDocument.body, {
    //   childList: true,
    //   subtree: true
    // })
    // 超时保险
    setTimeout(() => {
      resolve()
    }, 3000)
  })
}

// 获取讲义文件内容
const getHtmlFileContent = async () => {
  const response = await fetch(relativeFilePath.value)
  const htmlContent = await response.text()
  textValue.value = htmlContent
  createEditor(htmlContent)
}

// 初始化
const init = () => {
  showLoadingText()
  getHtmlFileContent()
}

init();

</script>

<style lang="scss" scoped>
.plan-container {
  height: calc(100vh - 50px);
  width: 100vw;
}

.btn-tools {
  height: 32px;
  padding: 0 20px;
}
</style>