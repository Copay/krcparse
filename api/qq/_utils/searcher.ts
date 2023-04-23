import { get } from "https";
import { escape } from "querystring";
import {parse}from "url";
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const DOMParser = new JSDOM().window.DOMParser
export default function searcher(keyword: string):Promise<string> {
    return new Promise((resolve, reject) =>
        getter("https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?key="+escape(keyword))
            .then((data: string) => JSON.parse(data).data.song.itemlist[0].id)
            .then((data) => getter("https://c.y.qq.com/qqmusic/fcgi-bin/lyric_download.fcg?musicid="+data+"&version=15&miniversion=82&lrctype=4"))
            .then((data: string) => {
                let p = new DOMParser;
                let a = p.parseFromString(data.slice("<!--".length,data.length-"-->".length),"text/html");
                return a.getElementsByTagName("content")[0].innerHTML.slice("<!--[CDATA[".length,a.getElementsByTagName("content")[0].innerHTML.length-"]]-->".length)
            })
            .then((a) => resolve(a))
            .catch(err => reject(err))
    )
}
function getter(url: string):Promise<string> {
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
