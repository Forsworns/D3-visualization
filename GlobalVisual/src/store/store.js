import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import axios from 'axios'
import Papa from 'papaparse'

import {countryMap, countryMapInv, serieMap, serieMapInv} from '../utils/DataMap.js'

const YEARS = ['2010','2011','2012','2013','2014']

const store = new Vuex.Store({
    state: {
        allData: [],
        allDataObj: [], // country-serie-year
        processedData: [],
        processedDataObj: [],
        captionName: [],
        yearsName: ['---',...YEARS],
        seriesArr:[],
        seriesMap:{}, 
        seriesMapInv: {},
        countryMap:{},
        countryMapInv: {},
        seriesFilterMap: [] ,
        parallelData: [],
        dataMax: [],
        dataMean: [],
        dataMin: [],
    },
    mutations: {
        readData(state,data){
            state.allData = data
        },
        readCaption(state,cap){
            state.captionName = cap
        },
        processData(state,data){
            state.processedData = data
        },
        trans2obj(state,payload){
            state.allDataObj = payload.allDataObj
            state.processedDataObj = payload.processedDataObj
        },
        buildSetMap(state,payload){
            state.seriesArr = payload.seriesArr
            state.countryMap = payload.countryMap
            state.countryMapInv = payload.countryMapInv
            state.seriesMap = payload.seriesMap
            state.seriesMapInv = payload.seriesMapInv
            state.seriesFilterMap = payload.seriesFilterMap
            state.parallelData = payload.parallelData
            state.dataMax = payload.dataMax
            state.dataMean = payload.dataMean
            state.dataMin = payload.dataMin
        }
    },
    actions:{
        readFromFile({commit,state}){
            // check if the csv data is readed
            if(state.allData.length===0){
            // read in csv file and parse to json
                const curPageUrl = window.document.location.href;
                const fileName = `${curPageUrl.split("//")[0]}//${curPageUrl.split("//")[1].split("/")[0]}/static/data/statistic/countriesData.csv`
                return axios.get(fileName).then((res)=>{
                    let parsed = Papa.parse(res.data,{delimeter:','})
                    let caption = parsed.data.shift() // get the key for each value
                    caption = caption.map((item)=>item.split("[").shift()) // remove the postfix [YRxxxx] 
                    commit('readCaption',caption)

                    let csvData = parsed.data
                    csvData = csvData.map((data)=>{ // reshape the data structure
                        return Object.assign(...data.map((d,i)=>{
                            return {[caption[i]]:d}
                        }))
                    })
                    csvData = csvData.filter((ele)=>{ // remove empty data
                        return !Object.values(ele).includes("")
                    })
                    csvData.forEach((ele,idx)=>{
                        csvData[idx].CountryCode = ele.CountryCode.toLowerCase()
                    })
                    commit('readData',csvData)

                    let processedData = csvData.map((obj)=>{ // change the data '..' to 0
                        let newObj = {}
                        for(let ky in obj){
                            if(obj[ky]!='..' && obj[ky]!='.. '){
                                newObj[ky] = obj[ky]
                            }else{
                                newObj[ky] = 0
                            }
                        }
                        return newObj
                    })
                    commit('processData',processedData)

                    let allDataObj = {}
                    csvData.forEach(ele=>{
                        if(!allDataObj.hasOwnProperty(ele.CountryCode)){
                            Object.assign(allDataObj,allDataObj,{[ele.CountryCode]:{}})
                        }
                        Object.assign(allDataObj[ele.CountryCode],allDataObj[ele.CountryCode],{[ele.SeriesCode]:ele})
                        // there is redundant information inside
                    })
                    let processedDataObj = {}
                    processedData.forEach(ele=>{
                        if(!processedDataObj.hasOwnProperty(ele.CountryCode)){
                            Object.assign(processedDataObj,processedDataObj,{[ele.CountryCode]:{}})
                        }
                        Object.assign(processedDataObj[ele.CountryCode],processedDataObj[ele.CountryCode],{[ele.SeriesCode]:ele})
                    })
                    commit('trans2obj',{'allDataObj':allDataObj,'processedDataObj':processedDataObj})

                    // build series array
                    let serArr = new Set(Object.values(serieMap))
                    serArr.delete('数据缺失')
                    serArr = Array.from(serArr)
                    let seriesFilterMap = new Array()
                    serArr.forEach(ele=>{
                        seriesFilterMap.push({'text':ele,'value':ele})
                    })

                    // build the data for parallel graph
                    let paraData = []
                    Object.entries(processedDataObj).forEach((entry)=>{
                        YEARS.forEach(y=>{
                            let newObj = {country: entry[0] ,year:y}
                            serArr.forEach(ser=>{
                                ser = serieMapInv[ser]
                                if(entry[1].hasOwnProperty(ser)){
                                    Object.assign(newObj,newObj,{[ser]:entry[1][ser][y]})
                                }else{
                                    Object.assign(newObj,newObj,{[ser]:0})
                                }
                            })
                            paraData.push(newObj)
                        })
                    })

                    let dataMax = {}
                    let dataMean = {}
                    let dataMin = {}
                    serArr.forEach(ser=>{
                        ser = serieMapInv[ser]
                        let maxes = Array.from(YEARS).map(()=>-1e9)
                        let means = Array.from(YEARS).map(()=>0)
                        let mins = Array.from(YEARS).map(()=>1e9)
                        let num = Array.from(YEARS).map(()=>0)
                        for(let cty in processedDataObj){
                            YEARS.forEach((y,i)=>{
                                if(processedDataObj[cty][ser][y]!==0){
                                    num[i]+=1
                                }
                                maxes[i]=Math.max(maxes[i],parseFloat(processedDataObj[cty][ser][y]))
                                means[i]+=parseFloat(processedDataObj[cty][ser][y])
                                mins[i]=Math.min(mins[i],parseFloat(processedDataObj[cty][ser][y]))
                            })
                        }
                        means = means.map((ele,i)=>{
                            if(num[i]===0){
                                return 0
                            }
                            return ele/num[i]
                        })
                        Object.assign(dataMax,dataMax,{[ser]:[...maxes]})
                        Object.assign(dataMean,dataMean,{[ser]:[...means]})
                        Object.assign(dataMin,dataMin,{[ser]:[...mins]})
                    })

                    let payload = new Object()
                    Object.assign(payload,payload,{'seriesArr':serArr})
                    Object.assign(payload,payload,{'seriesMap':serieMap})
                    Object.assign(payload,payload,{'seriesMapInv':serieMapInv})
                    Object.assign(payload,payload,{'seriesFilterMap':seriesFilterMap})
                    Object.assign(payload,payload,{'countryMap':countryMap})
                    Object.assign(payload,payload,{'countryMapInv':countryMapInv})
                    Object.assign(payload,payload,{'parallelData':paraData})
                    Object.assign(payload,payload,{'dataMax':dataMax})
                    Object.assign(payload,payload,{'dataMean':dataMean})
                    Object.assign(payload,payload,{'dataMin':dataMin})
                    commit('buildSetMap',payload)
                }).catch((err)=>{
                    console.log(err)
                })
            }
        }
    }
})

export default store