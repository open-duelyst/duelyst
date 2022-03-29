import {ChromaInstance} from "../ChromaInstance";
import DeviceBase from "./Base";

export default class Headset extends DeviceBase {
    constructor() {
        super();
        this.device = "headset";
        this.supports = ["CHROMA_NONE", "CHROMA_CUSTOM", "CHROMA_STATIC"];
    }
}
