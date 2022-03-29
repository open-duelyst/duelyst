import {ChromaInstance} from "../ChromaInstance";
import DeviceBase from "./Base";

export default class ChromaLink extends DeviceBase {
    constructor() {
        super();
        this.device = "chromalink";
        this.supports = ["CHROMA_NONE", "CHROMA_CUSTOM", "CHROMA_STATIC"];
    }
}
