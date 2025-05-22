<template>
  <div class="login-container">

    <el-card class="login-card">
      <div class="text-center relative">
        <h2 class="mb-3 text-2xl font-bold">{{ defaultSettings.title }}</h2>
        <el-tag class="ml-2 absolute-rt">{{ defaultSettings.version }}</el-tag>
        <subTitle></subTitle>
      </div>

      <el-form ref="loginFormRef" :model="loginData" :rules="loginRules" class="login-form ml-[50px]">
        <el-form-item prop="phone" label="手机号">
          <el-input ref="phone" v-model="loginData.phone" placeholder="请输入11位手机号" name="phone" />
        </el-form-item>
        <el-form-item prop="captchaCode" label="验证码">
          <el-input ref="captchaCode" v-model="loginData.captchaCode" placeholder="请输入验证码" name="captchaCode"
            style="width: 170px; margin-right: 10px" />
          <el-button :disabled="n > 0" type="primary" style="width: calc(100% - 180px)" @click="handleSendCode">
            发送验证码
            <span v-show="n > 0"> ({{ n }})</span>
          </el-button>
        </el-form-item>
        <el-form-item prop="betaCode" label="内测码">
          <el-input ref="betaCode" v-model="loginData.betaCode" placeholder="请输入内测码" name="betaCode"
            style="width: 170px; margin-right: 10px" />
          <el-button type="primary" link style="width: 100px" @click="handleApplyBetaCode">马上申请</el-button>
        </el-form-item>
        <div class="flex justify-end mb-4">
          <el-button type="primary" link @click="handleRegister">没有账号，立即注册</el-button>
        </div>

        <el-button :loading="loading" type="primary" size="large" class="w-full" @click.prevent="handleLoginSubmit">
          {{ $t("login.login") }}
        </el-button>

      </el-form>
    </el-card>

    <!-- ICP备案 -->
    <div class="icp-info" v-show="icpVisible">
      <p>
        Copyright © 2025 - 2099 IECube Tutorial All Rights Reserved. IECUBE
        北京曾益慧创科技有限公司 版权所有
      </p>
      <p>京ICP备xxx号-x</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import subTitle from "./subTitle.vue";

// 外部库和依赖
import { LocationQuery, useRoute } from "vue-router";

// 内部依赖
import { useSettingsStore, useUserStore } from "@/store";
// import AuthAPI, { type LoginData } from "@/api/auth";
import router from "@/router";
import defaultSettings from "@/settings";
import { ThemeEnum } from "@/enums/ThemeEnum";

// 类型定义
import type { FormInstance } from "element-plus";
import { login, getVerifCode, checkPhoneIsRegisterUser } from "@/api/login"

// 导入 login.scss 文件
import "@/styles/login.scss";

// 使用导入的依赖和库
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const route = useRoute();
// 窗口高度
const { height } = useWindowSize();
// 国际化 Internationalization
const { t } = useI18n();

// 是否暗黑模式
const isDark = ref(settingsStore.theme === ThemeEnum.DARK);
// 是否显示 ICP 备案信息
const icpVisible = ref(true);
// 按钮 loading 状态
const loading = ref(false);
// 是否大写锁定
const isCapslock = ref(false);
// 验证码图片Base64字符串
const captchaBase64 = ref();
// 登录表单ref
const loginFormRef = ref<FormInstance>();

const loginData = ref({
  // phone: "18011111111",
  // captchaCode: "899999",
  // betaCode: "iF-mfs",
  phone: "",
  captchaCode: "",
  betaCode: "",
});

const loginRules = computed(() => {
  return {
    phone: [
      { required: true, message: "请输入手机号", trigger: ["blur", "change"] },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: ["blur", "change"] },
    ],
    captchaCode: [
      { required: true, message: "请输入验证码", trigger: ["blur", "change"] },
    ],
    betaCode: [
      { required: true, message: "请输入内测码", trigger: ["blur", "change"] },
    ],
  };
});






/** 登录表单提交 */
function handleLoginSubmit() {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;

      let req = {
        "phone": loginData.value.phone,
        "verifyCode": loginData.value.captchaCode,
        "invitationCode": loginData.value.betaCode,
      }
      login(req)
        .then(res => {
          console.log(res)
          if (res.state == 200) {
            let { token, user } = res.data;
            localStorage.setItem("token", token);
            userStore.setUserInfo(user);
          }

          const { path, queryParams } = parseRedirect();
          router.push({ path: path, query: queryParams });
        })
        .catch(() => {

        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

/** 解析 redirect 字符串 为 path 和  queryParams */
function parseRedirect(): {
  path: string;
  queryParams: Record<string, string>;
} {
  const query: LocationQuery = route.query;
  const redirect = (query.redirect as string) ?? "/";

  const url = new URL(redirect, window.location.origin);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}

/** 主题切换 */
const toggleTheme = () => {
  const newTheme =
    settingsStore.theme === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK;
  settingsStore.changeTheme(newTheme);
};

/** 根据屏幕宽度切换设备模式 */
watchEffect(() => {
  if (height.value < 600) {
    icpVisible.value = false;
  } else {
    icpVisible.value = true;
  }
});

/** 检查输入大小写 */
function checkCapslock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}

const handleRegister = () => {
  router.push({ path: "signup" });
};



const handleApplyBetaCode = () => {
  if (loginData.value.phone == "") {
    ElMessage.error("请输入手机号")
    return
  }

  let reg = /^1[3-9]\d{9}$/;
  if (!reg.test(loginData.value.phone)) {
    ElMessage.error("请输入正确的手机号")
    return
  }


  checkPhoneIsRegisterUser(loginData.value.phone).then(res => {
    if (res.state == 200 && res.data == true) {
      router.push({
        path: "applyBetaCode",
        query: {
          phone: loginData.value.phone
        }
      });
    } else {
      ElMessage.error("该手机号未注册,请先注册")
      return
    }
  })
}




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

  if (loginData.value.phone == "") {
    ElMessage.error("请输入手机号")
    return
  }

  let reg = /^1[3-9]\d{9}$/;
  if (!reg.test(loginData.value.phone)) {
    ElMessage.error("请输入正确的手机号")
    return
  }

  checkPhoneIsRegisterUser(loginData.value.phone).then(res => {
    if (res.state == 200 && res.data == true) {
      getVerifCode({
        usage: "login",
        phone: loginData.value.phone
      }).then(res => {
        if (res.state == 200) {
          ElMessage.success("验证码发送成功")
          startTimer();
        }
      })
    } else {
      ElMessage.error("该手机号未注册,请先注册")
      return
    }
  })
}

</script>

<style lang="scss" scoped></style>
