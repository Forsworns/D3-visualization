<template>
  <div id="Ping">
    <P>If the connection is on, you will receive a hello world from Flask, instead of Vue.</P>
    <p>{{ msg }}</p>
    <p><router-link to="/">back</router-link></p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Ping',
  created(){
    this.getMessage();
  },
  data() {
    return {
      msg: 'Hello world from vue!',
    };
  },
  methods: {
    getMessage(){
      const path = "http://localhost:5000/ping";
      axios.get(path)
        .then((res)=>{
          this.msg = res.data;
        })
        .catch((error)=>{
          console.log(error);
        })
    }
  },
};
</script>

<style scoped>
#ping {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
p {
  text-align: center;
}
</style>