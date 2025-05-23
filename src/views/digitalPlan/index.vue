<template>
  <div class="app-container digitalPlanContainer">
    <el-tabs type="border-card">
      <el-tab-pane>
        <template #label>
          <svg-icon icon-class="client" class="mr-2" />
          动态讲义
        </template>
        <p class="mt-0 mb-2" style="display: flow-root;">
          <span class="font-bold float-left">基础信息</span>
        </p>
        <el-form :model="formData" :rules="rules" ref="genForm" inline label-width="90px">
          <div class="flex">
            <el-form-item label="文件名称:" prop="name" class="w-1/2">
              <el-input v-model="formData.name" placeholder="请输入文件名称"></el-input>
            </el-form-item>
            <el-form-item label="课程名称:" prop="title" class="w-1/2">
              <el-input v-model="formData.title" placeholder="请输入课程名称"></el-input>
            </el-form-item>
          </div>
          <div class="flex">
            <el-form-item label="知识要点:" prop="knowledgePoints" class="w-1/2">
              <el-input v-model="formData.knowledgePoints" placeholder="请输入知识要点"></el-input>
            </el-form-item>
            <el-form-item class="w-1/2">
              <span class="text-gray-400 text-xs ml-[-10px]">推荐输入单个知识点，生成效果更好</span>
            </el-form-item>
          </div>
        </el-form>
        <p class="mt-0 mb-2 font-bold" v-show="advanceSettingVisible">高级设置</p>
        <el-form label-width="120px" :model="formData" v-show="advanceSettingVisible">

          <el-form-item label="生成方式:">
            <el-radio-group v-model="formData.type" prop="type">
              <el-radio value="1">
                <span class="w-[80px] inline-block">整页形式</span>
              </el-radio>
              <el-radio value="2">
                <span class="w-[80px] inline-block">分页形式</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="理论讲解:">
            <el-radio-group v-model="formData.planType" prop="planType">
              <el-radio value="1"><span class="w-[80px] inline-block">概述</span></el-radio>
              <el-radio value="2">
                <el-popover title="温馨提示：" content="针对简单知识点效果不明显" placement="right">
                  <template #reference>
                    <span class="inline-block">
                      精讲<el-icon class="ml-1">
                        <InfoFilled />
                      </el-icon>
                    </span>
                  </template>
                </el-popover>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="仿真代码:">
            <el-radio-group v-model="formData.hasCode" prop="hasCode">
              <el-radio value="1"><span class="w-[80px] inline-block">有</span></el-radio>
              <el-radio value="2"><span class="w-[80px] inline-block">无</span></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-show="formData.hasCode == '1'">
            <el-input v-model="formData.codeRequirement" placeholder="请输入仿真代码要求，如帮我生成QPSK算法的matlab仿真"></el-input>
          </el-form-item>
          <el-form-item label="学科垂域大模型:">
            <el-radio-group disabled>
              <el-radio value="1">通信垂域大模型</el-radio>
              <el-radio value="2">机电垂域大模型</el-radio>
              <el-radio value="3">集成电路垂域大模型</el-radio>
              <el-radio value="4">自建模型</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div>
          <el-button type="primary" link @click="toggleAdvanceSettingVisible">
            <el-icon>
              <ArrowUpBold v-if="advanceSettingVisible" />
              <ArrowDownBold v-else />
            </el-icon>
            高级设置
          </el-button>
          <el-button type="primary" class="w-[200px]" @click="handleSubmit">一键生成</el-button>
        </div>

        <el-divider class="my-4" />

        <p class="mt-0 mb-4 font-bold">历史记录</p>
        <div class="p-4">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="文件名称" />
            <el-table-column prop="title" label="课程名称" />
            <el-table-column prop="createTime" label="生成时间" width="200">
              <template #default="scope">
                <span v-show="scope.row.status == 'DONE'">{{
                  moment(scope.row.resource.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="当前状态" width="200">
              <template #default="scope">
                <el-tag :type="scope.row.status == 'NOTReady' ? 'info' :
                  scope.row.status == 'GENERATING' ? 'warning' :
                    scope.row.status == 'DONE' ? 'success' : 'danger'" class="w-[60px]">{{ scope.row.statusZn
                    }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" :disabled="scope.row.status != 'DONE'" link
                  @click="handleShowPlan(scope.row)">查看</el-button>
                <el-button type="primary" :disabled="scope.row.status != 'DONE'" link
                  @click="handleDownload(scope.row)">下载</el-button>
                <el-button type="primary" link @click="handleRemove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="习题生成" disabled>
        <template #label>
          <svg-icon icon-class="document" class="mr-2" />
          习题生成
        </template>
      </el-tab-pane>
      <el-tab-pane label="实验设计" disabled>
        <template #label>
          <svg-icon icon-class="system" class="mr-2" />
          实验设计
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import router from '@/router'
import { getPlanList, generatePlan, removePlan } from '@/api/plan'

const genForm = ref(null)

const formData = reactive({
  name: '',
  title: '',
  knowledgePoints: '',
  type: '1',
  planType: '1',
  hasCode: '2',
  codeRequirement: '',
})

const rules = {
  name: [
    { required: true, message: '请输入文件名称', trigger: ['change', 'blur'] },
    { pattern: /^[^<>:"\/\\|?*]+$/, message: '文件名称不能包含特殊字符,如<>:"/\\|?*', trigger: ['change', 'blur'] }
  ],
  title: [
    { required: true, message: '请输入课程名称', trigger: ['change', 'blur'] },
  ],
  knowledgePoints: [
    { required: true, message: '请输入知识要点', trigger: ['change', 'blur'] },
  ],
}

const advanceSettingVisible = ref(false)

const toggleAdvanceSettingVisible = () => {
  advanceSettingVisible.value = !advanceSettingVisible.value
}


const tableData = ref([])

const getStateCn = (state) => {
  let statusZn = ''
  switch (state) {
    case 'NOTReady':
      statusZn = '准备中'
      break;
    case 'GENERATING':
      statusZn = '生成中'
      break;
    case 'DONE':
      statusZn = '完成'
      break;
    case 'FAILED':
      statusZn = '失败'
      break;
    default:
      statusZn = '-'
      break;
  }
  return statusZn

}

const getList = () => {
  getPlanList().then(res => {
    tableData.value = res.data

    for (let i = 0; i < tableData.value.length; i++) {
      // tableData.value[i].createTime = moment(tableData.value[i].createTime).utc().format('YYYY-MM-DD HH:mm:ss')
      // tableData.value[i].createTime = moment(tableData.value[i].createTime).utc().format('YYYY-MM-DD HH:mm:ss')
      tableData.value[i].statusZn = getStateCn(tableData.value[i].status)
    }

  })
}

getList();

const intervalTime = ref(null)

onMounted(() => {
  intervalTime.value = setInterval(() => {
    getList()
  }, 20 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalTime.value)
})

// 查看讲义
const handleShowPlan = (row) => {
  let filePath = `/resource/${row.resource.filename}`
  let openPath = router.resolve({
    path: '/showDigitalPlan',
    query: {
      filePath: filePath,
      fileName: row.name,
      id: row.id
    }
  })
  window.open(openPath.href, '_blank')
}

// 下载讲义
const handleDownload = (row) => {
  let filePath = `/resource/${row.resource.filename}`
  const link = document.createElement('a');
  link.href = filePath;
  link.download = row.name;
  link.click();
}

// 删除讲义
const handleRemove = (row) => {
  ElMessageBox.confirm(`确定要删除该讲义 ${row.name} 吗?`, "提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    removePlan(row.id).then(res => {
      ElMessage.success({
        message: '删除成功',
        customClass: 'el-message el-message--success is-closable myToast',
      })
      getList()
    }).catch(err => {
      console.log(err)
      ElMessage.error('删除失败')
    })
  })
}

import genPrompts from './promptGen.js'

// 一键生成讲义
const handleSubmit = () => {
  genForm.value.validate((valid) => {
    if (valid) {
      let req = {
        name: formData.name,
        title: formData.title,
        knowledgePoints: formData.knowledgePoints,
        instruction: genPrompts(formData.type, formData.planType, formData.hasCode, formData.codeRequirement)
      }
      generatePlan(req).then(res => {
        ElMessage.success({
          message: '发送成功！请耐心等待讲义生成完成!',
          duration: 10 * 1000,
          showClose: true,
          customClass: 'el-message el-message--success is-closable myToast',
          type: 'success'
        })
        setTimeout(() => {
          getList()
        }, 1000)
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.digitalPlanContainer {

  :deep(.el-tabs__content) {
    height: calc(100vh - 130px);
    overflow-y: auto;
  }
}
</style>