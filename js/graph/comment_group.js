import { v4 as uuidv4 } from 'uuid';
import Handlebars from "handlebars";

export default class CommentGroup {
    constructor(graphboard, options) {
        this.graphboard = graphboard;
        this.id = options.id ? options.id : uuidv4();
        this.title = options.title ? options.title : "New Group";
        this.description = options.description ? options.description : "Edit the description of the group here";
        this.size = options.size ? options.size : {
            width: 400,
            height: 50,
        };
        this.element = null;
        this.header = null;

        this.x = options.x ? options.x : 50 - this.graphboard.offset.x;
        this.y = options.y ? options.y : 50 - this.graphboard.offset.y;
        this.focus = false;
        this.offset = { x: 0, y: 0 };
    }

    async appendToGraph() {
        const templateUrl = require("../../templates/node-comment-group.hbs");
        const template = Handlebars.compile(await (await fetch(templateUrl)).text());
        const content = template({
            id: this.id,
        });
        this.element = new DOMParser().parseFromString(content, 'text/html').body.firstChild;
        this.element.style.left = this.x;
        this.element.style.top = this.y;
        //this.element.querySelector(".text-comment input").value = this.text;
        this.graphboard.getGraphContainer().appendChild(this.element);
        this.header = this.element.querySelector(".node-comment-group-title");
        this.resize();

        this.makeResizable();
        this.makeDraggable();

        this.element.querySelector(".node-comment-group-title input").addEventListener("keyup", (e) => {
            this.title = e.target.value;
        })
        this.element.querySelector(".node-comment-group-description input").addEventListener("keyup", (e) => {
            this.description = e.target.value;
        })

        this.element.querySelector(".node-comment-group-title .delete-group-btn").addEventListener("click", () => {
            if(confirm("Are you sure to delete the group ?")) {
                this.delete();
            }
        });

        this.refresh();
    }

    delete() {
        this.graphboard.commentGroups = this.graphboard.commentGroups.filter(x => x.id != this.id);
        this.element.remove();
    }

    refresh() {
        this.element.querySelector(".node-comment-group-title input").value = this.title;
        this.element.querySelector(".node-comment-group-description input").value = this.description;
    }

    resize() {
        this.element.style.width = this.size.width;
        this.element.style.height = this.size.height;
    }

    makeResizable() {
        const resizeHandle = this.element.querySelector('.resize-handle');
        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
        });

        const handleMouseMove = (e) => {
            if (isResizing) {
                // Calculate new size
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                const { left, top } = this.element.getBoundingClientRect();
                const newWidth = mouseX - left;
                const newHeight = mouseY - top;

                // Update size
                this.size.width = Math.max(newWidth, /* minimum width */ 50);
                this.size.height = Math.max(newHeight, /* minimum height */ 50);
                this.resize();
            }
        };

        const stopResizing = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
        };
    }

    makeDraggable() {
        let isDragging = false;
        let startX, startY; // Starting positions of the mouse

        const startDragging = (e) => {

            isDragging = true;
            // Capture the starting mouse position
            startX = e.clientX;
            startY = e.clientY;

            // Calculate the initial offset at the start of the drag
            this.offset.x = startX - this.element.offsetLeft;
            this.offset.y = startY - this.element.offsetTop;

            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDragging);
        };

        const onDrag = (e) => {
            if (isDragging) {
                // Calculate the new position by adjusting with the initial offset
                this.x = e.clientX - this.offset.x;
                this.y = e.clientY - this.offset.y;

                this.updatePosition();
            }
        };

        const stopDragging = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDragging);
        };

        // Update the element's CSS position
        this.updatePosition = () => {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        };

        // Initialize dragging
        this.header.addEventListener('mousedown', startDragging);
    }
}