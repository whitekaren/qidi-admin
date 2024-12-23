export { default as dayjs } from "dayjs";
export { useDark, cloneDeep, randomGradient } from "@pureadmin/utils";
import { getBoard } from "@/api/board";
import { ref, onMounted } from "vue";
import GroupLine from "@iconify-icons/ri/group-line";
import Question from "@iconify-icons/ri/question-answer-line";
import CheckLine from "@iconify-icons/ri/chat-check-line";
import Smile from "@iconify-icons/ri/star-smile-line";
import device from "@iconify-icons/ri/hearts-line";
import thumb from "@iconify-icons/ri/thumb-up-line";
import { delay, getKeyList } from "@pureadmin/utils";

export function getRandomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getData() {
  const userList = ref([]);
  const deviceList = ref([]);
  const userLoginList = ref([]);
  const userRegisterList = ref([]);
  userList.value = [
    {
      icon: GroupLine,
      bgColor: "#effaff",
      color: "#41b6ff",
      duration: 2200,
      name: "用户人数",
      value: 0,
      percent: "+0",
      data: [100]
    },
    {
      icon: Smile,
      bgColor: "#f6f4fe",
      color: "#7846e5",
      duration: 50,
      name: "活跃用户数",
      value: 0,
      percent: "",
      data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
    },
    {
      icon: device,
      bgColor: "#f6f4fe",
      color: "#7846e5",
      duration: 100,
      name: "Frp连接数",
      value: 0,
      percent: "",
      data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
    }
  ];
  deviceList.value = [
    {
      icon: Question,
      bgColor: "#fff5f4",
      color: "#e85f33",
      duration: 1600,
      name: "设备数量",
      value: 0,
      percent: "+0",
      data: [100]
    },
    {
      icon: CheckLine,
      bgColor: "#f6f4fe",
      color: "#26ce83",
      duration: 2200,
      name: "活跃设备数",
      value: 0,
      percent: "",
      data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
    },
    {
      icon: Question,
      bgColor: "#fff5f4",
      color: "#e85f33",
      duration: 1600,
      name: "在线设备数",
      value: 0,
      percent: "",
      data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
    },
    {
      icon: thumb,
      bgColor: "#eff8f4",
      color: "#26ce83",
      duration: 1500,
      name: "Frp出站流量",
      value: 0,
      percent: "",
      data: [100]
    }
  ];
  userLoginList.value = [];
  userRegisterList.value = [];
  onMounted(() => {
    delay(600).then(() => {
      getBoard()
        .then(data => {
          userList.value = [];
          deviceList.value = [];
          userLoginList.value = [];
          userRegisterList.value = [];
          const addDeviceCountlist = getKeyList(
            data.data.device_list,
            "total_count",
            false
          );
          const addUserCountlist = getKeyList(
            data.data.user_list,
            "total_count",
            false
          );
          const transformedData = [
            {
              icon: GroupLine,
              bgColor: "#effaff",
              color: "#41b6ff",
              duration: 2200,
              name: "用户人数",
              value: data.data.user_count,
              percent:
                "+" + addUserCountlist[addUserCountlist.length - 1].toString(),
              data: data.data.user_list
                .slice(23, 30)
                .map(item => item.total_count)
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
                parseInt(
                  (data.data.alive_user_count / data.data.user_count) * 100
                )
              ]
            },
            {
              icon: device,
              bgColor: "#f6f4fe",
              color: "#7846e5",
              duration: 100,
              name: "Frp连接数",
              value: data.data.frpcount,
              percent:
                data.data.frpcount - data.data.frpYesterdayCount > 0
                  ? "+" +
                    parseInt(
                      ((data.data.frpcount - data.data.frpYesterdayCount) /
                        data.data.frpYesterdayCount) *
                        100
                    ).toString() +
                    "%"
                  : "" +
                    parseInt(
                      ((data.data.frpcount - data.data.frpYesterdayCount) /
                        data.data.frpYesterdayCount) *
                        100
                    ).toString() +
                    "%",
              data: [
                parseInt((data.data.frpcount / data.data.device_count) * 100)
              ]
            }
          ];
          const transformedData2 = [
            {
              icon: Question,
              bgColor: "#fff5f4",
              color: "#e85f33",
              duration: 1600,
              name: "设备数量",
              value: data.data.device_count,
              percent:
                "+" +
                addDeviceCountlist[addDeviceCountlist.length - 1].toString(),

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
              icon: thumb,
              bgColor: "#eff8f4",
              color: "#26ce83",
              duration: 1500,
              name: "Frp出站流量",
              value: data.data.totalTrafficOut / 1073741824,
              percent:
                "▲ " +
                (data.data.totalTrafficIn / 1073741824).toFixed(2).toString(),
              data: [861, 1002, 3195, 1715, 3666, 2415, 3645]
            }
          ];
          transformedData.flat(Infinity).forEach(item => {
            userList.value.push(item);
          });
          transformedData2.flat(Infinity).forEach(item => {
            deviceList.value.push(item);
          });
          userLoginList.value = data.data.user_list;
          userRegisterList.value = data.data.device_list;
        })
        .catch(error => {
          console.log(error);
        });
    });
  });
  return {
    userList,
    deviceList,
    userLoginList,
    userRegisterList
  };
}
