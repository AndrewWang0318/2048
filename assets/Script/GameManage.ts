import { _decorator, Component, EventTouch, instantiate, Node, NodeEventType, Prefab, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

enum MoveDirect {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

@ccclass('GameManage')
export class GameManage extends Component {
    // 开始菜单
    @property(Node)
    StartMenu:Node;
    // 设置菜单
    @property(Node)
    SettingMenu:Node;
    // 块 容器
    @property(Node)
    TileMap:Node;
    // 块 预制体
    @property(Prefab)
    Tile:Prefab;
    // 空白块 预制体
    @property(Prefab)
    Road:Prefab;

    private isGameStarting:boolean = true; // 游戏是否已经开始
    private posStart:Vec2; // 起始点
    private posEnd:Vec2; // 结束点

    tileNums:number = 4; // 容器容纳块数量
    tileMargin:number = 16; // 块间隔
    tilesData:(number | null)[][] = []; // 容器内容 null 代表为空白 数字代表为生成的块
    start() {
        this.addEventListener();

        this.StartMenu.active = true;
        this.SettingMenu.active = false;

        this.init();
    }

    init(){
        this.initTileMap();
        this.renderTileMap();
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

    // 随机生成块
    randomTile(){
        
    }

    // 渲染方块地图
    renderTileMap(){
        const tileMapUI:UITransform = this.TileMap.getComponent(UITransform);
        // 块容器宽度
        const tileMapWidth = tileMapUI.width; 
        // 块边距
        const tileMargin = this.tileMargin;
        // 块宽度
        const tileWidth = (tileMapWidth - tileMargin * ( this.tileNums + 1 )) / this.tileNums
        // 起始点坐标
        const startX = - tileMapWidth / 2 + tileWidth / 2 + tileMargin;
        const startY = tileMapWidth / 2 - tileWidth / 2 - tileMargin;
        const startPos =  new Vec3( startX, startY, 0); // x y 轴的 0,0 点为中心点, 则左上角的点 x 轴是 负的 y 轴是正向的。且为 块容器宽的一半 +/- 块宽 的一半 +/- margin
        // 初始化
        for (let i = 0; i < this.tilesData.length; i++) {
            for (let j = 0; j < this.tilesData[i].length; j++) {
                const num = this.tilesData[i][j];
                // null 为空白格的情况,否则为格的情况
                if(num == null){
                    const node = instantiate(this.Road);
                    const tileUI:UITransform = node.getComponent(UITransform);
                    tileUI.width = tileWidth;
                    tileUI.height = tileWidth;
                    const tilePos = new Vec3(startPos.x + tileWidth * i + tileMargin * i, startPos.y - tileWidth * j - tileMargin * j, 0);
                    node.position = tilePos;
                    node.parent = this.TileMap;
                }else{
                    const node = instantiate(this.Tile);
                    const tile =  node.getComponent(Tile)
                    tile.init(num)
                    const tileUI:UITransform = node.getComponent(UITransform);
                    tileUI.width = tileWidth;
                    tileUI.height = tileWidth;
                    const tilePos = new Vec3(startPos.x + tileWidth * i + tileMargin * i, startPos.y - tileWidth * j - tileMargin * j, 0);
                    node.position = tilePos;
                    node.parent = this.TileMap;
                }
            }
        }
    }

    // 开始游戏
    startGame(){
        this.StartMenu.active = false;
    }

    // 打开游戏设置
    openGameSetting(){
        this.SettingMenu.active = true;
    }

    // 切换游戏类型
    changeGameType(evt:EventTouch,customEventData:number){
        this.tileNums = customEventData;
        this.SettingMenu.active = false;
    }

    // 返回游戏
    backGame(){
        this.SettingMenu.active = false;
    }

    // 返回主页面
    backHome(){
        this.SettingMenu.active = false;
        this.StartMenu.active = true;
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


