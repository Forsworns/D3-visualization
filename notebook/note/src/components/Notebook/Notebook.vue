<template>
  <div id="notebook">
    <Heading msg="My Notebook"/>
    <NoteList></NoteList>
    <NoteAdd></NoteAdd>
    <router-link to="/ping">ping to check connection</router-link>
  </div>
</template>

<script>
import Heading from './components/Heading.vue'
import NoteList from './components/NoteList.vue'
import NoteAdd from './components/NoteAdd.vue'

export default {
  name: 'notebook',
  components: {
    Heading,
    NoteList,
    NoteAdd,
  }
}
</script>

<style>
#notebook {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
