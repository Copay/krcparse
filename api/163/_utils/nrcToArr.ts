export default function nrcToArr(nrc: string) {
    nrc = nrc.replace(/\r/g, "");
    let arr: lyric[] = [];
    let nrcSlices: string[] = nrc.split("\n");
    for (let i = 0; i < nrcSlices.length; i++) {
        let lyric: lyric = { nodes: [], start: null, end: null };
        regex[0].lastIndex = 0; //reset lastIndex each loop<this scope>
        regex[1].lastIndex = 0; //reset lastIndex each loop<this scope>
        let match: RegExpExecArray;
        if ((match = regex[0].exec(nrcSlices[i])) === null) continue;
        [, lyric.start, lyric.end] = match.map(_ => parseInt(_));
        lyric.end += lyric.start; //duration + startTime
        while ((match = regex[1].exec(nrcSlices[i])) !== null) {
            let node: node = { start: null, end: null, content: null };
            console.log(match);
            [, node.start, node.end, node.content] = match.map((_, i) => {
                if (i < 3 && i > 0) return parseInt(_);
                return _;
            }) as [string, number, number, string];
            node.start -= lyric.start;
            node.end += node.start;
            lyric.nodes.push(node);
        }
        arr.push(lyric);
        
    }
    return arr;
}

let regex = [/\[(\d*),(\d*)\]/, /\((\d*),(\d*),0\)(.*?)(?=\(|$)/g]
/**
 * lyricNode
 */
export interface lyric {
    nodes: node[];
    start: number;//ms
    end: number;//ms
    overSize?: boolean;
}
/**
 * Node
 */
export interface node {
    start: number;//ms,relative to lyricNode
    end: number;//ms
    content: string;
}