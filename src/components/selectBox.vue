<template>
  <!-- 弹窗左侧：待选择列表展示区域 -->
  <ul class="select-box">
    <!-- 循环遍历传入的配置数组（可能包含 role, department, employee 的混合配置） -->
    <template
      v-for="(elem, i) in list"
      :key="i">
      <!-- 渲染角色列表 -->
      <template v-if="elem.type === 'role'">
        <li
          v-for="item in elem.data"
          :key="item.roleId"
          class="check_box"
          :class="{
            active: elem.isActive && elem.isActive(item), // 判断当前角色是否已被选中
            not: elem.not, // 控制样式，某些场景下角色不可选
          }"
          @click="elem.change(item)">
          <!-- 点击触发选中/取消选中逻辑 -->
          <a
            :title="item.description"
            :class="{ active: elem.isActiveItem && elem.isActiveItem(item) }">
            <img src="@/assets/images/icon_role.png" />{{ item.roleName }}
          </a>
        </li>
      </template>
      <!-- 渲染部门列表 -->
      <template v-if="elem.type === 'department'">
        <li
          v-for="item in elem.data"
          :key="item.id"
          class="check_box"
          :class="{ not: !elem.isDepartment }">
          <!-- 如果允许选择部门本身，则绑定点击选中事件 -->
          <a
            v-if="elem.isDepartment"
            :class="elem.isActive(item) && 'active'"
            @click="elem.change(item)">
            <img src="@/assets/images/icon_file.png" />{{
              item.departmentName
            }}</a
          >
          <!-- 如果不允许选择部门（比如只能选具体的人），则点击部门名字无反应 -->
          <a v-else
            ><img src="@/assets/images/icon_file.png" />{{
              item.departmentName
            }}</a
          >
          <!-- 点击“下级”按钮，触发 next 方法，重新请求并渲染子部门数据 -->
          <i @click="elem.next(item)">下级</i>
        </li>
      </template>
      <!-- 渲染员工列表 -->
      <template v-if="elem.type === 'employee'">
        <li
          v-for="item in elem.data"
          :key="item.id"
          class="check_box">
          <a
            :class="elem.isActive(item) && 'active'"
            @click="elem.change(item)"
            :title="item.departmentNames">
            <img src="@/assets/images/icon_people.png" />{{ item.employeeName }}
          </a>
        </li>
      </template>
    </template>
  </ul>
</template>
<script setup>
// selectBox.vue - 通用的待选项列表组件（用于在弹窗中展示 角色/部门/人员 的列表供用户点击选择）
defineProps({
  list: {
    // 传入的列表数据，包含了类型（type）、数据源（data）、是否激活的判断函数（isActive）以及点击事件（change/next）
    type: Array,
    default: () => [],
  },
})
</script>
<style lang="less">
.select-box {
  height: 420px;
  overflow-y: auto;

  li {
    padding: 5px 0;

    i {
      float: right;
      padding-left: 24px;
      padding-right: 10px;
      color: #3195f8;
      font-size: 12px;
      cursor: pointer;
      background: url(~@/assets/images/next_level_active.png) no-repeat 10px
        center;
      border-left: 1px solid rgb(238, 238, 238);
    }

    a.active + i {
      color: rgb(197, 197, 197);
      background-image: url(~@/assets/images/next_level.png);
      pointer-events: none;
    }

    img {
      width: 14px;
      vertical-align: middle;
      margin-right: 5px;
    }
  }
}
</style>
