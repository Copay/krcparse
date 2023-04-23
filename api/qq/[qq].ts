import searcher from "./_utils/searcher";
import qrcParser from "./_utils/qrcParser";
import qrcToArr from "./_utils/qrcToArr";

module.exports = async (req,res)=>{
    let arr
    res.status(200).json({
        body:await searcher(req.query["qq"])
        .then(o=>qrcParser(o))
        .then(o=>(arr = qrcToArr(o),req.query["body"]?arr:JSON.stringify(arr)))
        .catch(()=>null)
    })
}