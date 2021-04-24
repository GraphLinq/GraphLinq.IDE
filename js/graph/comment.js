import { v4 as uuidv4 } from 'uuid';
import Handlebars from "handlebars";

export default class Comment {
    constructor(graphboard, options) {
        this.graphboard = graphboard;
        this.id = options.id ? options.id : uuidv4();
        this.text = options.text ? options.text : "";
        this.color = options.color ? options.color : "";
        this.size = options.size ? options.size : 12;
        this.element = null;

        this.x = options.x ? options.x : 50 - this.graphboard.offset.x;
        this.y = options.y ? options.y : 50 - this.graphboard.offset.y;
        this.focus = false;
        this.offset = { x: 0, y: 0 };
    }

    delete() {
        this.graphboard.comments = this.graphboard.comments.filter(x => x.id != this.id);
        this.element.remove();
    }

    async appendToGraph() {
        const templateUrl = require("../../templates/graph.comment.hbs");
        const template = Handlebars.compile(await (await fetch(templateUrl)).text());
        const content = template({
            id: this.id,
        });
        this.element = new DOMParser().parseFromString(content, 'text/html').body.firstChild;
        this.element.style.left = this.x;
        this.element.style.top = this.y;
        this.element.querySelector(".text-comment input").value = this.text;
        this.graphboard.getGraphContainer().appendChild(this.element);

        this.element.querySelector(".text-comment input").addEventListener("keyup", (e) => {
            this.text = e.target.value;
        })

        this.element.querySelector(".comment-toolbar .delete-btn").addEventListener("click", () => {
            this.delete();
        });

        // Init events
        this.element.addEventListener("mousedown", (e) => { // For moving the node
            e = e || window.event;
            if (e.which != 1) return;
            let x = e.pageX - this.element.offsetLeft;
            let y = e.pageY - this.element.offsetTop;
            this.focus = true;
            this.offset.x = x;
            this.offset.y = y;
        });

        this.element.addEventListener("mouseup", (e) => { // For moving the node
            e = e || window.event;
            if (!this.focus) return;
            this.focus = false;
        });

        document.addEventListener("mousemove", (e) => {
            if (!this.focus) return;
            e = e || window.event;
            let x = e.clientX;
            let y = e.clientY;
            this.x = x - this.offset.x;
            this.y = y - this.offset.y;

            this.element.style.top = this.y;
            this.element.style.left = this.x;
        });
    }
}