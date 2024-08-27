import { _decorator, Component, EventTouch, instantiate, Node, NodeEventType, Prefab, Sprite, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
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
    tilesData:(number | null)[][] = []; // 容器内容 null 代表为空白 数字代表为生成的块
    tileMargin:number = 16; // 块间隔
    tileWidth:number; // 格子的宽度
    startPos:Vec3; // 起始点坐标

    // 游戏开始[回调]
    start() {
        this.addEventListener();
        this.StartMenu.active = true;
        this.SettingMenu.active = false;

        this.init();
    }

    // 重新开始
    reStart(){
        localStorage.removeItem('tilesData');

        this.init();
    }

    // 初始化
    init(){
        const tilesData:string | null = localStorage.getItem('tilesData')
        this.initTileMapData();
        this.renderTileMap();
        if(tilesData === null){
            this.createTile();
        }
    }
    
    // 初始化方块地图
    initTileMapData(){

        

        const tilesData:string = localStorage.getItem('tilesData')
        // 使用本地存储的情况
        if(tilesData){
            this.tilesData = JSON.parse(tilesData)
        }else{
            this.tilesData = [];
            for (let i = 0; i < this.tileNums; i++) {
                this.tilesData.push([])
                for (let j = 0; j < this.tileNums; j++) {
                    this.tilesData[i].push(null)
                }
            }
        }
    }

    // 渲染方块地图
    renderTileMap(){
        // 清理之前所有的块
        this.TileMap.removeAllChildren();

        const tileMapUI:UITransform = this.TileMap.getComponent(UITransform);
        // 块容器宽度
        const tileMapWidth = tileMapUI.width; 
        // 块宽度
        this.tileWidth = (tileMapWidth - this.tileMargin * ( this.tileNums + 1 )) / this.tileNums
        // 起始点坐标
        const startX = - tileMapWidth / 2 + this.tileWidth / 2 + this.tileMargin;
        const startY = tileMapWidth / 2 - this.tileWidth / 2 - this.tileMargin;
        this.startPos = new Vec3( startX, startY, 0); // x y 轴的 0,0 点为中心点, 则左上角的点 x 轴是 负的 y 轴是正向的。且为 块容器宽的一半 +/- 块宽 的一半 +/- margin
        
        // 初始化
        for (let i = 0; i < this.tilesData.length; i++) {
            for (let j = 0; j < this.tilesData[i].length; j++) {
                const curPos = v2(i,j)
                const curNum = this.tilesData[curPos.x][curPos.y];
                // null 为空白格的情况,否则为格的情况
                if(curNum == null){
                    this.createRoad(curPos)
                }else{
                    this.createTile(false,false,curNum,curPos)
                }
            }
        }
    }

    /**
     * 创建一个新的块(tile)。
     *
     * @param {boolean} isAnimated - 指定是否为新创建的块添加动画效果。默认为 `false`，如果设置为 `true`，则在创建块时应用动画。
     * @param {boolean} isRandom - 指定块的生成是否为随机位置。默认为 `true`，如果设置为 `false`，则使用指定的生成位置。
     * @param {number} curNum - 当前块的编号或标识，用于区分或跟踪块的状态。
     */
    createTile(isAnimated: true | false = true,isRandom: true | false = true, curNum?: number, curPos?:Vec2 ){
        const isDouble = Math.floor(Math.random() * 2); // 是否生成一个双倍大的数字
        const randomNum = isDouble === 1 ? 4 : 2
        const num = isRandom ? randomNum: curNum; // 生成的数字大小
        const roadArr = []; // 空白块的下标
        this.tilesData.forEach( (arr,idx) => {
            arr.forEach((v,i) => {
                if(v === null){
                    roadArr.push(v2(idx,i));
                }
            })
        });
        if(roadArr.length <= 0) return; // 如果当前没有空白块则跳出

        const roadIdx = Math.floor(Math.random() * roadArr.length); // 空白块下标
        const roadPos = isRandom ? roadArr[roadIdx] : curPos; // 随机的空白块的坐标
        this.tilesData[roadPos.x][roadPos.y] = num; // 将目标的空白块重新赋值

        const node = instantiate(this.Tile);
        const tile =  node.getComponent(Tile)
        tile.init(num)
        const tileUI:UITransform = node.getComponent(UITransform);
        tileUI.width = this.tileWidth;
        tileUI.height = this.tileWidth;

        const xPos = this.startPos.x + this.tileWidth * roadPos.x + this.tileMargin * roadPos.x
        const yPos = this.startPos.y - this.tileWidth * roadPos.y - this.tileMargin * roadPos.y
        const tilePos = new Vec3( xPos, yPos, 0);
        node.position = tilePos;
        node.parent = this.TileMap;

        // 播放动画
        if(isAnimated){
            node.scale = v3(0.2,0.2,0.2);
            tween(node).to(0.15,{ scale:v3(1,1,1) }, { easing:'sineInOut' }).start();
        }
    }
    
    // 生成 空白块
    createRoad(curPos:Vec2){
        const node = instantiate(this.Road);
        const tileUI:UITransform = node.getComponent(UITransform);
        tileUI.width = this.tileWidth;
        tileUI.height = this.tileWidth;

        const xPos = this.startPos.x + this.tileWidth * curPos.x + this.tileMargin * curPos.x;
        const yPos = this.startPos.y - this.tileWidth * curPos.y - this.tileMargin * curPos.y;
        const tilePos = new Vec3( xPos, yPos, 0 );
        node.position = tilePos;
        node.parent = this.TileMap;
    }

    // 保存历史数据
    saveStorage(){
        const tilesData = JSON.stringify(this.tilesData)
        localStorage.setItem('tilesData',tilesData)
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
        // this.tileNums = customEventData;
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
        this.calculateTiles(type)
    }

    // 运算tiles结果
    calculateTiles(type:MoveDirect){
        console.log(this.TileMap.children)
        if(type === MoveDirect.LEFT){

            for (let idx = 0; idx < this.tilesData.length; idx++) {
                const array = this.tilesData[idx];
                for (let i = 0; i < array.length; i++) {
                    const curPos = v2(idx,i);// 当前坐标
                    const curItem = array[i]; // 当前值
                    if(curPos.x === 0) break; // 当前值是边界的情况,跳出
                    const tarPos = v2(idx-1,i);// 目标坐标
                    const tarItem = this.tilesData[tarPos.x][tarPos.y]; // 目标值
                    // 如果 当前和目标结果不是空值 且  当前值和目标值相等 则 合并两者的值
                    if(curItem !== null && tarItem !== null && curItem === tarItem){

                        console.log(curItem,curPos,tarItem,tarPos);

                    }
                }
            }


            // this.tilesData.forEach( (arr,idx) => {
            //     arr.forEach( (v,i) => {
            //         const curPos = v2(idx,i);// 当前坐标
            //         const curItem = v; // 当前值

            //         const tarPos = v2(idx-1,i);// 目标坐标
            //         const tarItem = this.tilesData[tarPos.x][tarPos.y]; // 目标值

            //         // 如果 当前和目标结果不是空值 且  当前值和目标值相等 且 并没有碰到边界
            //         if(curItem !== null && tarItem !== null && curItem === tarItem && curPos.x !== 0){
            //             // 合并两者的值

            //             console.log(v,curPos,tarItem,tarPos);
            //         }
            //     })
            // })
        }else if(type === MoveDirect.RIGHT){
            this.createTile();
        }else if(type === MoveDirect.DOWN){

        }else if(type === MoveDirect.UP){

        }
        this.saveStorage();
    }

}


