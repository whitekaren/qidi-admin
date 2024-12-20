import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { FormItemProps, RoleFormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  getDeptList,
  getUserList,
  getAllRoleList,
  editUserList,
  deleteUserList
} from "@/api/system";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 左侧部门树的id
    dept_id: "",
    username: "",
    phone: "",
    status: "",
    limit: 100,
    page: 1
  });
  const formRef = ref();
  const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 100,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="w-[24px] h-[24px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "sex",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex === "1" ? "danger" : null}
          effect="plain"
        >
          {row.sex === "1" ? "女" : "男"}
        </el-tag>
      )
    },
    {
      label: "部门",
      prop: "dept_name",
      minWidth: 90
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
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
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "created_at",
      formatter: ({ created_at }) =>
        dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
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
        editUserList({ id: row.id, status: row.status })
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
                message(
                  `已${row.status === 0 ? "停用" : "启用"}${row.username}`,
                  {
                    type: "success"
                  }
                );
              }, 300);
            } else {
              message(
                `您${row.status === 0 ? "停用" : "启用"}${row.username}数据失败`,
                {
                  type: "error"
                }
              );
            }
          })
          .catch(error => {
            console.log(error);
            message(
              `您${row.status === 0 ? "停用" : "启用"}${row.username}数据失败`,
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

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    deleteUserList({ id: row.id })
      .then(data => {
        if (data.status == 0) {
          message(`您删除了角色名称为${row.nickname}的这条数据`, {
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

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getUserList(toRaw(form));
    dataList.value = data.list;
    pagination.total = data.count;
    pagination.pageSize = 20;
    pagination.currentPage = 1;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.dept_id = "";
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.dept_id = selected ? id : "";
    onSearch();
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
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          id: row?.id ?? "",
          parent_id: row?.dept_id ?? 0,
          nickname: row?.nickname ?? "",
          username: row?.username ?? "",
          password: row?.password ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sex: row?.sex ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? "",
          dept_id: row?.dept_id ?? 0
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了用户名称为${curData.username}的这条数据`, {
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
                /** 用于判断是`新增`还是`修改` */
                nickname: string;
                username: string;
                password: string;
                phone: string | number;
                email: string;
                sex: string;
                status: number;
                dept_id?: number;
                dept_name?: string;
                [key: string]: any; // 允许任意数量的动态属性
              }
              const dynamicParams: Dynamicdata = curData as Dynamicdata;
              curData.dept_name = "测试部门";
              editUserList(dynamicParams)
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
                nickname: string;
                username: string;
                password: string;
                phone: string | number;
                email: string;
                sex: string;
                status: number;
                dept_id?: number;
                dept_name?: string;
                [key: string]: any; // 允许任意数量的动态属性
              }
              const dynamicParams: Dynamicdata = curData as Dynamicdata;
              editUserList(dynamicParams)
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

  const cropRef = ref();
  /** 上传头像 */
  function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: done => {
        console.log("裁剪后的图片信息：", avatarInfo.value);
        // 根据实际业务使用avatarInfo.value和row里的某些字段去调用上传头像接口即可
        done(); // 关闭弹框
        onSearch(); // 刷新表格数据
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
          </ElForm>
          <div class="mt-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            console.log(pwdForm.newPwd);
            // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可

            editUserList({ id: row.id, password: pwdForm.newPwd })
              .then(data => {
                if (data.status == 0) {
                  message(`已成功重置 ${row.username} 用户的密码`, {
                    type: "success"
                  });
                } else {
                  message(`重置 ${row.username} 用户的密码失败`, {
                    type: "success"
                  });
                }
              })
              .catch(error => {
                console.log(error);
                message(`重置 ${row.username} 用户的密码失败`, {
                  type: "success"
                });
              });

            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          }
        });
      }
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const userData = await getUserList({ id: row.id });
    const roleIdsString = userData?.data?.list[0]?.role_ids;
    const ids = roleIdsString
      ? roleIdsString.split(",").map(role_id => parseInt(role_id))
      : [];
    addDialog({
      title: `分配 ${row.username} 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
          ids
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        const ids_str = curData.ids.map(id => id.toString());

        const roles = roleOptions.value
          .filter(option => ids_str.includes(option.id))
          .map(option => option.code);
        editUserList({
          id: row.id,
          roles: roles.join(","),
          role_ids: ids_str.join(",")
        })
          .then(data => {
            if (data.status == 0) {
              message(`已成功编辑 ${row.username} 用户的角色`, {
                type: "success"
              });
            } else {
              message(`编辑 ${row.username} 用户的角色失败`, {
                type: "error"
              });
            }
          })
          .catch(error => {
            console.log(error);
            message(`编辑 ${row.username} 用户的角色失败`, {
              type: "error"
            });
          });
        done(); // 关闭弹框
      }
    });
  }

  onMounted(async () => {
    treeLoading.value = true;
    onSearch();

    // 归属部门
    const { data } = await getDeptList({
      limit: 100
    });
    higherDeptOptions.value = handleTree(data.list);
    treeData.value = handleTree(data.list);
    treeLoading.value = false;

    // 角色列表
    roleOptions.value = (await getAllRoleList()).data.list;
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
