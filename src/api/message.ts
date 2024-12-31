import { http } from "@/utils/http";

type MessageData = {
  id?: number;
  parent_id?: number;
  title?: string;
  type?: string;
  content?: string;
  lang?: string;
  region?: string;
  platform?: string;
  expiry_date: Date;
  created_at?: Date;
  /** 更新时间 */
  updated_at?: Date;
};

type MessageListResult = {
  status: number;
  data?: {
    /** 列表数据 */
    list: Array<MessageData>;
    /** 总条目数 */
    count?: number;
  };
  message: string;
};

type editMessageResult = {
  status: number;
  data?: {
    id?: string;
  };
  message: string;
};

export const getMessageList = (params?: object) => {
  return http
    .request<MessageListResult>("get", "/qidi/common/newMessageList", {
      params
    })
    .then(response => {
      return response; // 返回处理后的数据
    });
};

export const editMessage = (data?: object) => {
  return http
    .request<editMessageResult>("post", "/qidi/admin/editNewMessage", { data })
    .then(response => {
      return response; // 返回处理后的数据
    });
};

export const deleteMessage = (data?: object) => {
  return http
    .request<MessageListResult>("post", "/qidi/admin/deleteNewMessage", {
      data
    })
    .then(response => {
      return response; // 返回处理后的数据
    });
};
export const uploadFile = (data?: object) => {
  return http
    .request<MessageListResult>("post", "/qidi/common/upload", {
      data
    })
    .then(response => {
      return response; // 返回处理后的数据
    });
};
