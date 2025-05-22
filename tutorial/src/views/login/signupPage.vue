<template>
  <div class="login-container">

    <el-card class="login-card flex flex-column justify-center items-center">
      <div class="text-center relative">
        <h2>{{ defaultSettings.title }}</h2>
        <subTitle></subTitle>
      </div>
      <el-form class="signup-form" label-width="80px" :model="form" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学校" prop="school">
          <el-autocomplete v-model="form.school" :fetch-suggestions="querySearch" placeholder="请输入用学校" />
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-autocomplete v-model="form.college" :fetch-suggestions="querySearchCollege" placeholder="请输入学院" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" minlength="11" maxlength="11" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码" style="width: 170px; margin-right: 10px" />
          <el-button :disabled="n > 0" type="primary" style="width: calc(100% - 180px)" @click="handleSendCode">
            发送验证码
            <span v-show="n > 0"> ({{ n }})</span>
          </el-button>
        </el-form-item>
        <div>
          <el-checkbox v-model="form.agree" :disabled="!isRead" class="float-left">
            我已阅读并同意
            <span class="color-blue cursor-pointer" @click="handleRead">
              《用户协议》
            </span>
          </el-checkbox>

          <el-button link type="primary" class="float-right" @click="goRouter">
            已有账号，马上登录
          </el-button>
        </div>
        <div>
          <el-button type="primary" class="w-full" @click="onSubmit">
            注册
          </el-button>
        </div>
      </el-form>

    </el-card>



    <el-dialog title="" v-model="isRead" top="50px" width="50%" :modal="false" :show-close="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="overflow-y-auto" style="height: calc(100vh - 250px)">
        <markdown-it class="markdown-body" :source="text" />
      </div>
      <div class="mt-4">
        <el-button class="w-full" type="primary" @click="closeRead">
          我已阅读并同意
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import subTitle from "./subTitle.vue";

import MarkdownIt from "vue3-markdown-it";
import "markdown-it-highlightjs";
import router from "@/router";

import defaultSettings from "@/settings";

import { registerUser, getVerifCode } from "@/api/login"

const isRead = ref(false);


const formRef = ref(null)
const form = ref({
  name: "",
  school: "",
  college: "",
  phone: "",
  code: "",
  agree: false, // 是否已经阅读
});

const rules = ref({
  name: [
    { required: true, message: "请输入用户名", trigger: ["blur", "change"] },
  ],
  school: [
    { required: true, message: "请输入学校", trigger: ["blur", "change"] },
  ],
  college: [
    { required: true, message: "请输入学院", trigger: ["blur", "change"] },
  ],
  phone: [
    { required: true, message: "请输入电话", trigger: ["blur", "change"] },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: ["blur", "change"] },
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: ["blur", "change"] },
  ],
});

import { userAgreement } from "./userAgreement";
const text = ref("");
text.value = userAgreement;
// const md = new MarkdownIt()
// const userAgreementHtml = md.render(userAgreement)

const handleRead = () => {
  isRead.value = true;
};

const closeRead = () => {
  isRead.value = false;
  form.value.agree = true;
};

const onSubmit = () => {
  if (!form.value.agree) {
    ElMessage({
      message: '请先阅读并同意用户协议',
      type: 'warning',
    })
    return
  }

  formRef.value.validate((valid) => {
    if (valid) {
      let req = {
        name: form.value.name.trim(),
        school: form.value.school.trim(),
        collage: form.value.college.trim(),
        phone: form.value.phone.trim(),
        code: form.value.code.trim(),
      };
      registerUser(req).then(res => {
        if (res.state == 200) {
          ElMessage({
            message: '注册成功, 返回登录',
            type: 'success',
            duration: 3000,
            showClose: true,
          })
          router.push({ path: "login" });
        } else {
          ElMessage({
            message: res.msg,
            type: 'error',
          })
        }
      })
    } else {
      return false;
    }
  });
}


const goRouter = () => {
  router.push({ path: "login" });
};

import University from "./colleges.json"
// 输入提示功能
const querySearch = (queryString, cb) => {

  const results = queryString
    ? University.filter((item) => {
      return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
    })
    : University;
  // 调用 callback 返回建议列表的数据
  cb(results);
};

const colleges = [
  { "id": 1, "value": "信息与通信工程学院" },
  { "id": 2, "value": "电子工程学院" },
  { "id": 3, "value": "计算机学院" },
  { "id": 4, "value": "软件学院" },
  { "id": 5, "value": "自动化学院" },
  { "id": 6, "value": "人文学院" },
  { "id": 7, "value": "国际学院" },
  { "id": 8, "value": "继续教育学院" },
  { "id": 9, "value": "经济管理学院" },
  { "id": 10, "value": "文法经济学院" },
  { "id": 11, "value": "电信工程学院" },
  { "id": 12, "value": "民族教育学院" },
  { "id": 13, "value": "理学院" },
  { "id": 14, "value": "数字媒体与设计艺术学院" },
  { "id": 15, "value": "现代邮政学院" },
  { "id": 16, "value": "网络空间安全学院" },
  { "id": 17, "value": "光电信息学院" },
  { "id": 18, "value": "集成电路学院" },
  { "id": 19, "value": "人工智能学院" },
  { "id": 20, "value": "智能工程与自动化学院" },
  { "id": 21, "value": "物理科学与技术学院" },
  { "id": 22, "value": "未来学院" },
  { "id": 23, "value": "北京邮电大学玛丽女王海南学院" },
  { "id": 24, "value": "通信工程学院" },
  { "id": 25, "value": "计算机科学与技术学院（示范性软件学院）" },
  { "id": 26, "value": "机电工程学院" },
  { "id": 27, "value": "光电工程学院" },
  { "id": 28, "value": "物理学院" },
  { "id": 29, "value": "经济与管理学院" },
  { "id": 30, "value": "数学与统计学院" },
  { "id": 31, "value": "外国语学院" },
  { "id": 32, "value": "微电子学院" },
  { "id": 33, "value": "生命科学技术学院" },
  { "id": 34, "value": "空间科学与技术学院" },
  { "id": 35, "value": "先进材料与纳米科技学院" },
  { "id": 36, "value": "网络与信息安全学院" },
  { "id": 37, "value": "马克思主义学院" },
  { "id": 38, "value": "信息力学与感知工程学院" },
  { "id": 39, "value": "体育部" },
  { "id": 40, "value": "网络与继续教育学院" },
  { "id": 41, "value": "前沿交叉研究院" },
  { "id": 42, "value": "人文学院 / 文学院" },
  { "id": 43, "value": "计算机学院 / 信息科学技术学院" },
  { "id": 44, "value": "电子信息学院 / 通信工程学院" },
  { "id": 45, "value": "自动化学院 / 控制科学与工程学院" },
  { "id": 46, "value": "社会学院 / 公共管理学院" },
  { "id": 47, "value": "机械工程学院" },
  { "id": 48, "value": "材料科学与工程学院" },
  { "id": 49, "value": "能源与环境学院" },
  { "id": 50, "value": "艺术与设计学院" },
  { "id": 51, "value": "法学院" },
  { "id": 52, "value": "创新创业学院" }
]

// 输入提示功能
const querySearchCollege = (queryString, cb) => {

  const results = queryString
    ? colleges.filter((item) => {
      return (item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
    })
    : colleges;
  // 调用 callback 返回建议列表的数据
  cb(results);
};

const n = ref(0);
const timer = ref(0);

const startTimer = () => {
  n.value = 60;
  timer.value = setInterval(() => {
    n.value--;
    if (n.value <= 0) {
      clearInterval(timer.value);
    }
  }, 1000);
}

const handleSendCode = () => {
  if (form.value.phone == '') {
    ElMessage.warning("请先输入手机号")
  }

  let reg = /^1[3-9]\d{9}$/;
  if (!reg.test(form.value.phone)) {
    ElMessage.error("请输入正确的手机号")
    return
  }

  getVerifCode({
    phone: form.value.phone,
    usage: 'register',
  }).then(res => {
    if (res.state == 200) {
      ElMessage.success("验证码已发送")
      startTimer();
    } else {
      ElMessage.error(res.msg)
    }
  })

}

import "@/styles/login.scss";
</script>

<style lang="scss" scoped>
.signup-form {
  width: 400px;
}
</style>
