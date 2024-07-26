import { _decorator, Component, instantiate, LabelComponent, Node,NodeEventType,Prefab,sys, tween, UITransform, v3, Vec3,EventTouch, Vec2  } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;


// 用户本地数据接口
interface userData {
    lv:number,
    score:number,
    bestScore:number,
    backNum:number,

    array:  number[][],
    arrHistory: number[]
}

// 移动枚举类型
enum MoveType {
    top,
    bottom,
    left,
    right,
}

@ccclass('GameManage')
export class GameManage extends Component {

    @property(Node)
    startMenu:Node;
    @property(Node)
    gamePlane:Node;
    @property(Node)
    endMenu:Node;

    @property(LabelComponent)
    txtLv:LabelComponent;
    @property(LabelComponent)
    txtScore:LabelComponent;
    @property(LabelComponent)
    txtBestScore:LabelComponent;
    @property(LabelComponent)
    txtBackNum:LabelComponent;

    @property(Node)
    ndParent:Node;
    @property(UITransform)
    ndParentTransForm:UITransform;
    @property(Prefab)
    block:Prefab
    @property(Prefab)
    blockBg:Prefab

    // 用户数据
    private userData:userData;
    // 间隙
    private gap:number = 0;
    // 块宽高
    private blockWH:number = 0;
    // 父级块宽高
    private blockPraentWH:number = 0;

    // 块数据数组
    private array:number[][] = [];

    // 起始点坐标
    private posStart:Vec2;
    // 截至点坐标
    private posEnd:Vec2;
    // 游戏状态 1为游戏中 0为游戏未开始
    private gameStatus:number = 0;

    // 游戏开始的回调
    start() {
        this.initPanel();
        this.startMenu.active = true;
        this.addTouchEvent()
    }

    // 初始化
    private init(){
        this.getUserInfo();
        this.updateView();
    }

    // 添加需要绑定的事件
    private addTouchEvent(){
        this.node.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(NodeEventType.TOUCH_END,this.onTouchEnd,this)
    }

    // 点击开始
    private onTouchStart(event:EventTouch){
        if(!this.gameStatus) return;
        this.posStart = event.getLocation()
    }

    // 点击结束
    private onTouchEnd(event:EventTouch){
        if(!this.gameStatus) return;
        this.posEnd = event.getLocation();
        const displaceX = this.posStart.x - this.posEnd.x // x轴偏移量
        const displaceY = this.posStart.y - this.posEnd.y // y轴偏移量
        if(Math.abs(displaceX) < 10 && Math.abs(displaceY) < 10) return; // 当前位移量太小
        // 判断移动方向
        if(Math.abs(displaceX) > Math.abs(displaceY)){/* x轴位移量大于y轴则为x轴方向的移动，反之同理 */ 
            if(displaceX < 0){
                this.blockMove(MoveType.right)
                console.log('向右')
            }
            if(displaceX > 0){
                this.blockMove(MoveType.left)
                console.log('向左')
            }
        }else{
            if(displaceY < 0){
                this.blockMove(MoveType.top)
                console.log('向上')
            }
            if(displaceY > 0){
                this.blockMove(MoveType.bottom)
                console.log('向下')
            }
        }
    }

    // 判断数字块移动的逻辑
    private blockMove(key:MoveType){
        let canMove:boolean = false; // 是否可移动

        let isGetScore:boolean = false; // 是否已得分

        switch (key) {
            case MoveType.right:               
                // 用于表示除最后一列的每一列
                // for (let i = this.array.length - 2; i >= 0; i--) {
                //     // 用于表示除最后一列的每一个值
                //     for (let j = 0; j < this.array.length; j++) {
                //         // 用于表示除最后一列的每一个值的全部可能性
                //         for (let k = 0; k < this.array.length; k++) {
                //             // j + k < this.array.length - 1 用于比对的全部可能性 必须小于数组最大长度-1
                //             // 代表向右的下一个没有值则可移动
                //             if(i + k < this.array.length - 1 && this.array[j][i+k] > 0 && this.array[j][i+k+1] === 0){
                //                 this.array[j][i+k+1] = this.array[j][i+k];
                //                 this.array[j][i+k] = 0
                //                 canMove = true;
                //             }else if(i + k < this.array.length - 1 && this.array[j][i+k] > 0 && this.array[j][i+k] === this.array[j][i+k+1]){
                //                 // 代表向右的下一个没有值且与当前值相当则可移动并且和合成
                //                 this.array[j][i+k+1] = this.array[j][i+k+1] * 2
                //                 this.array[j][i+k] = 0;
                //                 canMove = true;
                //                 isGetScore = true;
                //                 this.updateScore()
                //             }
                //         }
                //     }
                // }

                // y轴
                for (let j = 0; j < this.array.length; j++) {
                    // x轴
                    /*let i = this.array.length - 2 ：因为当前的目标只能是边缘的前一个元素才有判断的必要 */
                    for (let i = this.array.length - 2 ; i >= 0; i--) {
                        
                        let k = i;
                        /* this.array[j][k + 1] === 0 : 目标值的元素 */
                        while (k < this.array.length - 1 && (this.array[j][k + 1] === 0 || this.array[j][k + 1] === this.array[j][k])) {

                            if (this.array[j][k + 1] === 0) { // 代表目标值为0; 则可以移动

                                this.array[j][k + 1] = this.array[j][k];
                                this.array[j][k] = 0;
                                k++;
                                canMove = true;
                            } else if (this.array[j][k + 1] === this.array[j][k]) { // 代表目标值等于当前值; 则可以合成并移动

                                this.array[j][k + 1] *= 2;
                                this.array[j][k] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore();
                                break;
                            }
                        }
                    }
                }
                break;
            case MoveType.left:
                for (let i = 1; i < this.array.length; i++) {
                    // 用于表示除最后一列的每一个值
                    for (let j = 0; j < this.array[i].length; j++) {
                        // 用于表示除最后一列的每一个值的全部可能性
                        for (let k = 0; k < this.array.length; k++) {
                            // j + k < this.array.length - 1 用于比对的全部可能性 必须小于数组最大长度-1
                            // 代表向右的下一个没有值则可移动
                            if(i - k >= 1 && this.array[j][i-k] > 0 && this.array[j][i-k-1] === 0){
                                this.array[j][i-k-1] = this.array[j][i-k];
                                this.array[j][i-k] = 0
                                canMove = true;
                            }else if(i - k >= 1 && this.array[j][i-k] > 0 && this.array[j][i-k] === this.array[j][i-k-1]){
                                // 代表向右的下一个没有值且与当前值相当则可移动并且和合成
                                this.array[j][i-k-1] = this.array[j][i-k-1] * 2
                                this.array[j][i-k] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore()
                            }
                        }
                    }
                }
                break;
            case MoveType.top:
                // for (let i = this.array.length - 2; i >= 0; i--) {
                //     for (let j = 0; j < this.array[i].length; j++) {
                //         for (let k = 0; k < this.array.length; k++) {
                //             if(i + k < this.array.length - 1 && this.array[i+k][j] > 0 && this.array[i+k+1][j] === 0){
                //                 this.array[i+k+1][j] = this.array[i+k][j];
                //                 this.array[i+k][j] = 0;
                //                 canMove = true;
                //             }else if(i + k < this.array.length - 1 && this.array[i+k][j] > 0 && this.array[i+k][j] === this.array[i+k+1][j]){
                //                 this.array[i+k+1][j] = this.array[i+k+1][j] * 2;
                //                 this.array[i+k][j] = 0;
                //                 canMove = true;
                //                 isGetScore = true;
                //                 this.updateScore();
                //             }
                //         }
                //     }
                // }
                break;
            case MoveType.bottom:
                // for (let i = 1; i < this.array.length; i++) {
                //     for (let j = 0; j < this.array[i].length; j++) {
                //         for (let k = 0; k < this.array.length; k++) {
                //             if(i - k >=  1 && this.array[i-1-k][j] > 0 && this.array[i-k][j] === 0){
                //                 this.array[i-k-1][j] = this.array[i-k][j];
                //                 this.array[i-k][j] = 0
                //                 canMove = true;
                //             }else if(i - k >=  1 && this.array[i-k][j] > 0 && this.array[i-k][j] === this.array[i-k-1][j]){
                //                 this.array[i-k-1][j] = this.array[i-k-1][j] * 2
                //                 this.array[i-k][j] = 0;
                //                 canMove = true;
                //                 isGetScore = true;
                //                 this.updateScore()
                //             }
                //         }
                //     }
                // }


                break;
            default:
                break;
        }
        if(canMove){
            this.clearAllBlock();
            this.createAllBlock();
            this.addRandomArray();
        }
        if(isGetScore){

        }
    }

    // 创建所有块图形
    private createAllBlock(){
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array[i].length; j++) {
                if(this.array[i][j]>0){
                    const pos = new Vec3(i,j,0);
                    this.createBlock(pos,this.array[i][j],true);
                }
            }
        }
    }
    // 生成数字块
    private createBlock(pos:Vec3,num:number,isAction:boolean = false){
        const posStart = new Vec3(-this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, - this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, 0);
        let block = instantiate(this.block); // 实例化block预制体
        let tile = block.getComponent(Tile);
        if(tile) tile.init(num); // 执行tile预制体方法
        block.parent = this.ndParent
        // 设置blockUI形态
        let blockUI:UITransform = block.getComponent(UITransform);
        blockUI.width = this.blockWH;
        blockUI.height = this.blockWH;
        // 设置block坐标
        const x = posStart.x + (blockUI.width + this.gap) * pos.y;
        const y = posStart.x + (blockUI.width + this.gap) * pos.x;
        block.position = new Vec3(x,y,0);
        // 是否播放动画
        if(isAction){
            block.scale = v3(0,0,0);
            tween(block).to(0.15,{scale:v3(1,1,1)},{easing:"sineInOut"}).start()
        }
    }
    // 删除所有块图形
    clearAllBlock(){
        let children = this.ndParent.children;
        for (let i = children.length - 1; i >= 0; i--) {
            let child = children[i]
            let tile = child.getComponent(Tile);
            if(tile){
                this.ndParent.removeChild(child)
            }
        }
    }

    // 获取本地用户信息
    private getUserInfo(){
        this.userData = JSON.parse(sys.localStorage.getItem('userInfo'));
        if(!this.userData){
            this.userData = {
                lv:5,
                score:0,
                bestScore:0,
                backNum:3,

                array:[],
                arrHistory:[]
            }
        }
    }

    // 保存本地用户信息
    private setUserInfo(){
        sys.localStorage.setItem('userInfo',JSON.stringify(this.userData))
    }

    // 刷新视图
    private updateView(){
        const lv = this.userData.lv
        this.gap = 5;
        // this.blockWH = Math.round( 640 / lv); // 640 会超出当前屏幕宽度

        this.blockWH = Math.round( 580 / lv);

        // 父块的宽高
        this.blockPraentWH = this.blockWH * lv + this.gap * (lv + 1)

        const blockPraent = this.ndParent.getComponent(UITransform)
        blockPraent.width = this.blockPraentWH
        blockPraent.height = this.blockPraentWH

        this.addBlockBg(lv); // 添加 块背景颜色


        this.txtLv.string = lv + ' x ' + lv
        this.txtScore.string = this.userData.score.toString()
        this.txtBestScore.string = this.userData.bestScore.toString()
        this.txtBackNum.string = '撤回(' + this.userData.backNum.toString() + ')'

        if(this.userData.array.length === 0){
            this.initArray(lv);
            this.addRandomArray();
        }else{
            this.array = this.userData.array;
            this.createAllBlock();
        }
        
    }
    
    // 刷新得分
    private updateScore(){

    }

    // 初始数组
    initArray(lv:number){
        this.array = []
        for (let i = 0; i < lv; i++) {
            this.array[i] = [];
            for (let j = 0; j < lv; j++) {
                this.array[i][j] = 0
            }
        }
    }

    // 添加背景块
    addBlockBg(lv:number){
        const posStart = new Vec3(-this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, - this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, 0);
        for (let i = 0; i < lv; i++) {
            for (let j = 0; j < lv; j++) {
                let blockBg = instantiate(this.blockBg); // 实例化预制体
                blockBg.parent = this.ndParent
                let blockBgTransform:UITransform = blockBg.getComponent(UITransform);

                blockBgTransform.width = this.blockWH;
                blockBgTransform.height = this.blockWH;

                const posX = posStart.x + (blockBgTransform.width + this.gap) * j;
                const posY = posStart.y + (blockBgTransform.height + this.gap) * i;

                blockBg.position = new Vec3(posX, posY, 0);
            }
        }
    }

    // 添加随机数组
    private addRandomArray(){
        let arrEmpty = [];
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array[i].length; j++) {
                if(this.array[i][j] === 0){
                    arrEmpty.push(new Vec3(i,j,0))
                }
            }            
        }
        if(arrEmpty.length !== 0){
            // 随机一个已有的空白格子的一个点
            let pos = Math.floor(Math.random() * arrEmpty.length);
            
            let ii = arrEmpty[pos].x;
            let jj = arrEmpty[pos].y;

            let randomNum = Math.random() * 10;

            if(randomNum < 2 ){
                this.array[ii][jj] = 4
            }else{
                this.array[ii][jj] = 2
            }

            this.createBlock(arrEmpty[pos],this.array[ii][jj],true)
        }
    }

    

    // 初始化面板
    initPanel(){
        this.startMenu.active = false;
        this.gamePlane.active = false;
        this.endMenu.active = false;
    }

    // 开始游戏
    startGame(){
        this.initPanel();
        this.gamePlane.active = true;
        this.init();

        this.gameStatus = 1;
    }

    // 返回主菜单
    backMain(){
        this.initPanel();
        this.startMenu.active = true;
    }

    // 重新开始游戏
    replay(){

    }

    // 撤回上一步
    retreat(){

    }

    update(deltaTime: number) {
        
    }
}


