<template>
  <div id="title" class="title">
    <strong>{{ msg }}</strong>
  </div>
</template>

<script>
export default {
  name: 'Title',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
  font-size: 30px;
}
</style>
