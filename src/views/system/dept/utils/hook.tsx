import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { getDeptList, editDeptList, deleteDeptList } from "@/api/system";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "../utils/types";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";

export function useDept() {
  const form = reactive({
    name: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const { tagStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "部门名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "排序",
      prop: "sort",
      minWidth: 70
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "created_at",
      formatter: ({ created_at }) =>
        dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 320
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getDeptList({
      limit: 100
    }); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parent_id，parent_id取父节点id
    let newData = data.list;
    if (!isAllEmpty(form.name)) {
      // 前端搜索部门名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.status)) {
      // 前端搜索状态
      newData = newData.filter(item => item.status === form.status);
    }
    dataList.value = handleTree(newData); // 处理成树结构
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: {
          higherDeptOptions: formatHigherDeptOptions(cloneDeep(dataList.value)),
          parent_id: row?.parent_id ?? 0,
          name: row?.name ?? "",
          principal: row?.principal ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sort: row?.sort ?? 0,
          status: row?.status ?? 1,
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
          message(`您${title}了部门名称为${curData.name}的这条数据`, {
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
              editDeptList(dynamicParams)
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
              editDeptList(dynamicParams)
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

  function handleDelete(row) {
    deleteDeptList({ id: row.id })
      .then(data => {
        if (data.status == 0) {
          message(`您删除了部门名称为${row.name}的这条数据`, {
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

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改部门 */
    openDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
