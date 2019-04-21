<template>
  <div id="app">
    <el-menu 
      :defualt-active="activeIndex" 
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :router="true"
    >
      <el-menu-item index="1" route="global">Global</el-menu-item>
      <el-menu-item index="2" route="country">Country</el-menu-item>
      <el-menu-item index="3" route="compare">Compare</el-menu-item>
    </el-menu>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  data() {
    return {
      activeIndex: '1'
    }
  },
}
</script>

<style>

</style>
