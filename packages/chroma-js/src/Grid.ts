import { Color } from "./Color";

export default class Grid {
    public grid: Color[][];
    public rows: number;
    public cols: number;
    public initialValue: Color;
    public isExtended: boolean = false;

    constructor(rows: number, cols: number, initialValue: Color= Color.Black) {
        this.rows = rows;
        this.cols = cols;
        this.initialValue = initialValue;
        this.grid = [];
    }

    public clone() {
        const copygrid = new Grid(this.rows, this.cols, this.initialValue);
        for (const inner of this.grid){
            const rowarray = new Array<Color>();
            for (const color of inner){
                rowarray.push(new Color(color.r, color.g, color.b));
            }
            copygrid.grid.push(rowarray);
        }
        return copygrid;
    }

    public setPosition(r: number, c: number, value: Color) {
        if (r === undefined || this.rows <= r || r < 0) {
            throw Error("Index out of range [row]");
        }
        if (c === undefined || this.cols <= c || c < 0) {
            throw Error("Index out of range [col]");
        }
        if (this.grid[r] === undefined) {
            this.grid[r] = [];
        }
        this.grid[r][c] = value;
    }

    public setRow(r: number, value: Color) {
        if (r === undefined || this.rows <= r || r < 0) {
            throw Error("Index out of range [row] " + this.rows + " - " + r);
        }
        if (this.grid[r] === undefined) {
            this.grid[r] = [];
        }

        for (let c = 0; c < this.cols; c++) {
            this.grid[r][c] = value;
        }
    }

    public setCol(c: number, value: Color) {
        if (c === undefined || this.cols <= c || c < 0) {
            throw Error("Index out of range [col]");
        }
        for (let r = 0; r < this.rows; r++) {
            if (this.grid[r] === undefined) {
                this.grid[r] = [];
            }
            this.grid[r][c] = value;
        }
    }

    public set(value: Color) {
        for (let r = 0; r < this.rows; r++) {
            if (this.grid[r] === undefined) {
                this.grid[r] = [];
            }
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = value;
            }
        }
    }

    public getPosition(r: number, c: number) {
        if (this.grid[r] !== undefined && this.grid[r][c] !== undefined) {
            return this.grid[r][c];
        }
        return null;
    }

    public toJSON() {
        if (!this.isExtended) {
            this.isExtended = true;
            for (let r = 0; r < this.rows; r++) {
                if (this.grid[r] === undefined) {
                    this.grid[r] = [];
                }

                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c] === undefined) {
                        this.grid[r][c] = this.initialValue;
                    }
                }
            }
        }
        return this.grid;
    }

}
