<template>
  <!-- 条件设置配置抽屉 -->
  <el-drawer
    :append-to-body="true"
    title="条件设置"
    v-model="visible"
    class="condition_copyer"
    :show-close="false"
    :size="550"
    :before-close="saveCondition">
    <!-- 自定义抽屉头部 -->
    <template #header="{ titleId, titleClass }">
      <h3
        :id="titleId"
        :class="titleClass">
        条件设置
      </h3>
      <!-- 调整当前条件分支优先级的下拉框 -->
      <select
        v-model="conditionConfig.priorityLevel"
        class="priority_level">
        <option
          v-for="item in conditionsConfig.conditionNodes.length"
          :value="item"
          :key="item">
          优先级{{ item }}
        </option>
      </select>
    </template>
    <div class="demo-drawer__content">
      <div class="condition_content drawer_content">
        <p class="tip">当审批单同时满足以下条件时进入此流程</p>
        <ul>
          <!-- 循环渲染用户已添加的条件列表 -->
          <li
            v-for="(item, index) in conditionConfig.conditionList"
            :key="index">
            <span class="ellipsis"
              >{{ item.type == 1 ? '发起人' : item.showName }}：</span
            >
            <!-- 条件类型1：基于“发起人”进行条件判断 -->
            <div v-if="item.type == 1">
              <p
                :class="
                  conditionConfig.nodeUserList.length > 0 ? 'selected_list' : ''
                "
                @click.self="addConditionRole"
                style="cursor: text">
                <!-- 展示已选择的发起人范围 -->
                <span
                  v-for="(item1, index1) in conditionConfig.nodeUserList"
                  :key="index1">
                  {{ item1.name
                  }}<img
                    src="@/assets/images/add-close1.png"
                    @click="
                      $func.removeEle(
                        conditionConfig.nodeUserList,
                        item1,
                        'targetId',
                      )
                    " />
                </span>
                <input
                  type="text"
                  placeholder="请选择具体人员/角色/部门"
                  v-if="conditionConfig.nodeUserList.length == 0"
                  @click="addConditionRole" />
              </p>
            </div>
            <!-- 条件类型：基于“字符串/下拉框”等进行条件判断 -->
            <div v-else-if="item.columnType == 'String' && item.showType == 3">
              <p class="check_box">
                <a
                  :class="$func.toggleStrClass(item, item1.key) && 'active'"
                  @click="toStrChecked(item, item1.key)"
                  v-for="(item1, index1) in JSON.parse(item.fixedDownBoxValue)"
                  :key="index1"
                  >{{ item1.value }}</a
                >
              </p>
            </div>
            <!-- 条件类型：基于“数值范围”（如请假天数、报销金额）进行判断 -->
            <div v-else>
              <p>
                <!-- 选择判断符（如：大于、小于、介于两数之间） -->
                <select
                  v-model="item.optType"
                  :style="'width:' + (item.optType == 6 ? 370 : 100) + 'px'"
                  @change="changeOptType(item)">
                  <option
                    v-for="{ value, label } in optTypes"
                    :value="value"
                    :key="value">
                    {{ label }}
                  </option>
                </select>
                <!-- 非区间判断，只需输入一个数值 -->
                <input
                  v-if="item.optType != 6"
                  type="text"
                  :placeholder="'请输入' + item.showName"
                  v-enter-number="2"
                  v-model="item.zdy1" />
              </p>
              <!-- optType=6 时为“介于两个数之间”的判断，需要输入两个数值和两个判断符 -->
              <p v-if="item.optType == 6">
                <input
                  type="text"
                  style="width: 75px"
                  class="mr_10"
                  v-enter-number="2"
                  v-model="item.zdy1" />
                <select
                  style="width: 60px"
                  v-model="item.opt1">
                  <option
                    v-for="{ value, label } in opt1s"
                    :value="value"
                    :key="value">
                    {{ label }}
                  </option>
                </select>
                <span
                  class="ellipsis"
                  style="
                    display: inline-block;
                    width: 60px;
                    vertical-align: text-bottom;
                  "
                  >{{ item.showName }}</span
                >
                <select
                  style="width: 60px"
                  class="ml_10"
                  v-model="item.opt2">
                  <option
                    v-for="{ value, label } in opt1s"
                    :value="value"
                    :key="value">
                    {{ label }}
                  </option>
                </select>
                <input
                  type="text"
                  style="width: 75px"
                  v-enter-number="2"
                  v-model="item.zdy2" />
              </p>
            </div>
            <!-- 删除当前条件项的按钮 -->
            <a
              v-if="item.type == 1"
              @click="
                ((conditionConfig.nodeUserList = []),
                $func.removeEle(
                  conditionConfig.conditionList,
                  item,
                  'columnId',
                ))
              "
              >删除</a
            >
            <a
              v-if="item.type == 2"
              @click="
                $func.removeEle(conditionConfig.conditionList, item, 'columnId')
              "
              >删除</a
            >
          </li>
        </ul>
        <!-- 增加新条件的按钮 -->
        <el-button
          type="primary"
          @click="addCondition"
          >添加条件</el-button
        >
        <!-- 选择条件的内部弹窗 -->
        <el-dialog
          title="选择条件"
          v-model="conditionVisible"
          :width="480"
          append-to-body
          class="condition_list">
          <p>请选择用来区分审批流程的条件字段</p>
          <p class="check_box">
            <a
              :class="
                $func.toggleClass(conditionList, { columnId: 0 }, 'columnId') &&
                'active'
              "
              @click="
                $func.toChecked(conditionList, { columnId: 0 }, 'columnId')
              "
              >发起人</a
            >
            <a
              v-for="(item, index) in conditions"
              :key="index"
              :class="
                $func.toggleClass(conditionList, item, 'columnId') && 'active'
              "
              @click="$func.toChecked(conditionList, item, 'columnId')"
              >{{ item.showName }}</a
            >
          </p>
          <template #footer>
            <el-button @click="conditionVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="sureCondition"
              >确 定</el-button
            >
          </template>
        </el-dialog>
      </div>
      <!-- 选人/选角色弹窗 -->
      <employees-role-dialog
        v-model:visible="conditionRoleVisible"
        :data="checkedList"
        @change="sureConditionRole"
        :isDepartment="true" />
      <div class="demo-drawer__footer clear">
        <el-button
          type="primary"
          @click="saveCondition"
          >确 定</el-button
        >
        <el-button @click="closeDrawer">取 消</el-button>
      </div>
    </div>
  </el-drawer>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import $func from '@/utils/index'
import { useStore } from '@/stores/index'
import { optTypes, opt1s } from '@/utils/const'
import { getConditions } from '@/api/index'
import employeesRoleDialog from '../dialog/employeesRoleDialog.vue'

// conditionDrawer.vue - 条件分支配置抽屉组件
let conditionVisible = ref(false) // 内部“选择条件”小弹窗可见性
let conditionsConfig = ref({ // 整个条件壳节点的数据
  conditionNodes: [],
})
let conditionConfig = ref({}) // 当前正在编辑的这个条件分支的数据
let PriorityLevel = ref('') // 当前条件的优先级
let conditions = ref([]) // 可供选择的条件列表（来源于后端/mock数据）
let conditionList = ref([]) // 弹窗中勾选的条件
let checkedList = ref([])
let conditionRoleVisible = ref(false)

let store = useStore()
let { setCondition, setConditionsConfig } = store

// 从 Pinia 中获取状态
let tableId = computed(() => store.tableId)
let conditionsConfig1 = computed(() => store.conditionsConfig1)
let conditionDrawer = computed(() => store.conditionDrawer)

// 双向绑定抽屉可见性
let visible = computed({
  get() {
    return conditionDrawer.value
  },
  set() {
    closeDrawer()
  },
})

// 监听 Pinia 数据变化，初始化数据回显
watch(conditionsConfig1, (val) => {
  conditionsConfig.value = val.value
  PriorityLevel.value = val.priorityLevel
  // 找出当前正在编辑的那个条件分支
  conditionConfig.value = val.priorityLevel
    ? conditionsConfig.value.conditionNodes[val.priorityLevel - 1]
    : { nodeUserList: [], conditionList: [] }
})

// 当切换条件判断符（如切换为介于两数之间 optType=6）时，重置默认值
const changeOptType = (item) => {
  if (item.optType == 1) {
    item.zdy1 = 2
  } else {
    item.zdy1 = 1
    item.zdy2 = 2
  }
}

// 字符串/枚举类型条件的多选处理逻辑
const toStrChecked = (item, key) => {
  let a = item.zdy1 ? item.zdy1.split(',') : []
  var isIncludes = $func.toggleStrClass(item, key)
  if (!isIncludes) {
    a.push(key)
    item.zdy1 = a.toString()
  } else {
    removeStrEle(item, key)
  }
}

// 移除字符串条件中已选的某项
const removeStrEle = (item, key) => {
  let a = item.zdy1 ? item.zdy1.split(',') : []
  var includesIndex
  a.map((item, index) => {
    if (item == key) {
      includesIndex = index
    }
  })
  a.splice(includesIndex, 1)
  item.zdy1 = a.toString()
}

// 点击“添加条件”，打开条件选择小弹窗并获取条件数据字典
const addCondition = async () => {
  conditionList.value = []
  conditionVisible.value = true
  let { data } = await getConditions({ tableId: tableId.value })
  conditions.value = data
  // 将已选的条件回显到弹窗中
  if (conditionConfig.value.conditionList) {
    for (var i = 0; i < conditionConfig.value.conditionList.length; i++) {
      var { columnId } = conditionConfig.value.conditionList[i]
      if (columnId == 0) {
        conditionList.value.push({ columnId: 0 })
      } else {
        conditionList.value.push(
          conditions.value.filter((item) => {
            return item.columnId == columnId
          })[0],
        )
      }
    }
  }
}

// 确认选择条件，将勾选的条件数据格式化并塞入当前条件的 conditionList
const sureCondition = () => {
  // 1.弹窗有，外面无：新增
  // 2.弹窗有，外面有：不变
  for (var i = 0; i < conditionList.value.length; i++) {
    var {
      columnId,
      showName,
      columnName,
      showType,
      columnType,
      fixedDownBoxValue,
    } = conditionList.value[i]
    if (
      $func.toggleClass(
        conditionConfig.value.conditionList,
        conditionList.value[i],
        'columnId',
      )
    ) {
      continue
    }
    // 特殊条件：发起人
    if (columnId == 0) {
      conditionConfig.value.nodeUserList = []
      conditionConfig.value.conditionList.push({
        type: 1,
        columnId: columnId,
        showName: '发起人',
      })
    } else {
      // 数值类型条件（如请假天数）
      if (columnType == 'Double') {
        conditionConfig.value.conditionList.push({
          showType: showType,
          columnId: columnId,
          type: 2,
          showName: showName,
          optType: '1',
          zdy1: '2',
          opt1: '<',
          zdy2: '',
          opt2: '<',
          columnDbname: columnName,
          columnType: columnType,
        })
      } else if (columnType == 'String' && showType == '3') {
        // 字符串下拉类型条件
        conditionConfig.value.conditionList.push({
          showType: showType,
          columnId: columnId,
          type: 2,
          showName: showName,
          zdy1: '',
          columnDbname: columnName,
          columnType: columnType,
          fixedDownBoxValue: fixedDownBoxValue,
        })
      }
    }
  }
  // 3.弹窗无，外面有：删除（用户取消勾选的条件）
  for (let i = conditionConfig.value.conditionList.length - 1; i >= 0; i--) {
    if (
      !$func.toggleClass(
        conditionList.value,
        conditionConfig.value.conditionList[i],
        'columnId',
      )
    ) {
      conditionConfig.value.conditionList.splice(i, 1)
    }
  }
  // 保持条件顺序一致
  conditionConfig.value.conditionList.sort(function (a, b) {
    return a.columnId - b.columnId
  })
  conditionVisible.value = false
}

// 保存当前条件的配置
const saveCondition = () => {
  closeDrawer()
  // 处理优先级排序的变更
  var a = conditionsConfig.value.conditionNodes.splice(
    PriorityLevel.value - 1,
    1,
  ) //截取旧下标
  conditionsConfig.value.conditionNodes.splice(
    conditionConfig.value.priorityLevel - 1,
    0,
    a[0],
  ) //填充新下标
  conditionsConfig.value.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
  })
  // 重新校验所有条件的 error 状态
  for (var i = 0; i < conditionsConfig.value.conditionNodes.length; i++) {
    conditionsConfig.value.conditionNodes[i].error =
      $func.conditionStr(conditionsConfig.value, i) == '请设置条件' &&
      i != conditionsConfig.value.conditionNodes.length - 1
  }
  // 提交更新到 Pinia
  setConditionsConfig({
    value: conditionsConfig.value,
    flag: true,
    id: conditionsConfig1.value.id,
  })
}

// 打开条件选人弹窗（仅当条件为“发起人”时触发）
const addConditionRole = () => {
  conditionRoleVisible.value = true
  checkedList.value = conditionConfig.value.nodeUserList
}

// 确认条件选人
const sureConditionRole = (data) => {
  conditionConfig.value.nodeUserList = data
  conditionRoleVisible.value = false
}

const closeDrawer = (val) => {
  setCondition(false)
}
</script>
<style lang="less">
.condition_copyer {
  .priority_level {
    position: absolute;
    top: 11px;
    right: 30px;
    width: 100px;
    height: 32px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(217, 217, 217, 1);
    font-size: 12px;
  }

  .condition_content {
    padding: 20px 20px 0;

    p.tip {
      margin: 20px 0;
      width: 510px;
      text-indent: 17px;
      line-height: 45px;
      background: rgba(241, 249, 255, 1);
      border: 1px solid rgba(64, 163, 247, 1);
      color: #46a6fe;
      font-size: 14px;
    }

    ul {
      max-height: 500px;
      overflow-y: scroll;
      margin-bottom: 20px;

      li {
        & > span {
          float: left;
          margin-right: 8px;
          width: 70px;
          line-height: 32px;
          text-align: right;
        }

        & > div {
          display: inline-block;
          width: 370px;

          & > p:not(:last-child) {
            margin-bottom: 10px;
          }
        }

        &:not(:last-child) > div > p {
          margin-bottom: 20px;
        }

        & > a {
          float: right;
          margin-right: 10px;
          margin-top: 7px;
        }

        select,
        input {
          width: 100%;
          height: 32px;
          background: rgba(255, 255, 255, 1);
          border-radius: 4px;
          border: 1px solid rgba(217, 217, 217, 1);
        }

        select + input {
          width: 260px;
        }

        select {
          margin-right: 10px;
          width: 100px;
        }

        p.selected_list {
          padding-left: 10px;
          border-radius: 4px;
          min-height: 32px;
          border: 1px solid rgba(217, 217, 217, 1);
          word-break: break-word;
        }

        p.check_box {
          line-height: 32px;
        }
      }
    }

    .el-button {
      margin-bottom: 20px;
    }
  }
}

.condition_list {
  .el-dialog__body {
    padding: 16px 26px;
  }

  p {
    color: #666666;
    margin-bottom: 10px;

    & > .check_box {
      margin-bottom: 0;
      line-height: 36px;
    }
  }
}
</style>
