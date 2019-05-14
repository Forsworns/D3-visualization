const INFINITE_YEAR = 9012 
function parseDate(date){
    let [startDate, endDate] = date.split('-').map(d=>parseInt(d))
    if(endDate===undefined){
        endDate = INFINITE_YEAR
    }
    return [startDate, endDate]
}
function dateOverlap(s1,e1,s2,e2){
    return (s1<e2) || (s2<e1)
}

export default{
    parseDate,
    dateOverlap
}