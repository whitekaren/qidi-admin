import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data?: Array<any>;
};

type PermissionsResult = {
  status: number;
  data?: Array<number>;
  message: string;
};

type departmentData = {
  name?: string;
  parent_id?: number;
  id?: number;
  sort?: number;
  phone?: string;
  principal?: string;
  email?: string;
  status?: number;
  type?: number;
  remark?: string;
  created_at?: Date;
  /** 更新时间 */
  updated_at?: Date;
};

type roleData = {
  name?: string;
  id?: number;
  code?: string;
  status?: number;
  remark?: string;
  permissions?: string;
  created_at?: Date;
  updated_at?: Date;
};

type userData = {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  nickname: string;
  username: string;
  password: string;
  phone: string | number;
  email: string;
  sex: string;
  status: number;
  roles?: string;
  role_ids?: string;
  dept_id?: number;
  dept_name?: string;
  remark: string;
  created_at?: Date;
  /** 更新时间 */
  updated_at?: Date;
};

type userResult = {
  status: number;
  data?: {
    /** 列表数据 */
    list: Array<userData>;
    /** 总条目数 */
    count?: number;
  };
  message: string;
};

type DataResult = {
  status: number;
  data?: {
    /** 列表数据 */
    list: Array<departmentData>;
    /** 总条目数 */
    count?: number;
  };
  message: string;
};

type RoleResult = {
  status: number;
  data?: {
    /** 列表数据 */
    list: Array<roleData>;
    /** 总条目数 */
    count?: number;
  };
  message: string;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 获取系统管理-用户管理列表 */
export const getUserList = (params?: object) => {
  return http.request<userResult>("get", "qidi/admin/adminUserList", {
    params
  });
};

/** 编辑/新增系统管理-用户管理列表 */
export const editUserList = (data?: object) => {
  return http.request<userData>("post", "qidi/admin/editAdminUser", {
    data
  });
};

/** 删除系统管理-角色管理列表 */
export const deleteUserList = (data?: object) => {
  return http.request<DataResult>("post", "qidi/admin/deleteAdminUser", {
    data
  });
};

/** 系统管理-用户管理-获取所有角色列表 */
export const getAllRoleList = () => {
  return http.request<RoleResult>("get", "qidi/admin/roleList");
};

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 获取系统管理-角色管理列表 */
export const getRoleList = (params?: object) => {
  return http.request<RoleResult>("get", "qidi/admin/roleList", { params });
};

/** 编辑/新增系统管理-角色管理列表 */
export const editRoleList = (data?: object) => {
  return http.request<DataResult>("post", "qidi/admin/editRole", {
    data
  });
};

/** 删除系统管理-角色管理列表 */
export const deleteRoleList = (data?: object) => {
  return http.request<DataResult>("post", "qidi/admin/deleteRole", {
    data
  });
};

/** 获取系统管理-菜单管理列表 */
export const getMenuList = (data?: object) => {
  return http.request<Result>("post", "/menu", { data });
};

/** 获取系统管理-部门管理列表 */
export const getDeptList = (params?: object) => {
  return http.request<DataResult>("get", "qidi/admin/departmentList", {
    params
  });
};

/** 编辑/新增系统管理-部门管理列表 */
export const editDeptList = (data?: object) => {
  return http.request<DataResult>("post", "qidi/admin/editDepartment", {
    data
  });
};

/** 删除系统管理-部门管理列表 */
export const deleteDeptList = (data?: object) => {
  return http.request<DataResult>("post", "qidi/admin/deleteDepartment", {
    data
  });
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (data?: object) => {
  return http.request<Result>("post", "/role-menu", { data });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (params?: object) => {
  return http.request<PermissionsResult>("get", "qidi/admin/rolePermissions", {
    params
  });
};
