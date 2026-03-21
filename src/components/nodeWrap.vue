<template>
  <div
    class="node-wrap"
    v-if="nodeConfig.type < 3">
    <div
      class="node-wrap-box"
      :class="
        (nodeConfig.type == 0 ? 'start-node ' : '') +
        (isTried && nodeConfig.error ? 'active error' : '')
      ">
      <!-- 标签头部 -->
      <div
        class="title"
        :style="`background: rgb(${bgColors[nodeConfig.type]});`">
        <!-- 发起人type=0 -->
        <span v-if="nodeConfig.type == 0">{{ nodeConfig.nodeName }}</span>
        <!-- 审批人type=1;抄送人type=2 -->
        <template v-else>
          <span class="iconfont">{{ nodeConfig.type == 1 ? '' : '' }}</span>
          <!-- 编辑情况 -->
          <!-- v-focus让输入框自动获取光标焦点、@focus="$event.currentTarget.select()获得焦点的时候全选选中（高亮）、@blur="blurEvent()失焦的时候触发方法（方法是把isInput改为false） -->
          <input
            v-if="isInput"
            type="text"
            class="ant-input editable-title-input"
            @blur="blurEvent()"
            @focus="$event.currentTarget.select()"
            v-focus
            v-model="nodeConfig.nodeName"
            :placeholder="defaultText" />
          <!-- 非编辑情况 -->
          <span
            v-else
            class="editable-title"
            @click="clickEvent()"
            >{{ nodeConfig.nodeName }}</span
          >
          <i
            class="anticon anticon-close close"
            @click="delNode"></i>
        </template>
      </div>
      <!-- 标签内容 -->
      <div
        class="content"
        @click="setPerson">
        <div class="text">
          <span
            class="placeholder"
            v-if="!showText"
            >请选择{{ defaultText }}</span
          >
          {{ showText }}
        </div>
        <i class="anticon anticon-right arrow"></i>
      </div>
      <!-- 标签旁边的失败感叹号符 -->
      <div
        class="error_tip"
        v-if="isTried && nodeConfig.error">
        <i class="anticon anticon-exclamation-circle"></i>
      </div>
    </div>
    <addNode v-model:childNodeP="nodeConfig.childNode" />
  </div>
  <div
    class="branch-wrap"
    v-if="nodeConfig.type == 4">
    <div class="branch-box-wrap">
      <div class="branch-box">
        <button
          class="add-branch"
          @click="addTerm">
          添加条件
        </button>
        <!-- 一个条件及其内容 -->
        <div
          class="col-box"
          v-for="(item, index) in nodeConfig.conditionNodes"
          :key="index">
          <div class="condition-node">
            <div class="condition-node-box">
              <!-- 一个条件框 -->
              <div
                class="auto-judge"
                :class="isTried && item.error ? 'error active' : ''">
                <!-- 左移按钮：只有当当前条件不是第一个时才显示（最左边的不能再往左移了） -->
                <div
                  class="sort-left"
                  v-if="index != 0"
                  @click="arrTransfer(index, -1)">
                  &lt;
                </div>

                <div class="title-wrapper">
                  <!-- 编辑状态：显示输入框用于修改条件名称 -->
                  <input
                    v-if="isInputList[index]"
                    type="text"
                    class="ant-input editable-title-input"
                    @blur="blurEvent(index)"
                    @focus="$event.currentTarget.select()"
                    v-focus
                    v-model="item.nodeName" />
                  <!-- 非编辑状态：显示条件名称文本，点击可切换为编辑状态 -->
                  <span
                    v-else
                    class="editable-title"
                    @click="clickEvent(index)"
                    >{{ item.nodeName }}</span
                  >
                  <!-- 优先级标签：显示当前分支的优先级，点击可打开右侧抽屉设置条件细节 -->
                  <span
                    class="priority-title"
                    @click="setPerson(item.priorityLevel)"
                    >优先级{{ item.priorityLevel }}</span
                  >
                  <!-- 删除按钮：点击删除当前这个条件分支 -->
                  <i
                    class="anticon anticon-close close"
                    @click="delTerm(index)"></i>
                </div>

                <!-- 右移按钮：只有当当前条件不是最后一个时才显示（最右边的不能再往右移了） -->
                <div
                  class="sort-right"
                  v-if="index != nodeConfig.conditionNodes.length - 1"
                  @click="arrTransfer(index)">
                  &gt;
                </div>

                <!-- 条件内容区域：显示类似 "请假天数 > 3天" 的摘要文本 -->
                <div
                  class="content"
                  @click="setPerson(item.priorityLevel)">
                  {{ $func.conditionStr(nodeConfig, index) }}
                </div>

                <!-- 错误提示图标：如果尝试保存且当前条件未配置完整，显示红色感叹号 -->
                <div
                  class="error_tip"
                  v-if="isTried && item.error">
                  <i class="anticon anticon-exclamation-circle"></i>
                </div>
              </div>

              <!-- 条件节点下方的添加按钮（用于在当前条件内部添加审批人/抄送人等） -->
              <addNode v-model:childNodeP="item.childNode" />
            </div>
          </div>

          <!-- 递归渲染：如果当前条件分支内部还有后续节点，继续渲染 -->
          <nodeWrap
            v-if="item.childNode"
            v-model:nodeConfig="item.childNode" />

          <!-- CSS 连线遮罩：如果是第一个分支（最左边），需要隐藏其左侧多余的连接线 -->
          <template v-if="index == 0">
            <div class="top-left-cover-line"></div>
            <div class="bottom-left-cover-line"></div>
          </template>
          <!-- CSS 连线遮罩：如果是最后一个分支（最右边），需要隐藏其右侧多余的连接线 -->
          <template v-if="index == nodeConfig.conditionNodes.length - 1">
            <div class="top-right-cover-line"></div>
            <div class="bottom-right-cover-line"></div>
          </template>
        </div>
      </div>
      <addNode v-model:childNodeP="nodeConfig.childNode" />
    </div>
  </div>
  <nodeWrap
    v-if="nodeConfig.childNode"
    v-model:nodeConfig="nodeConfig.childNode" />
</template>
<script setup>
import { onMounted, ref, watch, getCurrentInstance, computed } from 'vue'
import $func from '@/utils/index'
import { useStore } from '@/stores/index'
import { bgColors, placeholderList } from '@/utils/const'

// 获取当前组件实例的唯一 id，主要用于在 Pinia 状态中区分当前操作的是哪一个组件节点
let _uid = getCurrentInstance().uid

// 接收来自父组件的数据
let props = defineProps({
  nodeConfig: {
    // 当前节点的数据配置
    type: Object,
    default: () => ({}),
  },
  flowPermission: {
    // 流程权限相关数据
    type: Object,
    default: () => [],
  },
})

// 根据节点类型 (0发起人/1审批人/2抄送人等) 计算默认的占位提示文本
let defaultText = computed(() => {
  return placeholderList[props.nodeConfig.type]
})
// 计算节点内容区域显示的文本（如：显示选中的审批人名字，或者“所有人”）
let showText = computed(() => {
  if (props.nodeConfig.type == 0)
    return $func.arrToStr(props.flowPermission) || '所有人'
  if (props.nodeConfig.type == 1) return $func.setApproverStr(props.nodeConfig)
  return $func.copyerStr(props.nodeConfig)
})

let isInputList = ref([]) // 控制条件分支的标题是否处于编辑（输入框）状态的数组
let isInput = ref(false) // 控制普通节点的标题是否处于编辑状态

// 重置条件分支内部的错误状态：检查条件是否未设置
const resetConditionNodesErr = () => {
  for (var i = 0; i < props.nodeConfig.conditionNodes.length; i++) {
    props.nodeConfig.conditionNodes[i].error =
      $func.conditionStr(props.nodeConfig, i) == '请设置条件' &&
      i != props.nodeConfig.conditionNodes.length - 1
  }
}

// 组件挂载时，初始化校验当前节点的配置是否有错误（是否为空）
onMounted(() => {
  if (props.nodeConfig.type == 1) {
    props.nodeConfig.error = !$func.setApproverStr(props.nodeConfig)
  } else if (props.nodeConfig.type == 2) {
    props.nodeConfig.error = !$func.copyerStr(props.nodeConfig)
  } else if (props.nodeConfig.type == 4) {
    resetConditionNodesErr()
  }
})

let emits = defineEmits(['update:flowPermission', 'update:nodeConfig'])
let store = useStore()
let {
  setPromoter,
  setApprover,
  setCopyer,
  setCondition,
  setFlowPermission,
  setApproverConfig,
  setCopyerConfig,
  setConditionsConfig,
} = store

// 从 Pinia 中获取状态，判断用户是否点击过“发布”（用于触发错误标红显示）
let isTried = computed(() => store.isTried)

// 监听 Pinia 中的配置数据变化。
// 因为配置是在右侧抽屉里完成的，配置完成后存入 Pinia。
// 这里通过 _uid 匹配，如果是当前组件节点的数据更新了，就触发 emits 更新本地 nodeConfig
let flowPermission1 = computed(() => store.flowPermission1)
let approverConfig1 = computed(() => store.approverConfig1)
let copyerConfig1 = computed(() => store.copyerConfig1)
let conditionsConfig1 = computed(() => store.conditionsConfig1)

watch(flowPermission1, (flow) => {
  if (flow.flag && flow.id === _uid) {
    emits('update:flowPermission', flow.value)
  }
})
watch(approverConfig1, (approver) => {
  if (approver.flag && approver.id === _uid) {
    emits('update:nodeConfig', approver.value)
  }
})
watch(copyerConfig1, (copyer) => {
  if (copyer.flag && copyer.id === _uid) {
    emits('update:nodeConfig', copyer.value)
  }
})
watch(conditionsConfig1, (condition) => {
  if (condition.flag && condition.id === _uid) {
    emits('update:nodeConfig', condition.value)
  }
})

// 点击节点标题文本时触发，将文本切换为输入框
const clickEvent = (index) => {
  if (index || index === 0) {
    isInputList.value[index] = true // 条件分支的标题编辑
  } else {
    isInput.value = true // 普通节点的标题编辑
  }
}

// 输入框失去焦点时触发，隐藏输入框并保存名字
const blurEvent = (index) => {
  if (index || index === 0) {
    isInputList.value[index] = false
    props.nodeConfig.conditionNodes[index].nodeName =
      props.nodeConfig.conditionNodes[index].nodeName || '条件'
  } else {
    isInput.value = false
    props.nodeConfig.nodeName = props.nodeConfig.nodeName || defaultText
  }
}

// 删除当前普通节点：将父级传来的节点数据直接替换为当前节点的子节点（相当于从链表中把当前节点摘除）
const delNode = () => {
  emits('update:nodeConfig', props.nodeConfig.childNode)
}

// 在条件分支中添加一个新的条件（条件3、条件4...）
const addTerm = () => {
  let len = props.nodeConfig.conditionNodes.length + 1
  props.nodeConfig.conditionNodes.push({
    nodeName: '条件' + len,
    type: 3,
    priorityLevel: len,
    conditionList: [],
    nodeUserList: [],
    childNode: null,
  })
  resetConditionNodesErr()
  emits('update:nodeConfig', props.nodeConfig)
}

// 删除指定的条件分支
const delTerm = (index) => {
  props.nodeConfig.conditionNodes.splice(index, 1) // 移除该分支
  // 重新计算并整理剩下分支的优先级和默认名称
  props.nodeConfig.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
    item.nodeName = `条件${index + 1}`
  })
  resetConditionNodesErr()
  emits('update:nodeConfig', props.nodeConfig)

  // 核心逻辑：如果删除后只剩下一个条件了，那“条件分支”就没意义了，需要解散外层条件壳
  if (props.nodeConfig.conditionNodes.length == 1) {
    if (props.nodeConfig.childNode) {
      if (props.nodeConfig.conditionNodes[0].childNode) {
        // 如果内部有节点，外部也有后续节点，需要把外部的节点接在内部节点的末尾
        reData(
          props.nodeConfig.conditionNodes[0].childNode,
          props.nodeConfig.childNode,
        )
      } else {
        props.nodeConfig.conditionNodes[0].childNode =
          props.nodeConfig.childNode
      }
    }
    // 直接用仅剩的内部节点替换掉当前的条件分支节点
    emits('update:nodeConfig', props.nodeConfig.conditionNodes[0].childNode)
  }
}

// 递归函数：用于将 addData 节点追加到 data 节点的链表最末尾
const reData = (data, addData) => {
  if (!data.childNode) {
    data.childNode = addData
  } else {
    reData(data.childNode, addData)
  }
}

// 点击节点内容区域时触发，打开对应的右侧抽屉进行人员/规则配置
const setPerson = (priorityLevel) => {
  var { type } = props.nodeConfig
  if (type == 0) {
    setPromoter(true) // 打开“发起人”配置抽屉
    setFlowPermission({
      value: props.flowPermission,
      flag: false,
      id: _uid, // 绑定当前组件实例的 ID
    })
  } else if (type == 1) {
    setApprover(true) // 打开“审批人”配置抽屉
    setApproverConfig({
      value: {
        ...JSON.parse(JSON.stringify(props.nodeConfig)), // 深拷贝当前节点数据到 Pinia
        ...{ settype: props.nodeConfig.settype ? props.nodeConfig.settype : 1 },
      },
      flag: false,
      id: _uid,
    })
  } else if (type == 2) {
    setCopyer(true) // 打开“抄送人”配置抽屉
    setCopyerConfig({
      value: JSON.parse(JSON.stringify(props.nodeConfig)),
      flag: false,
      id: _uid,
    })
  } else {
    setCondition(true) // 打开“条件分支”配置抽屉
    setConditionsConfig({
      value: JSON.parse(JSON.stringify(props.nodeConfig)),
      priorityLevel, // 传入当前点击的是哪个优先级的条件
      flag: false,
      id: _uid,
    })
  }
}

// 处理条件分支的左右平移排序
const arrTransfer = (index, type = 1) => {
  // 向左移: type = -1, 向右移: type = 1
  // 使用 splice 巧妙地交换数组中两个相邻元素的位置
  props.nodeConfig.conditionNodes[index] =
    props.nodeConfig.conditionNodes.splice(
      index + type,
      1,
      props.nodeConfig.conditionNodes[index],
    )[0]
  // 交换位置后重新分配优先级
  props.nodeConfig.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
  })
  resetConditionNodesErr()
  emits('update:nodeConfig', props.nodeConfig)
}
</script>
<style>
.error_tip {
  position: absolute;
  top: 0px;
  right: 0px;
  transform: translate(150%, 0px);
  font-size: 24px;
}

.promoter_person .el-dialog__body {
  padding: 10px 20px 14px 20px;
}

.selected_list {
  margin-bottom: 20px;
  line-height: 30px;
}

.selected_list span {
  margin-right: 10px;
  padding: 3px 6px 3px 9px;
  line-height: 12px;
  white-space: nowrap;
  border-radius: 2px;
  border: 1px solid rgba(220, 220, 220, 1);
}

.selected_list img {
  margin-left: 5px;
  width: 7px;
  height: 7px;
  cursor: pointer;
}
</style>
