<template>
  <div id="country-add">
    <div id="countryAdd">
      <span v-for="(item,idx) in columnName" :key="idx">
        <label :for="idx">{{item}}</label> <input :placeholder="item" v-model="itemToAdd[idx]">
      </span>
      <span>
        <button @click="postAdd()">Add</button>
      </span>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import {serie_map_inv, country_map_inv} from './DataMap.js'

export default {
  name: 'CountryAdd',
  data() {
    return {
      itemToAdd: [],
    }
  },
  props:{
      columnName: Array,
  },
  methods:{
    postAdd(){
      const path = "http://localhost:5000/country_add"
      let params = new URLSearchParams()
      let items = this.itemToAdd
      this.columnName.forEach((elem,idx) => {
        params.append(elem,items[idx])
      })
      params.append('CountryCode',country_map_inv[items[0]])
      params.append('SeriesCode',serie_map_inv[items[1]])
      axios.post(path, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(()=>{
        window.location.reload()
      })
      .catch((error)=>{
        console.log(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./colors.scss";

span{
  margin: 0 3px;
}

input{
    width:90px;
}

button{
  border: 0;
  height: 30px;
  width: 50px;
  background-color: $button-blue;
  color:white;
}

</style>
