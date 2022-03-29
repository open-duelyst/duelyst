import {ChromaInstance} from "../ChromaInstance";
import Effect from "../Effect";
import fetch from "../request";

function parseEffectData(effect: any, data: any) {
    let jsonObj = null;
    if (effect === Effect.CHROMA_NONE) {
        jsonObj = { effect };
    } else if (effect === Effect.CHROMA_CUSTOM
                || effect === Effect.CHROMA_CUSTOM2
                || effect === Effect.CHROMA_CUSTOM_KEY) {
        jsonObj = { effect, param: data };
    } else if (effect === Effect.CHROMA_STATIC) {
        const color = { color: data };
        jsonObj = { effect, param: color };
    }
    return jsonObj;
}

export interface IDeviceData {
    activeEffect: Effect;
    effectData: any;
    device: string;
}

export interface IDevice {
    activeEffect: Effect;
    effectData: any;
    device: string;
    effectId: string;
    setStatic(color: any): void;
    setAll(color: any): void;
    setNone(): void;
}

export default class DeviceBase implements IDevice, IDeviceData {
    public device: any;
    public supports: any;
    public activeEffect: Effect = Effect.UNDEFINED;
    public effectData: any = null;
    public effectId: string = "";

    constructor() {
        this.setStatic = this.setStatic.bind(this);
        this.setDeviceEffect = this.setDeviceEffect.bind(this);
        this.setAll = this.setAll.bind(this);
        this.setNone = this.setNone.bind(this);
        this.set = this.set.bind(this);
    }

    public setStatic(color: any) {
        this.setDeviceEffect(Effect.CHROMA_STATIC, color);
        return this;
    }

    public setAll(color: any) {
        this.setStatic(color);
        return this;
    }

    public set() {
        // console.log("Test");
    }

    public setNone() {
        this.setDeviceEffect(Effect.CHROMA_NONE);
    }

    public async setDeviceEffect(effect: Effect, data: any = null) {
        this.activeEffect = effect;
        this.effectData = parseEffectData(effect, data);
    }

}
