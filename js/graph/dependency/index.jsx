import React from "react";
import { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import toastr from "toastr";

let root = null;
let app = null;

export const openDependencyPage = () => {
    const container = document.querySelector("#dependency-page");
    container.className = "active";
}

export const closeDependencyPage = () => {
    const container = document.querySelector("#dependency-page");
    container.className = "";
}

const getProjects = () => {
    return app.projectManager.projects;
}

export const updateView = () => {
    root.render(<View />);
}

export const initEvents = (_app) => {
    app = _app;
    root = createRoot(document.querySelector("#dependency-page .container"));
}
                    
const View = ({  }) => {
    const [items, setItems] = useState(app.projectManager.projects.map((e, i) => {
        return {
            id: i,
            enabled: app.graphboard.deps.filter(x => x == e.id).length > 0,
            project: e
        }
    }));

    const updateItems = () => {
        setItems(app.projectManager.projects.map((e, i) => ({
            id: i,
            enabled: app.graphboard.deps.includes(e.id),
            project: e
        })));
    }

    useEffect(() => {
        updateItems();
     }, [app.projectManager.projects]);

     
     useEffect(() => {
        updateItems();
     }, [app.graphboard.deps]);
 
    const handleChange = (index) => {
        if(items[index].project.id == app.currentProject.id) {
            toastr.error("Can't add the graph itself as dependency");
            return;
        }
        const newItems = [...items];
        newItems[index] = { ...newItems[index], enabled: !newItems[index].enabled };
        setItems(newItems);

        app.graphboard.setDeps(newItems.filter((e) => e.enabled).map((e, i) => {
            return e.project.id
        }))
    };

    return (
        <div>
            {items.map((item, i) => (
                <div className="item" key={i} onClick={() => {
                    handleChange(i)
                }}>
                    <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => {}}
                    />
                    <span><i className="fas fa-project-diagram"></i>{item.project.name}</span>
                </div>
            ))}
        </div>
    );
};