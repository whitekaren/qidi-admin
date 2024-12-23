// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";
// import { system } from "@/router/enums";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */
// const permissionRouter = {
//   path: "/permission",
//   meta: {
//     title: "权限管理",
//     icon: "ep:lollipop",
//     rank: 10
//   },
//   children: [
//     {
//       path: "/permission/page/index",
//       name: "PermissionPage",
//       meta: {
//         title: "页面权限",
//         roles: ["201"]
//       }
//     },
//     {
//       path: "/permission/button",
//       meta: {
//         title: "按钮权限",
//         roles: ["202"]
//       },
//       children: [
//         {
//           path: "/permission/button/router",
//           component: "permission/button/index",
//           name: "PermissionButtonRouter",
//           meta: {
//             title: "路由返回按钮权限",
//             roles: ["203"],
//             auths: [
//               "permission:btn:add",
//               "permission:btn:edit",
//               "permission:btn:delete"
//             ]
//           }
//         },
//         {
//           path: "/permission/button/login",
//           component: "permission/button/perms",
//           name: "PermissionButtonLogin",
//           meta: {
//             title: "登录接口返回按钮权限"
//           }
//         }
//       ]
//     }
//   ]
// };

const frameRouter = {
  path: "/iframe",
  meta: {
    icon: "ri:links-fill",
    title: "外部页面",
    rank: 2
  },
  children: [
    {
      path: "/iframe/showDoc",
      name: "showDoc",
      meta: {
        icon: "radix-icons:file-text",
        title: "showDoc",
        frameSrc: "http://47.120.29.134:4999",
        keepAlive: true,
        roles: ["201"]
      }
    },
    {
      path: "/iframe/frp_dashboard_aliyun",
      name: "frp_dashboard_aliyun",
      meta: {
        icon: "material-symbols:dashboard",
        title: "阿里云Frp面板",
        frameSrc: "http://120.55.71.36:7660/",
        keepAlive: true,
        roles: ["202"]
      }
    },
    {
      path: "/iframe/frp_dashboard_aws",
      name: "frp_dashboard_aws",
      meta: {
        icon: "material-symbols:dashboard",
        title: "亚马逊Frp面板",
        frameSrc: "http://54.68.120.215:7660/",
        keepAlive: true,
        roles: ["203"]
      }
    }
  ]
};

const ListManagementRouter = {
  path: "/list",
  meta: {
    icon: "ri:table-line",
    title: "列表",
    rank: 1
  },
  children: [
    {
      path: "/list/userlist/index",
      name: "UserList",
      meta: {
        icon: "memory:account",
        title: "用户列表",
        roles: ["101"]
      }
    },
    {
      path: "/list/devicelist/index",
      name: "DeviceList",
      meta: {
        icon: "eos-icons:3d-print",
        title: "设备列表",
        roles: ["102"]
      }
    }
  ]
};

const systemManagementRouter = {
  path: "/system",
  meta: {
    icon: "ri:settings-3-line",
    title: "系统管理",
    rank: 3
  },
  children: [
    {
      path: "/system/user/index",
      name: "SystemUser",
      meta: {
        icon: "ri:admin-line",
        title: "用户管理",
        roles: ["301"]
      }
    },
    {
      path: "/system/role/index",
      name: "SystemRole",
      meta: {
        icon: "ri:admin-fill",
        title: "角色管理",
        roles: ["302"]
      }
    },
    // {
    //   path: "/system/menu/index",
    //   name: "SystemMenu",
    //   meta: {
    //     icon: "ep:menu",
    //     title: "菜单管理",
    //     roles: ["admin"]
    //   }
    // },
    {
      path: "/system/dept/index",
      name: "SystemDept",
      meta: {
        icon: "ri:git-branch-line",
        title: "部门管理",
        roles: ["303"]
      }
    }
  ]
};

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [ListManagementRouter, frameRouter, systemManagementRouter]
      };
    }
  }
]);
