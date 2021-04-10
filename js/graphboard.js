import toastr from "toastr";
import Node from "./node";
import Comment from "./comment";

export default class GraphBoard {
    constructor(app) {
        this.app = app;
        this.name = "NEW_GRAPH";
        this.container = document.querySelector("#graph-container");
        this.nodes = [];
        this.comments = [];
        this.move = false;
        this.offset = {x:0,y:0};
        this.moveOriginOffset = {x:0,y:0};
        this.moveOffset = {x:0,y:0};
        this.mousePosition = {x:0,y:0};
        this.currentScale = 1;

        this.isLinkingParameters = false;
        this.linkParametersLine = null;
        this.linkParametersFromNode = null;
        this.linkParametersFromParameter = null;

        this.isLinkingParametersReference = false;
        this.linkParametersReferenceLine = null;
        this.linkParametersReferenceFromNode = null;
        this.linkParametersReferenceFromParameter = null;

        this.isLinkingExecution = false;
        this.linkExecutionLine = null;
        this.linkExecutionFromNode = null;

        //this.clear();
        this.setupEvents();
        setInterval(() => {
            this.onUITicker();
        }, 100);
    }

    onUITicker() {
        if(this.isLinkingExecution || this.isLinkingParameters || this.isLinkingParametersReference) {
            document.getElementById("linker-block").classList.remove("disable");
        }
        else {
            document.getElementById("linker-block").classList.add("disable");
        }
    }

    clear() {
        this.nodes = [];
        this.comments = [];
        this.name = "NEW_GRAPH";
        document.querySelector(".graph-name input").value = this.name;
        this.container.querySelector(".inner-container").innerHTML = "";
    }

    beginLinkParameter(fromNode, fromParameter) {
        if(this.isLinkingParameters) {
            if(fromParameter.schema.Id == this.linkParametersFromParameter.schema.Id && fromNode.id == this.linkParametersFromNode.id) {
                this.linkParametersLine.remove();
                this.linkParametersLine = null;
                this.isLinkingParameters = false;
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
        this.isLinkingParameters = true;
        this.linkParametersFromNode = fromNode;
        this.linkParametersFromParameter = fromParameter;

        const dotPosition = fromParameter.dot.getBoundingClientRect();
        this.linkParametersLine = this.createLine(dotPosition.x + 5, dotPosition.y + 5, this.mousePosition.x, this.mousePosition.y, "gray");
        this.getGraphContainer().appendChild(this.linkParametersLine);
    }

    beginLinkReference(fromNode, fromParameter) {
        if(this.isLinkingParametersReference) {
            return;
        }
        if(fromParameter.direction == "in") {
            toastr.error("You need to select a OUT parameter point for beginning the linking");
            this.app.terminal.append("error", "You need to select a OUT parameter point for beginning the linking");
            return;
        }
        this.isLinkingParametersReference = true;
        this.linkParametersReferenceFromNode = fromNode;
        this.linkParametersReferenceFromParameter = fromParameter;

        const dotPosition = fromParameter.dot.getBoundingClientRect();
        this.linkParametersReferenceLine = this.createLine(dotPosition.x + 5, dotPosition.y + 5, this.mousePosition.x, this.mousePosition.y, "#989818");
        this.getGraphContainer().appendChild(this.linkParametersReferenceLine);
    }

    linkParameter(toParameter) {
        if(!this.isLinkingParameters) return;
        this.linkParametersLine.remove();
        this.linkParametersLine = null;
        this.isLinkingParameters = false;
        toParameter.linkParameter(this.linkParametersFromNode, this.linkParametersFromParameter);
        this.linkParametersFromNode = null;
        this.linkParametersFromParameter = null;
    }

    beginLinkExecution(fromNode, direction) {
        if(this.isLinkingParametersReference) {
            if(direction != "in") {
                toastr.error("You need to select a IN execution point");
                this.app.terminal.append("error", "You need to select a IN execution point");
                return;
            }
            this.linkParameterReference(fromNode);
            return;
        }
        if(this.isLinkingExecution) {
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
        this.isLinkingExecution = true;
        const dotPosition = fromNode.element.getBoundingClientRect();
        this.linkExecutionFromNode = fromNode;
        this.linkExecutionLine = this.createLine(dotPosition.x + dotPosition.width, dotPosition.y + 44, this.mousePosition.x, this.mousePosition.y, "#989818");
    
        this.getGraphContainer().appendChild(this.linkExecutionLine);
    }

    linkExecution(toNode, fromNode = null) {
        if(fromNode == null) {
            if(!this.isLinkingExecution) return;
        }
        if(fromNode != null) this.linkExecutionFromNode = fromNode;
        if(this.linkExecutionLine != null) this.linkExecutionLine.remove();
        this.isLinkingExecution = false;
        if(this.linkExecutionLine != null) this.linkExecutionFromNode.linkExecution(toNode);
        this.linkExecutionLine = null;
        this.linkExecutionFromNode = null;
    }

    linkParameterReference(toNode) {
        if(!this.isLinkingParametersReference) return;
        this.linkParametersReferenceLine.remove();
        this.linkParametersReferenceLine = null;
        this.isLinkingParametersReference = false;
        this.linkParametersReferenceFromParameter.linkExecution(toNode);
        this.linkParametersReferenceFromNode = null;
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
              
            if(this.isLinkingParameters) {
                const line =  this.linkParametersLine.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
                let dotPosition = this.linkParametersFromParameter.dot.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 4 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));
            }

            if(this.isLinkingParametersReference) {
                const line =  this.linkParametersReferenceLine.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};
                let dotPosition = this.linkParametersReferenceFromParameter.dot.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 4 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));

            }

            if(this.isLinkingExecution) {
                const line =  this.linkExecutionLine.querySelector("path");
                const offset = {x: this.container.offsetLeft + this.offset.x, y: this.container.offsetTop + this.offset.y};    
                const dotPosition = this.linkExecutionFromNode.element.getBoundingClientRect();
                line.setAttribute('d', curved(dotPosition.x + dotPosition.width - offset.x, dotPosition.y + 44 - offset.y, this.mousePosition.x - offset.x, this.mousePosition.y - offset.y));
            }
        });

        document.querySelector(".graph-name input").addEventListener("keyup", (e) => {
            this.name = e.target.value;
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
    }

    cancelLinking() {
        if(this.isLinkingParameters) {
            this.linkParametersLine.remove();
            this.linkParametersLine = null;
            this.isLinkingParameters = false;
            return;
        }

        if(this.isLinkingExecution) {
            this.linkExecutionLine.remove();
            this.isLinkingExecution = false;
            this.linkExecutionLine = null;
        }

        if(this.isLinkingParametersReference) {
            this.linkParametersReferenceLine.remove();
            this.isLinkingParametersReference = false;
            this.linkParametersReferenceLine = null;
        }
    }

    async appendNewNodeWithSchema(schema, options = {}) {
        const node = new Node(this, schema, options);
        await node.initialize();
        this.nodes.push(node);
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