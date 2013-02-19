declare var mat4;
///<reference path='WebGL2dContext.ts'/>
///<reference path='TextureMap.ts'/>

class WebGLRenderer extends GameRenderer {
	constructor(game:Game, container?:HTMLElement, transferMode?:RenderTransferMode) {
		super(game, container, transferMode, true);
	}

	static create2dContext(canvas:HTMLCanvasElement):CanvasRenderingContext2D {
		return new WebGL2dContext(canvas);
	}

	refresh() {
		//always direct mode
		delete this.buffer;
		this.buffer = new HTMLCanvasElement[];

		this.handler.innerHTML = "";
		this.buffer[0] = window.createCanvas(this.game.width, this.game.height);;
		//this.buffer[0] = <HTMLCanvasElement>document.getElementById("canvaskun");
		this.handler.appendChild(this.buffer[0]);
		this.fc = WebGLRenderer.create2dContext(this.buffer[0]);
		//this.bc = this.fc;

		if (this.frontCanvasSize) {
			this.buffer[0].style.width = this.frontCanvasSize.width+"px";
			this.buffer[0].style.height = this.frontCanvasSize.height+"px";
			if (this.frontCanvasOffset) {
				this.handler.style.position = "relative";
				this.handler.style.left = this.frontCanvasOffset.x+"px";
				this.handler.style.top = this.frontCanvasOffset.y+"px";
			}
		}
	}

	render() {
		var c = (<WebGL2dContext>this.fc);
		var gl = c.gl;
		var layer = this.scene.root;
		//if (! layer.isUpdate()) {
		//} else {
			if (!this.disableClear)
				c.clear();
				//gl.clear(gl.COLOR_BUFFER_BIT);

			this.renderParent(layer, this.fc);
			layer.reflected();
		//}

		gl.flush();
	}
}