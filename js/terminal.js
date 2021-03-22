import {Version} from "./app";
import moment from "moment";

export default class Terminal {
    constructor(app) {
        this.app = app;
        this.container = document.querySelector("#console");
        this.flush();
        this.append("debug", "Welcome to GraphLinq IDE v" + Version);
    }

    flush() {
        this.container.querySelector(".console-entry-container").innerHTML = "";
    }

    append(type, text) {
        const entry = document.createElement("div");
        entry.className = "console-entry " + type;
        entry.innerText = "[" + (moment().format("hh:mm:ss")) + "] " + text;
        this.container.querySelector(".console-entry-container").appendChild(entry);
        this.container.querySelector(".console-entry-scroll").scrollTop = this.container.querySelector(".console-entry-scroll").scrollHeight;
    }

    appendGraphLogs(type, text, timestamp = 0) {
        const entry = document.createElement("div");
        entry.className = "console-entry " + type;
        let date = (moment().format("hh:mm:ss"));
        if(timestamp != 0) {
            date = moment.unix(timestamp).format("hh:mm:ss");
        }
        entry.innerText = "[" + date + "] " + text;
        this.container.querySelector(".logs-entry-container").appendChild(entry);
        this.container.querySelector(".logs-entry-scroll").scrollTop = this.container.querySelector(".logs-entry-scroll").scrollHeight;
    }

    clearGraphLogs() {
        this.container.querySelector(".logs-entry-container").innerHTML = "";
    }
}