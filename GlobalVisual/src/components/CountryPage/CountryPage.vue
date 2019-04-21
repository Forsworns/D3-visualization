<template>
  <div id="CountryPage">
    <div id="selects">
      <span>Country:</span>
      <el-select v-model="selectCountry" placeholder="country">
        <el-option v-for="(ky,val,idx) of countryMap" :key="idx" :label="ky" :value="val"></el-option>
      </el-select>

      <span>Year:</span>
      <el-select v-model="selectYear" placeholder="year">
        <el-option v-for="item in yearsName" :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </div>

    <div id="tables">
      <el-table
        ref="dataTable"
        v-on:filter-change="filterChange"
        :data="tableData"
        align="center"
        border
      >
        <el-table-column prop="CountryName" label="CountryName" width="160"></el-table-column>
        <el-table-column
          prop="SeriesName"
          label="SeriesName"
          width="160"
          :filters="seriesFilterMap"
          :filter-method="filterSeries"
          filter-placement="bottom-end"
        ></el-table-column>
        <el-table-column
          v-for="(ky,idx) in yearsShown"
          :key="idx"
          :prop="ky"
          :label="ky"
          width="160"
        ></el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="countryData.length"
      ></el-pagination>
    </div>
    <div id="paraCodi"></div>
  </div>
</template>

<script>
// 平行坐标图
import { mapState } from "vuex";

export default {
  name: "CountryPage",
  created() {
    this.$store.dispatch("readFromFile").then(() => {
      // return the Promise of axios to make sure the asyn done
      this.selectCountry = this.selectedCountry; // selected from last page
      this.updateCountry(this.selectCountry)
      this.yearsShown = this.yearsName.slice(1, this.yearsName.length)
    })
  },
  props: {
    selectedCountry: {
      type: String,
      default: "---"
    }
  },
  watch: {
    selectYear(val) {
      if (val !== "---") {
        this.yearsShown = [val];
      } else {
        this.yearsShown = this.yearsName.slice(1, this.yearsName.length)
      }
    },
    selectCountry(val) {
      this.updateCountry(val)
    },
    countryData(arr) {
      this.tableData = arr.slice(0, this.pageSize)
      this.currentPage = 1;
    },
    selectSeries(arr) {
      this.countryData = [...this.countryDataCopy];
      if (this.selectSeries.length !== 0) {
        this.countryData = this.countryDataCopy.filter(ele => {
          return arr.includes(ele.SeriesName)
        })
      }
      this.handleClear()
    }
  },
  data() {
    return {
      selectYear: "---", // code
      selectCountry: "---", // code
      selectSeries: [],
      currentPage: 1,
      pageSize: 5,
      pageSizes: [5, 10, 20, 40],
      countryData: [],
      countryDataCopy: [],
      tableData: [],
      yearsShown: [],
      parallel: [] // the svg figure
    }
  },
  computed: {
    ...mapState([
      "allData",
      "allDataObj",
      "parallelData",
      "seriesArr",
      "seriesMapInv",
      "seriesMap",
      "captionName",
      "yearsName",
      "countryMap",
      "seriesFilterMap"
    ])
  },
  methods: {
    handleClear() {
      this.$d3.select("#paraCodi")
        .select("svg")
		.remove()
      this.drawParaSvg()
    },
    filterChange(filter) {
      console.log(filter)
      this.selectSeries = Object.values(filter)[0]
    },
    updateCountry(val) {
      if (val === "---") {
        this.countryData = this.allData;
      } else {
        this.countryData = this.allData.filter(ele => {
          // or use the allDataObj[val]
          return ele.CountryCode === val;
        })
      }
      this.countryDataCopy = [...this.countryData];
      this.tableData = this.countryData.slice(0, this.pageSize)
      this.currentPage = 1;
      this.handleClear()
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.tableData = this.countryData.slice(0, this.pageSize)
    },
    handleCurrentChange(val) {
      const { pageSize, countryData } = { ...this.$data }
      this.currentPage = val;
      this.tableData = countryData.slice(
        (this.currentPage - 1) * pageSize,
        this.currentPage * pageSize
      )
    },
    filterSeries() {
      // this.selectSeries = this.$refs.dataTable.columns[1].filteredValue // the 0th row is the header
      // in fact, since we can directly get the filter by listening the event (see filterChange()),
      // we don't need this function any more!
      return true; // don't use the element-ui to filter since it doesn't consider the pagination
    },
    drawParaSvg() {
      const that = this;
      let parallelData = [];
      if (this.selectCountry === "---") {
        parallelData = [...this.parallelData];
      } else {
        parallelData = this.parallelData.filter(obj => {
          return obj.country === this.selectCountry;
        })
      }
      const keyz = "year"; // color encoding
      const keys = ["year"]; // the keys of each the parallel data
      if (this.selectSeries.length === 0) {
        // dynamically change the keys to be shown
        keys.push(...this.seriesArr.map(ele => this.seriesMapInv[ele]))
      } else {
        keys.push(...this.selectSeries.map(ele => this.seriesMapInv[ele]))
      }

      const width = 1280;
      const height = keys.length * 120;
      const margin = { top: 20, right: 10, bottom: 20, left: 10 }

      // biuld the scaleLinear functions for different keys
      const x = new Map(
        Array.from(
          keys,
          // x is a map [serieName : scaleAxis], d3.extent calculate the maximum and minimum
          key => [
            key,
            this.$d3.scaleLinear(this.$d3.extent(parallelData, d => d[key]), [
              margin.left,
              width - margin.right
            ])
          ]
        )
      )
      // build the y axis scale function consisting of keys
      const y = this.$d3.scalePoint(keys, [margin.top, height - margin.bottom])
      // strokeColor is a mapped color scale function built from data domain of the selected key
      const strokeColor = this.$d3.scaleSequential(
        x
          .get(keyz)
          .domain()
          .reverse(),
        this.$d3.interpolateBrBG
      )

      const paraSvg = this.$d3
        .select("#paraCodi")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "scale(1)")

      paraSvg
        .append("g") // group for paths
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(
          parallelData
            .slice()
            .sort((a, b) => this.$d3.ascending(a[keyz], b[keyz]))
        )
        .join("path")
        .attr("stroke", d => strokeColor(d[keyz])) // stroke directly set color
        .attr("stroke-opacity", 0.4)
        .attr("d", d =>
          this.$d3
            .line()
            .defined(([, value]) => value != null) // whether draw the line between two points
            .x(([key, value]) => x.get(key)(value)) // the [key, value] is from the "d", in fact it just iterates the "d" in a key-val format
            .y(([key]) => y(key))(
            this.$d3.cross(keys, [d], (key, d) => [key, d[key]])
          )
        ) // Cartesian product
        .append("title")
        .text(d => this.countryMap[d.country])

      paraSvg
        .append("g") // axis setting
        .selectAll("g")
        .data(keys)
        .join("g")
        .attr("transform", d => `translate(0,${y(d)})`)
        .each(function(d) {
          that.$d3.select(this).call(that.$d3.axisBottom(x.get(d)))
        })
        .call(g =>
          g
            .append("text")
            .attr("x", margin.left)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => {
              if (d !== "year") {
                return this.seriesMap[d];
              } else {
                return d;
              }
            })
        )
        .call(g =>
          g
            .selectAll("text")
            .clone(true)
            .lower()
            .attr("fill", "none")
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round") // use a round transition at the join point
            .attr("stroke", "white")
        )
    }
  }
}
</script>

<style lang="scss" scoped>
#CountryPage {
  text-align: center;
}
</style>
