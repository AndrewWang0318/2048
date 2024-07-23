import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManage')
export class GameManage extends Component {

    @property(Node)
    private startMenu:Node
    @property(Node)
    private endMen:Node

    init(){
        // this.startMenu.active = false;
        this.endMen.active = false;
    }

    // 开始游戏
    startGame(){
        this.startMenu.active = false;
    }

    // 返回主菜单
    backMain(){
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


