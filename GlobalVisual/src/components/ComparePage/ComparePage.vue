<template>
  <div id="ComparePage">
    <el-row>
      <el-col :span="12">
        <div id="left">
          <span>Country:</span>
          <el-select v-model="selCtyLt" placeholder="country">
            <el-option v-for="(ky,val,idx) of countryMap" :key="idx" :label="ky" :value="val"></el-option>
          </el-select>
          <span>Series:</span>
          <el-select v-model="selSer" placeholder="series">
            <el-option
              v-for="(item,idx) of seriesFilterMap"
              :key="idx"
              :label="item.text"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div id="figLt"></div>
      </el-col>
      <el-col :span="12">
        <div id="right">
          <span>Country:</span>
          <el-select v-model="selCtyRt" placeholder="country">
            <el-option v-for="(ky,val,idx) of countryMap" :key="idx" :label="ky" :value="val"></el-option>
          </el-select>
          <span>Series:</span>
          <el-select v-model="selSer" placeholder="series">
            <el-option
              v-for="(item,idx) of seriesFilterMap"
              :key="idx"
              :label="item.text"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div id="figRt"></div>
      </el-col>
    </el-row>
    <div id="figBot"></div>
  </div>
</template>

<script>
//柱状图比较，同时要加上平均值的部分对比；底部一个折线图
import { mapState } from "vuex";

export default {
  name: "ComparePage",
  created() {
    this.$store.dispatch("readFromFile").then(() => {
      this.selSer = this.selectedSerie;
      if (this.selectedCountries.length >= 1) {
        this.selCtyLt = this.selectedCountries[0];
        if (this.selectedCountries.length >= 2) {
          this.selCtyRt = this.selectedCountries[1];
        }
      }
      if (this.selCtyLt !== "---" && this.selSer !== "---") {
        this.drawLtSvg()
      }
      if (this.selCtyRt !== "---" && this.selSer !== "---") {
        this.drawRtSvg()
      }
    })
  },
  data() {
    return {
      selCtyLt: "---",
      selCtyRt: "---",
      selSer: "---",
      dataLeft: [],
      dataRight: []
      // dataBottom: [], // in fact is left + right
    }
  },
  props: {
    selectedCountries: {
      type: Array,
      default: () => ["chn", "chn"]
    },
    selectedSerie: {
      type: String,
      default: "GDP growth (annual %)"
    }
  },
  watch: {
    selCtyLt() {
      this.handleClear(true, false)
    },
    selCtyRt() {
      this.handleClear(false, true)
    },
    selSer() {
      this.handleClear(true, true)
    }
  },
  computed: {
    ...mapState([
      "countryMap",
      "seriesFilterMap",
      "processedDataObj",
      "dataMean",
      "dataMax",
      "dataMin",
      "yearsName",
      "seriesMapInv"
    ])
  },
  methods: {
    handleClear(figLt, figRt) {
      if (figLt) {
        this.$d3
          .select("#figLt")
          .select("svg")
          .remove()
        this.drawLtSvg()
      }
      if (figRt) {
        this.$d3
          .select("#figRt")
          .select("svg")
          .remove()
        this.drawRtSvg()
      }

      this.$d3
        .select("#figBot")
        .select("svg")
        .remove()
      this.drawBotSvg()
    },
    drawLtSvg() {
      // bar-chart
      const selSerLt = this.seriesMapInv[this.selSer];
      const years = this.yearsName.slice(1)

      this.dataLeft = years.map(y =>
        parseFloat(
          this.processedDataObj[this.selCtyLt][this.seriesMapInv[this.selSer]][
            y
          ]
        )
      )

      const width = 600;
      const height = 600;
      const padding = { top: 30, right: 60, bottom: 30, left: 60 }
      const contentWidth = width - padding.left - padding.right;
      const barWidth = 70;
      const spacing = 15;

      const x = this.$d3
        .scaleBand()
        .range([0, contentWidth])
        .domain(years) // 设定比例尺的长度和对应的值域
      const y = this.$d3
        .scaleLinear()
        .range([height - padding.top - padding.bottom, 0])
        .domain([
          this.$d3.min(this.dataMin[selSerLt]),
          this.$d3.max(this.dataMax[selSerLt])
        ])

      let svgLeft = this.$d3
        .select("#figLt")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      svgLeft
        .append("g")
        .classed("axis-x", true)
        .attr(
          "transform",
          `translate(${padding.left},${height - padding.bottom})`
        )
        .call(this.$d3.axisBottom(x))
      // transform 为相对左边界和上边界的位置

      svgLeft
        .append("g")
        .classed("axis-y", true) // 添加这个class，若为false则去掉这个class
        .attr("transform", `translate(${padding.left},${padding.bottom})`)
        .call(this.$d3.axisLeft(y))
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("y", -40)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .text(this.selSer)
        )

      svgLeft
        .append("g")
        .selectAll("rect")
        .data(this.dataLeft)
        .enter()
        .append("rect")
        .attr("fill", "rgb(0,0,255)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", d => height - padding.top - padding.bottom - y(d))
        .on("click", (d, i) => {
          console.log(d, i)
        })

      svgLeft
        .append("g")
        .selectAll("rect")
        .data(this.dataMean[selSerLt])
        .enter()
        .append("rect")
        .attr("fill", "rgb(255,0,0)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", d => height - padding.top - padding.bottom - y(d))
        .on("click", (d, i) => {
          console.log(d, i)
        })

      svgLeft
        .append("g")
        .selectAll("rect")
        .data(this.dataLeft)
        .enter()
        .append("rect")
        .attr("fill", "rgb(0,0,255)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", (d, i) => {
          if (d > this.dataMean[selSerLt][i]) {
            return 0;
          } else {
            return height - padding.top - padding.bottom - y(d)
          }
        })
        .on("click", (d, i) => {
          console.log(d, i)
        })

      const lengend = g => {
        g.append("rect")
          .style("fill", "rgb(255,0,0)")
          .attr("x", 0)
          .attr("y", -5)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 5)
          .text("mean")
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })

        g.append("rect")
          .style("fill", "rgb(0,0,255)")
          .attr("x", 0)
          .attr("y", 20)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 35)
          .text(this.countryMap[this.selCtyLt])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })
      }

      svgLeft
        .append("g")
        .attr("transform", "translate(340,10)")
        .call(lengend)
    },
    drawRtSvg() {
      const selSerRt = this.seriesMapInv[this.selSer];
      const years = this.yearsName.slice(1)
      this.dataRight = years.map(y =>
        parseFloat(
          this.processedDataObj[this.selCtyRt][this.seriesMapInv[this.selSer]][
            y
          ]
        )
      )
      const width = 600;
      const height = 600;
      const padding = { top: 30, right: 60, bottom: 30, left: 60 }
      const contentWidth = width - padding.left - padding.right;
      const barWidth = 70;
      const spacing = 15;

      const x = this.$d3
        .scaleBand()
        .range([0, contentWidth])
        .domain(years) // 设定比例尺的长度和对应的值域
      const y = this.$d3
        .scaleLinear()
        .range([height - padding.top - padding.bottom, 0])
        .domain([
          this.$d3.min(this.dataMin[selSerRt]),
          this.$d3.max(this.dataMax[selSerRt])
        ])

      let svgRight = this.$d3
        .select("#figRt")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      svgRight
        .append("g")
        .classed("axis-x", true)
        .attr(
          "transform",
          `translate(${padding.left},${height - padding.bottom})`
        )
        .call(this.$d3.axisBottom(x))
      // transform 为相对左边界和上边界的位置

      svgRight
        .append("g")
        .classed("axis-y", true) // 添加这个class，若为false则去掉这个class
        .attr("transform", `translate(${padding.left},${padding.bottom})`)
        .call(this.$d3.axisLeft(y))
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("y", -40)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .text(this.selSer)
        )

      svgRight
        .append("g")
        .selectAll("rect")
        .data(this.dataRight)
        .enter()
        .append("rect")
        .attr("fill", "rgb(0,0,255)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", d => height - padding.top - padding.bottom - y(d))
        .on("click", (d, i) => {
          console.log(d, i)
        })

      svgRight
        .append("g")
        .selectAll("rect")
        .data(this.dataMean[selSerRt])
        .enter()
        .append("rect")
        .attr("fill", "rgb(255,0,0)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", d => height - padding.top - padding.bottom - y(d))
        .on("click", (d, i) => {
          console.log(d, i)
        })

      svgRight
        .append("g")
        .selectAll("rect")
        .data(this.dataRight)
        .enter()
        .append("rect")
        .attr("fill", "rgb(0,0,255)")
        .attr("class", "my-rect")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("x", (d, i) => x(years[i]) + spacing)
        .attr("y", d => y(d)) // d is a [key-value] type
        .attr("width", barWidth)
        .attr("height", (d, i) => {
          if (d > this.dataMean[selSerRt][i]) {
            return 0;
          } else {
            return height - padding.top - padding.bottom - y(d)
          }
        })
        .on("click", (d, i) => {
          console.log(d, i)
        })

      const lengend = g => {
        g.append("rect")
          .style("fill", "rgb(255,0,0)")
          .attr("x", 0)
          .attr("y", -5)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 5)
          .text("mean")
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })

        g.append("rect")
          .style("fill", "rgb(0,0,255)")
          .attr("x", 0)
          .attr("y", 20)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 35)
          .text(this.countryMap[this.selCtyRt])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })
      }

      svgRight
        .append("g")
        .attr("transform", "translate(340,10)")
        .call(lengend)
    },
    drawBotSvg() {
      // multi-line
      const years = this.yearsName.slice(1)
      const width = 1200;
      const height = 600;
      const padding = { top: 30, right: 30, bottom: 30, left: 30 }
      const contentWidth = width - padding.left - padding.right;
      const spacing = width / years.length / 2;

      const x = this.$d3
        .scaleBand()
        .range([0, contentWidth])
        .domain(years) // 设定比例尺的长度和对应的值域
      const y = this.$d3
        .scaleLinear()
        .range([height - padding.top - padding.bottom, 0])
        .domain([
          this.$d3.min(this.dataMin[this.seriesMapInv[this.selSer]]),
          this.$d3.max(this.dataMax[this.seriesMapInv[this.selSer]])
        ])
        .nice()

      let line = this.$d3
        .line()
        .defined(d => !isNaN(d)) // define a filter
        .x((d, i) => x(years[i]))
        .y(d => y(d))

      let svgBottom = this.$d3
        .select("#figBot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      svgBottom
        .append("g")
        .classed("axis-x", true)
        .attr(
          "transform",
          `translate(${padding.left},${height - padding.bottom})`
        )
        .call(this.$d3.axisBottom(x))

      svgBottom
        .append("g")
        .classed("axis-y", true) // 添加这个class，若为false则去掉这个class
        .attr("transform", `translate(${padding.left},${padding.bottom})`)
        .call(this.$d3.axisLeft(y))
        .call(g =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("y", -4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .text(this.selSer)
        )

      svgBottom
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "rgb(0,0,255)")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr(
          "transform",
          `translate(${padding.left + spacing},${padding.top})`
        ) // move the group
        .selectAll("path")
        .data([{ country: this.selCtyLt, values: this.dataLeft }])
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values))

      svgBottom
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "rgb(0,255,0)")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr(
          "transform",
          `translate(${padding.left + spacing},${padding.top})`
        ) // move the group
        .selectAll("path")
        .data([{ country: this.selCtyRt, values: this.dataRight }])
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values))

      svgBottom
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "rgb(255,0,0)")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr(
          "transform",
          `translate(${padding.left + spacing},${padding.top})`
        ) // move the group
        .selectAll("path")
        .data([
          {
            country: "average",
            values: this.dataMean[this.seriesMapInv[this.selSer]]
          }
        ])
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.values))

      const lengend = g => {
        g.append("rect")
          .style("fill", "rgb(255,0,0)")
          .attr("x", 0)
          .attr("y", -5)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 5)
          .text("mean")
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })

        g.append("rect")
          .style("fill", "rgb(0,0,255)")
          .attr("x", 0)
          .attr("y", 20)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 35)
          .text(this.countryMap[this.selCtyLt])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })

        g.append("rect")
          .style("fill", "rgb(0,255,0)")
          .attr("x", 0)
          .attr("y", 45)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => 65)
          .attr("y", () => 65)
          .text(this.countryMap[this.selCtyRt])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            fill: "white",
            "font-weight": 600
          })
      }

      svgBottom
        .append("g")
        .attr("transform", "translate(340,10)")
        .call(lengend)
    }
  }
}
</script>

<style lang="scss" scoped>
.my-rect {
  cursor: pointer;
}
</style>
