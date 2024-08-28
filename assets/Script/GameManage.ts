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
        const offsetX = - tileMapWidth / 2 + this.tileWidth / 2 + this.tileMargin;
        const offsetY = tileMapWidth / 2 - this.tileWidth / 2 - this.tileMargin;
        // 0,0点是整个节点的中心点,如果以左上角顶点 作为为中心点 获取真实的位移值
        // x 轴对比 原中心点 为 -( 地图宽的一半 + 块宽的一半 + 间隔 )
        // y 轴对比 原中心点 为 +( 地图宽的一半 - 块宽的一半 - 间隔 )
        this.startPos = new Vec3( offsetX, offsetY, 0);
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
        const randomNum = Math.floor(Math.random() * 6) === 0 ? 4 : 2; // 5/1的几率生成一个更大的数字
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

        const tilePos = this.getRealPosition(roadPos);
        node.position = tilePos;
        node.parent = this.TileMap;

        // 播放动画
        if(isAnimated){
            node.scale = v3(0.5,0.5,0.5);
            tween(node).to(0.1,{ scale:v3(1,1,1) }, { easing:'sineInOut' }).start();
        }
    }
    
    // 生成 空白块
    createRoad(curPos:Vec3){
        const node = instantiate(this.Road);
        const tileUI:UITransform = node.getComponent(UITransform);
        tileUI.width = this.tileWidth;
        tileUI.height = this.tileWidth;

        const tilePos = this.getRealPosition(curPos);
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
            let isCreateTile = false; // 是否已经创建过块
            // rowIdx 代表的是y轴 ; colIdx 代表的是x轴
            for (let rowIdx = 0; rowIdx < this.tilesData.length; rowIdx++) {
                const rowData = this.tilesData[rowIdx];
                let hasMerged = false; // 当前行是否已经进行过合并
                for (let colIdx = 0; colIdx < rowData.length; colIdx++) {
                    const curItem = this.tilesData[rowIdx][colIdx]; // 当前节点
                    const boundaryPos = 0; // 边界点
                    // 当前节点 不为空 且 不处于边界
                    if(curItem !== null && colIdx !== boundaryPos ){
                        // 可移动的 目标空白块 下标
                        const endRoadColIdx = this.tilesData[rowIdx].findIndex( (v,i) => v === null && i < colIdx );
                        // 当前节点的数字
                        const curNum = + curItem.getComponent(Tile).TileLable.string; 
                        // 可合并的 目标块 下标
                        let endTileColIdx = -1;
                        for (let i = this.tilesData[rowIdx].length - 1; i >= 0; i--) {
                            let v = this.tilesData[rowIdx][i];
                            if (v !== null && i < colIdx) {
                                if(+(v.getComponent(Tile).TileLable.string) === curNum){
                                    endTileColIdx = i;
                                }
                                break; // 找到后只确定一次
                            }
                        }
                        let isMerge = endTileColIdx !== -1 && !hasMerged; // 是否可以合并
                        let isMove = endRoadColIdx !== -1; // 是否可以移动
                        if(isMerge || isMove){
                            // 目标点下标
                            const endColIdx = isMerge ? endTileColIdx : endRoadColIdx
                            const tarTilePos = new Vec3(endColIdx,rowIdx,0);// 目标 块 坐标
                            const movePos = this.getRealPosition(tarTilePos); // 目标点真实坐标
                            const tarItem = this.tilesData[rowIdx][endColIdx]
                            // 动画执行完毕后 删除目标元素 然后再生成新的元素
                            this.tileMovePosition(curItem,movePos,()=> {
                                if(isMerge){
                                    tarItem.destroy();
                                }
                                if(!isCreateTile){
                                    this.createTile();
                                    isCreateTile = true;
                                }
                            });
                            // 移动完成后需要更改其位置
                            this.tilesData[rowIdx][endColIdx] = curItem;
                            this.tilesData[rowIdx][colIdx] = null;
                            if(isMerge){
                                // 合并元素(当前元素数值 x 2)
                                const num = curNum * 2
                                const curTile = curItem.getComponent(Tile)
                                curTile.init(num)
                                hasMerged = true
                            }
                        }
                    }
                }
            }
        }else if(type === MoveDirect.RIGHT){
            let isCreateTile = false; // 是否已经创建过块
            // rowIdx 代表的是y轴 ; colIdx 代表的是x轴
            for (let rowIdx = 0; rowIdx < this.tilesData.length; rowIdx++) {
                const rowData = this.tilesData[rowIdx];
                let hasMerged = false; // 当前行是否已经进行过合并
                for (let colIdx = rowData.length - 1; colIdx >= 0; colIdx--) { // 从右开始计算*i顺序*
                    const curItem = this.tilesData[rowIdx][colIdx]; // 当前节点
                    const boundaryPos = this.tileNums; // 边界点
                    // 当前节点 不为空 且 不处于边界
                    if(curItem !== null && colIdx !== boundaryPos ){
                        // 可移动的 目标空白块 下标
                        const endRoadColIdx = this.tilesData[rowIdx].findLastIndex( (v,i) => v === null && i > colIdx ); // * > *
                        // 当前节点的数字
                        const curNum = + curItem.getComponent(Tile).TileLable.string; 
                        // 可合并的 目标块 下标
                        let endTileColIdx = -1;
                        for (let i = 0; i < this.tilesData[rowIdx].length; i++) { // *i顺序*
                            let v = this.tilesData[rowIdx][i];
                            if (v !== null && i > colIdx) { // * > *
                                if(+(v.getComponent(Tile).TileLable.string) === curNum){
                                    endTileColIdx = i;
                                }
                                break; // 找到后只确定一次
                            }
                        }
                        let isMerge = endTileColIdx !== -1 && !hasMerged; // 是否可以合并
                        let isMove = endRoadColIdx !== -1; // 是否可以移动
                        if(isMerge || isMove){
                            // 目标点下标
                            const endColIdx = isMerge ? endTileColIdx : endRoadColIdx
                            const tarTilePos = new Vec3(endColIdx,rowIdx,0);// 目标 块 坐标
                            const movePos = this.getRealPosition(tarTilePos); // 目标点真实坐标
                            const tarItem = this.tilesData[rowIdx][endColIdx]
                            // 动画执行完毕后 删除目标元素 然后再生成新的元素
                            this.tileMovePosition(curItem,movePos,()=> {
                                if(isMerge){
                                    tarItem.destroy();
                                }
                                if(!isCreateTile){
                                    this.createTile();
                                    isCreateTile = true;
                                }
                            });
                            // 移动完成后需要更改其位置
                            this.tilesData[rowIdx][endColIdx] = curItem;
                            this.tilesData[rowIdx][colIdx] = null;
                            if(isMerge){
                                // 合并元素(当前元素数值 x 2)
                                const num = curNum * 2
                                const curTile = curItem.getComponent(Tile)
                                curTile.init(num)
                                hasMerged = true
                            }
                        }
                    }
                }
            }
        } else if(type === MoveDirect.DOWN){
            let isCreateTile = false; // 是否已经创建过块
            // rowIdx 代表的是y轴 ; colIdx 代表的是x轴
            for (let colIdx = 0; colIdx < this.tilesData[0].length; colIdx++) {
                let hasMerged = false; // 当前行是否已经进行过合并
                for (let rowIdx = this.tilesData.length - 1; rowIdx >= 0; rowIdx--) { // 从右开始计算*i顺序*

                    // y行数是变化的 x列是不变的

                    const curItem = this.tilesData[rowIdx][colIdx]; // 当前节点 * 调换x,y位置 *

                    const boundaryPos = this.tileNums; // 边界点
                    // 当前节点 不为空 且 不处于边界
                    if(curItem !== null && rowIdx !== boundaryPos ){ // * 修改边界判断坐标 *
                        // 可移动的 目标空白块 下标
                        const endRoadRowIdx = this.tilesData.findLastIndex( (subArray,i)=> subArray[colIdx] === null && i > rowIdx ); // * > *
                        // 当前节点的数字
                        const curNum = + curItem.getComponent(Tile).TileLable.string;

                        // 可合并的 目标块 下标
                        let endTileRowIdx = -1;
                        for (let i = 0; i < this.tilesData.length; i++) { // *i顺序*
                            let v = this.tilesData[i][colIdx]; // * 调换了顺序 *
                            if (v !== null && i > rowIdx) { // * > *
                                if(+(v.getComponent(Tile).TileLable.string) === curNum){
                                    endTileRowIdx = i;
                                }
                                break; // 找到后只确定一次
                            }
                        }

                        let isMerge = endTileRowIdx !== -1 && !hasMerged; // 是否可以合并
                        let isMove = endRoadRowIdx !== -1; // 是否可以移动
                        if(isMerge || isMove){
                            // 目标点下标
                            const endRowIdx = isMerge ? endTileRowIdx : endRoadRowIdx
                            
                            const tarTilePos = new Vec3(colIdx,endRowIdx,0);// 目标 块 坐标

                            const movePos = this.getRealPosition(tarTilePos); // 目标点真实坐标
                            const tarItem = this.tilesData[endRowIdx][colIdx]
                            // 动画执行完毕后 删除目标元素 然后再生成新的元素
                            this.tileMovePosition(curItem,movePos,()=> {
                                if(isMerge){
                                    tarItem.destroy();
                                }
                                if(!isCreateTile){
                                    this.createTile();
                                    isCreateTile = true;
                                }
                            });
                            // 移动完成后需要更改其位置
                            this.tilesData[endRowIdx][colIdx] = curItem;
                            this.tilesData[rowIdx][colIdx] = null;
                            if(isMerge){
                                // 合并元素(当前元素数值 x 2)
                                const num = curNum * 2
                                const curTile = curItem.getComponent(Tile)
                                curTile.init(num)
                                hasMerged = true
                            }
                        }
                    }
                }
            }
        }else if(type === MoveDirect.UP){

        }
        
        // this.saveStorage();
    }

    // 块移动动画
    private tileMovePosition(tile:Node,tarPos:Vec3,callback?:Function){
        tween(tile)
        .to(0.15, { position:tarPos }, { easing: 'sineInOut' })
        .call(callback)
        .start();
    }

    // 获取实际的位置
    private getRealPosition(curPos:Vec3){
        
        const x = this.startPos.x + this.tileWidth * curPos.x + this.tileMargin * curPos.x; // x起始点 + 块宽度 * x轴坐标(个数) + 间隔宽度 * x轴坐标(个数)
        const y = this.startPos.y - this.tileWidth * curPos.y - this.tileMargin * curPos.y; // y起始点 - 块宽度 * x轴坐标(个数) - 间隔宽度 * x轴坐标(个数)
        return new Vec3( x, y, 0 );
    }
}


// else if(type === 2){
//     let isCreateTile = true;
//     // rowIdx 代表的是y轴 ; colIdx 代表的是x轴
//     for (let rowIdx = 0; rowIdx < this.tilesData.length; rowIdx++) {
//         const array = this.tilesData[rowIdx];
//         let hasMerged = false; // 用于记录当前行是否已经进行过合并
//         for (let colIdx = array.length - 1; colIdx >= 0; colIdx--) {
//             const curPos = new Vec3(colIdx,rowIdx,0);// 当前坐标
//             const curItem = this.tilesData[curPos.y][curPos.x]; // 当前值
//             const curTile = curItem ? curItem.getComponent(Tile) : null;
//             const curNum = curTile ? Number(curTile.TileLable.string) : -1; // 当前数字
            
//             const endRoadColIdx = this.tilesData[curPos.y].findLastIndex( (v,i) => v === null && i > curPos.x ); // 找到x轴从右往左数第一个 空块 下标*
//             const tarRoadPos = new Vec3(endRoadColIdx,curPos.y,0);// 目标 空块 坐标
            
//             const endTileColIdx = this.tilesData[curPos.y].findIndex( (v,i) => v !== null && i > curPos.x ); // 找到x轴从左往右数第一个 块 下标*
//             const tarTilePos = new Vec3(endTileColIdx,curPos.y,0);// 目标 块 坐标
            
//             const tarItem = endTileColIdx !== -1 ? this.tilesData[curPos.y][endTileColIdx] : null; // 目标 块
//             const tarTile = tarItem ? tarItem.getComponent(Tile) : null;
//             const tarNum = tarTile ? Number(tarTile.TileLable.string) : -1;// 当前数字
            
//             // 当前元素 不是左边界 且 不是空
//             const boundaryPos = this.tileNums; // x轴边界
//             if(curPos.x !== boundaryPos && curItem !== null){
//                 if(endTileColIdx !== -1 && curNum === tarNum && !hasMerged){
//                     // 当前元素移动到目标元素 并更新视图
//                     const movePos = this.getRealPosition(tarTilePos);
//                     // 动画执行完毕后 删除目标元素 然后再生成新的元素
//                     this.tileMovePosition(curItem,movePos,()=>{
//                         tarItem.destroy();
//                         if(isCreateTile){
//                             this.createTile();
//                             isCreateTile = false;
//                         }
//                     });
//                     this.tilesData[tarTilePos.y][tarTilePos.x] = curItem;
//                     this.tilesData[curPos.y][curPos.x] = null;
//                     // 合并元素(当前元素数值 x 2)
//                     const num = curNum * 2
//                     curTile.init(num);
//                     hasMerged = true;
//                 } else if( endRoadColIdx !== -1){ // 如果可以找到目标空缺 那么就可以移动
//                     const movePos = this.getRealPosition(tarRoadPos);
//                     this.tileMovePosition(curItem,movePos,()=>{
//                         if(isCreateTile){
//                             this.createTile();
//                             isCreateTile = false;
//                         }
//                     });
//                     // 移动完成后需要更改其位置
//                     this.tilesData[tarRoadPos.y][tarRoadPos.x] = curItem;
//                     this.tilesData[curPos.y][curPos.x] = null;
//                 }
//             }
            
//         }
//     }
// }