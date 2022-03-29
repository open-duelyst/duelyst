import {ChromaInstance} from "../ChromaInstance";
import Color from "../Color";
import Effect from "../Effect";
import Grid from "../Grid";
import Key from "../Key";
import DeviceBase from "./Base";

export class Keyboard extends DeviceBase {
    public static Columns: number = 22;
    public static Rows: number = 6;

    public grid: Grid;
    public keys: Grid;

    constructor() {
        super();
        this.device = "keyboard";
        this.grid = new Grid(Keyboard.Rows, Keyboard.Columns, Color.Black);
        this.keys = new Grid(Keyboard.Rows, Keyboard.Columns, Color.Black);
        this.setKey = this.setKey.bind(this);
    }

    public setAll(color: Color) {
        this.grid.set(color);
        this.keys.set(Color.Black);
        this.set();
        return this;
    }

    public setRow(r: number, color: Color) {
        this.grid.setRow(r, color);
        this.set();
        return this;
    }

    public setCol(c: number, color: Color) {
        this.grid.setCol(c, color);
        this.set();
        return this;
    }

    public setPosition(r: number, c: number, color: Color) {
        color.isKey = false;
        this.grid.setPosition(r, c, color);
        this.set();
        return this;
    }

    public setKey(keyOrArrayOfKeys: Key | Key[], color: Color) {
        if (keyOrArrayOfKeys instanceof Array) {
            const keyarray = keyOrArrayOfKeys as Key[];
            keyOrArrayOfKeys.forEach((element) => {
                this.setKey(element, color);
            });
            return this;
        } else {
            const row = keyOrArrayOfKeys >> 8; // tslint:disable-line:no-bitwise
            const col = keyOrArrayOfKeys & 0xFF; // tslint:disable-line:no-bitwise
            color.isKey = true;

            this.keys.setPosition(row, col, color);
            return this;
        }
    }

    public set() {
        this.setDeviceEffect(Effect.CHROMA_CUSTOM_KEY, {
            color: this.grid,
            key: this.keys,
        });
        return this;
    }
}

export default Keyboard;
