<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
const tableRef = ref();

const {
  loading,
  columns,
  dataList,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onSizeChange,
  onCurrentChange,
  showMouseMenu
} = useColumns();
</script>
<template>
  <el-card shadow="never">
    <pure-table
      ref="tableRef"
      border
      adaptive
      :adaptiveConfig="adaptiveConfig"
      row-key="id"
      alignWhole="center"
      showOverflowTooltip
      :loading="loading"
      :loading-config="loadingConfig"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      :data="
        dataList.slice(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize
        )
      "
      :columns="columns"
      :pagination="pagination"
      @row-contextmenu="showMouseMenu"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
    />
  </el-card>
</template>

<style scoped>
:deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

:deep(.el-tabs__header) {
  margin-top: 10px;
}

:deep(.el-input) {
  margin-top: 5px;
}
:deep(.el-button) {
  margin-top: 5px;
}
:deep(.el-alert__title) {
  font-size: 15px;
}
:deep(.el-tag) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  font-size: 16px;
  color: var(--el-text-color-primary);
}

:deep(.el-tabs__nav-next.is-disabled),
:deep(.el-tabs__nav-prev.is-disabled) {
  opacity: 0.5;
}
</style>
