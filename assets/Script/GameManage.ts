import { _decorator, Component, instantiate, LabelComponent, Node,NodeEventType,Prefab,sys, tween, UITransform, v3, Vec3,EventTouch, Vec2  } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;



interface userData {
    lv:number,
    score:number,
    bestScore:number,
    backNum:number,

    array:  number[][],
    arrHistory: number[]
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
    private array:number[][] | null = null;

    // 起始点坐标
    private posStart:Vec2;
    // 截至点坐标
    private posEnd:Vec2;
    // 游戏状态 1为游戏中 0为游戏未开始
    private gameStatus:number = 0;

    init(){
        this.initPane();
        this.startMenu.active = true;
        this.getUserInfo();
        this.updateView();
        this.addTouchEvent()
    }

    // 添加点击事件
    addTouchEvent(){
        this.node.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
        // this.node.on(NodeEventType.TOUCH_MOVE,this.onTouchMove,this)
        // this.node.on(NodeEventType.TOUCH_CANCEL,this.onTouchCancel,this)
        this.node.on(NodeEventType.TOUCH_END,this.onTouchEnd,this)
    }

    // 点击开始
    onTouchStart(event:EventTouch){
        this.posStart = event.getLocation()
    }

    // 点击后移动
    // onTouchMove(event:EventTouch){

    // }

    // 点击后取消
    // onTouchCancel(event:EventTouch){

    // }

    // 点击结束
    onTouchEnd(event:EventTouch){
        this.posEnd = event.getLocation();

        // x轴偏移量
        const displaceX = this.posStart.x - this.posEnd.x
        // y轴偏移量
        const displaceY = this.posStart.y - this.posEnd.y

        if(Math.abs(displaceX) < 10 && Math.abs(displaceY) < 10) return; /* 当前位移量太小 */ 

        // 判断移动方向
        if(Math.abs(displaceX) > Math.abs(displaceY)){/* x轴位移量大于y轴则为x轴方向的移动，反之同理 */ 
            if(displaceX > 0){
                this.blockMove('left')
                console.log('向左')
            }
            if(displaceX < 0){
                this.blockMove('right')
                console.log('向右')
            }
        }else{
            if(displaceY > 0){
                this.blockMove('bottom')
                console.log('向下')
            }
            if(displaceY < 0){
                this.blockMove('top')
                console.log('向上')
            }
        }
    }

    blockMove(key){
        switch (key) {
            case 'right':
                
                break;
            case 'left':

                break;
            case 'top':
                
                break;
            case 'bottom':
                
                break;
            default:
                break;
        }
    }




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

    private setUserInfo(){
        sys.localStorage.setItem('userInfo',JSON.stringify(this.userData))
    }

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


        this.initArray(lv)

        this.addRandomArray();
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

            this.createBlock(arrEmpty[pos],this.array[ii][jj],)
        }
    }
    // 生成块
    private createBlock(pos:Vec3,num:number,isAction:boolean = false){
        const posStart = new Vec3(-this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, - this.blockPraentWH / 2 + this.blockWH / 2 + this.gap, 0);
        let block = instantiate(this.block);
        let tile = block.getComponent(Tile)
        if(tile){
            tile.init(num)
        }
        block.parent = this.ndParent

        let blockTf:UITransform = block.getComponent(UITransform);

        blockTf.width = this.blockWH;
        blockTf.height = this.blockWH;


        let _x = posStart.x + (blockTf.width + this.gap) * pos.y;
        let _y = posStart.x + (blockTf.width + this.gap) * pos.x;


        block.position = new Vec3(_x,_y,0);


        if(isAction){
            block.scale = v3(0,0,0);

            tween(block).to(0.15,{scale:v3(1,1,1)},{easing:"sineInOut"}).start()
        }
    }


    

    initPane(){
        this.startMenu.active = false;
        this.gamePlane.active = false;
        this.endMenu.active = false;
    }

    // 开始游戏
    startGame(){
        this.initPane();
        this.gamePlane.active = true;
    }

    // 返回主菜单
    backMain(){
        this.initPane();
        this.startMenu.active = true;
    }

    // 重新开始游戏
    replay(){

    }

    // 撤回上一步
    retreat(){

    }

    start() {
        this.init();
    }

    update(deltaTime: number) {
        
    }
}


