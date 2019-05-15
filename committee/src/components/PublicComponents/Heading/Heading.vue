<template>
  <div id="heading">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'Heading',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin: 40px 0 0;
}
</style>
