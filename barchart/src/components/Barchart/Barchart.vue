<template>
  <div id="barchart">
    <Heading msg="Barchart"/>
    <button @click="add()">添加</button>
    <button @click="remove()">减少</button>
    <button @click="refresh()">刷新</button>
    <Bar :barData="chartData" v-bind="settings"></Bar>
  </div>
</template>

<script>
import Heading from './components/Heading'
import Bar from './components/Bar'

export default {
  name: 'barchart',
  created(){
      this.refresh()
  },
  data() {
    return {
      chartData: [],
      columnNum: 20,
      settings: {
          width:800,
          height:600
      }
    }
  },
  components: {
      Heading, Bar
  },
  methods: {
    add(){
        this.columnNum = this.chartData.push(Math.random()*10)
    },
    remove(){
        this.chartData.pop()
        this.columnNum = this.chartData.length
    },
    refresh(){
        this.chartData = Array.from({length:this.columnNum}).map(()=>Math.random()*10)
    }
  }
}
</script>

<style>
#country {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
