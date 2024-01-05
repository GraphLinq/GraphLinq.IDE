import { Application } from "../app";

export const registerInteropGlobalFunctions = () => {
    Application.terminal.append("ai", "Interop functions registered for AI");
    window.ide = {
        newComment: newComment,
        setGraphName: setGraphName,
        appendLog: appendLog,
        clearGraph: clearGraph,
        createNode: createNode,
        setNodeFlow: setNodeFlow,
        setNodeParameterValue: setNodeParameterValue,
        linkOutParameter: linkOutParameter
    }
}

const setGraphName = (name) => {
    Application.graphboard.name = name;
    document.querySelector(".graph-name input").value = Application.graphboard.name;
    Application.currentProject.name = name;
    Application.currentProject.update();
}

const appendLog = (type, message) => {
    Application.terminal.append(type, message);
}

const clearGraph = () => {
    var response = confirm("Graphlinq AI want to clear the current graph, accept ?");
    if(response) {
        Application.graphboard.clear();
    }
};

const createNode = async (nodeType, nodeParameters) => {
    const schema = Application.toolbox.schema.filter(x => x.NodeType == nodeType)[0];
    if (!schema) {
        Application.terminal.append("error", "Missing block schema in the graph " + nodeType);
        return;
    }
    const nodeInstance = Application.graphboard.appendNewNodeWithSchema(schema, { 
        x: nodeParameters.x,
        y: nodeParameters.y,
    });
    return nodeInstance;
}

const setNodeFlow = async (fromNode, toNode) => {
    fromNode.linkExecution(toNode);
}

const setNodeParameterValue = async(node, paramName, paramValue) => {
    const nodeParameter = node.parameters.filter(x => x.schema.Name == paramName)[0];
    if (nodeParameter == null) {
        Application.terminal.append("error", "Missing node parameter schema in the graph " + paramName);
        return;
    }
    nodeParameter.setValue(paramValue);
}

const linkOutParameter = async(fromNode, fromParameterName, toNode, toParameterName) => {
    const fromParameter = fromNode.parameters.filter(x => x.schema.Name == fromParameterName)[0];
    const toParameter = toNode.parameters.filter(x => x.schema.Name == toParameterName)[0];
    toParameter.linkParameter(fromNode, fromParameter);
}

const newComment = async(text, parameters) => {
    Application.graphboard.appendCommentToGraph({
        x: parameters.x,
        y: parameters.y,
        text: text
    })
}