import { get } from "https";
import { escape } from "querystring";
import {parse}from "url";

export default function searcher(keyword: string) {
    let res = { "adjust": null, "krc": null };
    return new Promise((resolve, reject) =>
        getter("https://bird.ioliu.cn/v1?url=http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=" + escape(keyword) + "&page=1&pagesize=1&showtype=1")
            .then((data: string) => JSON.parse(data).data)
            .then((data)=> {if(data.info.length) return data ;else reject(null)})
            //.then(data=>{console.log(data);return data;})
            .then((data) => getter("https://bird.ioliu.cn/v1?url=http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" + escape(data.info[0].songname) + "&duration=" + data.info[0].duration + "&hash=" + data.info[0].hash))
            .then((data: string) => JSON.parse(data))
            .then(data => (res.adjust = data.candidates[0].adjust, data))
            .then((data) => getter("https://bird.ioliu.cn/v1?url=http://lyrics.kugou.com/download?ver=1&client=pc&id=" + data.candidates[0].id + "&accesskey=" + data.candidates[0].accesskey + "&fmt=krc&charset=utf8"))
            .then((data: string) => JSON.parse(data))
            .then(({ content }) => res.krc = content)
            .then(() => resolve(res))
            .catch(err => reject(err))
    )
}
function getter(url: string) {
    return new Promise((resolve, reject) => {
        get({"headers":{"User-Agent":"Mozilla/5.0"},...parse(url)}, (res) => {
            if (res.statusCode !== 200) reject(new Error("Bad Request:" + res.statusCode));
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunks => data += chunks)
                .on("end", () => resolve(data))
                .on("error", (err) => reject(err));
        })
    })
}