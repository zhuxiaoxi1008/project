
import { resetRouter } from "@/router";
import { store } from "@/store";
import {userLogout} from '@/api/login'

export const useUserStore = defineStore("user", () => {
  const user = ref({
    userInfo: {},
    roles: [],
    perms: [],
  });

  function setUserInfo(userInfo: any){
    user.value.userInfo = userInfo
    localStorage.setItem("userInfo", JSON.stringify(userInfo))
  }



  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo() {
    let info = localStorage.getItem("userInfo");
    let obj = JSON.parse(info as string);
    return obj;
  }

  // user logout
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    location.reload(); // 清空路由
    return new Promise<void>((resolve, reject) => {
      userLogout()
        .then(() => {
          
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // remove token
  function resetToken() {
    return new Promise<void>((resolve) => {
      localStorage.setItem('token', "");
      resetRouter();
      resolve();
    });
  }

  return {
    user,

    setUserInfo,
    getUserInfo,
    resetToken,
    logout

  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
