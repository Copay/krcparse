export default async function qrcParser(qrc:string){
    const lrcdec = await require("./lrcdec.cjs");
    const lyric_dehexed = Buffer.from(qrc,"hex");
    const str = new Uint8Array(lyric_dehexed);
    lrcdec
    const data = lrcdec.ccall("qrcd","string",["array","number"],[str,str.length]);
    return data;
}
