import { getRoles, getDepartments, getEmployees } from '@/api/index.js'
import $func from '@/utils/index.js'
import { ref } from 'vue'

// 选人/选角色弹窗通用的搜索关键字状态
export let searchVal = ref('')

// 部门和员工数据的通用状态
export let departments = ref({
  titleDepartments: [], // 面包屑导航用的部门层级（如：天下 > 技术部 > 前端组）
  childDepartments: [], // 当前部门下的子部门列表
  employees: [], // 当前部门下的直属员工列表
})

// 角色数据的通用状态
export let roles = ref({})

// 通用方法：获取角色列表数据
export let getRoleList = async () => {
  let { data: { list } } = await getRoles()
  roles.value = list;
}

// 通用方法：获取部门数据（传入父级ID，获取其子部门和人员）
export let getDepartmentList = async (parentId = 0) => {
  let { data } = await getDepartments({ parentId })
  departments.value = data;
}

// 通用方法：输入框搜索时的防抖函数（避免用户每打一个字就发一次请求）
export let getDebounceData = (event, type = 1) => {
  // $func.debounce 是自定义的防抖工具函数
  $func.debounce(async () => {
    if (event.target.value) { // 如果输入框有值
      let data = {
        searchName: event.target.value,
        pageNum: 1,
        pageSize: 30
      }
      if (type == 1) { // type=1 代表搜索员工
        departments.value.childDepartments = []; // 搜索状态下不显示部门，只显示搜索出的人员
        let res = await getEmployees(data)
        departments.value.employees = res.data.list
      } else { // type=2 代表搜索角色
        let res = await getRoles(data)
        roles.value = res.data.list
      }
    } else { // 如果输入框被清空，则恢复显示默认的树状列表
      type == 1 ? await getDepartmentList() : await getRoleList();
    }
  })()
}