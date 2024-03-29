import 'regenerator-runtime/runtime';
import Terminal from "./shared/terminal";
import Toolbox from "./shared/toolbox";
import GraphBoard from "./graph/graphboard";
import toastr from "toastr";
import { addHandlebarsHelpers } from "./graph/utils/utils";
import { deployGraph, fetchCompressed, fetchDecompress, fetchLogs, fetchTemplate, fetchHelp, getEngineUrl, needAuth } from "./services/api";
import hotkeys from 'hotkeys-js';
import { saveAs } from 'file-saver';
import { getToken, initWeb3, isLogged, requestLogin } from "./auth/blockchain";
import { fetchTemplatesFromGithub } from "./shared/github_template_fetcher";
import ProjectManager from './shared/project_manager';
import Minimap from "./graph/minimap";
import Popup from "./shared/node_help";
import { registerInteropGlobalFunctions } from './graph/ide_interop';
import AIPrompt from './shared/ai_prompt';
import AISchema from './graph/ai/ai_schema';
import * as TemplatePage from './graph/templatepage/index';
import * as DependencyPage from './graph/dependency/index';
import html2canvas from 'html2canvas';

let Application = null;
let Version = "2.1";
let ReleaseMode = "prod";

class App {
    constructor() {
        addHandlebarsHelpers();

        this.configureToast();

        this.terminal = new Terminal(this);
        this.graphboard = new GraphBoard(this);
        this.toolbox = new Toolbox(this);
        this.projectManager = new ProjectManager(this);
        this.minimap = new Minimap(this);
        this.aiPrompt = new AIPrompt(this);
        this.aiSchema = new AISchema(this);
        this.currentProject = null;

        DependencyPage.initEvents(this);

        this.lastGraphHashLaunched = "";

        this.setupMenu();
        //this.fetchHelp();
        (async() => {
            await initWeb3();

            // Load graph in cache
            if (localStorage.getItem('graph') != null && localStorage.getItem('graph') != "null") {
                await this.migrateToProject();
            }
            else {
                const loadGraphResult = (await this.handleUrlParameters());
                if(!loadGraphResult) {
                    if(this.projectManager.projects.length == 0) {
                        this.currentProject = await this.projectManager.createNewProject({});
                        this.saveGraph();
                        await this.loadProjectById(this.currentProject.id);
                        this.terminal.append("success", "New project created");
                    }
                    else {
                        // Load from project
                        this.loadProjectById(localStorage.getItem("current_project"));
                        this.terminal.append("success", "Loaded the graph project from the cache");
                    }
                }
            }

            hotkeys('ctrl+s', (event, handler) => {
                event.preventDefault()
                this.saveGraph();
            });
            hotkeys('ctrl+e', (event, handler) => {
                event.preventDefault()
                this.launchGraph();
            });
            hotkeys('ctrl+o', (event, handler) => {
                event.preventDefault();
                this.requestLoadGraphFromFile();
            });
            hotkeys('ctrl+,', (event, handler) => {
                event.preventDefault();
                this.newGraph();
            });

            this.setupLogsWatcher();

            setInterval(() => {
                this.terminal.append("debug", "Autosave ..");
                this.saveGraph();
            }, 60000 * 1);

            await fetchTemplatesFromGithub();

            registerInteropGlobalFunctions();

            if(!needAuth()) {
                document.querySelector("#menu .right-container").style.display = "none";
            }

            // Register base engine url
            this.terminal.append("debug", "Engine URL set to " + getEngineUrl())
        })();
    }

    async loadProjectById(id) {
        let project = this.projectManager.projects.find(x => x.id == id);
        await this.loadGraphFromJSON(localStorage.getItem('graph/' + id));
        this.currentProject = project;
        document.title = this.currentProject.name + " - GraphLinq IDE";
    }

    async migrateToProject() {
        await this.loadGraphFromJSON(localStorage.getItem('graph'))
        this.currentProject = await this.projectManager.createNewProject({
            name: this.graphboard.name
        });
        localStorage.removeItem("graph");
        this.terminal.append("warning", "Your graph has been migrated to a project graph");
    }

    async handleUrlParameters() {
        var url = new URL(window.location.href);
        var idGraph = url.searchParams.get("loadGraph");
        if(idGraph == null) return false;
        this.terminal.append("warning", "Loading graph from a template URL ..")
        const result = await fetchTemplate(idGraph)
        if (result.success) {
            const decompressed = (await fetchDecompress(result.template.bytes, "")).decompressed
            await this.loadGraphFromJSON(decompressed);
            this.currentProject = await this.projectManager.createNewProject({
                name: this.graphboard.name
            })
            window.history.pushState('', 'GraphLinq IDE', window.location.protocol + "//" + window.location.host);
        }

        return result.success;
    }

    setupLogsWatcher() {
        setInterval(async () => {
            if(this.lastGraphHashLaunched == "" || this.lastGraphHashLaunched == null) return;
            const logs = await fetchLogs(this.lastGraphHashLaunched, getToken());
            this.terminal.clearGraphLogs();
            for(const l of logs.logs.slice(-30)) {
                this.terminal.appendGraphLogs(l.type, l.message, l.timestamp / 1000);
            }
        }, 10000);
    }

    setupMenu() {
        document.querySelector("[data-app-menu='execution.launch']").addEventListener("click", () => {
            this.launchGraph();
        });

        document.querySelector("[data-app-menu='file.new']").addEventListener("click", () => {
            this.newGraph();
        });

        document.querySelector("[data-app-menu='file.save']").addEventListener("click", () => {
            this.saveGraph();
        });

        document.querySelector("[data-app-menu='file.export']").addEventListener("click", () => {
            this.exportGraphCompressed();
        });

        document.querySelector("[data-app-menu='file.load']").addEventListener("click", () => {
            this.requestLoadGraphFromFile();
        });

        document.querySelector("[data-app-menu='file.export_human_schema']").addEventListener("click", () => {
            this.aiSchema.buildHumanSchema();
        });

        document.querySelector("[data-app-menu='file.export_js']").addEventListener("click", () => {
            this.aiSchema.buildJavascriptGraph();
        });

        /**
        document.querySelector("[data-app-menu='file.export_image']").addEventListener("click", () => {
            html2canvas(document.querySelector("#graph-container .inner-container")).then(function(canvas) {
                document.body.appendChild(canvas);
            });
        });
         */

        document.querySelector("[data-app-menu='login']").addEventListener("click", () => {
            requestLogin();
        });

        document.querySelector("#template-open-btn").addEventListener("click", () => {
            TemplatePage.openTemplatePage();
        });

        TemplatePage.initEvents();

        document.getElementById("file-input").addEventListener("change", (event) => {
            event.stopPropagation();
            event.preventDefault();
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = async (readEvt) => {
                const projectId = await this.loadGraphFromJSON(readEvt.target.result, !readEvt.target.result.startsWith("{"));

                // Preload dependencies
                for(const deps of JSON.parse(readEvt.target.result).rawDeps) {
                    const depJson = JSON.parse(deps);
                    await this.projectManager.createNewProject({
                        id: depJson.project_id,
                        name: depJson.name
                    })
                    localStorage.setItem("graph/" + depJson.project_id, deps);
                    this.terminal.append("success", "Dependency saved");
                }

                this.currentProject = await this.projectManager.createNewProject({
                    id: projectId,
                    name: this.graphboard.name
                })
                this.terminal.append("success", "Graph " + this.graphboard.name + " loaded from file");
                this.saveGraph();
                DependencyPage.updateView();
            }
        });

        document.querySelector("[data-app-menu='graph.add_comment']").addEventListener("click", () => {
            this.graphboard.appendCommentToGraph({
                text: "Write your comment",
                color: "white",
                size: "12px"
            })
        });

        document.querySelector("[data-app-menu='graph.add_group_comment']").addEventListener("click", () => {
            this.graphboard.appendCommentGroupToGraph({})
        });

        document.querySelector("#minimine-terminal-btn").addEventListener("click", () => {
            this.toogleTerminal();
        });

        document.querySelector("#maximize-terminal-btn").addEventListener("click", () => {
            this.toogleTerminal();
        });

        document.querySelector("#dependencies-open-btn").addEventListener("click", () => {
            if(document.querySelector("#dependency-page").className == "active") {
                DependencyPage.closeDependencyPage();
            } else {
                DependencyPage.openDependencyPage();
            }
            
            DependencyPage.updateView();
        });
    }

    toogleTerminal() {
        if(document.querySelector("#console").classList != "minimized") {
            document.querySelector("#console").classList = "minimized";
            document.querySelector("#graph-container").classList = "maximized";
            document.querySelector("#subgraph-toolbox").classList = "maximized";
        } else {
            document.querySelector("#console").classList = "";
            document.querySelector("#graph-container").classList = "";
            document.querySelector("#subgraph-toolbox").classList = "";
        }
    }

    exportGraphAsJSON() {
        let graphJson = {
            project_id: this.currentProject.id,
            name: this.graphboard.name,
            last_view_position: {
                x: this.graphboard.moveOffset.x,
                y: this.graphboard.moveOffset.y,
            },
            mouse_position: {
                x: this.graphboard.offset.x,
                y: this.graphboard.offset.y
            },
            nodes: [],
            comments: [],
            commentGroups: [],
            deps: [],
            rawDeps: []
        };
        this.terminal.append("debug", "Compressing graph ..");
        for (const node of this.graphboard.nodes) {
            const nodeJson = {
                "id": node.id,
                "type": node.schema.NodeType,
                "out_node": node.outNode,
                "can_be_executed": node.schema.CanBeExecuted,
                "can_execute": node.schema.CanExecute,
                "friendly_name": node.schema.FriendlyName,
                "block_type": node.schema.NodeBlockType,
                "sub_graph_id": node.subgraphId,
                "_x": node.x,
                "_y": node.y,
                "in_parameters": node.parameters.filter(x => x.direction == "in").map(e => {
                    return {
                        "id": e.id,
                        "name": e.schema.Name,
                        "type": e.schema.ValueType,
                        "value": e.value == "" ? null : e.value,
                        "assignment": e.assignment,
                        "assignment_node": e.assignmentNode,
                        "value_is_reference": e.schema.IsReference
                    }
                }),
                "out_parameters": node.parameters.filter(x => x.direction == "out").map(e => {
                    return {
                        "id": e.id,
                        "name": e.schema.Name,
                        "type": e.schema.ValueType,
                        "value": e.value == "" ? null : e.value,
                        "assignment": e.assignment,
                        "assignment_node": e.assignmentNode,
                        "value_is_reference": e.schema.IsReference
                    }
                }),
            };
            graphJson.nodes.push(nodeJson);
        }
        for (const comment of this.graphboard.comments) {
            const commentJson = {
                "id": comment.id,
                "text": comment.text,
                "_x": comment.x,
                "_y": comment.y
            };
            graphJson.comments.push(commentJson);
        }
        for (const commentGroup of this.graphboard.commentGroups) {
            const commentJson = {
                "id": commentGroup.id,
                "title": commentGroup.title,
                "description": commentGroup.description,
                "_x": commentGroup.x,
                "_y": commentGroup.y,
                "size": { "width": commentGroup.size.width, "height": commentGroup.size.height },
                "color": commentGroup.color
            };
            graphJson.commentGroups.push(commentJson);
        }

        // Merge dependencies
        this.terminal.append("debug", "Merging " + this.graphboard.deps.length + " sub graph(s)")
        graphJson.deps = this.graphboard.deps;
        for(const d of graphJson.deps) {
            let project = this.projectManager.projects.find(x => x.id == d);
            if(project != null) {
                const depJson = localStorage.getItem('graph/' + project.id);
                graphJson.rawDeps.push(depJson);
            }
            else {
                this.terminal.append("error", "Missing dependency " + d + " for the graph");
            }
        }

        this.terminal.append("debug", "Graph compressed");
        return graphJson;
    }

    async launchGraph() {
        if(!isLogged() && needAuth()) {
            toastr.error("You need to be logged first");
            return;
        }
        const json = this.exportGraphAsJSON();
        const compressedData = await fetchCompressed(JSON.stringify(json), getToken());
        const deployment = await deployGraph(compressedData.compressed, getToken(), this.graphboard.name);
        this.lastGraphHashLaunched = deployment.hash;
        this.terminal.append("success", "Graph " + deployment.hash + " deployed with success");
        this.terminal.clearGraphLogs();
        this.terminal.appendGraphLogs("success", "Waiting for logs ..");
    }

    requestLoadGraphFromFile() {
        document.getElementById("file-input").click();
    }

    async newGraph(prompt = true) {
        if(!prompt) {
            this.graphboard.clear();
            let project = await this.projectManager.createNewProject({});
            this.currentProject = project;
            this.saveGraph();
            return;
        }
        var response = confirm("Are you sure to initialize a new empty graph ?");
        if(response) {
            this.terminal.append("success", "Initialize new empty graph");
            this.graphboard.clear();
            let project = await this.projectManager.createNewProject({});
            this.currentProject = project;
            this.saveGraph();
            
            DependencyPage.updateView();
        }
    }

    saveGraph() {
        const json = this.exportGraphAsJSON();
        localStorage.setItem("graph/" + this.currentProject.id, JSON.stringify(json));
        localStorage.setItem("current_project", this.currentProject.id);
        this.terminal.append("success", "Graph saved");
    }

    exportGraph() {
        const json = this.exportGraphAsJSON();
        saveAs(new File([JSON.stringify(json)], this.graphboard.name + ".glq", { type: "text/plain;charset=utf-8" }))
        this.terminal.append("success", "Graph downloaded");
    }

    async exportGraphCompressed() {
        const uncompressed = true;
        if(uncompressed) {
            const json = this.exportGraphAsJSON();
            saveAs(new File([JSON.stringify(json)], this.graphboard.name + ".glq", { type: "text/plain;charset=utf-8" }))
            this.terminal.append("debug", "The graph exported will not be compressed for the engine");
            this.terminal.append("success", "Graph downloaded");
        }
        else {
            const json = this.exportGraphAsJSON();
            const compressedData = await fetchCompressed(JSON.stringify(json), getToken());
            saveAs(new File([compressedData.compressed], this.graphboard.name + ".glq", { type: "text/plain;charset=utf-8" }))
            this.terminal.append("success", "Graph downloaded");
        }
    }

    async loadGraphFromJSON(json, isBinary = false) {
        let graph = {};
        if(!isBinary) {
            this.terminal.append("debug", "Load graph from json data");
            graph = JSON.parse(json);
        }
        else {
            console.log(json);
            graph = JSON.parse((await fetchDecompress(json, getToken())).decompressed);
            this.terminal.append("debug", "Load graph from binary data");
            console.log(graph);
        }
        this.graphboard.clear();
        this.graphboard.name = graph.name;

        if(graph.last_view_position != null) {
            if(graph.last_view_position.y != 0 && graph.last_view_position.x != 0) {
                this.graphboard.setMoveOffset(graph.last_view_position.y, graph.last_view_position.x, graph.mouse_position.x, graph.mouse_position.y);
                this.graphboard.cancelLinking();
                this.graphboard.updatePosition()
            }
        }

        document.querySelector(".graph-name input").value = this.graphboard.name;

        for (const comment of graph.comments) {
            this.graphboard.appendCommentToGraph({
                id: comment.id,
                x: comment._x,
                y: comment._y,
                text: comment.text
            })
        }

        if(graph.commentGroups) {
            for (const commentGroup of graph.commentGroups) {
                this.graphboard.appendCommentGroupToGraph({
                    id: commentGroup.id,
                    x: commentGroup._x,
                    y: commentGroup._y,
                    title: commentGroup.title,
                    description: commentGroup.description,
                    size: { width: commentGroup.size.width, height: commentGroup.size.height },
                    color: commentGroup.color
                })
            }
        }

        for (const node of graph.nodes) {
            const schema = this.toolbox.schema.filter(x => x.NodeType == node.type)[0];
            if(!schema) {
                this.terminal.append("error", "Missing block schema in the graph " + node.type);
                continue;
            }
            const graphnode = await this.graphboard.appendNewNodeWithSchema(schema, {
                id: node.id,
                subgraphId: node.sub_graph_id,
                x: node._x,
                y: node._y
            });
            for (const p of node.out_parameters) {
                const nodeParameter = graphnode.parameters.filter(x => x.schema.Name == p.name)[0];
                if (nodeParameter == null) continue;
                nodeParameter.id = p.id;
                nodeParameter.setValue(p.value);
            }
            for (const p of node.in_parameters) {
                const nodeParameter = graphnode.parameters.filter(x => x.schema.Name == p.name)[0];
                if (nodeParameter == null) continue;
                nodeParameter.id = p.id;
                nodeParameter.setValue(p.value);
            }
        }

        for (const node of graph.nodes) {
            const graphnode = this.graphboard.findNodeById(node.id);
            if(graphnode == null) continue;
            if (node.out_node != null) {
                const otherNode = this.graphboard.findNodeById(node.out_node);
                if(otherNode != null) {
                    graphnode.linkExecution(otherNode);
                }
            }
            for (const p of node.in_parameters) {
                const nodeParameter = graphnode.parameters.filter(x => x.schema.Name == p.name)[0];
                if (nodeParameter == null) continue;
                if (p.assignment != "" && p.assignment != null) {
                    const otherNode = this.graphboard.findNodeById(p.assignment_node);
                    if(otherNode == null) continue;
                    const otherParameter = otherNode.parameters.filter(x => x.id == p.assignment)[0];
                    nodeParameter.linkParameter(otherNode, otherParameter);
                }
            }

            for (const p of node.out_parameters) {
                const nodeParameter = graphnode.parameters.filter(x => x.schema.Name == p.name)[0];
                if (nodeParameter == null) continue;
                if (p.value_is_reference && p.value != "") {
                    const otherNode = this.graphboard.findNodeById(p.value);
                    nodeParameter.linkExecution(otherNode);
                }
            }
        }
        if(graph.deps != null) {
            this.graphboard.deps = graph.deps;
            this.terminal.append("debug", "Loaded " + this.graphboard.deps.length + " dependencies in the graph");
        }
        this.graphboard.initSubgraph();
        DependencyPage.updateView();
        
        return graph.project_id;
    }

    async fetchHelp() {
        this.terminal.append("debug", "Load help dialog")
        var id = 1;
        const result = await fetchHelp(id)
        if (result.success) {
            var popupEl = document.getElementById('popup');
            var popup = new Popup(popupEl, {
                width: 650,
                height: 500,
                header: "GraphLinq IDE v" + Version + " - " + result.help.title,
                body:  result.help.html,
            });
            popup.open();
        }

        return result.success;
    }

    configureToast() {
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
    }
}

export { Application, Version, ReleaseMode };

document.addEventListener('DOMContentLoaded', () => {
    Application = new App();
    window.Application = Application;
}, false);
