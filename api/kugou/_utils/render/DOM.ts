/**
 * Corlean chan~
 */

export default class DOMHandler {
    private lyricElement: HTMLCanvasElement;
    data: import("./krcToArr").lyric[];
    public destroy: () => void;
    private baseElement: HTMLCanvasElement;
    private canvasContextOfBase: CanvasRenderingContext2D;
    private canvasContextOfLyric: CanvasRenderingContext2D;
    private lastLyric: import("./krcToArr").lyric;
    public style: { [props: string]: { stroke?: string | null, fill?: string | null } } //todo...
    dimension: { width: number; height: number; };
    audio: HTMLMediaElement;
    private mode: string;
    constructor() {
        const container = document.createElement("div");
        container.classList.add("karaoke-container");
        this.destroy = () => { };

        this.lyricElement = document.createElement("canvas");
        this.lyricElement.classList.add("karaoke-lyric");
        container.appendChild(this.lyricElement);

        this.baseElement = document.createElement("canvas");
        container.insertBefore(this.baseElement,this.lyricElement);
        document.body.appendChild(container);

        this.canvasContextOfBase = this.baseElement.getContext("2d");
        this.canvasContextOfBase.font = "50px Arial"
        this.canvasContextOfBase.textBaseline = "middle";

        this.canvasContextOfLyric = this.lyricElement.getContext("2d");
        this.canvasContextOfLyric.textBaseline = "middle";
        this.canvasContextOfLyric.font = "50px Arial"


        //Cache of width&height
        //this.dimension = { width: null, height: null };
        Object.defineProperty(this, "dimension", {
            set: (e) => {
                this.lyricElement.width = e.width*window.devicePixelRatio;
                this.lyricElement.style.width = e.width + "px";
                this.lyricElement.height = e.height*window.devicePixelRatio;
                this.lyricElement.style.height = e.height + "px";
                this.baseElement.width = e.width*window.devicePixelRatio;
                this.baseElement.style.width = e.width + "px";
                this.baseElement.height = e.height*window.devicePixelRatio;
                this.baseElement.style.height = e.height + "px";
            },
            get:()=>({width:this.lyricElement.width/window.devicePixelRatio,height:this.lyricElement.height/window.devicePixelRatio})
        })
        // Initialization
        this.setMode("single");
        this.dimension = { width: document.body.clientWidth * 0.8, height: 100 }; //初始化
    }
    setData(data: import("./krcToArr").lyric[]) {
        this.data = data;
    }
    setAudio(audio:HTMLMediaElement){
        this.audio = audio;
        audio.addEventListener("play",()=>{
            let a = ()=>{
                this.render(audio.currentTime*1000,this.mode)
                id = requestAnimationFrame(a)
            }
            let id = requestAnimationFrame(a);
            audio.addEventListener("pause",()=>cancelAnimationFrame(id),{once:true})
        })
    }
    setMode(mode:string){
        if(mode!=="single"&&mode!=="double") throw new Error("Wrong Mode: the mode property should only be single or double")
        this.mode = mode;
        this.dimension = {width:0.8*window.innerHeight,height:((mode === "single")?1:2)*1.2*parseInt(this.canvasContextOfBase.font.match(/(\d+)px/)[1])}
    }
    /**
     * 
     * @param currentTime Audio/Video's Current Time
     * @param mode `"single"`: Single line lyric, `"double"`: Two lines lyric
     */
    render(currentTime: number, mode = "single") {
        //Get the lyric&node now
        let lyricNode = this.data.find(n => n.start <= currentTime && n.end > currentTime);
        if(!lyricNode) return;
        let NodeIndex = lyricNode.nodes.findIndex(n => n.start <= currentTime - lyricNode.start && n.end > currentTime - lyricNode.start);
        if(NodeIndex === -1) return;
        let Node = lyricNode.nodes[NodeIndex];
        //Initialize left value
        let left = 0;
        let align: CanvasTextAlign;
        //Fill backgroundText
        if (lyricNode.overSize === undefined) {
            lyricNode.overSize = this.canvasContextOfBase.measureText(Node.content).width >= this.baseElement.width
        }
        if (lyricNode.overSize) { //if oversized
            align = "left"
            if (this.lastLyric) { //if something has already painted
                if (this.lastLyric !== lyricNode) //if text needs repaint
                    left = 0, this._renderBackground(lyricNode, left, align, mode)
                else if (
                    this.canvasContextOfBase.measureText(
                        lyricNode.nodes
                            .slice(0, NodeIndex + 1)
                            .reduce(((pr, cv) => pr + cv.content), "")
                    ).width >= this.baseElement.width //if text out of canvas
                ) left = -this.canvasContextOfBase.measureText(Node.content).width
                    * (currentTime - lyricNode.start - Node.start)
                    / (Node.end - Node.start) * 1.2,
                    this._renderBackground(lyricNode, left, align, mode)
            } else {
                this.lastLyric = lyricNode;
                left = 0, this._renderBackground(lyricNode, left, align, mode)
            }
        } else { //if not oversized
            align = "center", left = this.dimension.width / 2; //single mode,if double mode,it's invaild.
            if (
                !this.lastLyric || this.lastLyric !== lyricNode //if text isn't painted
            ) this._renderBackground(lyricNode, left, align, mode)
        }
        //Fill lyricText
        this._renderLyric(lyricNode, Node, left, align, mode, currentTime);
    }
    private _renderBackground(lyricNode: import("./krcToArr").lyric, left: number, align: CanvasTextAlign, mode: string) {
        this.canvasContextOfBase.clearRect(0, 0, this.dimension.width, this.dimension.height);
        this.canvasContextOfBase.textAlign = align;
        ({
            "single": () => {
                this.canvasContextOfBase.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), left, this.dimension.height / 2)
            },
            "double": () => {
                this.canvasContextOfBase.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), (align === "center" ? (this.canvasContextOfBase.textAlign = "left", 0) : left), this.dimension.height / 4);
                this.canvasContextOfBase.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), (align === "center" ? (this.canvasContextOfBase.textAlign = "right", this.dimension.width) : left), this.dimension.height / 4 * 3);
            }
        })[mode]();
    }
    private _renderLyric(lyricNode: import("./krcToArr").lyric, Node: import("./krcToArr").node, left: number, align: CanvasTextAlign, mode: string, currentTime: number) {
        this.canvasContextOfLyric.clearRect(0, 0, this.dimension.width, this.dimension.height);
        this.canvasContextOfLyric.textAlign = align;
        ({
            "single": () => {
                this.canvasContextOfLyric.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), left, this.dimension.height / 2);
                this.canvasContextOfLyric.clearRect(//todo,it only does well at center mode
                    (this.dimension.width - this.canvasContextOfLyric.measureText(Node.content).width) / 2
                    + this.canvasContextOfLyric.measureText(lyricNode.nodes.slice(0, lyricNode.nodes.findIndex(a => a === Node)).reduce((pr, cu) => pr + cu.content, "")).width
                    + this.canvasContextOfLyric.measureText(Node.content).width * (currentTime - lyricNode.start - Node.start) / Node.end,
                    0, this.dimension.width, this.dimension.height
                )
            },
            "double": () => {
                this.canvasContextOfLyric.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), (align === "center" ? (this.canvasContextOfLyric.textAlign = "left", 0) : left), this.dimension.height / 4);
                this.canvasContextOfLyric.fillText(lyricNode.nodes.reduce((pre, cur) => pre + cur.content, ""), (align === "center" ? (this.canvasContextOfLyric.textAlign = "right", this.dimension.width) : left), this.dimension.height / 4 * 3);
            }
        })[mode]();
    }//todo...
}
