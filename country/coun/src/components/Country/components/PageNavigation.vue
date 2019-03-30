<template>
  <div id="page-navigation">
    <button @click="pageChange(pageSelected-1)" :disabled="pageSelected===0"> &lt; </button>
      <button v-for="idx in pageStart" :key="idx" @click="pageChange(idx)" :class="{selectedClass: pageSelected==idx}">{{idx+1}}</button>
      <span v-show="pageOmit">...</span>
      <button v-for="idx in pageEnd" :key="idx" @click="pageChange(idx)" :class="{selectedClass: pageSelected==idx}">{{idx+1}}</button>
      <button @click="pageChange(pageSelected+1)" :disabled="pageSelected===pageNum-1"> &gt; </button>
  </div>
</template>

<script>
import bus from './bus'

export default {
  name: 'PageNavigation',
  created() {
      bus.$on("dispatchDataAmount",val=>{
        let ceil = Math.ceil
        this.pageNum = ceil(val/this.pageSize)
        this.pageEnd = Array.apply(null,{length: ceil(this.pageShown/2)}).map((elem,idx)=>this.pageNum-ceil(this.pageShown/2)+idx)
        this.pageStart = Array.apply(null,{length: this.pageShown}).map((elem,idx)=>idx)
      })
      bus.$emit("dispatchPageSize",this.pageSize)
  },
  data(){
    return {
        pageSize: 5,
        pageShown: 5,
        pageOmit: true,
        pageNum: 0,
        pageStart: [],
        pageSelected: 0,
        pageEnd: [],
    }
  },
  watch: {
    pageStart(val){
      if(val[val.length-1]<this.pageEnd[0]){
        this.pageStart = val
        this.pageOmit = true
      }else{
        this.pageStart = []
        this.pageOmit = false
      }
    }
  },
  methods:{
      pageChange(val){
      if(val<0){
        return 
      }
      this.pageSelected = val
      bus.$emit("dispatchPageSelected",val)

      if(val>=this.pageEnd[0]){
        return
      }

      if(val < this.pageStart[0]){ // 在第一个位置向前翻页
        this.pageStart = Array.from({length:this.pageShown}).map((elem,idx)=>val-this.pageShown+idx+2)
      }else if(val > this.pageStart[this.pageStart.length-1]){ // 在最后一个位置向后翻页
        this.pageStart = Array.from({length:this.pageShown}).map((elem,idx)=>idx+val-1)
      }

      if(val!=0 && val == this.pageStart[0]){ // 正常点击或翻页
        this.pageStart = Array.from({length:this.pageShown}).map((elem,idx)=>val-this.pageShown+idx+1)
      }
      else if(val == this.pageStart[this.pageStart.length-1]){
        this.pageStart = Array.from({length:this.pageShown}).map((elem,idx)=>idx+val)
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "./colors.scss";

.selectedClass{
  background-color: $button-blue;
  color: white;
}

button{
    margin: 0 1px;
    border: 0;
    height: 30px;
    width: 30px;
    background-color: $button-gray; 
}
</style>
