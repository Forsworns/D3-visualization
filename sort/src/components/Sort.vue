<template>
  <div class="sort">
    <input v-model="inputArrString">
    <button @click="sort(false)">升序排列</button>
    <button @click="sort(true)">降序排列</button>
    <p>排列后为 {{outputArrString}} <p>
    <p>请用逗号分隔数字</p>
  </div>
</template>

<script>
import {quickSort} from './quickSort.js'

export default {
  name: 'Sort',
  data() {
    return{
      inputArrString: "",
      outputArr: [],
    }
  },
  methods: {
    sort(type){
      let inputArr = (this.inputArrString.indexOf(',')===-1)?this.inputArrString.split('，'):this.inputArrString.split(',');
      inputArr = inputArr.map(item=>parseFloat(item));
      this.outputArr = sort(inputArr,type);
    }
  },
  computed: {
    outputArrString(){
      if(this.inputArrString!=""){
        return this.outputArr.join(',');
      }else{
        return "";
      }
    }
  }
}

function sort(arr,reverse){
    let output = arr.concat();
    quickSort(output,0,arr.length-1);
    if(reverse){ // 默认降序，如果翻转
      output.reverse();
    }
    return output;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.sort{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
input::-ms-clear {
    display: none;
}
</style>
