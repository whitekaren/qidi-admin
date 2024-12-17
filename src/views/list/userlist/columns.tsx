import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive } from "vue";
import { clone, delay } from "@pureadmin/utils";
import { message } from "@/utils/message";

import { getUserList, editUser } from "@/api/list";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
import { addDrawer } from "@/components/ReDrawer/index";
import { hasPerms } from "@/utils/auth";
// import { useUserStoreHook } from "@/store/modules/user";

// const { permissions } = useUserStoreHook();

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchType = ref("email"); //搜索类型
  const search = ref("");
  const email = ref("");
  const password = ref("");
  const nick_name = ref("");

  const options = [
    {
      value: "email",
      label: "邮箱"
    },
    {
      value: "nick_name",
      label: "昵称"
    },
    {
      value: "id",
      label: "ID"
    }
  ];
  const loginoptions = [
    {
      value: "email",
      label: "邮箱",
      type: "warning"
    },
    {
      value: "admin",
      label: "后台",
      type: "danger"
    },
    {
      value: "apple",
      label: "苹果",
      type: "info"
    },
    {
      value: "qq",
      label: "QQ",
      type: "primary"
    },
    {
      value: "weixin",
      label: "微信",
      type: "success"
    }
  ];

  const menuOptions = {
    menuList: [
      {
        label: ({ id }) => `ID:${id}`,
        disabled: true
      },
      {
        label: "添加账号",
        tips: "Add",
        fn: _row => {
          onBaseClick();
          // console.log(row.id);
        },
        hidden: !hasPerms("permission:btn:add")
      }
    ]
  };
  function onBaseClick() {
    addDrawer({
      title: "基础用法",
      closeCallBack: ({ options, index, args }) => {
        console.log(options, index, args);
        if (args?.command === "sure") {
          editUser({
            email: email.value,
            password: password.value,
            nick_name: nick_name.value
          }).then(response => {
            message(`${response.message}`, {
              type: response.message == "新增成功" ? "success" : "error"
            });
            onCurrentChange(pagination.currentPage);
          });
        }
        email.value = "";
        password.value = "";
        nick_name.value = "";
      },
      contentRenderer: () => (
        <>
          邮箱:
          <el-input
            v-model={email.value}
            size="middle"
            clearable
            placeholder="请输入邮箱"
          />
          密码:
          <el-input
            v-model={password.value}
            size="middle"
            clearable
            placeholder="请输入密码"
          />
          昵称:
          <el-input
            v-model={nick_name.value}
            size="middle"
            clearable
            placeholder="请输入昵称"
          />
        </>
      )
    });
  }

  function showMouseMenu(row, column, event) {
    event.preventDefault();
    const { x, y } = event;
    const ctx = CustomMouseMenu({
      el: event.currentTarget,
      params: row,
      // 菜单容器的CSS设置
      menuWrapperCss: {
        background: "var(--el-bg-color)"
      },
      menuItemCss: {
        labelColor: "var(--el-text-color)",
        hoverLabelColor: "var(--el-color-primary)",
        hoverTipsColor: "var(--el-color-primary)"
      },
      ...menuOptions
    });
    ctx.show(x, y);
  }

  const columns: TableColumnList = [
    // {
    //   label: "id",
    //   prop: "id"
    // },
    {
      label: "邮箱",
      prop: "email"
    },
    // {
    //   label: "登录方式",
    //   prop: "type"
    // },
    {
      label: "openid",
      prop: "openid"
    },
    {
      label: "绑定设备数",
      prop: "device_count"
    },
    {
      label: "用户名",
      prop: "nick_name"
    },
    {
      label: "创建时间",
      prop: "created_at"
    },
    {
      label: "在线时间",
      prop: "online_at"
    },
    {
      align: "right",
      // 自定义表头，tsx用法
      headerRenderer: () => (
        <>
          <el-select v-model={searchType.value} size="small">
            {options.map(item => {
              return (
                <el-option
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              );
            })}
          </el-select>
          <el-input
            v-model={search.value}
            size="small"
            clearable
            placeholder="请输入关键词"
          />
          <el-button
            size="small"
            onClick={() => onCurrentChange(pagination.currentPage)}
          >
            刷新
          </el-button>
          <el-button size="small" onClick={() => onCurrentChange(1)}>
            搜索
          </el-button>
        </>
      ),
      cellRenderer: ({ row }) => (
        <>
          <el-tag
            type={loginoptions.filter(opt => opt.value == row.type)[0]?.type}
          >
            {loginoptions.filter(opt => opt.value == row.type)[0]?.label}
          </el-tag>
        </>
        // <el-button
        //   class="reset-margin"
        //   // size="small"
        //   link
        //   type="primary"
        //   onClick={() => handleEdit(index + 1, row)}
        // >
        //   Edit
        // </el-button>
      )
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 15,
    currentPage: 1,
    pageSizes: [15, 20, 30, 40, 50, 100],
    total: 0,
    align: "right",
    background: true,
    size: "default"
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 110
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

  function onSizeChange(val) {
    console.log("onSizeChange", val);
    loadingConfig.text = `正在切换尺寸...`;
    loading.value = true;
    delay(600).then(() => {
      const newList = [];
      dataList.value = [];

      interface DynamicParams {
        limit: number;
        page: number;
        [key: string]: any; // 允许任意数量的动态属性
      }
      const dynamicParams: DynamicParams = {
        limit: pagination.pageSize,
        page: pagination.currentPage
      };
      if (searchType.value === "nick_name") {
        dynamicParams["nick_name"] = search.value;
      } else if (searchType.value === "id") {
        dynamicParams["id"] = search.value;
      } else if (searchType.value === "email") {
        dynamicParams["email"] = search.value;
      }
      getUserList(dynamicParams)
        .then(data => {
          if (search.value) {
            newList.push(clone(data.data.list, true));
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.list.length;
            loading.value = false;
          } else {
            Array.from({
              length: Math.ceil(data.data.count / pagination.pageSize)
            }).forEach(() => {
              newList.push(clone(data.data.list, true));
            });
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.count;
            loading.value = false;
          }
        })
        .catch(error => {
          console.log(error);
        });

      loading.value = false;
    });
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      const newList = [];
      dataList.value = [];
      interface DynamicParams {
        limit: number;
        page: number;
        [key: string]: any; // 允许任意数量的动态属性
      }
      const dynamicParams: DynamicParams = {
        limit: pagination.pageSize,
        page: pagination.currentPage
      };
      if (searchType.value === "nick_name") {
        dynamicParams["nick_name"] = search.value;
      } else if (searchType.value === "id") {
        dynamicParams["id"] = search.value;
      } else if (searchType.value === "email") {
        dynamicParams["email"] = search.value;
      }
      getUserList(dynamicParams)
        .then(data => {
          if (search.value) {
            console.log(data.data.list);
            newList.push(clone(data.data.list, true));
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.list.length;
            loading.value = false;
          } else {
            console.log(data.data.list);
            console.log(Math.ceil(data.data.count / pagination.pageSize));
            Array.from({
              length: Math.ceil(data.data.count / pagination.pageSize)
            }).forEach(() => {
              newList.push(clone(data.data.list, true));
            });
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.count;
            loading.value = false;
          }
        })
        .catch(error => {
          console.log(error);
        });

      loading.value = false;
    });
  }

  onMounted(() => {
    delay(600).then(() => {
      const newList = [];
      interface DynamicParams {
        limit: number;
        page: number;
        [key: string]: any; // 允许任意数量的动态属性
      }
      const dynamicParams: DynamicParams = {
        limit: pagination.pageSize,
        page: pagination.currentPage
      };
      if (searchType.value === "nick_name") {
        dynamicParams["nick_name"] = search.value;
      } else if (searchType.value === "id") {
        dynamicParams["id"] = search.value;
      } else if (searchType.value === "email") {
        dynamicParams["email"] = search.value;
      }
      getUserList(dynamicParams)
        .then(data => {
          if (search.value) {
            newList.push(clone(data.data.list, true));
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.list.length;
            loading.value = false;
          } else {
            Array.from({
              length: Math.ceil(data.data.count / pagination.pageSize)
            }).forEach(() => {
              newList.push(clone(data.data.list, true));
            });
            newList.flat(Infinity).forEach((item, index) => {
              dataList.value.push({ id: index, ...item });
            });
            pagination.total = data.data.count;
            loading.value = false;
          }
        })
        .catch(error => {
          console.log(error);
        });
      // console.log(newList);
      // Array.from({ length: 6 }).forEach(() => {
      //   newList.push(clone(tableData, true));
      // });
    });
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    loadingConfig,
    adaptiveConfig,
    onSizeChange,
    onCurrentChange,
    showMouseMenu
  };
}
