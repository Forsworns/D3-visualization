<template>
  <div id="note-add">
    <Title msg="Add a new note"></Title>
    <div id="title">
      <span>Enter the note title: </span> 
      <input v-model="itemTitle" placeholder="input title" type="text">
    </div>
    <div id="textare">
      <textarea v-model="itemContent" placeholder="input content"/>
    </div>
    <div id="save">
      <button @click="addItem">Save</button>
    </div>
  </div>
</template>

<script>
import bus from './bus'
import Title from './Title.vue'
import axios from 'axios'
import dayjs from 'dayjs'

export default {
  name: 'NoteAdd',
  components:{
      Title,
  },
  data() {
    return {
      itemTitle: "",
      itemContent: "",
    }
  },
  methods:{
    addItem(){
      if(this.itemTitle === ""){
        alert("标题为空");
        return;
      }
      if(this.itemContent === ""){
        alert("内容为空");
        return;
      }
      this.postAdd()
    },
    postAdd(){
      const path = "http://localhost:5000/note_add_temp"
      let createPara = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let params = new URLSearchParams()
      params.append('title', this.itemTitle);
      params.append('content', this.itemContent);
      params.append('created', createPara);
      axios.post(path, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(()=>{
        // 同样先在本地更新页面，不直接向服务器请求更新
        bus.$emit("noteAdd",{title: this.itemTitle, content: this.itemContent, created: createPara})
        this.itemTitle = "";
        this.itemContent = "";
      })
      .catch((error)=>{
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>
textarea {
  margin-top: 5px;
  height: 200px;
  width: 300px;
  resize: none;
}
button {
  margin: 5px;
} 

</style>
