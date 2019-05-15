import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

// to read csv
import axios from 'axios'
import Papa from 'papaparse'

// json can be read directly
import ChinaGeo from "@/assets/China.json";


import MyDate from '../utils/MyDate.js'
const date = new Date
const yearNow = date.getFullYear()

import Utils from '../utils/utils.js'
const isValid = Utils.isValid

import {C9,EDU_SCI,EDU_LIT} from '../utils/Constant.js'

const store = new Vuex.Store({
    state: {
        csvData: [],
        captionName: [],
        provinces: [],
        provinceMember: {},
        educations: [],
        educationMember: {},
        years: [],
        yearMember: {},
        nations: [],
        nationMember: {},
        campus: [],
        campusMember: {},
        geoData: {},
    },
    mutations: {
        importJson(state,data){
            state.geoData = data
        },
        readData(state,data){
            state.csvData = data
        },
        readCaption(state,cap){
            state.captionName = cap
        },
        details(state,payload){
            state.provinces = payload.provinces
            state.provinceMember = payload.provinceMember
            state.educations = payload.educations
            state.educationMember = payload.educationMember
            state.years = payload.years
            state.yearMember = payload.yearMember
            state.nations = payload.nations
            state.nationMember = payload.nationMember
            state.campus = payload.campus
            state.campusMember = payload.campusMember
        }
    },
    actions:{
        initialize({commit,state}){
            // check if the csv data is readed
            if(state.csvData.length===0){
                commit('importJson',ChinaGeo)
                // read in csv file and parse to json
                const curPageUrl = window.document.location.href;
                const fileName = `${curPageUrl.split("//")[0]}//${curPageUrl.split("//")[1].split("/")[0]}/static/people.csv`
                return axios.get(fileName).then((res)=>{
                    // record the cption of the csv
                    let parsed = Papa.parse(res.data,{delimeter:','})
                    let caption = parsed.data.shift() // get the key for each value
                    commit('readCaption',caption)

                    // deal with csv data
                    let csvData = parsed.data
                    csvData = csvData.map((data)=>{ // reshape the data structure
                        return Object.assign(...data.map((d,i)=>{
                            return {[caption[i]]:d}
                        }))
                    })
                    csvData = csvData.filter(item=>item['姓名'].length!==0)
                    // deal with hiatus
                    for(let item of csvData){
                        if(isValid(item['出生日期'])){
                            item['出生日期'] = parseInt(item['出生日期'])
                            item['年龄'] = yearNow - item['出生日期']
                        }
                        if(isValid(item['出生地'])){
                            item['省份'] = item['出生地'].substr(0,2)
                        }else{
                            item['省份'] = '未知'
                            item['出生地'] = '未知'
                        }

                        if(isValid(item['履历'])){
                            item['履历'] = item['履历'].split('\n').map(d=>{
                                let [date,title] = d.split(',')
                                let [startDate, endDate] = MyDate.parseDate(date) 
                                return [startDate, endDate, title]
                            })
                        }else{
                            item['履历'] = []
                        }

                        if(!isValid(item['毕业院校'])){
                            item['毕业院校'] = ""
                        }
                        if(!isValid(item['专业背景'])){
                            item['专业背景'] = ""
                        }
                    }
                    commit('readData',csvData)
                    
                    /*
                    let experiences = []
                    csvData.forEach(ele=>{
                        ele['履历'].forEach(e=>{
                            experiences.push(e[2])
                        })
                        })
                    
                    function downFile(json) {
                        var elementA = document.createElement('a');
                        
                        elementA.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(json));
                        elementA.setAttribute('download', +new Date() + ".json");
                        elementA.style.display = 'none';
                        document.body.appendChild(elementA);
                        elementA.click();
                        document.body.removeChild(elementA);
                      }
                    const data = JSON.stringify(experiences)
                    downFile(data)
                    */
                    

                    // deal with specific details of csvData
                    
                    let payload = {}

                    // province
                    let provinces = state.geoData['features'].map(prvc=>prvc['properties'].name)
                    let provinceMember = {}
                    provinces.forEach(prvc => {
                        Object.assign(provinceMember,{[prvc]:[]})
                    })

                    // education
                    let educations = ['军事','工程自科','人文社科']
                    let educationMember = {}
                    educations.forEach(edu=>{
                        Object.assign(educationMember,{[edu]:[]})
                    })

                    // year
                    let years = ["50以下","50-59","60-69","70以上"]
                    let yearMember = {}
                    years.forEach(y=>{
                        Object.assign(yearMember,{[y]:[]})
                    })

                    // nationality
                    let nations = ['汉族','少数民族']
                    let nationMember = {}
                    nations.forEach(n=>{
                        Object.assign(nationMember,{[n]:[]})
                    })

                    // campus
                    let campus = ['党校军校','C9高校','其他学校'] 
                    let campusMember = {}
                    campus.forEach(c=>{
                        Object.assign(campusMember,{[c]:[]})
                    })
                    
                    csvData.forEach((member,idx)=>{
                        // hometown
                        for(let p of provinces){
                            if(p.includes(member['省份'])){
                                csvData[idx]['省份'] = p
                                provinceMember[p].push(idx)
                                break
                            }
                        }

                        // education
                        for(let word of EDU_SCI){
                            if(member['专业背景'].includes(word)){
                                csvData[idx]['专业属性'] = educations[1]        
                            }
                        }
                        for(let word of EDU_LIT){
                            if(member['专业背景'].includes(word)){
                                csvData[idx]['专业属性'] = educations[2]          
                            }
                        }
                        if(!isValid(csvData[idx]['专业属性'])){
                            csvData[idx]['专业属性'] = educations[0]
                        }
                        educationMember[csvData[idx]['专业属性']].push(idx)

                        // campus
                        if(member['毕业院校'].includes('党') || member['毕业院校'].includes('军')){
                            csvData[idx]['院校种类'] = campus[0]
                        }
                        for(let word of C9){
                            if(member['毕业院校'].includes(word)){
                                csvData[idx]['院校种类'] = campus[1]
                            }
                        }
                        if(!isValid(csvData[idx]['院校种类'])){
                            csvData[idx]['院校种类'] = campus[2]
                        }
                        campusMember[csvData[idx]['院校种类']].push(idx)

                        // year
                        if(member['年龄']<50){
                            csvData[idx]['年龄层次'] = years[0]
                        }else if(member['年龄']<60){
                            csvData[idx]['年龄层次'] = years[1]
                        }else if(member['年龄']<70){
                            csvData[idx]['年龄层次'] = years[2]
                        }else{
                            csvData[idx]['年龄层次'] = years[3]
                        }
                        yearMember[csvData[idx]['年龄层次']].push(idx)
                        
                        // nationality
                        if(member['民族']==='汉族'){
                            nationMember['汉族'].push(idx)
                        }else{
                            nationMember['少数民族'].push(idx)
                        }

                    })

                    Object.assign(payload, {provinces})
                    Object.assign(payload, {provinceMember})
                    Object.assign(payload, {educations})
                    Object.assign(payload, {educationMember})
                    Object.assign(payload, {years})
                    Object.assign(payload, {yearMember})
                    Object.assign(payload, {nations})
                    Object.assign(payload, {nationMember})
                    Object.assign(payload, {campus})
                    Object.assign(payload, {campusMember})
                    commit('details',payload)
                }).catch((err)=>{
                    console.log(err)
                })
            }
        }
    }
})

export default store