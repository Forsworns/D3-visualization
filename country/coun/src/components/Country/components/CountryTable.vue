<template>
  <div id="country-table">
      <table align="center">
        <tr>
          <th v-for="(item,idx) in columnName" :key="idx">{{item}}</th>
        </tr>
        <tr v-for="(row,idx1) in pageData" :key="idx1">
          <td v-for="(item,idx2) in row" :key="idx2">{{item}}</td>
        </tr>
      </table>
  </div>
</template>

<script>
import axios from 'axios'
import bus from './bus'
import {serie_map, country_map} from './DataMap.js'

export default {
  name: 'CountryTable',
  created() {
    bus.$on("dispatchPageSize",val=>{ // 收到一页几条后再处理数据
      this.pageSize = val
      this.getAll()
    })
    bus.$on("dispatchPageSelected", val=>{ // 收到换页信息后更新视图
      this.pageData = this.allData.slice(val*this.pageSize, (val+1)*this.pageSize).map((arr)=>{
        let elem = [...arr] // 注意是一个二维数组，所以内层数组还是引用，即使用了slice这里也要接触引用关系，否则会连带allData一并更改
        elem[0] = country_map[elem[0]]
        elem[1] = serie_map[elem[1]]
        return elem
      })
    })
  },
  data() {
    return {
      pageSize: 0,
      pageData: [],
      allData: [],
    }
  },
  props:{
    columnName: Array,
  },
  methods:{
    getAll(){
      const path = "http://localhost:5000/query_all"
      axios.get(path)
        .then((res)=>{
          this.allData = res.data
          bus.$emit("dispatchDataAmount",this.allData.length)
          this.pageData = this.allData.slice(0, this.pageSize).map((arr)=>{
            let elem = [...arr]
            elem[0] = country_map[elem[0]]
            elem[1] = serie_map[elem[1]]
            return elem
          })
        })
        .catch((error)=>{
          console.log(error)
        })
    },
  }
}
</script>

<style lang="scss" scoped>

table {
  width: 1200px;
  margin: 10px auto;
  tr {
    height:80px;
    td{
      border-collapse: collapse;
      border-spacing: 0;
      border-bottom: 1px solid lightgray;
    }
  }
}

</style>
