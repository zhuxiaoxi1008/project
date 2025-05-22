import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useUserStoreHook } from "@/store/modules/user";
import { ResultEnum } from "@/enums/ResultEnum";
import { TOKEN_KEY } from "@/enums/CacheEnum";
import qs from "qs";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => {
    return qs.stringify(params);
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    if (accessToken) {
      config.headers['x-access-token'] = accessToken;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {

    // 检查配置的响应类型是否为二进制类型（'blob' 或 'arraybuffer'）, 如果是，直接返回响应对象
    if (
      response.config.responseType === "blob" ||
      response.config.responseType === "arraybuffer"
    ) {
      return response;
    }

    const {message, state} = response.data;

    if( state === ResultEnum.SUCCESS){
      return response.data;
    }

    ElMessage.error(message || "系统出错");
    return Promise.reject(new Error(message || "Error"));
  },
  (error: any) => {
    const { status, message } = error;
    // 异常处理
    if (status === ResultEnum.TOKEN_INVALID || status === ResultEnum.UNAUTHORIZED) {
      ElMessageBox.confirm("您的会话已过期，请重新登录","提示",
        {
          confirmButtonText: "重新登录",
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          type: "warning",
        }
      ).then(() => {
          useUserStoreHook()
          .resetToken()
          .then(() => {
            location.reload();
          });
        }
      );
      
    }

    if(message){
      console.log(message)
      // ElMessage.error("系统出错");
    }
    return Promise.reject(error.message);
  }
);

// 导出 axios 实例
export default service;
