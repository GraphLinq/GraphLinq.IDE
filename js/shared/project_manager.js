import Project from "./project";
import { v4 as uuidv4 } from 'uuid';

export default class ProjectManager {
    constructor(app) {
        this.app = app;
        this.projects = [];

        // Init projects management
        if (localStorage.getItem('projects') == null) {
            this.saveProjects();
        }
        else {
            this.loadProjects();
        }
    }

    loadProjects() {
        this.projects = [];
        for(const po of JSON.parse(localStorage.getItem("projects"))) {
            if(localStorage.getItem("graph/" + po.id) == null) {
                continue;
            }
            var projectGraph = JSON.parse(localStorage.getItem("graph/" + po.id));
            let project = new Project({
                id: po.id,
                name: projectGraph.name
            }, this);
            project.append();
            this.projects.push(project)
        }
        this.saveProjects();
    }

    async createNewProject(options) {
        if (!options.name) {
            options.name = this.getBlankUniqueProjectName("Untitled Graph");
        }
        else {
            options.name = this.getBlankUniqueProjectName(options.name);
        }
        let project = new Project(options, this);
        await project.append();
        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects.map(e => {
            return {
                id: e.id,
                name: e.name
            }
        })));
    }

    getBlankUniqueProjectName(baseName) {
        if(this.projects.filter(x => x.name == name).length == 0) return baseName;
        let id = 1;
        let name = baseName;
        while (this.projects.filter(x => x.name == name + " (" + id + ")").length > 0) {
            id++;
        }
        return name + " (" + id + ")";
    }
}