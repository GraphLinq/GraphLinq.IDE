import {isParameterIsEditable} from "./utils/utils";
import { v4 as uuidv4 } from 'uuid';
import ace from 'brace';
import 'brace/mode/lua';
import 'brace/mode/json';
import 'brace/theme/monokai';

export default class NodeParameter {
    constructor(node, schema, direction) {
        this.node = node;
        this.id = uuidv4();
        this.schema = schema;
        this.assignment = "";
        this.assignmentNode = "";
        this.assignmentLine = null;
        this.value = "";
        this.direction = direction;
        this.element = this.node.element.querySelector('[data-parameter-name="' + this.schema.Name + '"]');
        this.dot = this.element.querySelector(".dot");
        this.svgLineElement = null;
        this.setupEvents();

        if(this.isScriptingValue()) {
            let scriptEditorElement = this.element.querySelector(".script-editor");
            this.editor = ace.edit(scriptEditorElement)
            this.editor.setOptions({
                mode: "ace/mode/" + this.node.schema.IDEParameters.ScriptType,
                selectionStyle: "text",
                theme: 'ace/theme/monokai',
                fontSize: "14px"
                
            });
            this.editor.renderer.setScrollMargin(10, 10);
            this.editor.session.on('change', (delta) => {
                this.value = this.editor.getValue();
            });
        }
    }

    isScriptingValue() {
        return this.node.schema.IDEParameters != null && this.node.schema.IDEParameters.IsScriptInput;
    }

    setupEvents() {
        this.dot.addEventListener("click", (e) => {
            e.stopPropagation();
            if(this.isReference()) {
                this.node.graphboard.beginLinkReference(this.node, this);
            }
            else {
                this.node.graphboard.beginLinkParameter(this.node, this);
            }
        });

        this.dot.addEventListener("mouseup", (ev) => {
            if (ev.which != 3) return;
            this.deleteAssignment();
        });

        if(isParameterIsEditable(this.schema.ValueType) && this.element.querySelector(".parameter-value-input") != null) {
            this.element.querySelector(".parameter-value-input").addEventListener("keyup", (e) => {
                this.value = e.target.value;
            })
        }
    }

    isReference() {
        return this.schema.IsReference;
    }

    linkParameter(otherNode, otherParameter) {
        let inNode = null;
        let inParameter = null;
        let outNode = null;
        let outParameter = null;
        if (this.direction == "in") {
            inNode = this.node;
            inParameter = this;
            outNode = otherNode;
            outParameter = otherParameter;
        } else {
            inNode = otherNode;
            inParameter = otherParameter;
            outNode = this.node;
            outParameter = this;
        }
        inParameter.assignment = otherParameter.id;
        inParameter.assignmentNode = otherNode.id;
        inParameter.createLine();
    }

    linkExecution(otherNode) {
        if(otherNode == null) return;
        this.value = otherNode.id;
        this.createReferenceLine();
    }

    deleteAssignment() {
        for(const n of this.node.graphboard.nodes) {
            for(const p of n.parameters) {
                if(p.assignment == this.id) {
                    p.assignment = "";
                    p.assignmentNode = "";
                    p.svgLineElement.remove();
                    p.svgLineElement = null;
                }
                if(p.id == this.assignment) {
                    this.assignment = "";
                    this.assignmentNode = "";
                    this.svgLineElement.remove();
                    this.svgLineElement = null;
                }

                if(p.isReference() && p.value != "" && p.value == this.id) {
                    if(p.svgLineElement != null) {
                        p.value = "";
                        p.svgLineElement.remove();
                        p.svgLineElement = null;
                    }
                }
            }
        }
        
        if(this.isReference() && this.value != "") {
            if(this.svgLineElement != null) {
                this.value = "";
                this.svgLineElement.remove();
                this.svgLineElement = null;
            }
        }
    }

    setValue(value) {
        this.value = value;
        if(this.isScriptingValue()) {
            this.editor.setValue(this.value == null ? "" : this.value);
        }
        else {
            if (isParameterIsEditable(this.schema.ValueType) && this.element.querySelector(".parameter-value-input") != null) {
                this.element.querySelector(".parameter-value-input").value = this.value;
            }
        }
    }

    createLine() {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let curved = require('svg-line-curved');
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";
        svgElement.style.position = "absolute";
        svgElement.setAttribute("class", "node-graph-line");
        const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const parameterBound1 = this.element.querySelector(".dot").getBoundingClientRect();
        const parameterBound2 = this.node.graphboard.findNodeById(this.assignmentNode).getParameterById(this.assignment).element.querySelector(".dot").getBoundingClientRect();
        const offset = {x: this.node.graphboard.container.offsetLeft + this.node.graphboard.offset.x, y: this.node.graphboard.container.offsetTop + this.node.graphboard.offset.y};

        lineElement.setAttribute('d', curved(parameterBound1.x - offset.x + 5, parameterBound1.y - offset.y + 5, parameterBound2.x - offset.x + 5, parameterBound2.y - offset.y + 5))
        lineElement.setAttribute("stroke", "white");
        lineElement.setAttribute("stroke-width", "3px");
        lineElement.setAttribute("stroke-dasharray", "5px");

        // Append to view
        svgElement.appendChild(lineElement);
        this.svgLineElement = svgElement;
        this.node.graphboard.getGraphContainer().appendChild(svgElement);
    }

    updateLine() {
        if (this.assignment != "" && this.assignmentNode != "" && this.svgLineElement != null) {
            const parameterBound1 = this.element.querySelector(".dot").getBoundingClientRect();
            const parameterBound2 = this.node.graphboard.findNodeById(this.assignmentNode).getParameterById(this.assignment).element.querySelector(".dot").getBoundingClientRect();
            const offset = {x: this.node.graphboard.container.offsetLeft + this.node.graphboard.offset.x, y: this.node.graphboard.container.offsetTop + this.node.graphboard.offset.y};
            const lineElement = this.svgLineElement.querySelector("path");
            let curved = require('svg-line-curved');
            lineElement.setAttribute('d', curved(parameterBound1.x - offset.x + 5, parameterBound1.y - offset.y + 5, parameterBound2.x - offset.x + 5, parameterBound2.y - offset.y + 5))
        }

        if (this.value != "" && this.isReference() && this.svgLineElement != null) {
            const parameterBound1 = this.element.querySelector(".dot").getBoundingClientRect();
            const parameterBound2 = this.node.graphboard.findNodeById(this.value).element.getBoundingClientRect();
            const offset = {x: this.node.graphboard.container.offsetLeft + this.node.graphboard.offset.x, y: this.node.graphboard.container.offsetTop + this.node.graphboard.offset.y};
            const lineElement = this.svgLineElement.querySelector("path");
            let curved = require('svg-line-curved');
            lineElement.setAttribute('d', curved(parameterBound1.x - offset.x + 5, parameterBound1.y - offset.y + 5, parameterBound2.x - offset.x, parameterBound2.y - offset.y + 44));
        }
    }

    createReferenceLine() {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";
        svgElement.style.position = "absolute";
        svgElement.setAttribute("class", "node-graph-line");
        const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let curved = require('svg-line-curved');
        const parameterBound1 = this.element.querySelector(".dot").getBoundingClientRect();
        const parameterBound2 = this.node.graphboard.findNodeById(this.value).element.getBoundingClientRect();
        const offset = {x: this.node.graphboard.container.offsetLeft + this.node.graphboard.offset.x, y: this.node.graphboard.container.offsetTop + this.node.graphboard.offset.y};
        lineElement.setAttribute('d', curved(parameterBound1.x - offset.x + 5, parameterBound1.y - offset.y + 5, parameterBound2.x - offset.x, parameterBound2.y - offset.y + 44));

        lineElement.setAttribute("stroke", "yellow");
        lineElement.setAttribute("stroke-width", "5px");

        // Append to view
        svgElement.appendChild(lineElement);
        this.svgLineElement = svgElement;
        this.node.graphboard.getGraphContainer().appendChild(svgElement);
    }
}