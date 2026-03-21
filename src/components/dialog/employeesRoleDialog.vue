<template>
  <!-- 综合选择弹窗（支持同时选择部门、人员和角色） -->
  <el-dialog title="选择成员" v-model="visibleDialog" :width="600" append-to-body class="promoter_person">
      <div class="person_body clear">
          <div class="person_tree l">
              <!-- 搜索框，带防抖，第二个参数传入 activeName 决定搜索什么数据 -->
              <input type="text" placeholder="搜索成员" v-model="searchVal" @input="getDebounceData($event,activeName)">
              <!-- 顶部 Tabs 切换组织架构和角色列表 -->
              <el-tabs v-model="activeName" @tab-change="handleClick">
                  <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                  <el-tab-pane label="角色列表" name="2"></el-tab-pane>
              </el-tabs>
              <!-- 部门层级面包屑导航（仅在组织架构 tab 且没有搜索时显示） -->
              <p class="ellipsis tree_nav" v-if="activeName === '1' && !searchVal">
                  <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                  <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                  :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
              </p>
              <!-- 左侧待选项组件 -->
              <selectBox :list="list" style="height: 360px;"/>
          </div>
          <!-- 右侧已选项展示组件 -->
          <selectResult :total="total" @del="delList" :list="resList"/>
      </div>
      <template #footer>
          <el-button @click="$emit('update:visible',false)">取 消</el-button>
          <el-button type="primary" @click="saveDialog">确 定</el-button>
      </template>
  </el-dialog>
</template>

<script setup>
import selectBox from '../selectBox.vue';
import selectResult from '../selectResult.vue';
import { computed, watch, ref } from 'vue'
import $func from '@/utils/index.js'
import { departments, roles, getDebounceData, getRoleList, getDepartmentList, searchVal } from './common'

// 接收外部 props
let props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data:{
    type: Array,
    default: ()=> []
  },
  isDepartment: { // 是否允许选择部门
    type: Boolean,
    default: false
  },
});
let emits = defineEmits(['update:visible', 'change'])

// 双向绑定弹窗可见性
let visibleDialog = computed({
  get(){
    return props.visible
  },
  set(){
    closeDialog()
  }
})

// 分别维护三种类型的选中列表
let checkedRoleList = ref([])
let checkedEmployessList = ref([])
let checkedDepartmentList = ref([])

// 当前激活的 tab ('1': 组织架构, '2': 角色列表)
let activeName = ref('1')

// 根据当前 tab 动态生成传递给左侧 selectBox 的数据
let list = computed(()=> {
  if(activeName.value === '2'){
    // 如果在角色 tab，则只展示角色数据
    return [{
      type: 'role', 
      not: false,
      data: roles.value, 
      isActiveItem: (item)=> $func.toggleClass(checkedRoleList.value, item, 'roleId'),
      change: (item)=> $func.toChecked(checkedRoleList.value, item, 'roleId')
    }]
  }else{
    // 如果在组织架构 tab，则展示部门和人员数据
    return [{
      isDepartment: props.isDepartment,
      type: 'department', 
      data: departments.value.childDepartments, 
      isActive: (item)=> $func.toggleClass(checkedDepartmentList.value, item),
      change: (item)=> $func.toChecked(checkedDepartmentList.value, item),
      next: (item)=> getDepartmentList(item.id)
    },{
      type: 'employee', 
      data: departments.value.employees, 
      isActive: (item)=> $func.toggleClass(checkedEmployessList.value, item),
      change: (item)=> $func.toChecked(checkedEmployessList.value, item),
    }]
  }
})

// 组合已选数据，传递给右侧 selectResult 展示
let resList = computed(()=>{
  let data = [{
    type: 'role', 
    data: checkedRoleList.value, 
    cancel: (item)=> $func.removeEle(checkedRoleList.value, item, 'roleId')
  },{
    type: 'employee', 
    data: checkedEmployessList.value, 
    cancel: (item)=> $func.removeEle(checkedEmployessList.value, item)
  }]
  if(props.isDepartment){
    data.splice(1, 0, {
      type: 'department',
      data: checkedDepartmentList.value,
      cancel: (item)=> $func.removeEle(checkedDepartmentList.value, item)
    })
  }
  return data
})

// 监听弹窗打开，初始化数据和回显
watch(()=> props.visible, (val)=>{
  if(val){
    activeName.value = "1"; // 默认回到第一个 tab
    getDepartmentList();
    searchVal.value = "";
    // 将传入的混合数据按 type 分解到各自的数组中
    checkedEmployessList.value = props.data.filter(item=>item.type===1).map(({name,targetId})=>({
      employeeName: name,
      id: targetId
    }));
    checkedRoleList.value = props.data.filter(item=>item.type===2).map(({name,targetId})=>({
      roleName: name,
      roleId: targetId
    }));
    checkedDepartmentList.value = props.data.filter(item=>item.type===3).map(({name,targetId})=>({
      departmentName: name,
      id: targetId
    }));
  }
});

// 计算总选中数量
let total = computed(()=> {
  return checkedEmployessList.value.length 
    + checkedRoleList.value.length 
    + checkedDepartmentList.value.length
})

// 切换 tab 时的处理
const handleClick = ()=> {
  searchVal.value = "";
  if (activeName.value === '1') {
      getDepartmentList();
  } else {
      getRoleList();
  }
}

// 保存时，将三类数据合并并标准化格式
const saveDialog = ()=> {
  let checkedList = [
    ...checkedRoleList.value, 
    ...checkedEmployessList.value,
    ...checkedDepartmentList.value
  ].map(item=>({
    // 区分数据类型：1人员，2角色，3部门
    type: item.employeeName?1:(item.roleName?2:3),
    targetId: item.id || item.roleId,
    name: item.employeeName || item.roleName || item.departmentName
  }))
  emits('change',checkedList)
}

// 清空所有已选
const delList = ()=> {
  checkedEmployessList.value = [];
  checkedRoleList.value = [];
  checkedDepartmentList.value = [];
}

const closeDialog = ()=> {
  emits('update:visible', false)
}
</script>

<style>
@import "@/css/dialog.css";
</style>