<template>
  <div id="app">
    <Heading msg="QuickSort App"/>
    <Sort></Sort>
  </div>
</template>

<script>
import Heading from './components/Heading.vue'
import Sort from './components/Sort.vue'

export default {
  name: 'app',
  components: {
    Heading,
    Sort
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
