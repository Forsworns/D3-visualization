<template>
  <div id="GlobalPage">
    <el-row>
      <el-col :span="16">
        <div id="globalMap"></div>
        <div id="selectedCountry">
          Selected Countries are:
          <el-tag
            v-for="(cty,idx) in selectedCountries"
            :key="idx"
            type="danger"
          >{{countryMap[cty]}}</el-tag>
          <el-tag @click="handleClear(selectedSerie)">clear</el-tag>
        </div>
        <div id="infoTypeButtons">
          <el-button
            v-for="(val,idx) in seriesArr"
            :key="idx"
            :type="selectedSerie===idx?'success':'primary'"
            @click="selectType(idx)"
          >{{val}}</el-button>
        </div>
        <div id="gotoButtons">
          <el-button type="warning">
            <router-link
              :to="{name: 'Country', params: { selectedCountry: selectedCountries[0] }}"
            >Details</router-link>
          </el-button>
          <el-button type="warning">
            <router-link
              :to="{name: 'Compare', params: { selectedCountries: selectedCountries, selectedSerie:seriesArr[selectedSerie]}}"
            >Comparison</router-link>
          </el-button>
        </div>
      </el-col>
      <el-col :span="8">
        <div id="figBar"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//饼图（选中国家和全球比例）
import { mapState } from "vuex";
import worldGeoData from "@/assets/geo/worldMap.json";
// directly use the world map data is easier than the dynamically import different countries

export default {
  name: "GlobalPage",
  created() {
    this.$store.dispatch("readFromFile").then(() => {
      this.copyCountryMap()
      this.queryGeoData().then(res => {
        // another way, now it is of no use, should remove
        res.forEach((ele, idx) => {
          Object.assign(this.geoData, this.geoData, {
            [Object.keys(this.countryMapCopy)[idx]]: ele.default
          })
        })
      })
      import("@/assets/geo/worldMap.json").then(res => {
        this.worldGeoData = res;
        this.drawGeoSvg(this.selectedSerie)
      })
    })
  },
  data() {
    return {
      selectedSerie: 0,
      countries: [], // the svg figure
      selectedCountries: [],
      worldGeoData: {},
      geoData: {}, // another way to implement world map, delete in the future
      countryMapCopy: {}, // for geoData
      touchedCountry: ""
    }
  },
  computed: {
    ...mapState([
      "allData",
      "processedDataObj",
      "dataMean",
      "dataMin",
      "dataMax",
      "captionName",
      "seriesArr",
      "seriesMapInv",
      "countryMap",
      "yearsName"
    ])
  },
  watch: {
    selectedSerie(val) {
      this.handleClear(val)
    },
    touchedCountry(val) {
      this.drawBarSvg(val)
    }
  },
  methods: {
    handleClear(val) {
      this.selectedCountries.splice(0, this.selectedCountries.length)
      this.$d3
        .select("#globalMap")
        .select("svg")
        .remove()
      this.drawGeoSvg(val)
    },
    computeColor(d, color, serCode, years) {
      const ctyName = d.properties.A3.toLowerCase()
      let val = 0;
      if (
        Object.keys(this.processedDataObj).includes(ctyName) &&
        Object.keys(this.processedDataObj[ctyName]).includes(serCode)
      ) {
        for (let y of years) {
          val += parseFloat(this.processedDataObj[ctyName][serCode][y])
        }
        val = val / years.length;
      }
      return color(val)
    },
    copyCountryMap() {
      let countryMap = {}
      Object.assign(countryMap, countryMap, this.countryMap)
      // delete the country doesn't exist (whether there exists a better way?
      delete countryMap["---"]; //for geoData (json reading)
      delete countryMap.tmp;
      delete countryMap.zar;
      delete countryMap.ado;
      delete countryMap.chi;
      delete countryMap.ksv;
      delete countryMap.wbg;
      delete countryMap.imy;
      delete countryMap.rom;
      Object.assign(this.countryMapCopy, countryMap, countryMap)
    },
    selectType(idx) {
      this.selectedSerie = idx;
    },
    queryGeoData() {
      // load the geo json dynamically
      let promises = [];
      for (let cty in this.countryMapCopy) {
        promises.push(import(`@/assets/geo/${cty}.geo.json`))
      }
      return Promise.all(promises) // wait until all of them end up
    },
    drawBarSvg(cty) {
      this.$d3
        .select("#figBar")
        .select("svg")
        .remove()
      if (cty !== "") {
        const serName = this.seriesArr[this.selectedSerie];
        const serCode = this.seriesMapInv[serName];
        const years = this.yearsName.slice(1)
        let ctyData = years.map(ele =>
          parseFloat(this.processedDataObj[this.touchedCountry][serCode][ele])
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
            this.$d3.min(this.dataMin[serCode]),
            this.$d3.max(this.dataMax[serCode])
          ])

        let svgBar = this.$d3
          .select("#figBar")
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
          .call(this.$d3.axisBottom(x))
        // transform 为相对左边界和上边界的位置

        svgBar
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
              .text(serName)
          )

        svgBar
          .append("g")
          .selectAll("rect")
          .data(ctyData)
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

        svgBar
          .append("g")
          .selectAll("rect")
          .data(this.dataMean[serCode])
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

        svgBar
          .append("g")
          .selectAll("rect")
          .data(ctyData)
          .enter()
          .append("rect")
          .attr("fill", "rgb(0,0,255)")
          .attr("class", "my-rect")
          .attr("transform", `translate(${padding.left},${padding.top})`)
          .attr("x", (d, i) => x(years[i]) + spacing)
          .attr("y", d => y(d)) // d is a [key-value] type
          .attr("width", barWidth)
          .attr("height", (d, i) => {
            if (d > this.dataMean[serCode][i]) {
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
            .text(this.countryMap[this.touchedCountry])
            .style({
              "font-size": "10px",
              "text-anchor": "middle",
              fill: "white",
              "font-weight": 600
            })
        }

        svgBar
          .append("g")
          .attr("transform", "translate(340,10)")
          .call(lengend)
      }
    },
    drawGeoSvg(selectedSerie) {
      let that = this;
      const serCode = this.seriesMapInv[this.seriesArr[selectedSerie]];
      const years = this.yearsName.slice(1, this.yearsName.length)
      let statisticData = [];
      for (let ky in this.processedDataObj) {
        let obj = this.processedDataObj[ky];
        if (obj[serCode] !== undefined) {
          for (let y of years) {
            statisticData.push(obj[serCode][y])
          }
        }
      }

      const width = 1280;
      const height = 500;
      const svgGeo = this.$d3
        .select("#globalMap")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
      const groups = svgGeo.append("g")

      const projection = this.$d3
        .geoEquirectangular()
        .scale(150)
        .translate([500, 300])

      const path = this.$d3.geoPath().projection(projection)

      // this.$d3.extent(statisticData) == [this.$d3.min(statisticData),this.$d3.max(statisticData)]
      const color = this.$d3.scaleQuantize(
        this.$d3.extent(statisticData),
        this.$d3.schemeBlues[9]
      )

      const legend = g => {
        const x = this.$d3
          .scaleLinear()
          .domain(this.$d3.extent(color.domain()))
          .rangeRound([0, 500])

        g.selectAll("rect") // fill the legend rect
          .data(color.range().map(d => color.invertExtent(d)))
          .join("rect")
          .attr("height", 30)
          .attr("x", d => x(d[0]))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("fill", d => color(d[0]))

        g.append("text") // serie name on the legend
          .attr("x", x.range()[0]) // position
          .attr("y", -6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text(this.seriesArr[selectedSerie])

        g.call(
          this.$d3
            .axisBottom(x) // fill the axis of the lengend
            .tickSize(30)
            .tickFormat(d => this.$d3.format(".3")(d))
            .tickValues(color.range().map(d => color.invertExtent(d)[0]))
        )

        g.select(".domain") // remove the upper border (in fact, the domain)
          .remove()
      }

      svgGeo
        .append("g")
        .attr("transform", "translate(400,30)")
        .call(legend)

      let tooltip = this.$d3
        .select("body") // absolute相对父级对象
        .append("div") // 悬浮框
        .classed("tooltip", true)

      this.countries = groups
        .selectAll("path")
        .data(worldGeoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", d => this.computeColor(d, color, serCode, years))
        .on("click", function(d) {
          // to use "this" inner the function, we can't use lambda anymore!
          // and remember to use "that" to replace the outter "this"
          if (!that.selectedCountries.includes(d.properties.A3.toLowerCase())) {
            that.selectedCountries.push(d.properties.A3.toLowerCase())
            that.$d3.select(this).style("fill", "orange")
          } else {
            that.selectedCountries.splice(
              that.selectedCountries.indexOf(d.properties.A3.toLowerCase()),
              1
            )
            that.$d3
              .select(this)
              .style("fill", d => that.computeColor(d, color, serCode, years))
          }
        })
        .on("mouseover", function(d) {
          // 边框突出
          that.$d3.select(this).style("fill", "red")

          // 悬浮框
          that.touchedCountry = d.properties.A3.toLowerCase()
          let obj = that.processedDataObj[that.touchedCountry][serCode];
          if (obj !== undefined) {
            let content = "";
            years.forEach(y => (content += `${y}: ${obj[y]}<br>`))
            tooltip
              .html(content)
              .transition()
              .duration(500)
              .style("left", `${that.$d3.event.pageX}px`)
              .style("top", `${that.$d3.event.pageY}px`)
              .style("opacity", 1.0)
          }
          return d;
        })
        .on("mouseout", function(d) {
          tooltip.transition().style("opacity", 0)
          if (that.selectedCountries.includes(d.properties.A3.toLowerCase())) {
            that.$d3.select(this).style("fill", "orange")
          } else {
            that.$d3
              .select(this)
              .style("fill", d => that.computeColor(d, color, serCode, years))
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#GlobalPage {
  a {
    text-decoration: none;
  }

  .router-link-active {
    text-decoration: none;
  }

  div {
    margin: 30px 0;
  }
}
</style>

<style lang="scss">
.tooltip {
  position: absolute;
  text-align: left;
  height: auto;
  font-family: simsun;
  font-size: 14px;
  border-style: solid;
  border-width: 1px;
  background-color: white;
  border-radius: 5px;
}
</style>