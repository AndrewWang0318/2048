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
        this.setColor(num)
    }

    public setColor(tag) {

        switch (tag) {
            case Math.pow(2, 1):
                this.TileBg.color = new Color(238, 228, 218);
                break;
            case Math.pow(2, 2):
                this.TileBg.color = new Color(237, 224, 200);
                break;
            case Math.pow(2, 3):
                this.TileBg.color = new Color(242, 177, 121);
                break;
            case Math.pow(2, 4):
                this.TileBg.color = new Color(245, 149, 99);
                break;
            case Math.pow(2, 5):
                this.TileBg.color = new Color(246, 124, 95);
                break;
            case Math.pow(2, 6):
                this.TileBg.color = new Color(246, 94, 59);

                break;
            case Math.pow(2, 7):
                this.TileBg.color = new Color(237, 207, 114);
                break;
            case Math.pow(2, 8):
                this.TileBg.color = new Color(237, 204, 97);
                break;
            case Math.pow(2, 9):
                this.TileBg.color = new Color(237, 200, 80);
                break;
            case Math.pow(2, 10): // 1024
                this.TileBg.color = new Color(237, 197, 63);
                break;
            case Math.pow(2, 11): // 2048
                this.TileBg.color = new Color(237, 194, 46);
                break;
            case Math.pow(2, 12):
                this.TileBg.color = new Color(255, 60, 61);
                break;
            case Math.pow(2, 13):
                this.TileBg.color = new Color(255, 30, 32);
                break;
            default:
                this.TileBg.color = new Color(0, 0, 0);
                break;
        }

    }
}


