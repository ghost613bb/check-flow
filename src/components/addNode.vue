<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <el-popover
        placement="right-start"
        v-model="visible"
        width="auto">
        <div class="add-node-popover-body">
          <a
            class="add-node-popover-item approver"
            @click="addType(1)">
            <div class="item-wrapper">
              <span class="iconfont"></span>
            </div>
            <p>审批人</p>
          </a>
          <a
            class="add-node-popover-item notifier"
            @click="addType(2)">
            <div class="item-wrapper">
              <span class="iconfont"></span>
            </div>
            <p>抄送人</p>
          </a>
          <a
            class="add-node-popover-item condition"
            @click="addType(4)">
            <div class="item-wrapper">
              <span class="iconfont"></span>
            </div>
            <p>条件分支</p>
          </a>
        </div>
        <template #reference>
          <button
            class="btn"
            type="button">
            <span class="iconfont"></span>
          </button>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

// 接收父组件（nodeWrap）传来的当前节点的子节点（childNode）
let props = defineProps({
  childNodeP: {
    type: Object,
    default: () => ({}),
  },
})

// 用于向父组件同步更新数据
let emits = defineEmits(['update:childNodeP'])
let visible = ref(false) // 控制添加节点气泡菜单的显示/隐藏

// 点击气泡菜单里的具体节点类型时触发
const addType = (type) => {
  visible.value = false
  if (type != 4) {
    // 添加普通节点（审批人 / 抄送人）
    var data
    if (type == 1) {
      // 1: 审批人节点
      data = {
        nodeName: '审核人',
        error: true, // 默认带 error，因为还没选人，需要提示必填
        type: 1,
        settype: 1,
        selectMode: 0,
        selectRange: 0,
        directorLevel: 1,
        examineMode: 1,
        noHanderAction: 1,
        examineEndDirectorLevel: 0,
        // 重点：将新节点的 childNode 指向原来的 childNode，实现“插入”效果
        childNode: props.childNodeP,
        nodeUserList: [],
      }
    } else if (type == 2) {
      // 2: 抄送人节点
      data = {
        nodeName: '抄送人',
        type: 2,
        ccSelfSelectFlag: 1,
        childNode: props.childNodeP, // 同样是把原来的后续流程接在这个新节点后面
        nodeUserList: [],
      }
    }
    // 触发更新：把这个新构建的节点对象替换掉父节点原来的 childNode
    emits('update:childNodeP', data)
  } else {
    // 添加条件分支节点 (type: 4)
    emits('update:childNodeP', {
      nodeName: '路由',
      type: 4,
      childNode: null, // 分支的后续主干先置空（通常在整个分支结束合流后再接原来的流程，这里的逻辑是将原流程接在第一个条件内部，视具体业务而定）
      conditionNodes: [
        {
          // 默认生成两个条件分支（条件1和条件2）
          nodeName: '条件1',
          error: true,
          type: 3,
          priorityLevel: 1,
          conditionList: [],
          nodeUserList: [],
          // 把原本主干的后续流程接在“条件1”的后面
          childNode: props.childNodeP,
        },
        {
          nodeName: '条件2',
          type: 3,
          priorityLevel: 2,
          conditionList: [],
          nodeUserList: [],
          childNode: null,
        },
      ],
    })
  }
}
</script>
<style scoped lang="less">
.add-node-btn-box {
  width: 240px;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }
  .add-node-btn {
    user-select: none;
    width: 240px;
    padding: 20px 0 32px;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    flex-grow: 1;
    .btn {
      outline: none;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      width: 30px;
      height: 30px;
      background: #3296fa;
      border-radius: 50%;
      position: relative;
      border: none;
      line-height: 30px;
      -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      .iconfont {
        color: #fff;
        font-size: 16px;
      }
      &:hover {
        transform: scale(1.3);
        box-shadow: 0 13px 27px 0 rgba(0, 0, 0, 0.1);
      }
      &:active {
        transform: none;
        background: #1e83e9;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
<style lang="less">
.add-node-popover-body {
  display: flex;
  .add-node-popover-item {
    margin-right: 10px;
    cursor: pointer;
    text-align: center;
    flex: 1;
    color: #191f25 !important;
    &:hover {
      background-color: transparent;
      .item-wrapper {
        transform: scale(1.1);
        box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
      }
    }
    .item-wrapper {
      user-select: none;
      display: inline-block;
      width: 60px;
      height: 60px;
      margin-bottom: 5px;
      background: #fff;
      border: 1px solid #e2e2e2;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      .iconfont {
        font-size: 28px;
        line-height: 60px;
      }
    }
    &.approver {
      .item-wrapper {
        color: #f59e0b;
      }
      &:hover .item-wrapper {
        border-color: #f59e0b;
      }
    }
    &.notifier {
      .item-wrapper {
        color: #0ea5e9;
      }
      &:hover .item-wrapper {
        border-color: #0ea5e9;
      }
    }
    &.condition {
      .item-wrapper {
        color: #10b981;
      }
      &:hover .item-wrapper {
        border-color: #10b981;
      }
    }
    &:active {
      .item-wrapper {
        transform: scale(0.95);
      }
    }
  }
}
</style>
