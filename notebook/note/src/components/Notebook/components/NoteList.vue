<template>
  <div id="note-list">
    <Title msg="All notes"></Title>
    <div id="note-list">
      <ul>
        <li v-for="(item,idx) in notes" :key="idx">
          <input type="checkbox" :value="idx" v-model="selected">
          <label :for="idx">
            <strong>{{item.title}}</strong> - {{item.content}}
          </label>
        </li>
      </ul> 
    </div>
    <div id="buttons">
      <button @click="selectAll">全选</button> 
      <button @click="deleteItem" :disabled="canDelete">{{deleteStr}}</button>
    </div>
  </div>
</template>

<script>
import bus from './bus'
import Title from './Title.vue'
import axios from 'axios'

export default {
  name: 'NoteList',
  components:{
      Title,
  },
  created() {
      this.getNotes()
      let that = this;
      bus.$on("noteAdd",data=>{
          that.notes.push(data);
      })
  },
  data() {
    return {
      notes: [],
      selected: [],
    }
  },
  computed: {
    deleteStr(){
      return `删除(${this.selected.length})`;
    },
    canDelete(){
      return this.selected.length === 0;
    },
  },
  methods:{
    selectAll(){
      this.selected = Array(this.notes.length).fill().map((elem,idx)=>idx++); // 生成一个n长的数组，先填充undefined，之后更改为位置的值0~n-1
    },
    deleteItem(){
      this.postDelete(this.selected);
    },
    getNotes(){
      const path = "http://localhost:5000/note_get_temp";
      axios.get(path)
        .then((res)=>{
          this.notes = res.data;
        })
        .catch((error)=>{
          console.log(error)
        })
    },
    postDelete(){
      const path = "http://localhost:5000/note_delete_temp";
      
      let params = new URLSearchParams()
      let seleted_created = this.selected.map((elem)=>{
        return this.notes[elem].created;
      });
      params.append('selected', seleted_created);
      
      axios.post(path, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(()=>{
        this.notes = this.notes.filter(
          (elem,idx)=>{
            return !this.selected.includes(idx)
          }); 
        // 先在本地更新，不每次都重新从服务器加载
        this.selected.splice(0, this.selected.length);
      })
      .catch((error)=>{
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>
button {
  margin: 5px;
} 

ul{
  width: fit-content;
  margin: 0 auto;
}

li {
  margin: 0;
  padding: 0; 
  text-align: left;
}

</style>
