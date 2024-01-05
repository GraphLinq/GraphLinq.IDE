export default class AISchema {
    constructor(app) {
        this.app = app;
        this.schema = this.app.toolbox.schema;
        console.log(this.schema);
    }

    buildHumanSchema() {
        this.app.terminal.append("debug", "Exporting human schema ...");
        let hSchema = "List of all nodes available to create graph in Graphlinq : \n\n";
        for(const nodeSingleSchema of this.schema) {
            const nodeHumanSchema = this.nodeToHumanNodeSchema(nodeSingleSchema);
            hSchema += nodeHumanSchema;
        }
        saveAs(new File([hSchema], "human_schema.txt", { type: "text/plain;charset=utf-8" }))
    }

    nodeToHumanNodeSchema(nodeSingleSchema) {
        let hSchema = "";
        hSchema += "Node type identifier = " + nodeSingleSchema.NodeType + "\n";
        hSchema += "Friendly Name (Not for use, just display purpose) = " + nodeSingleSchema.FriendlyName + "\n";
        hSchema += "Node description = " + nodeSingleSchema.NodeDescription + "\n";
        hSchema += "Can be executed in execution flow = " + nodeSingleSchema.CanBeExecuted + "\n";
        hSchema += "Can execute a other node in execution flow = " + nodeSingleSchema.CanExecute + "\n";
        hSchema += "Is Event Node, mean that one of his out parameters in a execution flow output = " + nodeSingleSchema.IsEventNode + "\n";
        hSchema += "Input parameters list : " + "\n";
        let index = 1;
        for(const inParam in nodeSingleSchema.InParameters) {
            hSchema += index + " = " + nodeSingleSchema.InParameters[inParam].Name + "\n";
            index++;
        }
        index = 1;

        hSchema += "Output parameters list : " + "\n";
        for(const outParam in nodeSingleSchema.OutParameters) {
            let additionalText = "";
            if(nodeSingleSchema.OutParameters[outParam].ValueType.startsWith("NodeBlock.Engine.Node")) {
                additionalText += "(This parameter is a execution flow out parameter, you can use it to execute other node)"
            }
            hSchema += index + " = " + nodeSingleSchema.OutParameters[outParam].Name + " " + additionalText + "\n";
            index++;
        }
        hSchema += "\n" + "===================" + "\n";
        return hSchema;
    }

    buildJavascriptGraph() {
        let javascriptFile = "(async () => {";

        javascriptFile += 'ide.clearGraph();\n\n';
        javascriptFile += 'ide.setGraphName("' + this.app.graphboard.name + '");\n\n';
        
        // Set vars and values
        for (const node of this.app.graphboard.nodes) { // <- out
            const varName = this.getUniqueVariableNameForNode(node);
            javascriptFile += 'const ' + varName + ' = await ide.createNode("' + node.schema.NodeType + '", {x: ' + node.x + ', y: ' + node.y + '}); // Create the ' + node.schema.NodeType + '\n';
            for(const param of node.parameters.filter(x => x.direction == "out")) {
                if(param.value != "" && param.value != null) {
                    javascriptFile += 'ide.setNodeParameterValue(' + varName + ', "' + param.schema.Name +  '", "' + param.value + '");\n';
                }
            }
        }

        javascriptFile += '\n';

        // set link assignment
        for (const node of this.app.graphboard.nodes) { // <- in
            const varName = this.getUniqueVariableNameForNode(node);
            for(const param of node.parameters.filter(x => x.direction == "in")) {
                if(param.assignment != "" && param.assignment != null) {
                    const fromNode = this.app.graphboard.findNodeById(param.assignmentNode);
                    const fromParameter = fromNode.parameters.filter(x => x.id == param.assignment)[0];
                    // ide.linkOutParameter(intNode, "value", timerNode, "intervalInSeconds"); // Link the IntNode value "value" to the TimerNode value "intervalInSeconds"
                    javascriptFile += ' ide.linkOutParameter(' + this.getUniqueVariableNameForNode(fromNode) + ', "' + fromParameter.schema.Name + '", ' + this.getUniqueVariableNameForNode(node) + ', "' + param.schema.Name + '");\n';
                }
            }
        }

        javascriptFile += '\n';

        // Set execution flow
        for (const node of this.app.graphboard.nodes) {
            const varName = this.getUniqueVariableNameForNode(node);
            if(node.outNode != "" && node.outNode != null) {
                const toNode = this.app.graphboard.findNodeById(node.outNode);
                javascriptFile += 'await ide.setNodeFlow(' + varName + ', ' + this.getUniqueVariableNameForNode(toNode) + ');\n';
            }
        }

        javascriptFile += '\n';

        // Add comments
        for (const comment of this.app.graphboard.comments) {
            javascriptFile += 'ide.newComment("' + comment.text + '", {x: ' + comment.x + ', y: ' + comment.y + '});\n';
        }

        javascriptFile += '})();';
        
        saveAs(new File([javascriptFile], this.app.graphboard.name + ".js", { type: "text/plain;charset=utf-8" }));
    }

    getUniqueVariableNameForNode(node) {
        return node.schema.NodeType + node.x + "_" + node.y;
    }
}