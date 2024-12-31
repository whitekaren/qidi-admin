import { ref, onMounted } from "vue";
import { getMessageList } from "@/api/message";
import { handleTree } from "@/utils/tree";

export function useMessage() {
  const treeData = ref([]);
  const treeLoading = ref(true);

  onMounted(async () => {
    treeLoading.value = true;

    // 归属部门
    const { data } = await getMessageList({
      limit: 100
    });
    treeData.value = handleTree(data.list);
    treeLoading.value = false;
  });

  function onReFresh() {
    treeLoading.value = true;
    setTimeout(async () => {
      const { data } = await getMessageList({
        limit: 100
      });
      treeData.value = handleTree(data.list);
      treeLoading.value = false;
    }, 500);
    // 归属部门
  }

  return { treeLoading, treeData, onReFresh };
}
