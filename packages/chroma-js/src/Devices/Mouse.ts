import {ChromaInstance} from "../ChromaInstance";
import Color from "../Color";
import Effect from "../Effect";
import Grid from "../Grid";
import DeviceBase from "./Base";

export default class Mouse extends DeviceBase {
    public grid: Grid;

    constructor() {
        super();
        this.device = "mouse";
        this.grid = new Grid(9, 7);
    }

    public setAll(color: Color) {
        this.grid.set(color);
        this.set();
        return this;
    }

    public setPosition(r: number, c: number, color: Color) {
        this.grid.setPosition(r, c, color);
        this.set();
        return this;
    }

    public set() {
        this.setDeviceEffect(Effect.CHROMA_CUSTOM2, this.grid.grid);
        return this;
    }
}
