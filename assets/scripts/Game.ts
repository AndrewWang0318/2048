import { _decorator, AudioClip, AudioSource, Component, instantiate, LabelComponent, Node, NodeEventType, Prefab, sys, Terrain, tween, UITransform, v2, v3 } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property(Node)
    startPanel:Node =null!;
    @property(Node)
    gamePanel:Node = null!;
    @property(Node)
    overPanel:Node = null!;

    @property(LabelComponent)
    txtLv:LabelComponent = null!;
    @property(LabelComponent)
    txtScore:LabelComponent = null!;
    @property(LabelComponent)
    txtBestScore:LabelComponent = null!;
    @property(LabelComponent)
    txtBack:LabelComponent = null!;
    @property(Node)
    ndParent:Node = null!;
    @property(UITransform)
    ndParentTransform:UITransform = null!;
    @property(Prefab)
    item:Prefab = null!;
    @property(Prefab)
    itemBg:Prefab = null!;
    @property(LabelComponent)
    txtOverScore:LabelComponent = null!;

    @property(AudioClip)
    soundMove:AudioClip = null!;
    @property(AudioClip)
    soundGetScore:AudioClip = null!;

    private userData:any = null;
    private jiange:number = 0;
    private itemWH:number = 0;
    private itemParentWh:number = 0;
    private array = [];

    private posStart;
    private posEnd;
    private gameType:number = 0;

    start() {
        this.initPanel();
        this.startPanel.active = true;
        this.addTouch();
    }

    private addTouch(){
        this.node.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(NodeEventType.TOUCH_MOVE,this.onTouchMove,this);
        this.node.on(NodeEventType.TOUCH_END,this.onTouchEnd,this);
        this.node.on(NodeEventType.TOUCH_CANCEL,this.onTouchCancel,this);
    }

    private onTouchStart(event)
    {
        if(this.gameType!=1)return;
        this.posStart = event.getLocation();
    }

    private onTouchMove(event)
    {
        if(this.gameType!=1)return;
    }

    private onTouchEnd(event)
    {
        if(this.gameType!=1)return;
        this.posEnd = event.getLocation();
        let xx = this.posEnd.x - this.posStart.x;
        let yy = this.posEnd.y - this.posStart.y;
        if(Math.abs(xx)<10&&Math.abs(yy)<10) return;
        if(Math.abs(xx)>Math.abs(yy))
        {
            if(xx>0)
            {
                this.moveItem("you")
                console.log("右移动");
            }else
            {
                this.moveItem("zuo")
                console.log("左移动");
            }
        }else{
            if(yy>0)
            {
                this.moveItem("shang")
                console.log("上移动");
            }else{
                this.moveItem("xia");
                console.log("下移动")
            }
        }
    }

    private moveItem(type)
    {
      let canMove:boolean = false;
      let isGetScore:boolean = false;
      switch (type) {
        case "you":
            for(let j = this.array.length-2;j>=0;j--)
            {
                for(let i = 0;i<this.array.length;i++)
                {
                    for(let k = 0;k<this.array.length;k++)
                    {
                        if(j+1+k<this.array.length&&this.array[i][j+1+k]==0&&this.array[i][j+k]>0)
                        {
                            this.array[i][j+1+k] = this.array[i][j+k];
                            this.array[i][j+k] = 0;
                            canMove = true;
                        }
                        else if(j+1+k<this.array.length&&this.array[i][j+1+k]==this.array[i][j+k]&&this.array[i][j+k]>0)
                        {
                            this.array[i][j+1+k] = this.array[i][j+1+k]*2;
                            this.array[i][j+k]=0;
                            canMove = true;
                            isGetScore = true;
                            this.updateScore(this.array[i][j+1+k]);
                        }
                    }
                }
            }
            break;
            case "zuo":
                for(let j = 1;j<this.array.length;j++)
                {
                    for(let i = 0;i<this.array[j].length;i++)
                    {
                        for(let k = 0;k<this.array.length;k++)
                        {
                            if(j-1-k>=0&&this.array[i][j-1-k]==0&&this.array[i][j-k]>0)
                            {
                                //可以移动
                                this.array[i][j-1-k] = this.array[i][j-k];
                                this.array[i][j-k] = 0;
                                canMove = true;
                            }
                            else if(j-1-k>=0 && this.array[i][j-1-k]==this.array[i][j-k]&&this.array[i][j-k]>0)
                            {
                                //可以合成
                                this.array[i][j-1-k] = this.array[i][j-1-k]*2;
                                this.array[i][j-k]=0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i][j-1-k]);
                            }
                        }
                    }
                }
                break;
            case "shang":
                for(let i = this.array.length-2;i>=0;i--)
                {
                    for(let j = 0 ;j<this.array[i].length;j++)
                    {
                        for(let k = 0;k<this.array.length;k++)
                        {
                            if(i+1+k<this.array.length&&this.array[i+1+k][j]==0 &&this.array[i+k][j]>0)
                            {
                                //可移动
                                this.array[i+1+k][j] = this.array[i+k][j];
                                this.array[i+k][j] = 0;
                                canMove = true;
                            }
                            else if(i+1+k<this.array.length && this.array[i+1+k][j]==this.array[i+k][j] && this.array[i+k][j]>0)
                            {
                                //可以合成
                                this.array[i+1+k][j] = this.array[i+1+k][j]*2;
                                this.array[i+k][j] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i+1+k][j]);
                            }
                        }
                    }
                }
                break;
            case "xia":
                for(let i = 1;i<this.array.length;i++)
                {
                    for(let j = 0;j<this.array[i].length;j++)
                    {
                        for(let k = 0;k<this.array.length;k++)
                        {
                            if(i-1-k>=0 && this.array[i-1-k][j]==0 && this.array[i-k][j] >0)
                            {
                                //可以移动
                                this.array[i-1-k][j] = this.array[i-k][j];
                                this.array[i-k][j] = 0;
                                canMove = true;
                            }
                            if(i-1-k>=0 && this.array[i-1-k][j] == this.array[i-k][j]&& this.array[i-k][j]>0)
                            {
                                //可以合成
                                this.array[i-1-k][j] = this.array[i-1-k][j]*2;
                                this.array[i-k][j] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i-1-k][j]);
                            }
                        }
                    }
                }
                break;
        default:
            break;
      }

      if(canMove)
      {
        let ad:AudioSource = new AudioSource();
        if(isGetScore)
        {
            ad.playOneShot(this.soundGetScore);
        }else{
            ad.playOneShot(this.soundMove);
        }
   
         this.cleanAllItem();
         for(let i =0 ;i<this.array.length;i++)
         {
            for(let j = 0;j<this.array[i].length;j++)
            {
                if(this.array[i][j]>0)
                {
                    let pos = v2(i,j);
                    this.createItem(pos,this.array[i][j]);
                }
            }
         }
         this.addRandomArray();
      }
    }


    private cleanAllItem(){
        let children = this.ndParent.children;
        for(let i = children.length-1;i>=0;i--){
            let tile =children[i].getComponent(Tile);
            if(tile)
            {
                this.ndParent.removeChild(children[i]);
            }
        }
    }

    private updateScore(score)
    {
        this.userData.score += score;
        if(this.userData.score> this.userData.bestScore)
        {
            this.userData.bestScore = this.userData.score;
        }

        this.txtScore.string = this.userData.score+"";
        this.txtBestScore.string = this.userData.bestScore+"";
        this.saveUserInfo();

    }

    private onTouchCancel(event)
    {
        if(this.gameType!=1)return;
    }

    update(deltaTime: number) {
        
    }

    private initPanel(){
        this.startPanel.active = false;
        this.gamePanel.active = false;
        this.overPanel.active = false;
    }

    //初始化
    private init(){
        this.getUserInfo();
        this.updateView();
    }

    //获取用户信息
    private getUserInfo(){
        this.userData = JSON.parse(sys.localStorage.getItem("userData"));
        if(this.userData==null)
        {
            this.userData = {
                lv:5,
                score:0,
                bestScore:0,
                array:[],
                arr_histroy:[],
                backNum:3
            }
        } 
    }

    private saveUserInfo(){
        sys.localStorage.setItem("userData",JSON.stringify(this.userData));
    }  

    private updateView(){
        this.gameType = 1;
        let lv = this.userData.lv;
        this.jiange = 5;
        this.itemWH = Math.round(640/lv);
        this.itemParentWh = this.itemWH*lv+this.jiange*(lv+1);
        this.ndParentTransform.width = this.itemParentWh;
        this.ndParentTransform.height = this.itemParentWh;
        this.addItemBg(lv);

        this.txtLv.string = lv+"x"+lv;
        this.txtScore.string = this.userData.score.toString();
        this.txtBestScore.string = this.userData.bestScore+"";
       

        let len = this.userData.arr_histroy.length - 1;
        if(len<=0)
        {
            len = 0;
        }
        if(len>this.userData.backNum)
        {
            len = this.userData.backNum;
        }

        this.txtBack.string = "撤回("+len+")";
        
        if(this.userData.array.length ==0)
        {
            this.initArray(lv);
            this.addRandomArray()
        }else
        {
            this.array = this.userData.array;
            for(let i = 0;i<this.array.length;i++)
            {
                for(let j = 0;j<this.array[i].length;j++)
                {
                    if(this.array[i][j]>0)
                    {
                        let pos = v2(i,j);
                        this.createItem(pos,this.array[i][j]);
                    }
                }
            }
        }


       
    }

    //初始化数组
    private initArray(lv){
        this.array = [];
        for(let i = 0;i<lv;i++)
        {
            this.array[i] = [];
        }

        for(let i = 0;i<lv;i++)
        {
            for(let j = 0;j<lv;j++)
            {
                this.array[i][j] = 0;
            }
        }
    }
    
    //在空格子上随机添加数字
    private addRandomArray()
    {
        let arr_0 = [];
        for(let i = 0;i<this.array.length;i++)
        {
            for(let j =0;j<this.array[i].length;j++)
            {
                if(this.array[i][j]==0)
                {
                    arr_0.push(v2(i,j));
                }
            }
        }
        if(arr_0.length!=0)
        {
            let i_random = Math.floor(Math.random()*arr_0.length);
            let ii = arr_0[i_random].x;
            let jj = arr_0[i_random].y;
            let randomNum = Math.random()*10;
            if(randomNum<2)
            {
                this.array[ii][jj] = 4;
            }else{
                this.array[ii][jj] = 2;
            }
            this.createItem(arr_0[i_random],this.array[ii][jj],true)
            this.onCheckOver();
        }
    }

    private createItem(pos,num,isAction = false)
    {
        let posStart = v2(-this.itemParentWh/2+this.itemWH/2+this.jiange,-this.itemParentWh/2+this.itemWH/2+this.jiange);
        let item = instantiate(this.item);
        let tile = item.getComponent(Tile);
        if(tile)
        {
            tile.init(num);
        }
        item.parent = this.ndParent;
        let itemTf:UITransform = item.getComponent(UITransform);
        itemTf.width = this.itemWH;
        itemTf.height = this.itemWH;
        let _x = posStart.x+(itemTf.width+this.jiange)*pos.y;
        let _y = posStart.y +(itemTf.height+this.jiange)*pos.x;
        item.position = v3(_x,_y,0);
        if(isAction)
        {
            item.scale = v3(0,0,0);
            tween(item).to(0.15,{scale:v3(1,1,1)},{easing:"sineInOut"}).start();
        }
    }


    addItemBg(lv:number){
        let posStart = v2(-this.itemParentWh/2+this.itemWH/2+this.jiange,-this.itemParentWh/2+this.itemWH/2+this.jiange);
        for (let i = 0;i<lv;i++)
        {
            for(let j = 0;j<lv;j++)
            {
                let itemBg = instantiate(this.itemBg);
                itemBg.parent = this.ndParent;
                let itemBgTf:UITransform = itemBg.getComponent(UITransform);
                itemBgTf.width = this.itemWH;
                itemBgTf.height = this.itemWH;
                let posX = posStart.x +(itemBgTf.width+this.jiange)*j;
                let posY = posStart.y +(itemBgTf.height+this.jiange)*i;
                itemBg.position = v3(posX,posY,0);
            }
        }
    }

    //点击事件
    private onBtnStartClick(){
        this.initPanel();
        this.gamePanel.active =true;
        this.init();
    }

    private onBtnRePlayClick(){
        this.gameType = 1;
        this.userData.score = 0;
        this.userData.arr_histroy = [];
        this.txtBack.string = "撤回(0)";
        this.userData.backNum = 3;
        this.txtScore.string = "0";
        this.cleanAllItem();
        this.initArray(this.userData.lv);
        this.addRandomArray();
    }

    private onBtnBackClick(){
      let len = this.userData.arr_histroy.length;
      if(len>=2 && this.userData.backNum>0)
      {
        this.userData.arr_histroy.pop();
        let str_arr = this.userData.arr_histroy[len-2];
        var arr = str_arr.split(",");
        this.cleanAllItem();
        let k_num =-1;
        for(let i = 0 ;i<this.array.length;i++)
        {
            for(let j =0;j<this.array[i].length;j++)
            {
                k_num++;
                this.array[i][j] = parseInt(arr[k_num]);
                if(this.array[i][j]>0)
                {
                    let pos = v2(i,j);
                    this.createItem(pos,this.array[i][j]);
                }
            }
        }
        this.userData.backNum --;
        let len1 = this.userData.arr_histroy.length-1;
        if(len1<=0)
        {
            len1 = 0;
        }
        if(len1>this.userData.backNum)
        {
            len1 = this.userData.backNum;
        }
        this.txtBack.string = "撤回("+len1+")";
        this.saveUserInfo();
      }
    }

    private onBtnHomeClick(){
        this.initPanel();
        this.gameType = 0;
        this.startPanel.active = true;
        this.cleanAllItem();
        this.cleanAllItemBg()
    }


    private onOverBtnRePlayClick(){
        this.overPanel.active = false;
        this.gameType = 1;
        this.userData.score = 0;
        this.userData.arr_histroy = [];
        this.txtBack.string = "撤回(0)";
        this.userData.backNum = 3;
        this.txtScore.string = "0";
        this.cleanAllItem();
        this.initArray(this.userData.lv);
        this.addRandomArray();
    }

    private onOverBtnHomeClick(){
        this.initPanel();
        this.gameType = 0;
        this.startPanel.active =true;
        this.cleanAllItem();
        this.cleanAllItemBg()
    }

    
    private onCheckOver(){
        let isOver = true;
        
        for(let i = 0 ;i<this.array.length;i++)
        {
            for(let j = 0;j<this.array[i].length;j++)
            {
                if(this.array[i][j]==0)
                {
                    isOver = false;
                }

            }
        }

        for(let i = 0 ;i<this.array.length;i++)
        {
            for(let j = 0 ;j<this.array[i].length;j++)
            {
                if(j+1<this.array.length&&this.array[i][j]==this.array[i][j+1])
                {
                    isOver = false;
                }
                else if(i+1<this.array.length&&this.array[i][j]==this.array[i+1][j])
                {
                    isOver = false;
                }
            }
        }
        if(isOver)
        {
            this.gameType = 2;
            this.overPanel.active = true;
            let gameOverScore = this.userData.score;
            this.txtOverScore.string = "获得"+gameOverScore+"分";
            this.userData.score = 0;
            this.userData.array = [];
            this.userData.arr_histroy = [];
            this.userData.backNum = 3;
            this.saveUserInfo();
        }else{
            this.userData.arr_histroy.push(this.array.join());
            this.userData.array = this.array;
            let len =  this.userData.arr_histroy.length-1;
            if(len>10)
            {
                this.userData.arr_histroy.shift();
            }
            if(len>this.userData.backNum)
            {
                len = this.userData.backNum;
            }
            this.txtBack.string = "撤回("+len+")";
            this.saveUserInfo();
        }
    }

    private cleanAllItemBg(){
        let children = this.ndParent.children;
        for(let i = children.length-1;i>=0;i--){
            let tile =children[i].getComponent(Tile);
            if(!tile)
            {
                this.ndParent.removeChild(children[i]);
            }
        }
    }
}


