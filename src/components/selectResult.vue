<template>
  <!-- 弹窗右侧：已选择结果展示区域 -->
  <div class="select-result l">
    <p class="clear">
      已选（{{ total }}）
      <a @click="emits('del')">清空</a>
    </p>
    <ul>
      <!-- 循环遍历不同类型（role, department, employee）的数据 -->
      <template
        v-for="{ type, data, cancel } in list"
        :key="type">
        <!-- 渲染已选角色 -->
        <template v-if="type === 'role'">
          <li
            v-for="item in data"
            :key="item.roleId">
            <img src="@/assets/images/icon_role.png" />
            <span>{{ item.roleName }}</span>
            <img
              src="@/assets/images/cancel.png"
              @click="cancel(item)" />
          </li>
        </template>
        <!-- 渲染已选部门 -->
        <template v-if="type === 'department'">
          <li
            v-for="item in data"
            :key="item.id">
            <img src="@/assets/images/icon_file.png" />
            <span>{{ item.departmentName }}</span>
            <img
              src="@/assets/images/cancel.png"
              @click="cancel(item)" />
          </li>
        </template>
        <!-- 渲染已选员工 -->
        <template v-if="type === 'employee'">
          <li
            v-for="item in data"
            :key="item.id">
            <img src="@/assets/images/icon_people.png" />
            <span>{{ item.employeeName }}</span>
            <!-- 点击右侧的 X 按钮触发 cancel 方法，从选中列表中移除该项 -->
            <img
              src="@/assets/images/cancel.png"
              @click="cancel(item)" />
          </li>
        </template>
      </template>
    </ul>
  </div>
</template>
<script setup>
// selectResult.vue - 通用的已选项展示组件（用于在弹窗右侧展示用户已经勾选的人员/部门/角色，并提供删除功能）
defineProps({
  total: {
    // 已选总数
    type: Number,
    default: 0,
  },
  list: {
    // 已选列表数据，包含了类型（type）、数据源（data）、以及取消选择的函数（cancel）
    type: Array,
    default: () => [{ type: 'role', data, cancel }],
  },
})
// 触发清空所有已选项的事件
let emits = defineEmits(['del'])
</script>

<style lang="less">
.select-result {
  width: 276px;
  height: 100%;
  font-size: 12px;

  ul {
    height: 460px;
    overflow-y: auto;

    li {
      margin: 11px 26px 13px 19px;
      line-height: 17px;

      span {
        vertical-align: middle;
      }

      img {
        &:first-of-type {
          width: 14px;
          vertical-align: middle;
          margin-right: 5px;
        }

        &:last-of-type {
          float: right;
          margin-top: 2px;
          width: 14px;
        }
      }
    }
  }

  p {
    padding-left: 19px;
    padding-right: 20px;
    line-height: 37px;
    border-bottom: 1px solid #f2f2f2;

    a {
      float: right;
    }
  }
}
</style>
