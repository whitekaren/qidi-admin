import { http } from "@/utils/http";

export type BoardResult = {
  status: number;
  data: {
    user_count: number;
    add_user_count: number;
    alive_user_count: number;
    device_count: number;
    add_device_count: number;
    alive_device_count: number;
    online_device_count: number;
    user_list: Array<CountList>;
    device_list: Array<CountList>;
  };
};

export type CountList = {
  id: string;
  /** 头像 */
  total_count: number;
  /** 用户名 */
  time: Date;
};

/** 登录 */
// export const getLogin = (data?: object) => {
//   return http.request<UserResult>("post", "/qidi/admin/adminLogin", { data });
// };
export const getBoard = (params?: object) => {
  return http
    .request<BoardResult>("get", "/qidi/admin/qidiboard", { params })
    .then(response => {
      // 在这里可以将处理后的数据保存到需要的地方
      console.log(response); // 输出处理后的数据

      return response; // 返回处理后的数据
    });
};
