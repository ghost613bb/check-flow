<template>
  <!-- 发起人配置抽屉 -->
  <el-drawer
    :append-to-body="true"
    title="发起人"
    v-model="visible"
    class="set_promoter"
    :show-close="false"
    :size="550"
    :before-close="savePromoter">
    <div class="demo-drawer__content">
      <div class="promoter_content drawer_content">
        <!-- 显示当前配置的发起人名单（拼成字符串），默认为所有人 -->
        <p>{{ $func.arrToStr(flowPermission) || '所有人' }}</p>
        <el-button
          type="primary"
          @click="addPromoter"
          >添加/修改发起人</el-button
        >
      </div>
      <!-- 底部操作按钮 -->
      <div class="demo-drawer__footer clear">
        <el-button
          type="primary"
          @click="savePromoter"
          >确 定</el-button
        >
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <!-- 发起人只能选择人员或部门，所以使用 employeesDialog -->
      <employees-dialog
        :isDepartment="true"
        v-model:visible="promoterVisible"
        :data="checkedList"
        @change="surePromoter" />
    </div>
  </el-drawer>
</template>
<script setup>
import employeesDialog from '../dialog/employeesDialog.vue'
import $func from '@/utils/index'
import { useStore } from '@/stores/index'
import { computed, ref, watch } from 'vue'

// promoterDrawer.vue - 发起人配置右侧抽屉组件
let flowPermission = ref([]) // 当前的流程权限（谁可以发起）
let promoterVisible = ref(false) // 选人弹窗可见性
let checkedList = ref([]) // 已选名单

let store = useStore()
let { setPromoter, setFlowPermission } = store

// 从 Pinia 获取状态
let promoterDrawer = computed(() => store.promoterDrawer)
let flowPermission1 = computed(() => store.flowPermission1)

// 双向绑定抽屉显示
let visible = computed({
  get() {
    return promoterDrawer.value
  },
  set() {
    closeDrawer()
  },
})

// 监听数据变化回显
watch(flowPermission1, (val) => {
  flowPermission.value = val.value
})

// 打开选人弹窗
const addPromoter = () => {
  checkedList.value = flowPermission.value
  promoterVisible.value = true
}

// 确认选人
const surePromoter = (data) => {
  flowPermission.value = data
  promoterVisible.value = false
}

// 保存数据到 Pinia
const savePromoter = () => {
  setFlowPermission({
    value: flowPermission.value,
    flag: true,
    id: flowPermission1.value.id,
  })
  closeDrawer()
}

// 关闭抽屉
const closeDrawer = () => {
  setPromoter(false)
}
</script>
<style lang="less">
.set_promoter {
  .promoter_content {
    padding: 0 20px;
    .el-button {
      margin-bottom: 20px;
    }
    p {
      padding: 18px 0;
      font-size: 14px;
      line-height: 20px;
      color: #000000;
    }
  }
}
</style>
