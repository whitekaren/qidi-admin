<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import tree from "./components/tree.vue";
import { useMessage } from "./components/hook";
const { treeData, treeLoading, onReFresh } = useMessage();
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import "plus-pro-components/es/components/form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusForm
} from "plus-pro-components";
defineOptions({
  name: "Editor"
});
import { editMessage, deleteMessage } from "@/api/message";
import { message } from "@/utils/message";
const value = ref(""); // 必须为number类型
const isReadOnly = ref(true);
const isSelect = ref({ id: "", isSelect: false });
const options = ref([]);
const js_content = ref({});
const js_title = ref({});
const js_abstract = ref({});
const treeRef = ref();
const lang_arr = ref([]);
const mode = "default";
// 编辑器实例，必须用 shallowRef
const contentEditorRef = shallowRef();
const abstractEditorRef = shallowRef();
const titleEditorRef = shallowRef();

// 内容 HTML
const contentValueHtml = ref("");
const titleValueHtml = ref("");
const abstractValueHtml = ref("");
const initialState = ref<FieldValues>({
  language: [],
  name: "",
  region: [],
  type: "",
  platform: [],
  is_publish: false,
  endTime: []
});

const state = ref<FieldValues>({
  language: [],
  name: "",
  region: [],
  type: "",
  platform: [],
  is_publish: false,
  endTime: []
});

const state_reset = {
  language: [],
  name: "",
  region: [],
  type: "",
  platform: [],
  is_publish: false,
  endTime: [],
  contentValueHtml: "",
  titleValueHtml: "",
  abstractValueHtml: "",
  value: "",
  lang_arr: [],
  options: [],
  js_content: {},
  js_title: {},
  js_abstract: {}
} as FieldValues;

const typeList = ref({
  system_message: "100",
  common_message: "200",
  device_message: "300",
  article_message: "400"
});

const langList = ref({
  zh: "中文",
  en: "英文",
  ar: "阿拉伯语",
  tr: "土耳其语",
  pt: "葡萄牙语",
  it: "意大利语",
  he: "希伯来语",
  fr: "法语",
  es: "西班牙语",
  de: "德语",
  ru: "俄语",
  ko: "韩语",
  ja: "日语"
});

// 模拟 ajax 异步获取内容
onMounted(() => {
  // setTimeout(() => {
  //   contentValueHtml.value = "<p>我是模拟的异步数据</p>";
  //   titleValueHtml.value = "<p>测试标题</p>";
  //   abstractValueHtml.value = "<p>测试概要 </p>";
  // }, 1500);
});

const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorContentConfig = {
  placeholder: "请输入内容...",
  scroll: false,
  readOnly: isReadOnly.value,
  MENU_CONF: {}
};

editorContentConfig.MENU_CONF["uploadImage"] = {
  // 服务端上传地址，根据实际业务改写
  server: "/qidi/common/upload",
  // form-data 的 fieldName，根据实际业务改写
  fieldName: "file",
  // 选择文件时的类型限制，根据实际业务改写
  allowedFileTypes: ["image/png", "image/jpg", "image/jpeg"],
  // 自定义插入图片
  customInsert(res: any, insertFn) {
    // res.data.url是后端返回的图片地址，根据实际业务改写
    if (res.data.url) {
      setTimeout(() => {
        // insertFn插入图片进编辑器
        insertFn(res.data.url);
      }, 2000);
    }
  }
};

const editorTitleConfig = {
  placeholder: "请输入标题...",
  scroll: false,
  readOnly: isReadOnly.value
};

const editorAbstractConfig = {
  placeholder: "请输入标题...",
  scroll: false,
  readOnly: isReadOnly.value
};

const handleContentCreated = editor => {
  // 记录 editor 实例，重要！
  contentEditorRef.value = editor;
};

const handleContentBlur = editor => {
  console.log("Content blur", value.value, contentValueHtml.value);
  js_content.value[value.value] = contentValueHtml.value;
};

const handleAbstractCreated = editor => {
  // 记录 editor 实例，重要！
  abstractEditorRef.value = editor;
};

const handleAbstractBlur = editor => {
  console.log("Abstract blur", value.value, abstractValueHtml.value);
  js_abstract.value[value.value] = abstractValueHtml.value;
};

const handleTitleCreated = editor => {
  // 记录 editor 实例，重要！
  titleEditorRef.value = editor;
};

const handleTitleBlur = editor => {
  console.log("Title blur", value.value, titleValueHtml.value);
  js_title.value[value.value] = titleValueHtml.value;
};

const handleCreate = readOnly => {
  isReadOnly.value = false;
  js_content.value = state_reset.js_content = {};
  js_abstract.value = state_reset.js_abstract = {};
  js_title.value = state_reset.js_title = {};
  lang_arr.value = state_reset.lang_arr = [];
  contentValueHtml.value = state_reset.contentValueHtml = "";
  titleValueHtml.value = state_reset.titleValueHtml = "";
  abstractValueHtml.value = state_reset.abstractValueHtml = "";
  value.value = state_reset.value = "";
  state.value.name = state_reset.name = "";
  state.value.language = state_reset.language = [];
  state.value.region = state_reset.region = [];
  state.value.type = state_reset.type = "";
  state.value.is_publish = state_reset.is_publish = false;
  state.value.platform = state_reset.platform = [];
  const currentDate = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(currentDate.getFullYear() + 1);
  state.value.endTime = state_reset.endTime = [currentDate, oneYearLater];
};

const handleEdit = readOnly => {
  isReadOnly.value = false;
  contentEditorRef.value.enable();
  abstractEditorRef.value.enable();
  titleEditorRef.value.enable();
};

const handleDelete = readOnly => {
  deleteMessage({
    id: isSelect.value.id
  })
    .then(data => {
      if (data.status == 0 && data.message === "删除成功") {
        message(`您删除消息成功`, {
          type: "success"
        });
        isReadOnly.value = true;
        js_content.value = state_reset.js_content = {};
        js_abstract.value = state_reset.js_abstract = {};
        js_title.value = state_reset.js_title = {};
        lang_arr.value = state_reset.lang_arr = [];
        contentValueHtml.value = state_reset.contentValueHtml = "";
        titleValueHtml.value = state_reset.titleValueHtml = "";
        abstractValueHtml.value = state_reset.abstractValueHtml = "";
        value.value = state_reset.value = "";
        state.value.name = state_reset.name = "";
        state.value.language = state_reset.language = [];
        state.value.region = state_reset.region = [];
        state.value.type = state_reset.type = "";
        state.value.is_publish = state_reset.is_publish = false;
        state.value.platform = state_reset.platform = [];
        state.value.endTime = state_reset.endTime = [];
        isSelect.value.isSelect = false;
        isSelect.value.id = "";
        onReFresh();
        contentEditorRef.value.disable();
        abstractEditorRef.value.disable();
        titleEditorRef.value.disable();
      } else {
        message(`您删除消息失败 ${data.message}`, {
          type: "error"
        });
      }
    })
    .catch(error => {
      console.log(error);
      message(`您删除消息失败 ${error}`, {
        type: "error"
      });
    });
};
function checkKeyAndValue(
  obj: Record<string, string>,
  key: string,
  messageValue: string
) {
  if (!obj.hasOwnProperty(key)) {
    console.error(`Key "${key}" is missing in the JSON object`);
    message(`"${langList.value[key]}" 未设置`, {
      type: "error"
    });
    return true;
  } else if (obj[key] === messageValue || obj[key] === "") {
    console.error(`Value for key "${key}" cannot be an empty string`);
    message(`"${langList.value[key]}" 内容不能为空`, {
      type: "error"
    });
    return true;
  }
  return false;
}

function checkStateChanges() {
  let is_valid = false;

  Object.keys(state.value).forEach(key => {
    if (
      (Array.isArray(state.value[key]) &&
        Array.isArray(initialState.value[key])) ||
      (typeof state.value[key] === "object" &&
        typeof initialState.value[key] === "object")
    ) {
      if (
        JSON.stringify(state.value[key]) ===
        JSON.stringify(initialState.value[key])
      ) {
        console.error(`${key} has not been correctly modified`);
        message(`${key} 不能为空`, {
          type: "error"
        });
        is_valid = true;
      }
    } else {
      if (state.value[key] === initialState.value[key]) {
        console.error(`${key} has not been correctly modified`);
        message(`${key} 不能为空`, {
          type: "error"
        });
        is_valid = true;
      }
    }
  });

  lang_arr.value.forEach(key => {
    if (is_valid) return is_valid;
    is_valid = checkKeyAndValue(js_title.value, key, "<p><br></p>");
    if (is_valid) return is_valid;
    is_valid = checkKeyAndValue(js_abstract.value, key, "<p><br></p>");
    if (is_valid) return is_valid;
    is_valid = checkKeyAndValue(js_content.value, key, "<p><br></p>");
  });

  return is_valid;
}
const handleSave = readOnly => {
  js_title.value[value.value] = titleValueHtml.value;
  js_abstract.value[value.value] = abstractValueHtml.value;
  js_content.value[value.value] = contentValueHtml.value;
  if (checkStateChanges()) {
    return;
  }
  contentEditorRef.value.disable();
  abstractEditorRef.value.disable();
  titleEditorRef.value.disable();
  isReadOnly.value = true;
  contentEditorRef.value.disable();
  abstractEditorRef.value.disable();
  titleEditorRef.value.disable();
  const language = state.value.language as Array<string>;
  const region = state.value.region as Array<string>;
  const platform = state.value.platform as Array<string>;
  const start_date = Date.parse(state.value.endTime[0].toString());
  const expiry_date = Date.parse(state.value.endTime[1].toString());
  if (isSelect.value.isSelect) {
    editMessage({
      id: isSelect.value.id,
      name: state.value.name,
      parent_id: typeList.value[state.value.type.toString()],
      type: state.value.type,
      title: JSON.stringify(js_title.value),
      abstract: JSON.stringify(js_abstract.value),
      content: JSON.stringify(js_content.value),
      lang: language.join(","),
      region: region.join(","),
      platform: platform.join(","),
      is_publish: state.value.is_publish ? "1" : "0",
      start_date,
      expiry_date
    })
      .then(data => {
        if (data.status == 0) {
          message(`您编辑消息成功`, {
            type: "success"
          });
          onReFresh();
          contentEditorRef.value.disable();
          abstractEditorRef.value.disable();
          titleEditorRef.value.disable();
        } else {
          message(`您编辑消息失败 ${data.message}`, {
            type: "error"
          });
        }
      })
      .catch(error => {
        console.log(error);
        message(`您编辑消息失败 ${error}`, {
          type: "error"
        });
      });
  } else {
    editMessage({
      name: state.value.name,
      parent_id: typeList.value[state.value.type.toString()],
      type: state.value.type,
      title: JSON.stringify(js_title.value),
      abstract: JSON.stringify(js_abstract.value),
      content: JSON.stringify(js_content.value),
      lang: language.join(","),
      region: region.join(","),
      platform: platform.join(","),
      is_publish: state.value.is_publish ? "1" : "0",
      start_date,
      expiry_date
    })
      .then(data => {
        if (data.status == 0) {
          message(`您新增消息成功`, {
            type: "success"
          });
          onReFresh();
          contentEditorRef.value.disable();
          abstractEditorRef.value.disable();
          titleEditorRef.value.disable();
        } else {
          message(`您新增消息失败 ${data.message}`, {
            type: "error"
          });
        }
      })
      .catch(error => {
        console.log(error);
        message(`您新增消息失败 ${error}`, {
          type: "error"
        });
      });
  }
  window.location.reload();
};

const handleCancel = readOnly => {
  isReadOnly.value = true;
  js_content.value = state_reset.js_content;
  js_abstract.value = state_reset.js_abstract;
  js_title.value = state_reset.js_title;
  lang_arr.value = state_reset.lang_arr as any[];
  contentValueHtml.value = state_reset.contentValueHtml as string;
  titleValueHtml.value = state_reset.titleValueHtml as string;
  abstractValueHtml.value = state_reset.abstractValueHtml as string;
  value.value = state_reset.value as string;
  state.value.name = state_reset.name;
  state.value.language = state_reset.language;
  state.value.region = state_reset.region;
  state.value.type = state_reset.type;
  state.value.is_publish = state_reset.is_publish;
  state.value.platform = state_reset.platform;
  state.value.endTime = state_reset.endTime;
  contentEditorRef.value.disable();
  abstractEditorRef.value.disable();
  titleEditorRef.value.disable();
};

function onTreeSelect({
  id,
  name,
  title,
  abstract,
  content,
  type,
  lang,
  region,
  platform,
  selected,
  is_publish,
  start_date,
  expiry_date,
  created_at
}) {
  isSelect.value.id = id;
  isSelect.value.isSelect = selected;
  if (selected) {
    js_content.value = state_reset.js_content = content;
    js_abstract.value = state_reset.js_abstract = abstract;
    js_title.value = state_reset.js_title = title;
    lang_arr.value = state_reset.lang_arr = lang.split(",");
    contentValueHtml.value = state_reset.contentValueHtml =
      type !== "branch" ? js_content.value[lang_arr.value[0]] : "";
    titleValueHtml.value = state_reset.titleValueHtml =
      type !== "branch" ? js_title.value[lang_arr.value[0]] : "";
    abstractValueHtml.value = state_reset.abstractValueHtml =
      type !== "branch" ? js_abstract.value[lang_arr.value[0]] : "";
    state.value.name = state_reset.name = name;
    state.value.language = state_reset.language =
      lang === "all"
        ? [
            "zh",
            "en",
            "ar",
            "tr",
            "pt",
            "it",
            "he",
            "fr",
            "es",
            "de",
            "ru",
            "ko",
            "ja"
          ]
        : lang_arr.value;
    state.value.region = state_reset.region =
      region === "all"
        ? ["china", "asiaPacific", "europe", "northAmerica", "other"]
        : region.split(",");
    state.value.type = state_reset.type = type;
    state.value.platform = state_reset.platform =
      platform === "all"
        ? ["iOS", "Android", "software", "test"]
        : platform.split(",");
    state.value.endTime = state_reset.endTime =
      start_date === null
        ? [created_at, expiry_date]
        : [start_date, expiry_date];
    state.value.is_publish = state_reset.is_publish =
      is_publish === "1" ? true : false;
    value.value = lang_arr.value[0];
  } else {
    isReadOnly.value = true;
    js_content.value = state_reset.js_content = {};
    js_abstract.value = state_reset.js_abstract = {};
    js_title.value = state_reset.js_title = {};
    lang_arr.value = state_reset.lang_arr = [];
    contentValueHtml.value = state_reset.contentValueHtml = "";
    titleValueHtml.value = state_reset.titleValueHtml = "";
    abstractValueHtml.value = state_reset.abstractValueHtml = "";
    value.value = state_reset.value = "";
    state.value.name = state_reset.name = "";
    state.value.language = state_reset.language = [];
    state.value.region = state_reset.region = [];
    state.value.type = state_reset.type = "";
    state.value.is_publish = state_reset.is_publish = false;
    state.value.platform = state_reset.platform = [];
    state.value.endTime = state_reset.endTime = [];
  }
}

function change_type(language) {
  const lang_arr = language as Array<string>;
  const lang = lang_arr.map(lang => {
    let label = "";
    switch (lang) {
      case "zh":
        label = "中文";
        break;
      case "en":
        label = "英文";
        break;
      case "ar":
        label = "阿拉伯语";
        break;
      case "tr":
        label = "土耳其语";
        break;
      case "pt":
        label = "葡萄牙语";
        break;
      case "it":
        label = "意大利语";
        break;
      case "he":
        label = "希伯来语";
        break;
      case "fr":
        label = "法语";
        break;
      case "es":
        label = "西班牙语";
        break;
      case "de":
        label = "德语";
        break;
      case "ru":
        label = "俄语";
        break;
      case "ko":
        label = "韩语";
        break;
      case "ja":
        label = "日语";
        break;
      default:
        label = "Unknown";
    }
    return { value: lang, label };
  });
  return lang;
}

const rules = {
  // name: [
  //   {
  //     required: true,
  //     message: "请输入名称"
  //   }
  // ],
  // language: [
  //   {
  //     required: true,
  //     message: "请选择语言"
  //   }
  // ],
  // region: [
  //   {
  //     required: true,
  //     message: "请选择地区"
  //   }
  // ],
  // type: [
  //   {
  //     required: true,
  //     message: "请选择类型"
  //   }
  // ],
  // platform: [
  //   {
  //     required: true,
  //     message: "请选择平台"
  //   }
  // ],
  // endTime: [
  //   {
  //     required: true,
  //     message: "请选择时间"
  //   }
  // ]
};

const columns: PlusColumn[] = [
  {
    label: "名称",
    width: 120,
    prop: "name",
    valueType: "copy",
    tooltip: "消息名称"
  },
  {
    label: "语言",
    width: 120,
    prop: "language",
    valueType: "select",
    fieldProps: {
      multiple: true
    },
    options: [
      {
        label: "中文",
        value: "zh",
        color: "blue"
      },
      {
        label: "英文",
        value: "en",
        color: "blue"
      },
      {
        label: "阿拉伯语",
        value: "ar",
        color: "blue"
      },
      {
        label: "土耳其语",
        value: "tr",
        color: "blue"
      },
      {
        label: "葡萄牙语",
        value: "pt",
        color: "blue"
      },
      {
        label: "意大利语",
        value: "it",
        color: "blue"
      },
      {
        label: "希伯来语",
        value: "he",
        color: "blue"
      },
      {
        label: "法语",
        value: "fr",
        color: "blue"
      },
      {
        label: "西班牙语",
        value: "es",
        color: "blue"
      },
      {
        label: "德语",
        value: "de",
        color: "blue"
      },
      {
        label: "俄语",
        value: "ru",
        color: "blue"
      },
      {
        label: "韩语",
        value: "ko",
        color: "blue"
      },
      {
        label: "日语",
        value: "ja",
        color: "blue"
      }
    ]
  },
  {
    label: "地区",
    width: 120,
    prop: "region",
    valueType: "select",
    fieldProps: {
      multiple: true
    },
    options: [
      {
        label: "中国",
        value: "china",
        color: "blue"
      },
      {
        label: "亚太",
        value: "asiaPacific",
        color: "blue"
      },
      {
        label: "欧洲",
        value: "europe",
        color: "blue"
      },
      {
        label: "北美",
        value: "northAmerica",
        color: "blue"
      },
      {
        label: "其他",
        value: "other",
        color: "blue"
      }
    ]
  },
  {
    label: "消息类型",
    width: 120,
    prop: "type",
    valueType: "select",
    options: [
      {
        label: "系统消息",
        value: "system_message",
        color: "blue"
      },
      {
        label: "消息",
        value: "common_message",
        color: "blue"
      },
      {
        label: "设备消息",
        value: "device_message",
        color: "blue"
      },
      {
        label: "协议文章",
        value: "article_message",
        color: "blue"
      }
    ]
  },
  {
    label: "平台",
    width: 120,
    prop: "platform",
    valueType: "select",
    fieldProps: {
      multiple: true
    },
    options: [
      {
        label: "Ios",
        value: "iOS",
        color: "blue"
      },
      {
        label: "Android",
        value: "Android",
        color: "blue"
      },
      {
        label: "Software",
        value: "software",
        color: "blue"
      },
      {
        label: "Test",
        value: "test",
        color: "blue"
      }
    ]
  },
  {
    label: "是否发布",
    width: 100,
    prop: "is_publish",
    valueType: "switch"
  },
  {
    label: "到期时间",
    prop: "endTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "请选择开始时间",
      endPlaceholder: "请选择结束时间"
    }
  },
  {
    label: "说明",
    prop: "desc",
    valueType: "textarea",
    fieldProps: {
      maxlength: 10,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  }
];

/** change 事件 */
function onChange() {
  console.log(value.value);
  if (isSelect.value.isSelect && lang_arr.value.includes(value.value)) {
    // const index = lang_arr.indexOf(value.value);
    contentValueHtml.value = js_content.value[value.value];
    titleValueHtml.value = js_title.value[value.value];
    abstractValueHtml.value = js_abstract.value[value.value];
  } else {
    contentValueHtml.value = "";
    titleValueHtml.value = "";
    abstractValueHtml.value = "";
  }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = contentEditorRef.value;
  if (editor == null) return;
  editor.destroy();
});

watch(
  () => state.value.language,
  index => {
    console.log(index);
    options.value = change_type(index);
    const lang_arr = index as Array<string>;
    if (lang_arr.length > 0 && state.value.type !== "branch") {
      value.value = lang_arr[0];
      contentValueHtml.value = js_content.value[value.value];
      titleValueHtml.value = js_title.value[value.value];
      abstractValueHtml.value = js_abstract.value[value.value];
    } else {
      value.value = "";
      contentValueHtml.value = "";
      titleValueHtml.value = "";
      abstractValueHtml.value = "";
    }
    if (!isReadOnly.value && contentEditorRef.value && lang_arr.length > 0) {
      contentEditorRef.value.enable();
      abstractEditorRef.value.enable();
      titleEditorRef.value.enable();
    } else if (contentEditorRef.value) {
      contentEditorRef.value.disable();
      abstractEditorRef.value.disable();
      titleEditorRef.value.disable();
    }
    let js_abstract_tem = ref({});
    let js_content_tem = ref({});
    let js_title_tem = ref({});
    lang_arr.map(lang => {
      js_abstract_tem.value[lang] =
        state.value.type !== "branch"
          ? lang in js_abstract.value
            ? js_abstract.value[lang]
            : ""
          : "";
      js_content_tem.value[lang] =
        state.value.type !== "branch"
          ? lang in js_content.value
            ? js_content.value[lang]
            : ""
          : "";
      js_title_tem.value[lang] =
        state.value.type !== "branch"
          ? lang in js_title.value
            ? js_title.value[lang]
            : ""
          : "";
    });
    js_abstract.value = js_abstract_tem.value;
    js_content.value = js_content_tem.value;
    js_title.value = js_title_tem.value;
  },
  {
    immediate: true
  }
);
</script>

<template>
  <el-card shadow="never">
    <div class="wangeditor">
      <el-col>
        <Toolbar
          :editor="contentEditorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
          style="border-bottom: 1px solid #ccc; border-top: 1px solid #ccc"
        />
        <el-row>
          <el-card style="margin-top: 32px">
            <tree
              ref="treeRef"
              :class="['mr-2', 'w-full']"
              :treeData="treeData"
              :treeLoading="treeLoading"
              @tree-select="onTreeSelect"
            />
          </el-card>
          <el-card style="margin-top: 32px; margin-left: 10px">
            <div class="wangeditor">
              <el-col>
                <el-row style="display: flex; justify-content: space-between">
                  <el-select
                    v-model="value"
                    style="width: 100px"
                    @change="onChange"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-space wrap>
                    <el-button
                      v-if="isReadOnly"
                      type="primary"
                      plain
                      :disabled="!isSelect.isSelect || state.type === 'branch'"
                      :icon="useRenderIcon('ep:edit')"
                      @click="handleEdit"
                    >
                      <template #default>
                        <p>{{ "编辑" }}</p>
                      </template>
                    </el-button>
                    <el-button
                      v-if="isReadOnly"
                      type="primary"
                      plain
                      :icon="useRenderIcon('ri:add-large-fill')"
                      @click="handleCreate"
                    >
                      <template #default>
                        <p>{{ "新增" }}</p>
                      </template>
                    </el-button>
                    <el-button
                      v-if="isReadOnly"
                      type="danger"
                      plain
                      :disabled="!isSelect.isSelect || state.type === 'branch'"
                      :icon="useRenderIcon('ep:delete')"
                      @click="handleDelete"
                    >
                      <template #default>
                        <p>{{ "删除" }}</p>
                      </template>
                    </el-button>
                    <el-button
                      v-if="!isReadOnly"
                      type="primary"
                      plain
                      :icon="useRenderIcon('ep:check')"
                      @click="handleSave"
                    >
                      <template #default>
                        <p>{{ "保存" }}</p>
                      </template>
                    </el-button>
                    <el-button
                      v-if="!isReadOnly"
                      type="primary"
                      plain
                      :icon="useRenderIcon('ep:check')"
                      @click="handleCancel"
                    >
                      <template #default>
                        <p>{{ "取消" }}</p>
                      </template>
                    </el-button>
                  </el-space>
                </el-row>
                <hr style="border-top: 1px solid #ccc; margin-top: 10px" />
                <Editor
                  v-model="titleValueHtml"
                  :defaultConfig="editorTitleConfig"
                  :mode="mode"
                  style="min-height: 50px; overflow-y: hidden; width: 800px"
                  @onCreated="handleTitleCreated"
                  @onBlur="handleTitleBlur"
                />
                <hr style="border-top: 1px solid #ccc" />
                <Editor
                  v-model="abstractValueHtml"
                  :defaultConfig="editorAbstractConfig"
                  :mode="mode"
                  style="min-height: 250px; overflow-y: hidden; width: 800px"
                  @onCreated="handleAbstractCreated"
                  @onBlur="handleAbstractBlur"
                />
                <hr style="border-top: 1px solid #ccc" />
                <Editor
                  v-model="contentValueHtml"
                  :defaultConfig="editorContentConfig"
                  :mode="mode"
                  style="min-height: 500px; overflow-y: hidden; width: 800px"
                  @onCreated="handleContentCreated"
                  @onBlur="handleContentBlur"
                />
              </el-col>
            </div>
          </el-card>
          <el-card style="margin-top: 32px; margin-left: 10px">
            <PlusForm
              v-model="state"
              class="w-[450px] m-auto"
              :columns="columns"
              :rules="rules"
              :disabled="isReadOnly"
              :validate-on-rule-change="true"
              label-position="right"
            >
              <template #footer="{}">
                <div style="margin: 0 auto" />
              </template>
            </PlusForm>
          </el-card>
        </el-row>
      </el-col>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-collapse-item__header) {
  padding-left: 10px;
}
</style>
