import json
import jieba
import pandas as pd

filter_map = ['。','，','、','；','：','（','）','(',')','.','-',' ','\u3000','—','副','任','其间','成员','兼','中国','国家','工作','司','省','和','专业','学习','系','在','十九']

def output(arr):
    with open("frequency.json","w") as f:
        json.dump(arr,f)

# JSON.stringfy add \ and " to json, while python didn't accept them
def wash(input):
    output = input.strip('" ').replace('\\','').replace("null,",'')
    return output


if __name__ == "__main__":
    with open("exps.json","r",encoding="utf8") as f:
        data = json.loads(wash(f.read()))
    print(len(data))
    seg_list = []
    for row in data:
        seg_list.extend(jieba.cut(row))
    seg_list = list(filter(lambda x: x not in filter_map, seg_list))
    seg_list = list(map(lambda x: {'text':x,'value':1}, seg_list))
    dfSg = pd.DataFrame(seg_list)
    dfWord = dfSg.groupby('text')['value'].sum()
    dfWord.sort_values(inplace=True,ascending=False)
    result = dfWord.iloc[0:50].to_dict()
    result = list(map(lambda k: {'text':k, 'value':result[k]}, result))
    print(result)
    output(result)
    
