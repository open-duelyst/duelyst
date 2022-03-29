import {Animation} from "../Animation";
import {AnimationFrame} from "../AnimationFrame";
import {Color} from "../Color";

export class BcaAnimation extends Animation {
    private url: string = null;
    private blob: Blob = null;

    constructor(url: string | Blob) {
        super();
        if (typeof url === "string") {
            this.url = url as string;
        } else {
            this.blob = url as Blob;
        }
    }

    public async createFrames() {
        if (this.blob !== null) {
            await this.fromBlob(this.blob);
        } else {
            await fetch(this.url).then((response) => {
                return response.blob();
            })
            .then(this.fromBlob);
        }
    }

    private async fromBlob(myBlob: Blob) {
            this.blob = myBlob;
            const reader = new FileReader();
            const test = new Promise<ArrayBuffer>((resolve, reject) => {
                reader.addEventListener("loadend", () => {
                    resolve(reader.result as ArrayBuffer);
                });
            });
            reader.readAsArrayBuffer(myBlob);
            const anim = await test;
            await this.parseAnimation(anim);
    }

    private async parseAnimation(buffer: ArrayBuffer) {
        const view = new DataView( buffer );

        const fileheader = {
            BcaOffset: view.getUint32(0x0A, true),
            Size: view.getUint16(0x02, true),
            Type: view.getUint16(0x0),
        };

        const bcaheader = {
            FPS: view.getUint16(fileheader.BcaOffset + 10, true),
            FrameCount: view.getUint32(fileheader.BcaOffset + 12, true),
            FrameOffset: view.getUint32(fileheader.BcaOffset + 6, true),
            Size: view.getUint32(fileheader.BcaOffset, true),
            Version: view.getUint16(fileheader.BcaOffset + 4, true),
        };
        let lastframe: AnimationFrame = null;

        let offset = bcaheader.FrameOffset;
        for (let frame = 1; frame <= bcaheader.FrameCount; frame++) {
            const frameheader = {
                DataSize: view.getUint16(offset + 4, true),
                DeviceCount: view.getUint16(offset + 2, true),
                HeaderSize: view.getUint16(offset, true),
            };
            const animframe = new AnimationFrame();
            animframe.delay = 10;
            if (lastframe !== null) {
                animframe.Keyboard.grid = lastframe.Keyboard.grid.clone();
            }

            let deviceoffset = offset + 6;
            for (let device = 0; device < frameheader.DeviceCount; device++) {
                const deviceheader = {
                    DataSize: view.getUint16(deviceoffset + 4, true),
                    DataType: view.getUint8(deviceoffset + 1),
                    Device: view.getUint16(deviceoffset + 2, true),
                    HeaderSize: view.getUint8(deviceoffset),
                };
                let dataoffset = deviceoffset + 6;

                const datacount = deviceheader.DataSize / 6;
            // console.log("COUNT", datacount);

                for (let devicedatanum = 0; devicedatanum < datacount; devicedatanum++) {

                    const devicedata = {
                        Col: view.getUint8(dataoffset + 1),
                        RGBa: view.getUint32(dataoffset + 2, true),
                        Row: view.getUint8(dataoffset),
                    };

                    if (deviceheader.Device === 1) {
                        animframe.Keyboard.setPosition(devicedata.Row, devicedata.Col, new Color(devicedata.RGBa));
                    } else {
                        // TODO: ADD MORE DEVICES
                       // console.log("UNKNOWN");
                    }

                    dataoffset += 6;
                }

                deviceoffset = dataoffset;
            }

            offset = deviceoffset;
            lastframe = animframe;
            this.Frames.push(animframe);
        }
    }
}
