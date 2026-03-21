<template>
  <!-- 错误提示弹窗，当点击发布时，如果有必填项未填则弹出 -->
  <el-dialog
    title="提示"
    v-model="visibleDialog"
    :width="520">
    <div class="ant-confirm-body">
      <i
        class="anticon anticon-close-circle"
        style="color: #f00"></i>
      <span class="ant-confirm-title">当前无法发布</span>
      <div class="ant-confirm-content">
        <div>
          <p class="error-modal-desc">以下内容不完善，需进行修改</p>
          <div class="error-modal-list">
            <!-- 循环渲染所有收集到的错误信息 -->
            <div
              class="error-modal-item"
              v-for="(item, index) in list"
              :key="index">
              <div class="error-modal-item-label">流程设计</div>
              <div class="error-modal-item-content">
                <!-- 显示出具体的节点名称和缺失的类型（如：审批人 未选择审核人） -->
                {{ item.name }} 未选择{{ item.type }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 弹窗底部操作按钮 -->
    <template #footer>
      <el-button @click="visibleDialog = false">我知道了</el-button>
      <el-button
        type="primary"
        @click="visibleDialog = false"
        >前往修改</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

// 接收外部传入的 props
let props = defineProps({
  list: { // 错误信息列表
    type: Array,
    default: () => [],
  },
  visible: { // 控制弹窗显示隐藏
    type: Boolean,
    default: false,
  },
})
let emits = defineEmits(['update:visible'])

// 计算属性，用于和 el-dialog 的 v-model 进行双向绑定
let visibleDialog = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val)
  },
})
</script>

<style scoped>
.ant-confirm-body .ant-confirm-title {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  display: block;
  overflow: hidden;
}

.ant-confirm-body .ant-confirm-content {
  margin-left: 38px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-top: 8px;
}

.ant-confirm-body > .anticon {
  font-size: 22px;
  margin-right: 16px;
  float: left;
}
</style>
