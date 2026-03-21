<template>
  <!-- 角色选择弹窗组件 -->
  <el-dialog
    title="选择角色"
    v-model="visibleDialog"
    :width="600"
    append-to-body
    class="promoter_person">
    <div class="person_body clear">
      <div class="person_tree l">
        <!-- 搜索框，绑定 input 事件进行防抖搜索 -->
        <input
          type="text"
          placeholder="搜索角色"
          v-model="searchVal"
          @input="getDebounceData($event, 2)" />
        <!-- 左侧：待选择的角色列表 -->
        <selectBox :list="list" />
      </div>
      <!-- 右侧：已选择的角色结果展示 -->
      <selectResult
        :total="total"
        @del="delList"
        :list="resList" />
    </div>
    <!-- 弹窗底部按钮区 -->
    <template #footer>
      <el-button @click="closeDialog">取 消</el-button>
      <el-button
        type="primary"
        @click="saveDialog"
        >确 定</el-button
      >
    </template>
  </el-dialog>
</template>
<script setup>
import selectBox from '../selectBox.vue'
import selectResult from '../selectResult.vue'
import { computed, watch, ref } from 'vue'
import $func from '@/utils/index.js'
import { roles, getDebounceData, getRoleList, searchVal } from './common'

// 接收外部传入的 props
let props = defineProps({
  visible: { // 控制弹窗的显示与隐藏
    type: Boolean,
    default: false,
  },
  data: { // 外部传入的已选角色数据，用于回显
    type: Array,
    default: () => [],
  },
})

let checkedRoleList = ref([]) // 内部维护的当前选中的角色列表
let emits = defineEmits(['update:visible', 'change'])

// 构造传递给 selectBox (左侧待选列表) 的数据
let list = computed(() => {
  return [
    {
      type: 'role', // 标识当前列表渲染的是角色类型
      not: true, // 样式控制标识
      data: roles.value, // 角色数据源
      isActive: (item) =>
        $func.toggleClass(checkedRoleList.value, item, 'roleId'), // 判断某项是否已选中
      change: (item) => {
        // 单选逻辑：每次点击角色，直接替换已选列表，而不是追加（说明当前业务场景下角色是单选）
        checkedRoleList.value = [item]
      },
    },
  ]
})

// 构造传递给 selectResult (右侧已选列表) 的数据
let resList = computed(() => {
  return [
    {
      type: 'role',
      data: checkedRoleList.value,
      cancel: (item) => $func.removeEle(checkedRoleList.value, item, 'roleId'), // 点击取消按钮从已选中移除
    },
  ]
})

// 计算属性，用于与 el-dialog 的 v-model 双向绑定
let visibleDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    closeDialog()
  },
})

// 监听弹窗的打开状态，进行数据初始化和回显
watch(
  () => props.visible,
  (val) => {
    if (val) {
      getRoleList() // 请求角色列表接口
      searchVal.value = '' // 清空搜索框
      // 将外部传入的 data 映射到内部的 checkedRoleList
      checkedRoleList.value = props.data.map(({ name, targetId }) => ({
        roleName: name,
        roleId: targetId,
      }))
    }
  },
)

// 计算已选中的总数
let total = computed(() => checkedRoleList.value.length)

// 点击确定按钮，将选中的数据格式化后传回给父组件
const saveDialog = () => {
  let checkedList = checkedRoleList.value.map((item) => ({
    type: 2, // type=2 在业务中代表角色
    targetId: item.roleId,
    name: item.roleName,
  }))
  emits('change', checkedList)
}

// 清空所有已选角色
const delList = () => {
  checkedRoleList.value = []
}

// 关闭弹窗
const closeDialog = () => {
  emits('update:visible', false)
}
</script>

<style>
@import '@/css/dialog.css';
</style>
