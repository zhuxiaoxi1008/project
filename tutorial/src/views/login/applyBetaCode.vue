<template>
  <div class="login-container">

    <el-card class="login-card">
      <div class="text-center relative">
        <h2>{{ defaultSettings.title }}</h2>
        <subTitle></subTitle>
        <p class="text-sm text-gray-500">目前为内测阶段，请输入邮箱获取内测码，数量有限，抓紧申请！</p>
      </div>
      <el-form label-width="50px" :model="form" :rules="rules" ref="formRef" label-position="left">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱">
            <template #append>.edu.cn</template>
          </el-input>
        </el-form-item>

        <el-button type="primary" class="w-full" @click="onSubmit">
          获取内测码
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>

import "markdown-it-highlightjs";
import router from "@/router";

import defaultSettings from "@/settings";

import { applyTestCode } from "@/api/login";

const formRef = ref(null)

import subTitle from "./subTitle.vue";

const route = useRouter()

console.log(route.currentRoute.value.query.phone)
const form = ref({
  email: "",
  phone: route.currentRoute.value.query.phone
});

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  if (!emailRegex.test(value)) {
    callback(new Error("请输入正确的邮箱格式"));
  } else if (!value.endsWith(".edu.cn")) {
    callback(new Error("请输入校园邮箱"));
  } else {
    callback();
  }
}

const rules = ref({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
    // { validator: validateEmail, trigger: "blur" },  // online时放开 校验邮箱是否为校园邮箱
  ],
});

import { userAgreement } from "./userAgreement";
const text = ref("");
text.value = userAgreement;
// const md = new MarkdownIt()
// const userAgreementHtml = md.render(userAgreement)

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      applyTestCode({
        email: form.value.email,
        phone: form.value.phone // 申请验证码带一个电话号
      }).then(res => {
        if (res.state === 200) {
          ElMessageBox.confirm("内测码已发送到您的邮箱，请注意查收", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            showClose: false,
            showCancelButton: false,
          }).then(() => {
            goRouter();
          }).catch();
        }
      })
    }
  });
}


const goRouter = () => {
  router.push({ path: "login" });
};
import "@/styles/login.scss";
</script>

<style lang="scss" scoped></style>
