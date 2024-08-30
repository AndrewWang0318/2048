import { _decorator, Component, Node, Color, Label, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property(Sprite)
    TileBg: Sprite
    @property(Label)
    TileLable: Label

    public init(num: number) {
        this.TileLable.string = num.toString()
        this.setColor3(num)
    }

    public setColor1(tag) {
        switch (tag) {
            case Math.pow(2, 1):
                this.TileBg.color = new Color(238, 228, 218); // 2
                break;
            case Math.pow(2, 2):
                this.TileBg.color = new Color(237, 224, 200); // 4
                break;
            case Math.pow(2, 3):
                this.TileBg.color = new Color(242, 177, 121); // 8
                break;
            case Math.pow(2, 4):
                this.TileBg.color = new Color(245, 149, 99);  // 16
                break;
            case Math.pow(2, 5):
                this.TileBg.color = new Color(246, 124, 95);  // 32
                break;
            case Math.pow(2, 6):
                this.TileBg.color = new Color(246, 94, 59);   // 64
                break;
            case Math.pow(2, 7):
                this.TileBg.color = new Color(237, 207, 114); // 128
                break;
            case Math.pow(2, 8):
                this.TileBg.color = new Color(237, 204, 97);  // 256
                break;
            case Math.pow(2, 9):
                this.TileBg.color = new Color(237, 200, 80);  // 512
                break;
            case Math.pow(2, 10): // 1024
                this.TileBg.color = new Color(237, 197, 63);
                break;
            case Math.pow(2, 11): // 2048
                this.TileBg.color = new Color(237, 194, 46);
                break;
            default:
                this.TileBg.color = new Color(60, 58, 50);    // 超过2048的颜色
                break;
        }
    }

    public setColor2(tag) {
        switch (tag) {
            case Math.pow(2, 1):
                this.TileBg.color = new Color(255, 255, 143); // 2, 浅黄色
                break;
            case Math.pow(2, 2):
                this.TileBg.color = new Color(255, 204, 102); // 4, 橙色
                break;
            case Math.pow(2, 3):
                this.TileBg.color = new Color(255, 153, 102); // 8, 浅红橙色
                break;
            case Math.pow(2, 4):
                this.TileBg.color = new Color(255, 102, 102); // 16, 红色
                break;
            case Math.pow(2, 5):
                this.TileBg.color = new Color(255, 102, 204); // 32, 粉红色
                break;
            case Math.pow(2, 6):
                this.TileBg.color = new Color(204, 102, 255); // 64, 紫色
                break;
            case Math.pow(2, 7):
                this.TileBg.color = new Color(153, 102, 255); // 128, 深紫色
                break;
            case Math.pow(2, 8):
                this.TileBg.color = new Color(102, 153, 255); // 256, 浅蓝色
                break;
            case Math.pow(2, 9):
                this.TileBg.color = new Color(102, 204, 255); // 512, 蓝色
                break;
            case Math.pow(2, 10): // 1024
                this.TileBg.color = new Color(102, 255, 204); // 青色
                break;
            case Math.pow(2, 11): // 2048
                this.TileBg.color = new Color(102, 255, 153); // 绿色
                break;
            default:
                this.TileBg.color = new Color(0, 153, 153); // 超过2048, 深绿色
                break;
        }
    }

    public setColor3(tag) {
        switch (tag) {
            case Math.pow(2, 1):
                this.TileBg.color = new Color(245, 245, 220); // 2, 米色
                break;
            case Math.pow(2, 2):
                this.TileBg.color = new Color(255, 235, 205); // 4, 杏色
                break;
            case Math.pow(2, 3):
                this.TileBg.color = new Color(255, 218, 185); // 8, 桃色
                break;
            case Math.pow(2, 4):
                this.TileBg.color = new Color(255, 192, 203); // 16, 浅粉色
                break;
            case Math.pow(2, 5):
                this.TileBg.color = new Color(255, 182, 193); // 32, 淡粉红
                break;
            case Math.pow(2, 6):
                this.TileBg.color = new Color(255, 105, 180); // 64, 热粉红
                break;
            case Math.pow(2, 7):
                this.TileBg.color = new Color(255, 20, 147);  // 128, 深粉红
                break;
            case Math.pow(2, 8):
                this.TileBg.color = new Color(219, 112, 147); // 256, 浅紫红
                break;
            case Math.pow(2, 9):
                this.TileBg.color = new Color(199, 21, 133);  // 512, 红紫色
                break;
            case Math.pow(2, 10): // 1024
                this.TileBg.color = new Color(186, 85, 211);  // 紫罗兰色
                break;
            case Math.pow(2, 11): // 2048
                this.TileBg.color = new Color(148, 0, 211);   // 深紫罗兰色
                break;
            default:
                this.TileBg.color = new Color(75, 0, 130);    // 超过2048, 靛色
                break;
        }
    }
}


