import {AnimationFrame} from "./AnimationFrame";
import {ChromaInstance} from "./ChromaInstance";
import Color from "./Color";
import {DeviceRequestData} from "./DeviceRequestData";
import DeviceContainer from "./Devices";
import {IDevice, IDeviceData} from "./Devices/Base";
import ChromaLink from "./Devices/ChromaLink";
import Headset from "./Devices/Headset";
import Keyboard from "./Devices/Keyboard";
import Keypad from "./Devices/Keypad";
import Mouse from "./Devices/Mouse";
import Mousepad from "./Devices/Mousepad";
import Effect from "./Effect";

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export interface IPlayInstance {
    send(container: DeviceContainer): void;
    deleteEffect(effects: string[]): Promise<any>;
    sendDeviceUpdate(devices: IDeviceData[], store: boolean): Promise<any>;
}

export class Animation {
    public Frames: AnimationFrame[] = [];
    public isPlaying: boolean = false;
    public Instance: IPlayInstance = null;
    public currentFrame: number = 0;
    private isInit: boolean= false;

    public async play(instance: IPlayInstance) {
        if (!this.isInit) {
            this.isInit = true;
            await this.createFrames();
        }
        this.Instance = instance;
        this.isPlaying = true;
        this.currentFrame = 0;
        await this.createEffects(instance);

        this.playLoop(instance);
    }

    public async playLoop(instance: IPlayInstance) {
        for (const i of this.Frames){
            await instance.send(i);
            await sleep(i.delay);
            if (!this.isPlaying) {
                break;
            }
        }
        if (this.isPlaying) {
            this.playLoop(instance);
        }
    }

    public async stop() {
        this.isPlaying = false;
        const effectIds: string[] = [];
        for (const frame of this.Frames){
            if (frame.Keyboard.effectId !== "") {
                effectIds.push(frame.Keyboard.effectId);
            }
            frame.Keyboard.effectId = "";
        }

        await this.Instance.deleteEffect(effectIds);
    }

    public async createEffects(instance: IPlayInstance) {
        this.Instance = instance;
        const keyboardEffectData: any = [];
        const device = new DeviceRequestData();
        device.device = "keyboard";

        for (const frame of this.Frames){
            keyboardEffectData.push(frame.Keyboard.effectData);
        }

        device.effectData = {
            effects: keyboardEffectData,
        };

        const response = await instance.sendDeviceUpdate([device], true);
        const keyboardids = response[0];

        for (let i = 0; i < keyboardids.length; i++) {
            this.Frames[i].Keyboard.effectId = keyboardids[i] !== null ? keyboardids[i].id : "";
        }
        return;
    }

    public async createFrames() {
       for (let i = 0; i < 10; i++) {
            const frame = new AnimationFrame();
            frame.Keyboard.setAll(new Color("ff0000"));
            this.Frames.push(frame);
        }
    }
}
