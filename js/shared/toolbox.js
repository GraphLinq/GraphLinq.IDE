import Handlebars from "handlebars";

export default class Toolbox {
    constructor(app) {
        this.app = app;
        this.container = document.querySelector("#toolbox");
        this.schema = require("../node_schema.json");
        this.app.terminal.append("debug", this.schema.length + " block loaded in the toolbox");
        this.groups = [];
        this.setup();
    }

    clear() {
        this.container.querySelector(".group-container").innerHTML = "";
    }

    onClickItem(item) {
        const model = this.schema.filter(x => x.NodeType == item)[0];
        this.app.graphboard.appendNewNodeWithSchema(model);
    }

    async setup() {
        this.clear();
        const sections = [];
        for(const item of this.schema) {
            if(sections.indexOf(item.NodeGroupName) == -1)  {
                sections.push(item.NodeGroupName);
            }
        }
        this.groups = sections;

        // Build html
        const templateUrl = require("../../templates/toolbox.group.hbs");
        const template = Handlebars.compile(await (await fetch(templateUrl)).text());
        for(const i of this.groups) {
            const content = template({
                groupName: i,
                items: this.schema.filter(x => x.NodeGroupName == i)
            });
            const element = document.createElement("div");
            element.innerHTML = content;
            this.container.querySelector(".group-container").appendChild(element);
            for(const item of element.querySelectorAll(".group-node-item")) {
                item.onclick = () => {
                    this.onClickItem(item.getAttribute("data-toolbox-node-type"));
                };

                item.onmouseenter = () => {
                    let tooltip = document.createElement("div");
                    
                    tooltip.classList.add("tooltip");
                    tooltip.setAttribute("id", "tooltip-node-description");
                    tooltip.innerText = item.querySelectorAll(".node-description")[0].innerText.replaceAll("\n", "");
                    document.body.appendChild(tooltip);
                };

                item.onmouseleave = () => {
                    document.getElementById("tooltip-node-description").remove();
                };
            }
        }

        document.querySelector("#toolbar-search-input").addEventListener("input", (e) => {
            this.refreshSearch(e.target.value);
        })
    }

    refreshSearch(searchFor) {
        if(searchFor.trim() == "") {
            for(const e of this.container.querySelector(".group-container").querySelectorAll(".group-node-item")) {
                e.style.display = "block";
            }
            for(const group of this.container.querySelectorAll(".group-item")) {
                group.style.display = "block";
            }
        } else {
            for(const e of this.container.querySelector(".group-container").querySelectorAll(".group-node-item")) {
                if(e.attributes["data-name"].value.toLowerCase().indexOf(searchFor.toLowerCase()) == -1) {
                    e.style.display = "none";
                }
                else {
                    e.style.display = "block";
                }
            }

            for(const group of this.container.querySelectorAll(".group-item")) {
                let count = 0;
                for(const e of group.querySelectorAll(".group-node-item")) {
                    if(e.style.display == "block") count++;
                }
                if(count == 0) {
                    group.style.display = "none";
                }
                else {
                    group.style.display = "block";
                }
            }
        }
    }
}