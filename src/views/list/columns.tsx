import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";
import { tableData } from "./data";
import { ref, onMounted, reactive } from "vue";
import { clone, delay } from "@pureadmin/utils";

import { getUserList } from "@/api/list";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "id",
      prop: "id"
    },
    {
      label: "邮箱",
      prop: "email"
    },
    {
      label: "登录方式",
      prop: "type"
    },
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
      console.log(val);
      getUserList({
        limit: pagination.pageSize,
        page: pagination.currentPage
      })
        .then(data => {
          console.log(data.data.list);
          Array.from({ length: 30 }).forEach(() => {
            newList.push(clone(data.data.list, true));
          });
          newList.flat(Infinity).forEach((item, index) => {
            dataList.value.push({ id: index, ...item });
          });
          pagination.total = data.data.count;
          loading.value = false;
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
      console.log(val);
      getUserList({
        limit: pagination.pageSize,
        page: pagination.currentPage
      })
        .then(data => {
          console.log(data.data.list);
          Array.from({ length: 30 }).forEach(() => {
            newList.push(clone(data.data.list, true));
          });
          newList.flat(Infinity).forEach((item, index) => {
            dataList.value.push({ id: index, ...item });
          });
          pagination.total = data.data.count;
          loading.value = false;
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
      console.log(tableData);
      getUserList({
        limit: 20,
        page: 1
      })
        .then(data => {
          console.log(data.data.list);
          Array.from({ length: 6 }).forEach(() => {
            newList.push(clone(data.data.list, true));
          });
          newList.flat(Infinity).forEach((item, index) => {
            dataList.value.push({ id: index, ...item });
          });
          pagination.total = data.data.count;
          loading.value = false;
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
    onCurrentChange
  };
}
