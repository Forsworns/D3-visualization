<template>
  <div id="country">
    <Heading msg="Country data"/>
    <CountryAdd :columnName="columnName"/>
    <CountryTable :columnName="columnName"/>
    <PageNavigation/>
    <router-link to="/ping">ping to check connection</router-link>
  </div>
</template>

<script>
import Heading from './components/Heading'
import CountryTable from './components/CountryTable'
import CountryAdd from './components/CountryAdd'
import PageNavigation from './components/PageNavigation' 
import axios from 'axios'

export default {
  name: 'country',
  created(){
    this.getColumnName()
  },
  data() {
    return {
      columnName: [],
    }
  },
  components: {
      Heading,CountryTable,CountryAdd,PageNavigation
  },
  methods: {
    getColumnName(){
      const path = "http://localhost:5000/query_column_name";
      axios.get(path)
        .then((res)=>{
          this.columnName = res.data;
        })
        .catch((error)=>{
          console.log(error)
        })
    },
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
