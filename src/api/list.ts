import { http } from "@/utils/http";
// import internal from "node:stream";

// import { baseUrlApi } from "./utils";

export type UserListResult = {
  status: number;
  data: UserDataResult;
  message: string;
};

export type UserDataResult = {
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

export type DeviceListResult = {
  status: number;
  data: DeviceDataResult;
  message: string;
};

export type DeviceDataResult = {
  list: Array<DeviceList>;
  count: number;
};

export type DeviceList = {
  /** id */
  id: string;
  /** user_id */
  user_id: string;
  /** 邮箱 */
  email: string;
  /** 设备名 */
  device_name: string;
  /** 机型 */
  machine_type: string;
  /** 序列号 */
  sn: string;
  /** MAC地址 */
  mac_address: string;
  /** IP */
  local_ip: string;
  /** 设备码 */
  device_code: string;
  /** 服务器 */
  server: string;
  /** frp地址 */
  url: string;
  /** 绑定状态 */
  status: string;
  /** 设备状态 */
  device_status: string;
  /** 创建时间 */
  created_at: Date;
  /** 更新时间 */
  updated_at: Date;
};

export const getUserList = (params?: object) => {
  return http
    .request<UserListResult>("get", "/qidi/admin/userList", { params })
    .then(response => {
      return response; // 返回处理后的数据
    });
};
export const getDeviceList = (params?: object) => {
  return http
    .request<DeviceListResult>("get", "/qidi/admin/deviceList", { params })
    .then(response => {
      return response; // 返回处理后的数据
    });
};
