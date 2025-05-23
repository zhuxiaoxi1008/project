<template>
  <div class="app-container userManage-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="bg-white p-4">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="fileName" label="用户名称"  />
        <el-table-column prop="role" label="用户角色"  />
        <el-table-column prop="time" label="更新时间" width="200" />
        <el-table-column prop="operation" label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link>修改</el-button>
            <el-button type="primary" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
const tableData = ref([
  {
    fileName: '张三',
    time: '2023-01-01 12:00:00',
  },
  {
    fileName: '李四',
    time: '2023-01-01 12:00:00',
  },
  {
    fileName: '王五',
    time: '2023-01-01 12:00:00',
  }
])
</script>
