function quickSortCore(arr,start,end){
    let mid = arr[start];
    while(start<end){
        while(arr[end] >= mid && start < end){
            end--;
        }
        arr[start] = arr[end];    
        while(arr[start]<=mid && start<end){
            start++;
        }
        arr[end] = arr[start];
    }
    arr[start] = mid;
    return start;
}

function quickSort(arr,low,high) {
    if(low>=high) {
        return;
    }
    let midIndex = quickSortCore(arr,low,high);
    quickSort(arr,low,midIndex-1);
    quickSort(arr,midIndex+1,high);
}

export {quickSort};