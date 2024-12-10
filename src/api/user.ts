import { http } from "@/utils/http";
// import internal from "node:stream";

// import { baseUrlApi } from "./utils";

export type UserResult = {
  status: number;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/** 登录 */
// export const getLogin = (data?: object) => {
//   return http.request<UserResult>("post", "/qidi/admin/adminLogin", { data });
// };
export const getLogin = (data?: object) => {
  return http
    .request<UserResult>("post", "/qidi/admin/adminLogin", { data })
    .then(response => {
      if (response.data.roles) {
        let str: string = "";
        for (let i = 0; i < response.data.roles.length; i++) {
          str += response.data.roles[i];
        }
        response.data.roles = str.split(",");
      }

      if (response.data.permissions) {
        let str: string = "";
        for (let i = 0; i < response.data.permissions.length; i++) {
          str += response.data.permissions[i];
        }
        response.data.permissions = str.split(",");
      }

      // 在这里可以将处理后的数据保存到需要的地方
      console.log(response); // 输出处理后的数据

      return response; // 返回处理后的数据
    });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};
