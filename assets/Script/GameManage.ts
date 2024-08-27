import { _decorator, Component, EventTouch, instantiate, Node, NodeEventType, Prefab, Sprite, tween, UITransform, v3, Vec2, Vec3 } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

enum MoveDirect {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

type userInfo  = {

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

    private isGameStarting:boolean = false; // 游戏是否已经开始
    private posStart:Vec2; // 起始点
    private posEnd:Vec2; // 结束点

    tileNums:number = 4; // 容器容纳块数量
    tilesData:(Node | null)[][] = []; // 容器内容 null 代表为空白 数字代表为生成的块
    tileMargin:number = 16; // 块间隔
    tileWidth:number; // 格子的宽度
    startPos:Vec3; // 起始点坐标

    userInfoData:userInfo = {}; // 玩家数据

    // 游戏开始时的回调
    start() {
        this.addEventListener();
        this.StartMenu.active = true;
        this.SettingMenu.active = false;
        this.init();
    }

    // 重新开始
    reStart(){
        localStorage.removeItem('userInfoData');
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
    
    // 初始化块地图数据
    initTileMapData(){
        const userInfoDataLocal:string = localStorage.getItem('userInfoData');
        // 使用本地存储的情况
        if(userInfoDataLocal){
            const userInfoData = JSON.parse(userInfoDataLocal)
            this.tilesData = userInfoData.tilesData;
        }else{
            this.tilesData = [];
            for (let rowIdx = 0; rowIdx < this.tileNums; rowIdx++) {
                this.tilesData[rowIdx] = [];
                for (let colIdx = 0; colIdx < this.tileNums; colIdx++) {
                    this.tilesData[rowIdx][colIdx] = null;
                }
            }
        }
    }

    // 渲染块地图视图
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
        this.startPos = new Vec3( startX, startY, 0 ); // x y 轴的 0,0 点为中心点, 则左上角的点 x 轴是 负的 y 轴是正向的。且为 块容器宽的一半 +/- 块宽 的一半 +/- margin
        
        // 初始化
        for (let rowIdx = 0; rowIdx < this.tilesData.length; rowIdx++) {
            const array = this.tilesData[rowIdx];

            for (let colIdx = 0; colIdx < array.length; colIdx++) {

                const curPos = new Vec3(colIdx,rowIdx,0)

                const curItem = this.tilesData[curPos.y][curPos.x];

                this.createRoad(curPos);
                // 不为null的情况下
                if(curItem !== null){
                    const curNum = Number(curItem.getComponent(Tile).TileLable.string) 
                    this.createTile(false,false,curNum,curPos);
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
    createTile(isAnimated: true | false = true,isRandom: true | false = true, curNum?: number, curPos?:Vec3 ){
        const randomNum = Math.floor(Math.random() * 2) === 1 ? 4 : 2; // 是否生成一个双倍大的数字
        const num = isRandom ? randomNum: curNum; // 生成的数字大小
        const roadArr = []; // 空白块的下标
        this.tilesData.forEach( (arr,rowIdx) => {
            arr.forEach((v,colIdx) => {
                if(v === null){
                    roadArr.push(new Vec3(colIdx,rowIdx,0));
                }
            })
        });
        if(roadArr.length <= 0) return; // 如果当前没有空白块则跳出

        const roadIdx = Math.floor(Math.random() * roadArr.length); // 空白块下标
        const roadPos = isRandom ? roadArr[roadIdx] : curPos; // 随机的空白块的坐标
       
        const node = instantiate(this.Tile);
        const tile =  node.getComponent(Tile)
        tile.init(num)

        this.tilesData[roadPos.y][roadPos.x] = node; // 将目标的空白块重新赋值

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
    createRoad(curPos:Vec3){
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
        const userInfoData = JSON.stringify(this.userInfoData)
        localStorage.setItem('userInfoData',userInfoData)
    }

    // 开始游戏
    startGame(){
        this.isGameStarting = true;
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
        if(this.isGameStarting === false) return;

        this.posStart = evt.getLocation()
    }

    // 点击结束
    private onTouchEnd(evt:EventTouch){
        if(this.isGameStarting === false) return;

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

    // 块移动
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

    // 运算块合并后结果
    private calculateTiles(type:MoveDirect){

        if(type === MoveDirect.LEFT){
            // rowIdx 代表的是y轴 ; colIdx 代表的是x轴
            for (let rowIdx = 0; rowIdx < this.tilesData.length; rowIdx++) {
                const array = this.tilesData[rowIdx];
                for (let colIdx = 0; colIdx < array.length; colIdx++) {

                    const curPos = new Vec3(colIdx,rowIdx,0);// 当前坐标


                    const curItem = this.tilesData[curPos.y][curPos.x]; // 当前值
                    
                    const endColIdx = this.tilesData[curPos.y].findIndex( v => v === null ); // 找到x轴的第几个

                    const tarPos = new Vec3(endColIdx,curPos.y,0);// 目标坐标

                    const tarItem = this.tilesData[tarPos.y][tarPos.x]; // 目标值
                    
                    const curNum = curItem ? Number(curItem.getComponent(Tile).TileLable.string) : 0;
                    const tarNum = tarItem ? Number(tarItem.getComponent(Tile).TileLable.string) : 0;

                    // 目标结果是空值则移动,否则合并 并 移动
                    if(curPos.x !== 0 && curItem !== null){

                        if(tarItem === null){

                        }

                        if(curNum === tarNum){

                        }

                        console.log(endColIdx,this.tilesData,curNum,curItem)

                        const xPos = this.startPos.x + this.tileWidth * tarPos.x + this.tileMargin * tarPos.x;
                        const yPos = this.startPos.y - this.tileWidth * tarPos.y - this.tileMargin * tarPos.y;

                        const tarTilePos = new Vec3( xPos, yPos, 0);

                        this.tileMovePosition(curItem,tarTilePos);

                        // 移动完成后需要更改其位置
                        this.tilesData[tarPos.y][tarPos.x] = curItem;
                        this.tilesData[curPos.y][curPos.x] = null;
                    }
                    
                    // else if(curPos.x !== 0 && curItem !== null && tarItem === null && curNum === tarNum){
                    //     //  且  当前值和目标值相等 则 合并两者的值
                    //     const curTile = curItem.getComponent(Tile)
                    //     const curNum = Number(curTile.TileLable.string);

                    //     const tarTile = tarItem.getComponent(Tile)
                    //     const tarNum = Number(tarTile.TileLable.string);
                    //     if(curNum === tarNum){
                    //         const xPos = this.startPos.x + this.tileWidth * tarPos.x + this.tileMargin * tarPos.x;
                    //         const yPos = this.startPos.y - this.tileWidth * tarPos.y - this.tileMargin * tarPos.y;
                    //         const tarTilePos = new Vec3( xPos, yPos, 0);
                            
                    //         console.log('same',curTile,tarTile,curNum,tarNum)
    
                    //         // this.tileMovePosition(curItem,tarTilePos)
                    //     }
                    // }
                }
            }
        }else if(type === MoveDirect.RIGHT){
            this.createTile();
        }else if(type === MoveDirect.DOWN){
            

        }else if(type === MoveDirect.UP){

        }
        
        // this.saveStorage();
    }

    // 块移动动画
    private tileMovePosition(tile:Node,tarPos:Vec3){
        tween(tile).to(0.15, { position:tarPos }, { easing: 'sineInOut' }).start();
    }
}


