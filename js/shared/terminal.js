import {Version} from "../app";
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
        this._appendMessage(".console-entry-container", type, text);
    }

    appendGraphLogs(type, text, timestamp = 0) {
        let date = timestamp != 0 ? moment.unix(timestamp).format("hh:mm:ss") : moment().format("hh:mm:ss");
        this._appendMessage(".logs-entry-container", type, text, date);
    }

    clearGraphLogs() {
        this.container.querySelector(".logs-entry-container").innerHTML = "";
    }

    _appendMessage(containerSelector, type, text, date = moment().format("hh:mm:ss")) {
        const container = this.container.querySelector(containerSelector);
        const entry = document.createElement("div");
        entry.className = `console-entry ${type}`;
        entry.appendChild(document.createTextNode(`[${date}] `));
        
        // Split text and create clickable links
        const parts = text.split(/(https?:\/\/[^\s]+)/g);
        for (const part of parts) {
            if (part.match(/^https?:\/\/[^\s]+$/)) {
                const link = document.createElement('a');
                link.setAttribute('href', part);
                link.setAttribute('target', '_blank'); // Open in new tab
                link.appendChild(document.createTextNode(part));
                entry.appendChild(link);
            } else {
                entry.appendChild(document.createTextNode(part));
            }
        }

        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }
}
