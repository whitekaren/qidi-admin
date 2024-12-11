import { http } from "@/utils/http";
// import internal from "node:stream";

// import { baseUrlApi } from "./utils";

export type UserListResult = {
  status: number;
  data: DataResult;
  message: string;
};

export type DataResult = {
  list: Array<UserList>;
  count: number;
};

export type UserList = {
  /** id */
  id: string;
  /** openid */
  openid: string;
  /** 邮箱 */
  email: string;
  /** 头像 */
  headimg_url: string;
  /** real_name */
  real_name: string;
  /** sur_name */
  sur_name: string;
  /** phone */
  phone: string;
  /** 用户名 */
  nick_name: string;
  /** 登录方式 */
  type: string;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
  /** 在线时间 */
  online_at: Date;
  /** 绑定设备数 */
  device_count: number;
};

export const getUserList = (params?: object) => {
  return http
    .request<UserListResult>("get", "/qidi/admin/userList", { params })
    .then(response => {
      return response; // 返回处理后的数据
    });
};
