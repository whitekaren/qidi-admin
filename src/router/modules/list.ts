export default {
  path: "/list",
  redirect: "/list/userlist",
  meta: {
    icon: "ri:table-line",
    // showLink: false,
    title: "列表",
    rank: 1
  },
  children: [
    {
      path: "/list/userlist",
      name: "用户列表",
      component: () => import("@/views/list/userlist/index.vue"),
      meta: {
        icon: "memory:account",
        title: "用户列表"
      }
    },
    {
      path: "/list/devicelist",
      name: "设备列表",
      component: () => import("@/views/list/devicelist/index.vue"),
      meta: {
        icon: "eos-icons:3d-print",
        title: "设备列表"
      }
    }
  ]
} satisfies RouteConfigsTable;
