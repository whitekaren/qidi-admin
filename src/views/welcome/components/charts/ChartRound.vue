<script setup lang="ts">
import { type PropType, ref, computed } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const props = defineProps({
  data: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  color: {
    type: String,
    default: "#41b6ff"
  }
});

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme,
  renderer: "svg"
});

setOptions({
  container: ".line-card",
  title: {
    text: props.data[0].toString() + "%",
    left: "47%",
    top: "30%",
    textAlign: "center",
    textStyle: {
      fontSize: "16",
      fontWeight: 600
    }
  },
  polar: {
    radius: ["100%", "90%"],
    center: ["50%", "50%"]
  },
  angleAxis: {
    max: 100,
    show: false
  },
  radiusAxis: {
    type: "category",
    show: true,
    axisLabel: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    }
  },
  series: [
    {
      type: "bar",
      roundCap: true,
      barWidth: 2,
      showBackground: true,
      backgroundStyle: {
        color: "#dfe7ef"
      },
      data: props.data,
      coordinateSystem: "polar",
      color: props.color,
      itemStyle: {
        shadowBlur: 2,
        shadowColor: "props.color",
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    }
  ]
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 60px" />
</template>
