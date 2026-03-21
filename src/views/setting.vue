<template>
  <div>
    <div class="fd-nav">
      <div class="fd-nav-left">
        <div
          class="fd-nav-back"
          @click="toReturn">
          <i class="anticon anticon-left"></i>
        </div>
        <div class="fd-nav-title">{{ workFlowDef.name }}</div>
      </div>
      <div class="fd-nav-right">
        <button
          type="button"
          class="ant-btn button-publish"
          @click="saveSet">
          <span>发 布</span>
        </button>
      </div>
    </div>
    <div class="fd-nav-content">
      <section class="dingflow-design">
        <div class="zoom">
          <div
            class="zoom-out"
            :class="nowVal == 50 && 'disabled'"
            @click="zoomSize(1)"></div>
          <span>{{ nowVal }}%</span>
          <div
            class="zoom-in"
            :class="nowVal == 300 && 'disabled'"
            @click="zoomSize(2)"></div>
        </div>
        <div
          class="box-scale"
          :style="`transform: scale(${nowVal / 100});`">
          <nodeWrap
            v-model:nodeConfig="nodeConfig"
            v-model:flowPermission="flowPermission" />
          <div class="end-node">
            <div class="end-node-circle"></div>
            <div class="end-node-text">流程结束</div>
          </div>
        </div>
      </section>
    </div>
    <errorDialog
      v-model:visible="tipVisible"
      :list="tipList" />
    <promoterDrawer />
    <approverDrawer :directorMaxLevel="directorMaxLevel" />
    <copyerDrawer />
    <conditionDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWorkFlowData, setWorkFlowData } from '@/api/index'
import { useStore } from '@/stores/index'
// 引入各个业务组件（错误弹窗及各种节点配置的右侧抽屉）
import errorDialog from '@/components/dialog/errorDialog.vue'
import promoterDrawer from '@/components/drawer/promoterDrawer.vue'
import approverDrawer from '@/components/drawer/approverDrawer.vue'
import copyerDrawer from '@/components/drawer/copyerDrawer.vue'
import conditionDrawer from '@/components/drawer/conditionDrawer.vue'

// 从 Pinia 状态管理中获取方法
let { setTableId, setIsTried } = useStore()

let tipList = ref([]) // 记录错误提示的列表
let tipVisible = ref(false) // 错误弹窗的显示状态
let nowVal = ref(100) // 画布缩放比例，默认 100%
let processConfig = ref({}) // 整个审批流的完整配置数据
let nodeConfig = ref({}) // 核心节点树数据，传递给递归组件渲染
let workFlowDef = ref({}) // 审批流定义信息（如流程名称等）
let flowPermission = ref([]) // 流程权限数据
let directorMaxLevel = ref(0) // 主管最大层级

// 页面挂载时初始化数据
onMounted(async () => {
  let route = useRoute()
  // 模拟从后端获取初始化的审批流数据
  let { data } = await getWorkFlowData({
    workFlowDefId: route.query.workFlowDefId,
  })
  processConfig.value = data
  // 解构并赋值给各个响应式变量
  let {
    nodeConfig: nodes,
    flowPermission: flows,
    directorMaxLevel: directors,
    workFlowDef: works,
    tableId,
  } = data
  nodeConfig.value = nodes
  flowPermission.value = flows
  directorMaxLevel.value = directors
  workFlowDef.value = works
  setTableId(tableId)
})

const toReturn = () => {
  // 返回上一页的逻辑
  //window.location.href = ""
}

// 递归校验节点树是否配置完整
const reErr = ({ childNode }) => {
  if (childNode) {
    let { type, error, nodeName, conditionNodes } = childNode
    // 如果是审批人(type=1)或抄送人(type=2)
    if (type == 1 || type == 2) {
      if (error) {
        // 如果节点有 error 标记，加入错误提示列表
        tipList.value.push({
          name: nodeName,
          type: ['', '审核人', '抄送人'][type],
        })
      }
      reErr(childNode) // 继续递归子节点
    } else if (type == 3) {
      // 其他普通节点直接递归
      // 办理人(type=3)
      reErr(childNode)
    } else if (type == 4) {
      // 如果是条件分支(type=4)，除了递归主干，还要遍历条件分支数组
      reErr(childNode)
      for (var i = 0; i < conditionNodes.length; i++) {
        if (conditionNodes[i].error) {
          tipList.value.push({ name: conditionNodes[i].nodeName, type: '条件' })
        }
        reErr(conditionNodes[i]) // 递归校验每个条件分支内部的节点
      }
    }
  } else {
    childNode = null // 递归结束点
  }
}

// 保存并发布设置
const saveSet = async () => {
  setIsTried(true) // 标记已尝试保存，触发界面上未填项标红
  tipList.value = []
  reErr(nodeConfig.value) // 触发全局递归校验

  // 如果发现有配置错误的节点，弹出错误提示并终止保存
  if (tipList.value.length != 0) {
    tipVisible.value = true
    return
  }

  processConfig.value.flowPermission = flowPermission.value
  // 打印最终生成的 JSON 数据到控制台，方便对接真实后端时查看数据结构
  console.log(JSON.stringify(processConfig.value))

  // 原本调用真实后端的代码（因为是纯前端项目会报 404，所以这里注释掉）
  // let res = await setWorkFlowData(processConfig.value);

  // 模拟接口调用成功，直接给予成功提示
  let res = { code: 200 }

  if (res.code == 200) {
    ElMessage.success('设置成功')
    setTimeout(function () {
      window.location.href = ''
    }, 200)
  }
}

// 控制画布缩放
const zoomSize = (type) => {
  if (type == 1) {
    // 缩小，最小到 50%
    if (nowVal.value == 50) {
      return
    }
    nowVal.value -= 10
  } else {
    // 放大，最大到 300%
    if (nowVal.value == 300) {
      return
    }
    nowVal.value += 10
  }
}
</script>
<style>
@import '../css/workflow.css';
.error-modal-list {
  width: 455px;
}
</style>
