import searcher from "./_utils/searcher";
import krcParser from "./_utils/krcParser";
import krcToArr from "./_utils/render/krcToArr";

module.exports = async (req,res)=>{
    let arr
    res.status(200).json({
        body:await searcher(req.query["kugou"])
        .then(o=>(i=(o as any).adjust,o))
        .then(o=>(o as any).krc)
        .then(o=>krcParser(o))
        .then(o=>o.toString())
        .then(o=>(arr = krcToArr(o),req.query["body"]?arr:JSON.stringify(arr)))
        .catch(()=>null)
    })
}
let i;