export default class Minimap {
    constructor(app) {
        this.app = app;
        this.canvas = document.querySelector("#minimap canvas");
        this.ctx = this.canvas.getContext("2d");
        setInterval(() => {
            this.render();
        }, 1000 / 15);
    }

    pixelToMapPixel(px, orientation) {
        let offset = (this.app.graphboard.offset[orientation] / 10);
        if(this.app.graphboard.move) {
            offset = (this.app.graphboard.moveOffset[orientation] / 10);
        }
        return (px / 10) + offset;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(const node of this.app.graphboard.nodes) {
            let style = getComputedStyle(node.element.querySelector(".node-title"));
            this.ctx.fillStyle = "rgb(" + style.background.split('rgb(')[1].split(")")[0] + ")";
            this.ctx.fillRect(this.pixelToMapPixel(node.x, "x"), this.pixelToMapPixel(node.y, "y"), 15, 7);
        }
    }
}