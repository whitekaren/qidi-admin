import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { ref, onMounted, reactive } from "vue";
import { clone, delay } from "@pureadmin/utils";
import { message } from "@/utils/message";

import { getDeviceList, unbinddevice } from "@/api/list";
import { CustomMouseMenu } from "@howdyjs/mouse-menu";
// import { addDrawer } from "@/components/ReDrawer/index";
import { hasPerms } from "@/utils/auth";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const searchType = ref("mac_address"); //搜索类型
  const search = ref("");

  const options = [
    {
      value: "mac_address",
      label: "MAC地址"
    },
    {
      value: "local_ip",
      label: "IP地址"
    },
    {
      value: "sn",
      label: "序列号"
    }
  ];
  // const loginoptions = [
  //   {
  //     value: "email",
  //     label: "邮箱"
  //   },
  //   {
  //     value: "admin",
  //     label: "后台"
  //   },
  //   {
  //     value: "apple",
  //     label: "苹果"
  //   },
  //   {
  //     value: "qq",
  //     label: "QQ"
  //   },
  //   {
  //     value: "weixin",
  //     label: "微信"
  //   }
  // ];

  const menuOptions = {
    menuList: [
      {
        label: ({ id }) => `ID:${id}`,
        disabled: true
      },
      {
        label: ({ user_id }) => `user:${user_id}`,
        disabled: true,
        hidden: row => {
          return row.user_id == null;
        }
      },
      {
        label: ({ url }) => `code:${url.split(".")[0]}`,
        disabled: true,
        hidden: row => {
          return row.user_id == null;
        }
      },
      {
        label: "解绑",
        tips: "unbind",
        fn: row =>
          unbinddevice({ device_id: row.id }).then(response => {
            message(`${response.message}`, {
              type: response.message == "设备解绑成功" ? "success" : "error"
            });
            onCurrentChange(pagination.currentPage);
          }),
        hidden: row => {
          return row.user_id == null || !hasPerms("permission:btn:unbind");
        }
      },
      {
        label: "新连接",
        tips: "server",
        fn: row =>
          window.open(
            "http://fluidd_" +
              row.server +
              ".qidi3dprinter.com/#/?url=" +
              row.url.split(".")[0] +
              "&theme=dark",
            "_blank"
          ),
        hidden: row => {
          return row.user_id == null || !hasPerms("permission:btn:newlink");
        }
      },
      {
        label: "旧连接",
        tips: "frp",
        fn: row => window.open("http://" + row.url, "_blank"),
        hidden: row => {
          return row.user_id == null || !hasPerms("permission:btn:oldlink");
        }
      }
    ]
  };

  function counttimeDifference(row) {
    const lastupdated_at = new Date(row.updated_at);
    const currentTime = new Date();
    const timeDifference =
      Math.abs(currentTime.getTime() - lastupdated_at.getTime()) / 1000;
    return timeDifference;
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
    {
      label: "设备名",
      prop: "device_name"
    },
    {
      label: "机型",
      prop: "machine_type"
    },
    {
      label: "序列号",
      prop: "sn"
    },
    {
      label: "MAC地址",
      prop: "mac_address"
    },
    {
      label: "本地IP",
      prop: "local_ip"
    },
    {
      label: "服务器",
      prop: "server"
    },
    // {
    //   label: "frp路径",
    //   prop: "url"
    // },
    {
      label: "设备状态",
      prop: "device_status",
      cellRenderer: ({ row }) => (
        <>
          {counttimeDifference(row) >= 60 || row.device_status === null ? (
            <el-tag type="danger">offline</el-tag>
          ) : (
            <el-tag type="success">{row.device_status}</el-tag>
          )}
        </>
      )
    },
    {
      label: "frp状态",
      prop: "proxy_status",
      cellRenderer: ({ row }) => (
        <>
          {row.proxy_status === "offline" || row.proxy_status === null ? (
            <el-tag type="danger">offline</el-tag>
          ) : (
            <el-tag type="success">{row.proxy_status}</el-tag>
          )}
        </>
      )
    },
    {
      label: "frp流量",
      prop: "proxy_traffic",
      cellRenderer: ({ row }) => (
        <>
          {row.today_traffic_in === 0 || row.today_traffic_in === null ? (
            <el-tag type="danger"> 0 MB</el-tag>
          ) : (
            <el-tag type="primary">
              {(row.today_traffic_in / 1048576).toFixed(2)} MB
            </el-tag>
          )}
          {row.today_traffic_out === 0 || row.today_traffic_out === null ? (
            <el-tag type="danger"> 0 MB</el-tag>
          ) : (
            <el-tag type="success">
              {(row.today_traffic_out / 1048576).toFixed(2)} MB
            </el-tag>
          )}
        </>
      )
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
          <el-tag type={row.user_id ? "success" : "danger"}>
            {row.user_id ? "已绑定" : "未绑定"}
          </el-tag>
        </>
      )
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 20, 30, 40, 50, 100],
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
      if (searchType.value === "mac_address" && search.value != "") {
        dynamicParams["mac_address"] = search.value;
      } else if (searchType.value === "sn" && search.value != "") {
        dynamicParams["sn"] = search.value;
      } else if (searchType.value === "local_ip" && search.value != "") {
        dynamicParams["local_ip"] = search.value;
      }
      getDeviceList(dynamicParams)
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
      if (searchType.value === "mac_address" && search.value != "") {
        dynamicParams["mac_address"] = search.value;
      } else if (searchType.value === "sn" && search.value != "") {
        dynamicParams["sn"] = search.value;
      } else if (searchType.value === "local_ip" && search.value != "") {
        dynamicParams["local_ip"] = search.value;
      }
      getDeviceList(dynamicParams)
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
      if (searchType.value === "mac_address" && search.value != "") {
        dynamicParams["mac_address"] = search.value;
      } else if (searchType.value === "sn" && search.value != "") {
        dynamicParams["sn"] = search.value;
      } else if (searchType.value === "local_ip" && search.value != "") {
        dynamicParams["local_ip"] = search.value;
      }
      getDeviceList(dynamicParams)
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
