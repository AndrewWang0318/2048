import { _decorator, Component, EventTouch, Node, NodeEventType, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

enum MoveDirect {
    LEFT,
    RIGHT,
    UP,
    DOWN
}


@ccclass('GameManage')
export class GameManage extends Component {

    @property(Node)
    startMenu:Node;
    @property(Node)
    settingMenu:Node;

    isGameStarting:boolean = true; // 游戏是否已经开始
    private posStart:Vec2; // 起始点
    private posEnd:Vec2; // 结束点

    tileNums:number = 4;
    tilesData:(number | null)[][] = [];

    start() {
        this.addEventListener();

        this.startMenu.active = true;
        this.settingMenu.active = false;
    }

    init(){

    }
    
    // 初始化方块地图
    initTileMap(){
        this.tilesData = [];

        for (let i = 0; i < this.tileNums; i++) {
            this.tilesData.push([])
            for (let j = 0; j < this.tileNums; j++) {
                this.tilesData[i].push(null)
            }
        }
    }

    // 渲染方块地图
    renderTileMap(){

    }

    // 开始游戏
    startGame(){
        this.startMenu.active = false;
    }

    // 打开游戏设置
    openGameSetting(){
        this.settingMenu.active = true;
    }

    // 切换游戏类型
    changeGameType(evt:EventTouch,customEventData:number){
        this.tileNums = customEventData;
        console.log(customEventData,evt.type)
        this.settingMenu.active = false;
    }


    // 返回游戏
    backGame(){
        this.settingMenu.active = false;
    }


    // 添加事件监听
    private addEventListener(){
        this.node.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(NodeEventType.TOUCH_END,this.onTouchEnd,this);
    }

    // 点击开始
    private onTouchStart(evt:EventTouch){
        if(this.isGameStarting == false) return;

        this.posStart = evt.getLocation()
    }

    // 点击结束
    private onTouchEnd(evt:EventTouch){
        if(this.isGameStarting == false) return;
        this.posEnd = evt.getLocation();
        // 计算 x,y 轴偏移量
        const offsetX = this.posStart.x - this.posEnd.x
        const offsetY = this.posStart.y - this.posEnd.y

        const absOffsetX = Math.abs(offsetX);
        const absOffsetY = Math.abs(offsetY);
        if(absOffsetX < 40 && absOffsetY < 40) return; // 偏移量太小,不计入操作

        // 判断是x轴的移动，还是y轴的移动
        if(absOffsetX > absOffsetY){
            // 大于0的时候是向右移动,否则是向左
            if(offsetX > 0){
                this.tileMove(MoveDirect.LEFT)
            }else{
                this.tileMove(MoveDirect.RIGHT)
            }
        }else{
            // 大于0的时候是向右移动,否则是向左
            if(offsetY > 0){
                this.tileMove(MoveDirect.DOWN)
            }else{
                this.tileMove(MoveDirect.UP)
            }
        }
    }

    // 砖块移动
    private tileMove(type:MoveDirect){

        switch (type) {
            case MoveDirect.LEFT:
                console.log('left direction')
                break;
            case MoveDirect.RIGHT:
                console.log('right direction')
                break;
            case MoveDirect.DOWN:
                console.log('down direction')
                break;
            case MoveDirect.UP:
                console.log('up direction')
                break;
            default:
                break;
        }
    }
}


