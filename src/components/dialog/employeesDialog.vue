<template>
   <!-- 选择成员/部门的弹窗 -->
   <el-dialog title="选择成员" v-model="visibleDialog" :width="600" append-to-body class="promoter_person">
      <div class="person_body clear">
          <div class="person_tree l">
              <!-- 搜索框：支持防抖搜索 -->
              <input type="text" placeholder="搜索成员" v-model="searchVal" @input="getDebounceData($event)">
              <!-- 部门面包屑导航 -->
              <p class="ellipsis tree_nav" v-if="!searchVal">
                  <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                  <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                  :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
              </p>
              <!-- 左侧待选项组件 -->
              <selectBox :list="list"/>
          </div>
          <!-- 右侧已选项展示组件 -->
          <selectResult :total="total" @del="delList" :list="resList"/>
      </div>
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
          <el-button @click="$emit('update:visible',false)">取 消</el-button>
          <el-button type="primary" @click="saveDialog">确 定</el-button>
      </template>     
  </el-dialog>
</template>

<script setup>
import selectBox from '../selectBox.vue';
import selectResult from '../selectResult.vue';
import { computed, watch, ref } from 'vue';
import { departments, getDebounceData, getDepartmentList, searchVal } from './common'
import $func from '@/utils/index.js'

// employeesDialog.vue - 选择成员/部门的弹窗组件
let props = defineProps({
  visible: { // 控制弹窗显示隐藏
    type: Boolean,
    default: false
  },
  data:{ // 外部传入的已选数据（用于回显）
    type: Array,
    default: ()=> []
  },
  isDepartment: { // 是否允许选择部门（如果为 false，则只能选择具体的人员，部门只能点击"下级"展开）
    type: Boolean,
    default: false
  },
});
let emits = defineEmits(['update:visible', 'change'])

// 计算属性，用于双向绑定弹窗的显示状态
let visibleDialog = computed({
  get(){
    return props.visible
  },
  set(){
    closeDialog()
  }
});

let checkedDepartmentList = ref([]) // 当前选中的部门列表
let checkedEmployessList = ref([]) // 当前选中的员工列表

// 构造传递给左侧选择列表组件 (selectBox) 的数据格式
let list = computed(()=> {
  return [{
    isDepartment: props.isDepartment,
    type: 'department', 
    data: departments.value.childDepartments, 
    isActive: (item)=> $func.toggleClass(checkedDepartmentList.value, item),
    change: (item)=> $func.toChecked(checkedDepartmentList.value, item),
    next: (item)=> getDepartmentList(item.id) // 点击下级，获取子部门数据
  },{
    type: 'employee', 
    data: departments.value.employees, 
    isActive: (item)=> $func.toggleClass(checkedEmployessList.value, item),
    change: (item)=> $func.toChecked(checkedEmployessList.value, item),
  }]
})

// 构造传递给右侧已选结果组件 (selectResult) 的数据格式
let resList = computed(()=>{
  let data = [{
    type: 'employee', 
    data: checkedEmployessList.value, 
    cancel: (item)=> $func.removeEle(checkedEmployessList.value, item) // 取消选择的逻辑
  }]
  if(props.isDepartment){
    data.unshift({
      type: 'department',
      data: checkedDepartmentList.value,
      cancel: (item)=> $func.removeEle(checkedDepartmentList.value, item)
    })
  }
  return data
})

// 监听弹窗打开，初始化数据回显
watch(()=> props.visible, (val)=>{
  if(val){
    getDepartmentList(); // 获取根部门数据
    searchVal.value = "";
    // 将传入的外部数据映射到组件内部的状态（区分人员 type=1 和部门 type=3）
    checkedEmployessList.value = props.data.filter(item=>item.type===1).map(({name,targetId})=>({
      employeeName: name,
      id: targetId
    }));
    checkedDepartmentList.value = props.data.filter(item=>item.type===3).map(({name,targetId})=>({
      departmentName: name,
      id: targetId
    }));
  }
})

const closeDialog = ()=> {
  emits('update:visible', false)
}

let total = computed(()=> checkedDepartmentList.value.length + checkedEmployessList.value.length)

let saveDialog = ()=> {
  let checkedList = [
    ...checkedDepartmentList.value,
    ...checkedEmployessList.value
  ].map(item=>({
    type: item.employeeName ? 1: 3,
    targetId: item.id,
    name: item.employeeName || item.departmentName
  }))
  emits('change',checkedList)
}
const delList = ()=> {
  checkedDepartmentList.value = [];
  checkedEmployessList.value = []
}
</script>
<style>
@import "@/css/dialog.css";
</style>