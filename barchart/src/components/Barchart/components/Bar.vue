<template>
    <div id="bar">
    </div>
</template>

<script>
import * as d3 from 'd3'

class Tools{
    getTrueNum (father, percent) {
        if (typeof percent === 'number') {
          return percent > father ? father : percent
        } else {
          return father * this.percentToPoint(percent)
        }
      }
    percentToPoint (percent) { // 百分比转小数
        let point = percent.replace('%', '').replace(' ', '')
        point = point / 100
        return point
    }
}

export default {
    mounted() {
        this.drawBarGraph()
    },
    data(){
        return {
            axis : {
                xAxisData : []
            }
        }
    },
    watch: {
        barData(){
            d3.select("#bar")
                .select("svg")
                .data([])
                .exit()
                .remove()
            this.drawBarGraph()
        }
    },
    props:{ // bar-chart 的格式
        width:{
            type: Number,
            default: 400,
        },
        height:{
            type: Number,
            default: 400,
        },
        barWidth:{
            type: [Number, String],
            default: '70' // 百分比
        },
        color:{
            type: String,
            default: 'steelblue',
        },
        padding:{
            type: Object,
            default: ()=>({top: 50, right: 50, bottom: 50, left: 50}),
        },
        barData: {
            type: Array,
            required: true,
        },
    },
    methods: {
        drawBarGraph(){
            this.axis.xAxisData = Array.from({length:this.barData.length}).map((val,idx)=>idx+1)
            const barAttr = this.createAttr()
            const svg = this.createSVG(this.barData,barAttr)
            const {xScale,yScale} = this.addScale(svg,this.barData,barAttr)
            this.rect = this.addRect(svg,this.barData,barAttr,xScale,yScale)
        },
        createAttr(){
            const {padding, width, barWidth, ...otherAttrs} = this.$props
            let axis = {}
            Object.assign(axis, this.axis)
            const contentWidth = width- padding.left-padding.right // 画布真实宽度
            const barStep = contentWidth/axis.xAxisData.length // 单个bar及两侧间隙占有的宽度
            const realBarWidth = Tools.prototype.getTrueNum(barStep,barWidth) // bar的实际宽度
            const spacing = barStep-realBarWidth // bar之间的间距
            return {
                padding,
                axis,
                width,
                ...otherAttrs,
                barWidth: realBarWidth,
                contentWidth,
                spacing,
            }
        },
        createSVG(barData,barAttr){
            const {width,height} = barAttr
            const svg = d3.select('#bar')
                .append('svg')
                .attr('width',width)
                .attr('height',height)
            return svg
        },
        addScale(svg,barData,barAttr){
            const {contentWidth, height, axis, padding} = barAttr
            // scaleBand非连续比例尺，scaleLinear是线性比例尺
            const xScale = d3.scaleBand().range([0,contentWidth]).domain(axis.xAxisData) // 设定比例尺的长度和对应的值域
            const xAxis = d3.axisBottom(xScale) // 按照scale设定底部axis
            const yScale = d3.scaleLinear().range([height-padding.top-padding.bottom,0]).domain([0,d3.max(this.barData)])
            const yAxis = d3.axisLeft(yScale)

            svg.append('g')
                .classed('axis-x',true)
                .attr('transform',`translate(${padding.left},${height-padding.bottom})`)
                .call(xAxis)
            // transform 为相对左边界和上边界的位置

            svg.append('g')
                .classed('axis-y',true) // 添加这个class，若为false则去掉这个class
                .attr('transform',`translate(${padding.left},${padding.bottom})`)
                .call(yAxis)
            
            return {
                xScale,
                yScale,
            }
        },
        addRect(svg,barData,barAttr,xScale,yScale){
            const{ barWidth, height, axis, color, padding, spacing} = barAttr
            const rect = svg.selectAll('rect')
                .data(barData)
                .enter()
                .append('rect')
                .attr('fill',color)
                .attr('class','my-rect')
                .attr('transform',`translate(${padding.left},${padding.top})`)
                .attr('x',(d,i)=> xScale(axis.xAxisData[i])+spacing) // (data,index)
                .attr('width',barWidth)
                .attr('y',(d)=> {return yScale(d)})
                .attr('height',d=> height -padding.top-padding.bottom-yScale(d))
                .on("click",(d,i)=>{
                    console.log(d,i)
                })
            return rect
        }
    },
}
</script>

<style lang="scss">
    .my-rect {
        cursor: pointer;
    }
</style>