<template>
  <div id="IndexPage">
    <el-row>
      <el-col :span="18">
        <el-row>
          <el-col :span="12">
            <div id="ChinaMap">
              <div id="MapLengend"></div>
              <div id="MapContent"></div>
            </div>
          </el-col>
          <el-col :span="12">
            <div id="PieFig">
              <el-select v-model="selectedSerie">
                <el-option
                  v-for="(item,idx) in series"
                  :key="idx"
                  :label="item"
                  :value="idx">
                </el-option>
              </el-select>
            </div>
          </el-col>
          
        </el-row>
        <el-row>
          <el-col :span="12">
            <div id="WordFig">
            </div>
          </el-col>
          <el-col :span="12">
            <div id="ForceFig"></div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="6">
        <h1>谁会成为委员</h1>
        <h2>中国共产党第十九届中央委员会委员名单分析</h2>
        <p>在左侧上方的中国地图中，是中国共产党第十九届中央委员会委员们的家乡分布图。地图上颜色越深的省份委员人数越多。
          可以看到，委员们大多来自沿海地区或中原腹地。其中山东省是培养委员会委员的核心省份，是30名委员的家乡；
          而江苏省紧随其后，有20名委员出生于此。同时没有一名委员出生于海南、青海、天津或台湾，可能是人口基数较小的原因，
          也说明未来有较大上升潜力。总之如果你出生在山东或江苏，那么首先恭喜你，委员会中有很多你的老乡！</p>
        <p>而下方的热词词云图中，我们可以看到“书记”是委员们履历中出现最频繁的一个词，类似的“党组书记”，“党委书记”，也是频繁出现的词语。
          各级党政机关的书记们，可能就有很多未来的委员会委员。
          令人意外的是本届委员会中，虽然只有一位委员来自西藏自治区，但是在委员们的履历中，“西藏自治区”也是频繁出现的热词，类似的热词还有“青海”。
          所以想要成为一名委员，多多到祖国的边疆进行锻炼吧。除此与外，“中央党校”、“研究生”、“研究所”、“学院”也是热词，学习真的很重要。</p>
        <p>在右上方的环形图中，我们可以查看委员会人员构成的详细信息。比如切换到民族选项，我们可以看到，委员会中有188名汉族委员。
          同时一半的委员都是人文社科专业出身，剩下的则有军事背景，只有极少数是自然科学或工程师出身，所以是否读工科要谨慎考虑！
          英雄不问出身，委员的毕业院校也各不相同，C9高校仅占了39人，军校或党校也仅占47人。当然在左侧地图切换省份后，也可以查看某个省份的详细信息。</p>
        <p>右下方是我们的最后一张图，这是一个力导向图，每位委员用一个圆形表示，年龄越大，圆形颜色越深；履历越丰富，圆形半径越大。
          一个省份的委员被连在了一起，我们可以看到，基本每个省份的圆，大小和颜色还是很均匀的，都有老资历的委员，也有一些年轻新秀。
          大而深的圆形都是本省的知名人物，所以与年龄正比的丰富履历也是委员的加分项。</p>
        <p>总之如果你出生在山东，大学读的是人文社科专业，有着丰富的书记任职经验，恭喜你，可能下一位委员就是你= =(本预测仅供数据可视化学习交流，对结果不负任何责任)。</p> 
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex"
import cloud from '@/utils/d3-cloud.js'
import frequency from '../python/frequency.json'

export default {
  name: "IndexPage",
  created() {
    this.$store.dispatch("initialize").then(() => {
      this.allMember = Array.from({length:this.csvData.length}).map((ele,idx)=>idx)
      this.drawGeoSvg()
      this.drawPieSvg()
      this.drawForceSvg()
      this.drawWordSvg()
    });
  },
  data() {
    return {
      touchedProvince: "",
      selectedProvince: null,
      selectedSerie: 0,
      allMember: [],
      chinaMap: null,
      series: ['campus','nations','educations','years'],
    }
  },
  computed: {
    ...mapState([
      "csvData",
      "captionName",
      "provinces",
      "provinceMember",
      "educations",
      "educationMember",
      "years",
      "yearMember",
      "nations",
      "nationMember",
      "campus",
      "campusMember",
      "geoData"
    ])
  },
  watch: {
    selectedSerie(){
      this.handleClear()
    },
    selectedProvince(){
      if(this.selectedProvince){
        this.allMember = this.provinceMember[this.selectedProvince["_groups"][0][0]["__data__"].properties.name]
      }else{
        this.allMember = Array.from({length:this.csvData.length}).map((ele,idx)=>idx)
      }
      this.handleClear()
    }
  },
  methods: {
    handleClear() {
      this.$d3
        .select("#PieFig")
        .select("svg")
        .remove()
      this.$d3
        .select("#ForceFig")
        .select("svg")
        .remove()
      this.drawPieSvg()
      this.drawForceSvg()
    },
    drawWordSvg(){
      const width = 770
      const height = 500
      const freqVals = frequency.map(ele=>ele['value'])
      const fontSize = this.$d3.scaleLinear(this.$d3.extent(freqVals),[30,100])
      const color = freq => this.$d3.interpolateGreens(this.$d3.scaleLinear(this.$d3.extent(freqVals),[0.4,1])(freq))
      let wordSvg = this.$d3.select("#WordFig").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      let layout = cloud()
        .size([width, height])
        .words(frequency)
        .padding(5)
        .rotate(() => Math.random() * 180 - 90) // minus 90 incase updown
        .font("Impact")
        .fontSize(d => fontSize(d.value))
        .on("end", (words)=>{
          wordSvg
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .attr("fill",d=>(color(d.value)))
              .style("font-size", d=>fontSize(d.value) + "px")
              .style("font-family", "Impact")
              .attr("text-anchor", "middle")
              .attr("transform", d=>
                "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
              )
              .text(function(d) { return d.text })
        })
      layout.start()
    },
    computeColor(d, color) {
      const prvc = d.properties.name;
      return color(this.provinceMember[prvc].length+3.4); // same as "attr("x", d => x(d[0]-3.3))", to control the color
    },
    drawGeoSvg() {
      let that = this
      let statisticData = Object.values(this.provinceMember).map(
        ele => ele.length
      )
      const color = this.$d3.scaleQuantize(
        this.$d3.extent(statisticData),
        this.$d3.schemeBlues[9]
      )

      // legend
      const legend = g => {
        const x = this.$d3
          .scaleLinear()
          .domain(this.$d3.extent(color.domain()))
          .rangeRound([0, 500]);

        g.selectAll("rect") // fill the legend rect
          .data(color.range().map(d => color.invertExtent(d)))
          .join("rect")
          .attr("height", 30)
          .attr("x", d => x(d[0]-3.3))
          .attr("width", d => x(d[1]) - x(d[0]))
          .attr("fill", d => color(d[0]));

        g.append("text") // serie name on the legend
          .attr("x", x.range()[0]) // position
          .attr("y", -6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("font-size","14px")
          .text("省内委员数目");

        g.call(
          this.$d3
            .axisBottom(x) // fill the axis of the lengend
            .tickSize(30)
            .tickFormat(d => this.$d3.format("2d")(d))
            .tickValues(color.range().map(d => color.invertExtent(d)[0]))
        );

        g.select(".domain") // remove the upper border (in fact, the domain)
          .remove();
      };

      this.$d3
        .select("#MapLengend")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", "translate(200,40)")
        .call(legend);

      // map
      const svgGeo = this.$d3
        .select("#MapContent")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")

      const groups = svgGeo.append("g")
    
      let zoom = this.$d3.zoom()
        .scaleExtent([0.1,5])
        .on("zoom",()=>{
          groups.attr('transform', `translate(${this.$d3.event.transform.x},${this.$d3.event.transform.y})scale(${this.$d3.event.transform.k})`)
        })
      svgGeo.call(zoom)

      const projection = this.$d3
        .geoEquirectangular()
        .scale(500)
        .translate([-500, 500]);

      const path = this.$d3.geoPath().projection(projection);

      let tooltip = this.$d3
        .select("body") // absolute相对父级对象
        .append("div") // 悬浮框
        .classed("tooltip", true);

      this.chinaMap = groups
        .selectAll("path")
        .data(this.geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", d => this.computeColor(d, color))
        .on("click", function() {
          if (that.selectedProvince === null) {
            that.selectedProvince = that.$d3.select(this);
            that.$d3.select(this).style("fill", "orange");
          } else if (
            that.selectedProvince["_groups"][0][0]["__data__"].properties
              .name !==
            that.$d3.select(this)["_groups"][0][0]["__data__"].properties.name
          ) {
            that.selectedProvince.style("fill", d =>
              that.computeColor(d, color)
            );
            that.selectedProvince = that.$d3.select(this);
            that.$d3.select(this).style("fill", "orange");
          } else {
            that.selectedProvince.style("fill", d =>
              that.computeColor(d, color)
            );
            that.selectedProvince = null;
          }
        })
        .on("mouseover", function(d) {
          // 边框突出
          that.$d3.select(this).style("fill", "red")
          // 悬浮框
          let prvc = d.properties.name
          tooltip
            .html(`${prvc}委员数目: ${that.provinceMember[prvc].length}`)
            .transition()
            .duration(500)
            .style("left", `${that.$d3.event.pageX}px`)
            .style("top", `${that.$d3.event.pageY}px`)
            .style("opacity", 1.0)
          that.touchedProvince = prvc
          return d;
        })
        .on("mouseout", function() {
          tooltip.transition().style("opacity", 0)
          if (that.selectedProvince!==null && that.selectedProvince["_groups"][0][0]["__data__"].properties
              .name ===
            that.$d3.select(this)["_groups"][0][0]["__data__"].properties.name) {
            that.$d3.select(this).style("fill", "orange")
          } else {
            that.$d3
              .select(this)
              .style("fill", d => that.computeColor(d, color))
          }
        })
    },
    drawPieSvg(){
      const width = 400
      const height = 400
      const memberDatas = [this.campusMember,this.nationMember,this.educationMember,this.yearMember]
      const dataKeys = [this.campus, this.nations, this.educations, this.years]
      let pie = this.$d3.pie() // pie data generator
      let color = this.$d3.schemeSet3
      let pieSvg = this.$d3.select('#PieFig')
        .append('svg')
        .attr('width',width+100)
        .attr('height',height+50)
      let g = pieSvg.append('g')
        .attr('transform',`translate(${width/2+50},${height/2+50})`)
      
      let oR = height/2
      let iR = height/3
      let path = this.$d3.arc()
        .innerRadius(iR)
        .outerRadius(oR)

      // iterate the selected province and serie, find the intersection
      let pieData = pie(Object.values(memberDatas[this.selectedSerie]).map(item=>{
          let memberNum = 0
          this.allMember.forEach(m=>{
            if(item.includes(m)){
              memberNum++
            }
          })
          return memberNum
        }))

      let arc = g.selectAll('arc')
        .data(pieData)
        .enter()
        .append('g')

      arc.append('path')
        .attr('d',path)
        .attr('fill',(d,i)=>color[i])

      arc.append('text')
        .attr('transform',d=>`translate(${path.centroid(d)})`)
        .attr('dy','0em')
        .text(d=>{
          if(d.value!==0){
            return d.value
          }
        })

      const lengend = g => {
        dataKeys[this.selectedSerie].forEach((ele,idx)=>{
          g.append("rect")
          .style("fill", color[idx])
          .attr("x", idx*120-90)
          .attr("y", 0)
          .attr("rx", "10")
          .attr("ry", "10")
          .attr("width", 50)
          .attr("height", 20)
        g.append("text")
          .attr("x", () => idx*120-40)
          .attr("y", () => 15)
          .text(dataKeys[this.selectedSerie][idx])
          .style({
            "font-size": "10px",
            "text-anchor": "middle",
            "fill": "white",
            "font-weight": 600
          })
        })
      }

      pieSvg
        .append("g")
        .attr("transform", "translate(100,10)")
        .call(lengend)
    },
    drawForceSvg(){
      let that = this
      const width = 750
      const height = 500
      const csvData = this.csvData
      let nodes = ([...this.allMember]).map(order=>({'order':order, name: csvData[order]['姓名'], 'age':csvData[order]['年龄'], 'times': csvData[order]['履历'].length, 'home': csvData[order]['省份']})) 
      let forceSimulation = this.$d3.forceSimulation()
        .force("link",this.$d3.forceLink())
        .force("charge",this.$d3.forceManyBody())
        .force("center",this.$d3.forceCenter())
        .force("circle",this.$d3.forceCollide(10))
      let nodesForce = forceSimulation.nodes(nodes)

      let edges = [] 
      // build edges according to hometown
      let idx = 0
      for(let p1 of nodes){
        for(let p2 of nodes){
          if(p1.order===p2.order){
            continue
          }else{
            if(p1.home === p2.home){
              edges.push({source:p1.index,target:p2.index,value:1,index:idx})
              idx++
            }
          }
        }
      }
      const ages = nodes.map(ele=>ele.age)
      const times = nodes.map(ele=>ele.times) 
      let color = a => this.$d3.interpolateGreens(this.$d3.scaleLinear(this.$d3.extent(ages),[0.5,1])(a)) // 年纪大的颜色深
      let radius = this.$d3.scaleLinear(this.$d3.extent(times), [10,50]) // 履历丰富的形状大

      let forceSvg = this.$d3.select("#ForceFig")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
      let g = forceSvg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      
      forceSimulation.force("link")
        .links(edges)
        .distance(d=>d.value*100)
      forceSimulation.force("center")
        .x(width/2)
        .y(height/2)
      
      // we should draw links first, then draw the nodes!
      let links = g.append("g")
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke",(d,i)=>color(i))
        .attr("stroke-width",1)
      let circles = g.selectAll(".circleText")
        .data(nodes)
        .enter()
        .append("g")
        .attr("transform",d=>`translate(${d.x},${d.y})`)
        .call(this.$d3.drag()
          .on("start",(d)=>{
            if(this.$d3.event.active){
              forceSimulation.alphaTarget(0.8).restart()
              d.fx = d.x
              d.fy = d.y
            }
          })
          .on("drag",(d)=>{
            d.fx = this.$d3.event.x
            d.fy = this.$d3.event.y
          })
          .on("end",(d)=>{
            if(!this.$d3.event.active){
              forceSimulation.alphaTarget(0)
            }
            d.fx = null
            d.fy = null
          })
        )
      let colorLast = "", prvc = "", prvcId = 0
      circles.append("circle")
        .attr("r",d=>radius(d.times))
        .attr("fill",d=>color(d.age))
        .on("mouseover", function(d) {
          // 边框突出
          // 悬浮框
          prvc = d.home
          prvcId = that.provinces.indexOf(prvc)
          // 这里直接这么写太暴力了
          colorLast = that.chinaMap._groups[0][prvcId].style.fill
          that.chinaMap._groups[0][prvcId].style.fill = "red"
          tooltip
            .html(`${prvc}委员数目: ${that.provinceMember[prvc].length}`)
            .transition()
            .duration(500)
            .style("left", `${that.$d3.event.pageX}px`)
            .style("top", `${that.$d3.event.pageY}px`)
            .style("opacity", 1.0)
          that.touchedProvince = prvc
          return d;
        })
        .on("mouseout", function() {
          tooltip.transition().style("opacity", 0)
          that.chinaMap._groups[0][prvcId].style.fill = colorLast
        })

      circles.append("text")
        .attr("x",0)
        .attr("y",0)
        .attr("dy",10)
        .text(d=>d.name)
      
      nodesForce.on("tick",()=>{
          links.attr("x1",(d)=>d.source.x)
            .attr("y1",(d)=>d.source.y)
            .attr("x2",(d)=>d.target.x)
            .attr("y2",(d)=>d.target.y)
          circles.attr("transform",d=>`translate(${d.x},${d.y})`)
        })

      let zoom = this.$d3.zoom()
        .scaleExtent([0.1,5])
        .on("zoom",()=>{
          g.attr('transform', `translate(${this.$d3.event.transform.x},${this.$d3.event.transform.y})scale(${this.$d3.event.transform.k})`)
        })
      forceSvg.call(zoom)

      let tooltip = this.$d3
        .select("body") // absolute相对父级对象
        .append("div") // 悬浮框
        .classed("tooltip", true)

      forceSimulation.restart()
    }
  }
};
</script>

<style lang="scss" scoped>
#IndexPage {
  #ChinaMap {
    border: 1px solid #000;
    height: 500px;
    #MapLengend {
      width: inherit;
      height: 20%;
    }
    #MapContent {
      width: inherit;
      height: 80%;
    }
  }
  #PieFig{
    border: 1px solid #000;
    height: 500px;
  }
  #ForceFig{
    border: 1px solid #000;
    height: 500px;
  }
  #WordFig{
    border: 1px solid #000;
    height: 500px;
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