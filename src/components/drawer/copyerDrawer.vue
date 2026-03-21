<template>
  <!-- 抄送人配置抽屉 -->
  <el-drawer
    :append-to-body="true"
    title="抄送人设置"
    v-model="visible"
    class="set_copyer"
    :show-close="false"
    :size="550"
    :before-close="saveCopyer">
    <div class="demo-drawer__content">
      <div class="copyer_content drawer_content">
        <!-- 抄送人选择按钮 -->
        <el-button
          type="primary"
          @click="addCopyer"
          >添加成员</el-button
        >
        <!-- 已选抄送人列表展示 -->
        <p class="selected_list">
          <span
            v-for="(item, index) in copyerConfig.nodeUserList"
            :key="index"
            >{{ item.name }}
            <img
              src="@/assets/images/add-close1.png"
              @click="
                $func.removeEle(copyerConfig.nodeUserList, item, 'targetId')
              " />
          </span>
          <a
            v-if="
              copyerConfig.nodeUserList && copyerConfig.nodeUserList.length != 0
            "
            @click="copyerConfig.nodeUserList = []"
            >清除</a
          >
        </p>
        <!-- 是否允许发起人在提交时自选额外抄送人 -->
        <el-checkbox-group
          v-model="ccSelfSelectFlag"
          class="clear">
          <el-checkbox :label="1">允许发起人自选抄送人</el-checkbox>
        </el-checkbox-group>
      </div>
      <!-- 底部操作按钮 -->
      <div class="demo-drawer__footer clear">
        <el-button
          type="primary"
          @click="saveCopyer"
          >确 定</el-button
        >
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
      <!-- 选择人员/角色的综合弹窗 -->
      <employees-role-dialog
        v-model:visible="copyerVisible"
        :data="checkedList"
        @change="sureCopyer" />
    </div>
  </el-drawer>
</template>
<script setup>
import employeesRoleDialog from '../dialog/employeesRoleDialog.vue'
import $func from '@/utils/index'
import { useStore } from '@/stores/index'
import { ref, watch, computed } from 'vue'

// copyerDrawer.vue - 抄送人配置右侧抽屉组件
let copyerConfig = ref({}) // 当前抄送人节点的配置数据
let ccSelfSelectFlag = ref([]) // 绑定多选框的值
let copyerVisible = ref(false) // 选人弹窗可见性
let checkedList = ref([]) // 传给弹窗的已选数据

let store = useStore()
let { setCopyerConfig, setCopyer } = store

// 从 Pinia 获取状态
let copyerDrawer = computed(() => store.copyerDrawer)
let copyerConfig1 = computed(() => store.copyerConfig1)

// 双向绑定抽屉可见性
let visible = computed({
  get() {
    return copyerDrawer.value
  },
  set() {
    closeDrawer()
  },
})

// 监听 Pinia 数据变化，初始化回显数据
watch(copyerConfig1, (val) => {
  copyerConfig.value = val.value
  ccSelfSelectFlag.value =
    copyerConfig.value.ccSelfSelectFlag == 0
      ? []
      : [copyerConfig.value.ccSelfSelectFlag]
})

// 打开选人弹窗
const addCopyer = () => {
  copyerVisible.value = true
  checkedList.value = copyerConfig.value.nodeUserList
}

// 确认选人回调
const sureCopyer = (data) => {
  copyerConfig.value.nodeUserList = data
  copyerVisible.value = false
}

// 保存配置到 Pinia
const saveCopyer = () => {
  // 转换 checkbox 的值为业务需要的 0 或 1
  copyerConfig.value.ccSelfSelectFlag =
    ccSelfSelectFlag.value.length == 0 ? 0 : 1
  // 校验节点配置是否为空
  copyerConfig.value.error = !$func.copyerStr(copyerConfig.value)
  setCopyerConfig({
    value: copyerConfig.value,
    flag: true,
    id: copyerConfig1.value.id,
  })
  closeDrawer()
}

// 关闭抽屉
const closeDrawer = () => {
  setCopyer(false)
}
</script>

<style lang="less">
.set_copyer {
  .copyer_content {
    padding: 20px 20px 0;

    .el-button {
      margin-bottom: 20px;
    }

    .el-checkbox {
      margin-bottom: 20px;
    }
  }
}
</style>
