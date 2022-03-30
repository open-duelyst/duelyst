import Color from "./Color";
import fetch from "./request";

import {Animation} from "./Animation";
import {IDevice, IDeviceData} from "./Devices/Base";

import DeviceContainer from "./Devices";

import Effect from "./Effect";

export class ChromaInstance extends DeviceContainer {
    public destroyed: boolean = false;

    private url: string;
    private interval: ReturnType<typeof setTimeout>;
    private activeAnimation: Animation = null;

    constructor(url: string) {
        super();
        this.url = url;
        this.heartbeat = this.heartbeat.bind(this);
        this.setAll = this.setAll.bind(this);
        this.destroy = this.destroy.bind(this);
        this.interval = setInterval(this.heartbeat, 10000);
    }

    public async playAnimation(animation: Animation) {
        await this.stopAnimation();
        this.activeAnimation = animation;
        await animation.play(this);
        return animation;
    }

    public async stopAnimation() {
        if (this.activeAnimation !== null) {
            await this.activeAnimation.stop();
            this.activeAnimation = null;
        }
        return;
    }

    public async destroy() {
        this.destroyed = true;
        clearInterval(this.interval);
        this.interval = null;
        const url = this.url;
        this.url = "";
        const response = await fetch(url, {
            method: "delete",
        });

        if (!response.ok) {
            throw Error(response.statusText);
        }

        return true;
    }

    public async heartbeat() {
        if (this.url === "") {
            return;
        }
        const response = await fetch(this.url + "/heartbeat", {
            method: "put",
        });

        if (!response.ok) {
            throw Error(response.statusText);
        }

        return response;
    }

    public async send(container: DeviceContainer = this) {
        if (this.url === "") {
            return;
        }

        const devices: IDevice[] = [];
        const effectids = [];
        for (const device of container.Devices){
            if (device.activeEffect === Effect.UNDEFINED) {
                continue;
            }

            if (device.effectId !== "") {
                effectids.push(device.effectId);
            } else {
                devices.push(device);
            }
        }
        this.setEffect(effectids);
        return await this.sendDeviceUpdate(devices, false);

    }

    public async sendDeviceUpdate(devices: IDeviceData[], store: boolean= false) {
        const response = [];
        for (const device of devices){
            const name = device.device;
            const parsedData = device.effectData;
            const deviceresponse = await fetch(this.url + "/" + name, {
                body: JSON.stringify(parsedData),
                headers: { "Content-Type": "application/json" },
                method: (store) ? "post" : "put",
            });

            if (!deviceresponse.ok) {
                throw Error(deviceresponse.statusText);
            }
            const data = await deviceresponse.json();

            response.push(data.results);
        }
        return response;
    }

    public async setEffect(effectids: string[]) {
        if (effectids.length === 0) {
            return;
        }
        for (const effectid of effectids){

            const payload = JSON.stringify({
                    id: effectid,
                });
            const deviceresponse = await fetch(this.url + "/effect", {
                body: payload,
                headers: { "Content-Type": "application/json", "Content-Length": payload.length },
                method: "put",
            });

            const jsonresp = await deviceresponse.json();
        }
    }

    public async deleteEffect(effectids: string[]) {
        if (effectids.length === 0) {
            return;
        }

        const payload = JSON.stringify({
                ids: effectids,
            });
        const deviceresponse = await fetch(this.url + "/effect", {
            body: payload,
            headers: { "Content-Type": "application/json", "Content-Length": payload.length },
            method: "delete",
        });
    }

}
