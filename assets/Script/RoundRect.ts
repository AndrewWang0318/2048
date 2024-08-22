import { _decorator, Component, Mask, UITransform, Graphics } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('RoundRect')
export class RoundRect extends Component {
  @property({ type: Number })
  radius = 10;

  start() {
    this.init();
  }

//   onEnable() {
//     this.init();
//   }

  init() {
    // 不加延时对于父元素的active切换不生效
    // setTimeout(() => {
      const mask = this.node.getComponent(Mask);
      mask.type = Mask.Type.GRAPHICS_RECT;

      const uiTransform = this.getComponent(UITransform);
      const { width, height, anchorX, anchorY } = uiTransform;

      const graphics = mask.subComp as Graphics;
      graphics.clear();
      const x = -width * anchorX;
      const y = -height * anchorY;
      graphics.roundRect(x, y, width, height, this.radius || 10);
      graphics.fill();
    // }, 30);
  }
}