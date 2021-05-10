import Handlebars from "handlebars";
import { v4 as uuidv4 } from 'uuid';
import toastr from "toastr";

export default class Project {
    constructor(options, projectManager) {
        this.projectManager = projectManager;
        this.id = options.id ? options.id : uuidv4();
        this.name = options.name ? options.name : "Untitled Graph";
        this.container = document.querySelector(".projects-container");
        this.element = null;
    }

    async append() {
        const templateUrl = require("../../templates/toolbox.project.hbs");
        const template = Handlebars.compile(await (await fetch(templateUrl)).text());
        const content = template({
            name: this.name,
            id: this.id
        });
        const element = document.createElement("div");
        element.innerHTML = content;
        this.container.appendChild(element);
        this.element = element;

        this.element.querySelector(".delete-item").addEventListener("click", (e) => {
            e.stopPropagation();
            if(this.projectManager.app.currentProject.id == this.id) {
                toastr.error("Can't delete the active project, create a new one and delete the old one");
                return;
            }
            var response = confirm("Are you sure to delete the project " + this.name + " ?");
            if(response) {
                this.delete();
            }
        });

        this.element.onclick = async () => {
            this.projectManager.app.saveGraph();
            await this.projectManager.app.loadProjectById(this.id);
            this.projectManager.app.terminal.append("success", "Project " + this.name + " loaded");
        }
    }

    delete() {
        this.element.remove();
        localStorage.removeItem("graph/" + this.id);
    }

    update() {
        this.element.querySelector("span").textContent = this.name;
    }
}