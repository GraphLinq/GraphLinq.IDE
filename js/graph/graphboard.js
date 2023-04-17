import toastr from "toastr";
import Node from "./node";
import Comment from "./comment";

export default class GraphBoard {
    constructor(app) {
        this.app = app;
        this.name = "NEW_GRAPH";
        this.currentSubGraph = "Main Graph";
        this.subGraphList = [];
        this.container = document.querySelector("#graph-container");
        this.nodes = [];
        this.comments = [];
        this.move = false;
        this.offset = {x:0,y:0};
        this.moveOriginOffset = {x:0,y:0};
        this.moveOffset = {x:0,y:0};
        this.mousePosition = {x:0,y:0};
        this.currentScale = 1;
        this.currentLink = undefined;

        //this.clear();
        this.setupEvents();
        setInterval(() => {
            this.onUITicker();
        }, 100);
    }

    initSubgraph() {
        if(this.subGraphList.length == 0) {
            // This is a legacy graph without subgraph support we need to upgrade it
            this.app.terminal.append("warning", "This is a legacy graph without subgraph support, the graph will be upgraded to support them");
            this.subGraphList.push(this.currentSubGraph);
            for(const n of this.nodes) {
                n.subgraphId = this.currentSubGraph;
            }
        }
    }

    selectSubGraph(subGraph) {
        if(!this.subGraphList[subGraph]) {
            this.app.terminal.append("error", "No subgraph " + subGraph + " found in the graph to load");
            return;
        }
        this.currentSubGraph = subGraph;
    }

    onUITicker() {
        if (this.currentLink?.type == "Execution" || this.currentLink?.type == "Parameter" || this.currentLink?.type == "ParametersReference") {
            document.getElementById("linker-block").classList.remove("disable");
        }
        else {
            document.getElementById("linker-block").classList.add("disable");
        }
    }

    clear() {
        this.nodes = [];
        this.comments = [];
        this.subGraphList = [];
        this.name = "NEW_GRAPH";
        document.querySelector(".graph-name input").value = this.name;
        this.container.querySelector(".inner-container").innerHTML = "";
    }

    beginLinkParameter(fromNode, fromParameter) {
        if(this.currentLink?.type == "Parameter") { // ???
            if(fromParameter.schema.Id == this.currentLink.fromParameter.schema.Id && fromNode.id == this.currentLink.fromNode.id) {
                this.currentLink.element.remove();
                this.currentLink = undefined;
                return;
            }
            this.linkParameter(fromParameter);
            return;
        }
        if(fromParameter.direction == "in") {
            toastr.error("You need to select a OUT parameter point for beginning the linking");
            this.app.terminal.append("error", "You need to select a OUT parameter point for beginning the linking");
            return;
        }

        const dotPosition = fromParameter.dot.getBoundingClientRect();
        const svgLine = this.createLine(dotPosition.x + 5, dotPosition.y + 5, this.mousePosition.x, this.mousePosition.y, "gray");

        this.currentLink = {
            type: "Parameter",
            direction: fromParameter.direction,
            element: svgLine,
            fromNode: fromNode,
            fromParameter: fromParameter
        };

        this.getGraphContainer().appendChild(this.currentLink.element);
    }

    beginLinkReference(fromNode, fromParameter) {
        if (fromParameter.direction == "out") {
            fromParameter.deleteAssignment();// if dot have link remove that
        }
        if(this.currentLink?.type == "ParametersReference") {
            return;
        }
        if(fromParameter.direction == "in") {
            toastr.error("You need to select a OUT parameter point for beginning the linking");
            this.app.terminal.append("error", "You need to select a OUT parameter point for beginning the linking");
            return;
        }

        const dotPosition = fromParameter.dot.getBoundingClientRect();
        const svgLine = this.createLine(dotPosition.x + 5, dotPosition.y + 5, this.mousePosition.x, this.mousePosition.y, "#989818");
        this.currentLink = {
            type: "ParametersReference",
            direction: fromParameter.direction,
            element: svgLine,
            fromNode: fromNode,
            fromParameter: fromParameter
        };

        this.getGraphContainer().appendChild(this.currentLink.element);
    }

    linkParameter(toParameter) {
        if (this.currentLink?.type != "Parameter") return ;
        this.currentLink.element.remove();
        toParameter.linkParameter(this.currentLink.fromNode, this.currentLink.fromParameter);
        this.currentLink = undefined;
    }

    beginLinkExecution(fromNode, direction) {
        if (direction == "out") {
            fromNode.deleteExecution();// if dot have link remove that
        }
        if (this.currentLink?.type == "ParametersReference") {
            if(direction != "in") {
                toastr.error("You need to select a IN execution point");
                this.app.terminal.append("error", "You need to select a IN execution point");
                return;
            }
            console.log("JJJJ2", this.currentLink);
            this.linkParameterReference(fromNode);
            return;
        }
        if(this.currentLink?.type == "Execution") {
            if(direction != "in") {
                toastr.error("You need to select a IN execution point");
                this.app.terminal.append("error", "You need to select a IN execution point");
                return;
            }
            this.linkExecution(fromNode);
            return;
        }
        if(direction == "in") {
            toastr.error("You need to select a OUT execution point for beginning the linking");
            this.app.terminal.append("error", "You need to select a OUT execution point for beginning the linking");
            return;
        }
        const dotPosition = fromNode.element.getBoundingClientRect();
        const svgLine = this.createLine(dotPosition.x + dotPosition.width, dotPosition.y + 44, this.mousePosition.x, this.mousePosition.y, "#989818");

        this.currentLink = {
            type: "Execution",
            direction: direction,
            element: svgLine,
            fromNode: fromNode
        };
        this.getGraphContainer().appendChild(this.currentLink.element);
    }

    linkExecution(toNode, fromNode = null) {
        if (this.currentLink?.type != "Execution") return ;
        if (fromNode != null) {
            this.currentLink.fromNode = fromNode;
        }
        this.currentLink.fromNode.linkExecution(toNode);
        this.currentLink.element.remove();// remove doted line;
        this.currentLink = undefined;
    }

    linkParameterReference(toNode) {
        if (this.currentLink?.type != "ParametersReference") return;
        this.currentLink.element.remove();
        this.currentLink.fromParameter.linkExecution(toNode);
        this.currentLink = undefined;
    }

    setupEvents() {
        document.addEventListener("mousemove", (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            let curved = require('svg-line-curved');
            if (this.move) {
                const offsetX = this.offset.x - (this.moveOriginOffset.x - this.mousePosition.x);
                const offsetY = this.offset.y - (this.moveOriginOffset.y - this.mousePosition.y);
                this.moveOffset.x = offsetX;
                this.moveOffset.y = offsetY;
                this.getGraphContainer().style.top = offsetY;
                this.getGraphContainer().style.left = offsetX;
            }

            if (this.currentLink?.type == "Parameter") {
                const line =  this.currentLink.element.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
                let dotPosition = this.currentLink.fromParameter.dot.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 4 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));
            }

            if (this.currentLink?.type == "ParametersReference") {
                const line =  this.currentLink.element.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
                let dotPosition = this.currentLink.fromParameter.dot.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 4 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));
            }

            if (this.currentLink?.type == "Execution") {
                const line =  this.currentLink.element.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
                const dotPosition = this.currentLink.fromNode.element.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 44 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));
            }
        });

        document.querySelector(".graph-name input").addEventListener("keyup", (e) => {
            this.name = e.target.value;
            this.app.currentProject.name = this.name;
            this.app.currentProject.update();
        });

        document.addEventListener('mousedown', (ev) => {
            if (ev.which == 3) {
                this.move = true;
                this.moveOriginOffset.x = this.mousePosition.x;
                this.moveOriginOffset.y = this.mousePosition.y;
            }
        }, false);

        document.addEventListener('mouseup', (ev) => {
            if (ev.which == 3) {
                this.move = false;
                this.offset.x = this.moveOffset.x;
                this.offset.y = this.moveOffset.y;
            }
        }, false);

        document.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
            return false;
        }, false);

        this.container.addEventListener("mousewheel", (e) => {
            return;
            if(e.deltaY > 0) { // Scale up
                this.currentScale -= 0.1;
            }
            else { // Scale down
                this.currentScale += 0.1;
            }
            this.getGraphContainer().style.transform = "scale(" + this.currentScale + ")";
        });

        document.querySelector("#linker-block .btn-cancel").addEventListener("mouseup", () => {
            this.cancelLinking();
        });

        document.addEventListener('click', (ev) => {
            this.cancelLinking();
            return false;
        }, false);
    }

    cancelLinking() {
        if (this.currentLink == undefined) return ;
        this.currentLink.element.remove();
        this.currentLink = undefined;
    }

    async appendNewNodeWithSchema(schema, options = {}) {
        const node = new Node(this, schema, options);
        await node.initialize();
        this.nodes.push(node);
        if(node.subgraphId != "") {
            if(!this.subGraphList.includes(node.subgraphId)) {
                this.subGraphList.push(node.subgraphId);
            }
        }
        return node;
    }

    getGraphContainer() {
        return this.container.querySelector(".inner-container");
    }

    updatePosition() {
        for(const n of this.nodes) {
            n.updateLine();
            for(const p of n.parameters) {
                p.updateLine();
            }
        }
    }

    findNodeById(id) {
        return this.nodes.filter(x => x.id == id)[0];
    }

    createLine(x1, y1, x2, y2, color, dashed = true) {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let curved = require('svg-line-curved');
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";
        svgElement.style.position = "absolute";
        svgElement.setAttribute("class", "node-graph-line");
        const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
        lineElement.setAttribute('d', curved(x1 - offset.x, y1 - offset.y, x2 - offset.x, y2 - offset.y));
        lineElement.setAttribute("stroke", color);

        if(dashed) {
            lineElement.setAttribute("stroke-width", "3px");
            lineElement.setAttribute("stroke-dasharray", "5px");
        }
        else {
            lineElement.setAttribute("stroke-width", "5px");
        }
        svgElement.appendChild(lineElement);
        return svgElement;
    }

    async appendCommentToGraph(options) {
        const comment = new Comment(this, options);
        await comment.appendToGraph();
        this.comments.push(comment);
    }
}