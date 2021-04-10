import toastr from "toastr";
import Handlebars from "handlebars";
import { v4 as uuidv4 } from 'uuid';
import NodeParameter from "./nodeParameter";
import Comment from "./comment";

export default class Node {
    constructor(graphboard, schema, options = {}) {
        this.graphboard = graphboard;
        this.schema = schema;
        this.parameters = [];
        this.element = null;
        this.id = options.id ? options.id : uuidv4();
        this.outNode = null;
        this.outNodeLineElement = null;

        this.x = options.x ? options.x : 50 - this.graphboard.offset.x;
        this.y = options.y ? options.y : 50 - this.graphboard.offset.y;

        this.focus = false;
        this.offset = { x: 0, y: 0 };

        setTimeout(() => {
            this.graphboard.updatePosition();
        }, 300);
    }

    async initialize() {
        await this.appendNodeToGraph();
        this.setupParameters();
    }

    delete() {
        for(const otherNode of this.graphboard.nodes) {
            if(otherNode.outNode == this.id) {
                otherNode.deleteExecution();
            }
        }

        this.deleteExecution();
        for(const p of this.parameters) {
            p.deleteAssignment()
        }
        
        for(const p of this.parameters) {
            if(p.assignment != "") {
                p.assignment = "";
                p.assignmentNode = "";
                p.svgLineElement.remove();
                p.svgLineElement = null;
            }
        }

        this.element.remove();
        this.graphboard.nodes = this.graphboard.nodes.filter(x => x.id != this.id);
    }

    deleteExecution() {
        if(this.outNode != null) {
            this.outNodeLineElement.remove();
            this.outNode = null;
        }
    }

    deleteInExecution() {
        for(const otherNode of this.graphboard.nodes) {
            if(otherNode.outNode == this.id) {
                otherNode.deleteExecution();
            }
        }
    }

    getParameterByName(name) {
        return this.parameters.filter(x => x.schema.Name == name)[0];
    }

    getParameterById(id) {
        return this.parameters.filter(x => x.id == id)[0];
    }

    setupEvents() {
        this.element.querySelector(".delete-node").addEventListener("click", () => {
            this.delete();
        });
    }

    setupParameters() {
        for(const p of Object.values(this.schema.OutParameters)) {
            this.parameters.push(new NodeParameter(this, p, "out"));
        }
        for(const p of Object.values(this.schema.InParameters)) {
            this.parameters.push(new NodeParameter(this, p, "in"));
        }

        // Setup execution parameter
        if(this.schema.CanExecute) {
            this.element.querySelector(".out .execution .dot").addEventListener("click", () => {
                this.graphboard.beginLinkExecution(this, "out");
            });

            this.element.querySelector(".out .execution .dot").addEventListener("mousedown", (ev) => {
                if (ev.which != 3) return;
                this.deleteExecution();
            });
        }

        if(this.schema.CanBeExecuted) {
            this.element.querySelector(".in .execution .dot").addEventListener("click", () => {
                this.graphboard.beginLinkExecution(this, "in");
            });

            this.element.querySelector(".in .execution .dot").addEventListener("mousedown", (ev) => {
                if (ev.which != 3) return;
                this.deleteInExecution();
            });
        }
    }

    linkExecution(toNode) {
        if(this.outNodeLineElement != null) {
            this.outNodeLineElement.remove();
        }
        this.outNode = toNode.id;
        const fromDotPosition = this.element.getBoundingClientRect();
        const toDotPosition = toNode.element.getBoundingClientRect();
        this.outNodeLineElement = this.graphboard.createLine(fromDotPosition.x + fromDotPosition.width, fromDotPosition.y + 44,
            toDotPosition.x, toDotPosition.y + 44, "yellow", false);
        this.graphboard.getGraphContainer().appendChild(this.outNodeLineElement);
    }

    updateLine() {
        if(this.outNode == null) return;
        const fromDotPosition = this.element.getBoundingClientRect();
        const toDotPosition = this.graphboard.findNodeById(this.outNode).element.getBoundingClientRect();
        let curved = require('svg-line-curved');
        const lineElement = this.outNodeLineElement.querySelector("path");
        const offset = {x: this.graphboard.container.offsetLeft + this.graphboard.offset.x, y: this.graphboard.container.offsetTop + this.graphboard.offset.y};
        lineElement.setAttribute('d', curved(fromDotPosition.x + fromDotPosition.width - offset.x,
            fromDotPosition.y + 44 - offset.y, 
            toDotPosition.x - offset.x, 
            toDotPosition.y + 44 - offset.y))
        
        lineElement.setAttribute("x1", fromDotPosition.x + fromDotPosition.width - offset.x);
        lineElement.setAttribute("y1", fromDotPosition.y + 44 - offset.y);
        lineElement.setAttribute("x2", toDotPosition.x - offset.x);
        lineElement.setAttribute("y2", toDotPosition.y + 44 - offset.y);
    }

    async appendNodeToGraph() {
        const templateUrl = require("../templates/graph.node.hbs");
        const template = Handlebars.compile(await (await fetch(templateUrl)).text());
        const content = template({
            id: this.id,
            schema: this.schema
        });
        this.element = new DOMParser().parseFromString(content, 'text/html').body.firstChild;
        this.graphboard.getGraphContainer().appendChild(this.element);

        this.element.style.top = this.y;
        this.element.style.left = this.x;

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

            this.graphboard.updatePosition();
        });

        this.setupEvents();
    }
}