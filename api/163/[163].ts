import { lyric_new, search } from "NeteaseCloudMusicApi";
import nrcToArr from "./_utils/nrcToArr";

module.exports = async (req,res)=>{
    let arr
    res.status(200).json({
        body: await search({keywords:req.query["ncm"], limit:1})
                        .then(val=>val.body.result.songs[0].id)
                        .then(id=>lyric_new({id: id}))
                        .then(val=>val.body.yrc.lyric)
                        .then(nrc=>(arr = nrcToArr(nrc),req.query["body"]?arr:JSON.stringify(arr)))
                        .catch(()=>null)
    })
}