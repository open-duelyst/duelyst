import {IDeviceData} from "./Devices/Base";
import Effect from "./Effect";

export class DeviceRequestData implements IDeviceData {
    public activeEffect: Effect;
    public effectData: any;
    public device: string;
}
