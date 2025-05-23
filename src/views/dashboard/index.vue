<template>
  <div class="app-container flex flex-col justify-center items-center">
    <h1>欢迎您！一起开始今天的工作</h1>
    <img :src="advPng" alt="广告图片" class="w-1/2 mt-10"/>
  </div>
</template>

<script setup lang="ts">
import  advPng from "@/assets/dashboard/adv.png";

// defineOptions({
//   name: "Dashboard",
//   inheritAttrs: false,
// });
</script>

<style lang="scss" scoped></style>
