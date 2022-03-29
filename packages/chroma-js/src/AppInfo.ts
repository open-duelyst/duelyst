import {AuthorInfo} from "./AuthorInfo";
import AvailableDevices from "./Devices/AvailableDevices";

export enum AppCategory {
    Application = "application" as any,
    Game = "game" as any,
}

export class AppInfo {
    public Title: string;
    public Description: string;
    public Author: AuthorInfo = new AuthorInfo();
    public DeviceSupported: AvailableDevices[] = [];
    public Category: AppCategory;

    public toJSON() {
        return {
            author: this.Author,
            category: this.Category,
            description: this.Description,
            device_supported: this.DeviceSupported,
            title: this.Title,
        };
    }

}
