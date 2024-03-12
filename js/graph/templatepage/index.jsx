import React from "react";
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import templateDB from "./templates";

let root = null;
let templates = [];

export const openTemplatePage = () => {
    const container = document.querySelector("#template-page");
    container.className = "active";
}

export const closeTemplatePage = () => {
    const container = document.querySelector("#template-page");
    container.className = "";
}

const updateView = () => {
    root.render(<View templates={templates} />);
}

export const initEvents = () => {
    document.querySelector('[data-action="close-template-page"]').addEventListener("click", () => {
        closeTemplatePage();
    });
    document.querySelector('#template-page .overlay').addEventListener("click", () => {
        closeTemplatePage();
    });
    root = createRoot(document.querySelector("#template-page .container"));
    updateView();

    loadTemplates();
}

export const loadTemplates = () => {
    templates = templateDB

    updateView();
}

const View = ({ templates }) => {
    let count = 0;
    for (const group of templates) {
        count += group.graphs.length;
    }

    let [selectedTabIndex, setSelectedTabIndex] = useState(0);

    const tabs = [
        {
            icon: "fas fa-th",
            name: "All graphs",
            key: "all",
        },
        {
            icon: "fas fa-vector-square",
            name: "Graphlinq",
            key: "graphlinq"
        },
        {
            icon: "fas fa-vector-square",
            name: "Blockchain",
            key: "blockchain"
        },
        {
            icon: "fas fa-vector-square",
            name: "Chat GPT",
            key: "chat-gpt"
        },
        {
            icon: "fas fa-vector-square",
            name: "Exchange",
            key: "exchange"
        },
        {
            icon: "fas fa-vector-square",
            name: "Dextools",
            key: "dextools"
        },,
        {
            icon: "fas fa-scroll",
            name: "Lua",
            key: "lua"
        },
    ]

    const filterTemplates = (i, group) => {
        if (i == 0) {
            let allTemplates = [];
            for (const grp of templates) {
                allTemplates = allTemplates.concat(grp.graphs);
            }
            return allTemplates;
        }
        if (templates.filter(x => x.key == group).length == 0) return [];
        return templates.filter(x => x.key == group)[0].graphs;
    }

    const useTemplateClick = async (tpl) => {
        closeTemplatePage();
        const res = await fetch(tpl.file_url);
        const jsonData = await res.json();
        await window.Application.newGraph(false);
        await window.Application.loadGraphFromJSON(JSON.stringify(jsonData));
        await window.Application.graphboard.updateGraphName("Template: " + tpl.title)
    }

    return (
        <div>
            <div className="heading-title">
                Templates <span>({count})</span>
            </div>
            <div className="tabs">
                {tabs.map((e, i) => {
                    return (
                        <div key={i} className={selectedTabIndex == i ? "tab-item active" : "tab-item"} onClick={() => setSelectedTabIndex(i)}>
                            <i className={e.icon}></i> <span>{e.name}</span>
                        </div>
                    )
                })}
            </div>
            <div className="tab-content">
                {filterTemplates(selectedTabIndex, tabs[selectedTabIndex].key).map((e, i) => {
                    return (
                        <div key={i} className="template-item">
                            {e.integration.map((integration, i2) => {
                                return (
                                    <div key={i2} className={"integration-icon " + integration}>
                                        <div className={"integration-icon-" + integration}>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="template-title">
                                {e.title}
                            </div>

                            <div className="template-desc">
                                {e.description}
                            </div>

                            <div className="template-use-btn" onClick={() => useTemplateClick(e)}>
                                <i className="fas fa-eject"></i> Use Template
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}