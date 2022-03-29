import {Animation} from "../Animation";
import {AnimationFrame} from "../AnimationFrame";
import {Color} from "../Color";
import {Keyboard} from "../Devices/Keyboard";

export class WaveAnimation extends Animation {
    private rightToLeft: boolean;

    constructor(rightToLeft: boolean = true) {
        super();
        this.rightToLeft = rightToLeft;
    }

    public async createFrames() {
        const frequency = 1;
        const rainbow: Color[] = [];

        for (let num = 0; num < Math.PI * 2; num += (Math.PI * 2 / 22)) {
                const red   = Math.cos(num) * 255 / 2 + 255 / 2;
                const green   = Math.cos(num + Math.PI) * 255 / 2 + 255 / 2;
                const blue   = Math.sin(num) * 255 / 2 + 255 / 2;
                const color = new Color(red, blue, green);
                rainbow.push(color);
        }

        for (const rainbowStep of rainbow)
        {
            const frame = new AnimationFrame();
            for (let c = 0; c < Keyboard.Columns; ++c) {
                frame.Keyboard.setCol(c, rainbowStep);
            }
            if (this.rightToLeft) {
              const first = rainbow.shift();
              rainbow.push(first);
            } else {
              const first = rainbow.pop();
              rainbow.unshift(first);
            }
            this.Frames.push(frame);
        }

    }
}
