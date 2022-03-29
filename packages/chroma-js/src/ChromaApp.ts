import {AppCategory, AppInfo} from "./AppInfo";
import AvailableDevices from "./Devices/AvailableDevices";

import {ChromaInstance} from "./ChromaInstance";
import fetch from "./request";

export class ChromaApp {
    private uninitpromise: any = null;
    private activeInstance: Promise<ChromaInstance> = null;
    private data: AppInfo;

    constructor(title: string,
                description: string= "",
                author: string= "TempRazerDev",
                contact: string= "razer@test.de",
                devices: AvailableDevices[]= [
                    AvailableDevices.Keyboard,
                    AvailableDevices.Mouse,
                    AvailableDevices.Headset,
                    AvailableDevices.Mousepad,
                    AvailableDevices.Keypad,
                    AvailableDevices.ChromaLink,
                ],
                category: AppCategory= AppCategory.Application) {
        this.activeInstance = null;
        this.data = new AppInfo();
        this.data.Title = title;
        this.data.Description = description;
        this.data.Author.Name = author;
        this.data.Author.Contact = contact;
        this.data.DeviceSupported = devices;
        this.data.Category = category;
    }

    public async Instance(create: boolean= true): Promise<ChromaInstance> {
        if (this.activeInstance !== null) {
            const instance = await this.activeInstance;

            if (!instance.destroyed) {
                return instance;
            } else {
                this.activeInstance = null;
            }
        }

        if (create) {
            const options = {
                body: JSON.stringify(this.data),
                headers: {"Content-Type": "application/json"},
                method: "post",
            };

            this.activeInstance = new Promise<ChromaInstance>(async (resolve, reject) => {
                try {
                  const response = await fetch("http://localhost:54235/razer/chromasdk", options);
                  const json = await response.json();
                  if (json.uri !== undefined) {
                    resolve(new ChromaInstance(json.uri));
                  }
                  reject("Unable to retrieve URI " + JSON.stringify(json));
                } catch (error) {
                  reject(error);
                }
            });

            return await this.activeInstance;
        } else {
            return null;
        }
    }
}
