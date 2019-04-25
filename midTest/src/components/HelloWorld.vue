<template>
  <div class="hello">
    <div id="buttons">
      <el-button
            v-for="(val,idx) in SERIES"
            :key="idx"
            :type="selBut===idx?'success':'primary'"
            @click="clickButton(idx)"
          >{{val}}</el-button>
    </div>
    <div id="barFig">
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3' 
import axios from 'axios'
import Papa from 'papaparse'

export default {
  name: 'HelloWorld',
  data() {
    return {
      captions: [],
      allData: [],
      barData: [],
      selBut: 0,
      SERIES: ['Area','Group','Reservation','Clients age','Gender','Occupancy'], // constant
      SERIES_ID :[[1,2,3,4,5,6],[7,8],[9,10,11],[12,13,14,15],[0],[18]],
    }
  },
  created() {
    const curPageUrl = window.document.location.href
    const fileName = `${curPageUrl.split("//")[0]}//${curPageUrl.split("//")[1].split("/")[0]}/static/hotel.csv`
    axios.get(fileName).then((res)=>{
      this.allData = Papa.parse(res.data,{delimeter:','}).data
      this.captions = this.allData.shift() // get the key for each value
      this.clickButton(0)
    })
  },
  methods: {
    clickButton(idx){
      this.selBut = idx;
      this.barData = []
      this.allData.forEach((item)=>{
        this.barData.push(item.filter((elem,idx)=>{
          return this.SERIES_ID[this.selBut].includes(idx)
        }))
      })
      this.handleClear()
      console.log(idx)
    },
    handleClear(){
      d3.select("#barFig")
        .select("svg")
        .remove()
      this.createBar()
    },
    createBar(){
      const VARIANTS = this.SERIES_ID[this.selBut]
      const COLORS = d3.scaleOrdinal(d3.schemeAccent)
      const width = 1400;
      const height = 600;
      const padding = { top: 30, right: 60, bottom: 30, left: 60 }
      const contentWidth = width - padding.left - padding.right;
      const barWidth = 70;
      const spacing = 15;

      const x = d3
        .scaleBand()
        .range([0, contentWidth])
        .domain(Array.from(this.barData, (elem,idx) => idx+1)) // 设定比例尺的长度和对应的值域
      const y = d3
        .scaleLinear()
        .range([height - padding.top - padding.bottom, 0])
        .domain([0,100])

      let svgBar = d3
        .select("#barFig")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      svgBar
        .append("g")
        .classed("axis-x", true)
        .attr(
          "transform",
          `translate(${padding.left},${height - padding.bottom})`
        )
        .call(d3.axisBottom(x))
      // transform 为相对左边界和上边界的位置

      svgBar
        .append("g")
        .classed("axis-y", true) // 添加这个class，若为false则去掉这个class
        .attr("transform", `translate(${padding.left},${padding.bottom})`)
        .call(d3.axisLeft(y))
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("y", -40)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .text("percentage(%)")
        )

      let accumulated = Array.from({length:12}).map(()=>0)
      VARIANTS.forEach((ele,idx)=>{
        svgBar
        .append("g")
        .selectAll("rect")
        .data(this.barData)
        .enter()
        .append("rect")
        .attr("fill", COLORS(idx))
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(i+1) + spacing)
        .attr("y", (d,i) => y(d[idx])-accumulated[i])
        .attr("width", barWidth)
        .attr("height", (d,i) => { 
          let realHeight = height - padding.top - padding.bottom - y(d[idx])
          accumulated[i]+=realHeight
          console.log(accumulated)
          return realHeight
        })
        .on("click", (d, i) => {
          console.log(d, i)
        })
      })
      

      
      
      const lengend = g => {
        VARIANTS.forEach((ele,idx)=>{
          g.append("rect")
          .style("fill", COLORS(idx))
          .attr("x", idx*200)
          .attr("y", -5)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65+idx*200)
          .attr("y", () => 10)
          .text(this.captions[VARIANTS[idx]])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            "fill": "white",
            "font-weight": 600
          })
        })
      }

      svgBar
        .append("g")
        .attr("transform", "translate(100,10)")
        .call(lengend)
      
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  el-button{
    text-align: center;
    width: 100px;
    height: 50px;
  }
</style>
