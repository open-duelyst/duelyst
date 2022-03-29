import {ChromaInstance} from "../ChromaInstance";
import Color from "../Color";
import Effect from "../Effect";
import Grid from "../Grid";
import DeviceBase from "./Base";

export default class Mousepad extends DeviceBase {
    public grid: Grid;

    constructor() {
        super();
        this.device = "mousepad";
        this.grid = new Grid(1, 15);
    }

    public setAll(color: Color) {
        this.grid.set(color);
        this.set();
        return this;
    }

    public  setPosition(c: number, color: Color) {
        this.grid.setPosition(0, c, color);
        this.set();
        return this;
    }

    public set() {
        this.setDeviceEffect(Effect.CHROMA_CUSTOM, this.grid.grid[0]);
        return this;
    }
}
