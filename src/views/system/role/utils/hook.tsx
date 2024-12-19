import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getRoleList,
  getRoleMenu,
  getRoleMenuIds,
  editRoleList,
  deleteRoleList
} from "@/api/system";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";

export function useRole(treeRef: Ref) {
  const form = reactive({
    name: "",
    code: "",
    status: "",
    limit: 100,
    page: 1
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 100,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色编号",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name"
    },
    {
      label: "角色标识",
      prop: "code"
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "created_at",
      minWidth: 160,
      formatter: ({ created_at }) =>
        dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "!h-[20px]",
  //     "reset-margin",
  //     "!text-gray-500",
  //     "dark:!text-white",
  //     "dark:hover:!text-primary"
  //   ];
  // });

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        editRoleList({ id: row.id, status: row.status })
          .then(data => {
            if (data.status == 0) {
              switchLoadMap.value[index] = Object.assign(
                {},
                switchLoadMap.value[index],
                {
                  loading: true
                }
              );
              setTimeout(() => {
                switchLoadMap.value[index] = Object.assign(
                  {},
                  switchLoadMap.value[index],
                  {
                    loading: false
                  }
                );
                message(`已${row.status === 0 ? "停用" : "启用"}${row.name}`, {
                  type: "success"
                });
              }, 300);
            } else {
              message(
                `您${row.status === 0 ? "停用" : "启用"}${row.name}数据失败`,
                {
                  type: "error"
                }
              );
            }
          })
          .catch(error => {
            console.log(error);
            message(
              `您${row.status === 0 ? "停用" : "启用"}${row.name}数据失败`,
              {
                type: "error"
              }
            );
          });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleDelete(row) {
    deleteRoleList({ id: row.id })
      .then(data => {
        if (data.status == 0) {
          message(`您删除了角色名称为${row.name}的这条数据`, {
            type: "success"
          });
          onSearch();
        } else {
          message(`您删除数据失败`, {
            type: "error"
          });
        }
      })
      .catch(error => {
        console.log(error);
        message(`您删除数据失败`, {
          type: "error"
        });
      });
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getRoleList(toRaw(form));
    dataList.value = data.list;
    pagination.total = data.count;
    pagination.pageSize = 100;
    pagination.currentPage = 1;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          name: row?.name ?? "",
          code: row?.code ?? "",
          remark: row?.remark ?? "",
          id: row?.id ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了角色名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              interface Dynamicdata {
                name: string;
                code: string;
                permissions?: string;
                remark?: string;
                status?: number;
                [key: string]: any; // 允许任意数量的动态属性
              }
              const dynamicParams: Dynamicdata = curData as Dynamicdata;
              editRoleList(dynamicParams)
                .then(data => {
                  if (data.status == 0) {
                    chores();
                  } else {
                    message(`您${title}数据失败`, {
                      type: "error"
                    });
                  }
                })
                .catch(error => {
                  console.log(error);
                  message(`您${title}数据失败`, {
                    type: "error"
                  });
                });
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              interface Dynamicdata {
                name: string;
                parent_id?: number;
                sort?: number;
                phone?: string;
                email?: string;
                remark?: string;
                status?: number;
                type?: number;
                [key: string]: any; // 允许任意数量的动态属性
              }
              const dynamicParams: Dynamicdata = curData as Dynamicdata;
              editRoleList(dynamicParams)
                .then(data => {
                  if (data.status == 0) {
                    chores();
                  } else {
                    message(`您${title}数据失败`, {
                      type: "error"
                    });
                  }
                })
                .catch(error => {
                  console.log(error);
                  message(`您${title}数据失败`, {
                    type: "error"
                  });
                });
            }
          }
        });
      }
    });
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { data } = await getRoleMenuIds({ id });
      treeRef.value.setCheckedKeys(data);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  function handleSave() {
    const { id, name } = curRow.value;
    // 根据用户 id 调用实际项目中菜单权限修改接口
    console.log(id, treeRef.value.getCheckedKeys());
    editRoleList({
      id: id,
      permissions: treeRef.value.getCheckedKeys().join(",")
    })
      .then(data => {
        if (data.status == 0) {
          message(`角色名称为${name}的菜单权限修改成功`, {
            type: "success"
          });
        } else {
          console.log(data.message);
          message(`角色名称为${name}的菜单权限修改失败`, {
            type: "error"
          });
        }
      })
      .catch(error => {
        console.log(error);
        message(`角色名称为${name}的菜单权限修改失败`, {
          type: "error"
        });
      });
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return node.title!.includes(query);
  };

  onMounted(async () => {
    onSearch();
    const { data } = await getRoleMenu();
    treeIds.value = getKeyList(data, "id");
    treeData.value = handleTree(data);
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    filterMethod,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
