export { default as dayjs } from "dayjs";
export { useDark, cloneDeep, randomGradient } from "@pureadmin/utils";
import { getBoard, type BoardResult } from "@/api/board";
import { ref, reactive } from "vue";
import GroupLine from "@iconify-icons/ri/group-line";
import Question from "@iconify-icons/ri/question-answer-line";
import CheckLine from "@iconify-icons/ri/chat-check-line";
import Smile from "@iconify-icons/ri/star-smile-line";

export function getRandomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getData() {
  const dataList = ref([]);
  const userLoginList = ref([]);
  const userRegisterList = ref([]);

  const receivedata = reactive<BoardResult>({
    status: 0,
    data: {
      user_count: 0,
      add_user_count: 0,
      device_count: 0,
      add_device_count: 0,
      alive_user_count: 0,
      alive_device_count: 0,
      online_device_count: 0,
      user_list: [],
      device_list: []
    }
  });

  const qidiData = [
    {
      icon: GroupLine,
      bgColor: "#effaff",
      color: "#41b6ff",
      duration: 2200,
      name: "需求人数",
      value: 380000,
      percent: "+88%",
      data: [2101, 5288, 4239, 4962, 6752, 5208, 7450] // 平滑折线图数据
    },
    {
      icon: Question,
      bgColor: "#fff5f4",
      color: "#e85f33",
      duration: 1600,
      name: "提问数量",
      value: 16580,
      percent: "+70%",
      data: [2216, 1148, 1255, 788, 4821, 1973, 4379]
    },
    {
      icon: CheckLine,
      bgColor: "#eff8f4",
      color: "#26ce83",
      duration: 1500,
      name: "解决数量",
      value: 16499,
      percent: "+99%",
      data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
    },
    {
      icon: Smile,
      bgColor: "#f6f4fe",
      color: "#7846e5",
      duration: 100,
      name: "用户满意度",
      value: 100,
      percent: "+100%",
      data: [100]
    }
  ];
  dataList.value = [];
  getBoard()
    .then(data => {
      console.log(data.data.user_count);
      receivedata.status = data.status;
      receivedata.data = data.data;
      const transformedData = [
        {
          icon: GroupLine,
          bgColor: "#effaff",
          color: "#41b6ff",
          duration: 2200,
          name: "用户人数",
          value: data.data.user_count,
          percent: "+" + data.data.add_user_count.toString(),
          data: data.data.user_list.slice(23, 30).map(item => item.total_count)
        },
        {
          icon: Smile,
          bgColor: "#f6f4fe",
          color: "#7846e5",
          duration: 50,
          name: "活跃用户数",
          value: data.data.alive_user_count,
          percent: "",
          data: [
            parseInt((data.data.alive_user_count / data.data.user_count) * 100)
          ]
        },
        {
          icon: Question,
          bgColor: "#fff5f4",
          color: "#e85f33",
          duration: 1600,
          name: "设备数量",
          value: data.data.device_count,
          percent: "+" + data.data.add_device_count.toString(),
          data: data.data.device_list
            .slice(23, 30)
            .map(item => item.total_count)
        },
        {
          icon: CheckLine,
          bgColor: "#f6f4fe",
          color: "#26ce83",
          duration: 2200,
          name: "活跃设备数",
          value: data.data.alive_device_count,
          percent: "",
          data: [
            parseInt(
              (data.data.alive_device_count / data.data.device_count) * 100
            )
          ]
        },
        {
          icon: Question,
          bgColor: "#fff5f4",
          color: "#e85f33",
          duration: 1600,
          name: "在线设备数",
          value: data.data.online_device_count,
          percent: "",
          data: [
            parseInt(
              (data.data.online_device_count / data.data.device_count) * 100
            )
          ]
        },
        {
          icon: CheckLine,
          bgColor: "#eff8f4",
          color: "#26ce83",
          duration: 1500,
          name: "解决数量",
          value: 16499,
          percent: "+99%",
          data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
        },
        {
          icon: CheckLine,
          bgColor: "#eff8f4",
          color: "#26ce83",
          duration: 1500,
          name: "解决数量",
          value: 16499,
          percent: "+99%",
          data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
        },
        {
          icon: Smile,
          bgColor: "#f6f4fe",
          color: "#7846e5",
          duration: 100,
          name: "用户满意度",
          value: 100,
          percent: "+100%",
          data: [100]
        }
      ];
      transformedData.flat(Infinity).forEach(item => {
        dataList.value.push(item);
      });
      userLoginList.value = data.data.user_list;
      userRegisterList.value = data.data.device_list;
      // dataList.value.push(item);
      // dataList.value.push(item);
    })
    .catch(error => {
      console.log(error);
    });
  return { qidiData, receivedata, dataList, userLoginList, userRegisterList };
}
