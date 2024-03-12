export default class Minimap {
    constructor(app) {
        this.app = app;
        this.canvas = document.querySelector("#minimap canvas");
        this.ctx = this.canvas.getContext("2d");
        
        setInterval(() => {
            this.render();
        }, 1000 / 60);
    }

    pixelToMapPixel(px, orientation) {
        let coef = 7;
        let offset = (this.app.graphboard.offset[orientation] / coef);
        if(this.app.graphboard.move) {
            offset = (this.app.graphboard.moveOffset[orientation] / coef);
        }
        return (px / coef) + offset;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(const node of this.app.graphboard.nodes) {
            let style = getComputedStyle(node.element.querySelector(".node-title"));
            
            this.ctx.fillStyle = "#6e7b94";
            this.ctx.fillRect(this.pixelToMapPixel(node.x, "x"), this.pixelToMapPixel(node.y, "y") + 5, 15, 4);

            this.ctx.fillStyle = style.background;
            this.ctx.fillRect(this.pixelToMapPixel(node.x, "x"), this.pixelToMapPixel(node.y, "y"), 15, 7);
        }

        for(const comment of this.app.graphboard.comments) {
            this.ctx.fillStyle = "#6e7b94";
            this.ctx.font = "8px serif";
            this.ctx.fillText(comment.text, this.pixelToMapPixel(comment.x, "x"), this.pixelToMapPixel(comment.y, "y"));
        }
    }
}