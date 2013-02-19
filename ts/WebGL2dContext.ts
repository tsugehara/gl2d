class WebGL2dContext implements CanvasRenderingContext2D {
	shadowOffsetX: number;
	lineWidth: number;
	miterLimit: number;
	canvas: HTMLCanvasElement;
	strokeStyle: any;
	font: string;
	globalAlpha: number;
	globalCompositeOperation: string;
	shadowOffsetY: number;
	fillStyle: any;
	lineCap: string;
	shadowBlur: number;
	textAlign: string;
	textBaseline: string;
	shadowColor: string;
	lineJoin: string;

	gl:WebGLRenderingContext;
	textureMap: TextureMap;
	spriteShaderI: any;
	spriteShaderP: any;
	spriteVertex: any;
	spriteUV: any;
	colorLocation: any;
	width:number;
	height:number;

	p:CommonOffset;

	static getContext(canvas:HTMLCanvasElement):WebGLRenderingContext {
		return <WebGLRenderingContext><any>(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
	}

	/*
	constructor(canvas:HTMLCanvasElement) {
		this.canvas = canvas;
		this.textureMap = new TextureMap();

		var gl = this.gl = WebGL2dContext.getContext(canvas);
		this.width = canvas.width;
		this.height = canvas.height;
		gl.viewport( 0, 0, this.width, this.height);

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clearDepth( 1.0 );
		//gl.enable( gl.DEPTH_TEST );
		//gl.depthFunc( gl.LEQUAL );

		//gl.enable( gl.DEPTH_TEST );
		gl.enable( gl.BLEND );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ); 

		this.supportSprite();

		this.spriteVertex = gl.createBuffer();
		var uvData = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		this.spriteUV = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.spriteUV );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW );		

		this.p = {x:0, y:0};	//仮

		this.spriteMode();
	}

	supportSprite() {
		var gl = this.gl;
		var shaderVsI =
			"attribute vec2 pos;"+
			"attribute vec2 uv;"+
			"uniform vec2 u_resolution;"+
			"varying vec2 texCoord;"+
			"varying float vAlpha;"+
			"void main(void)"+
			"{"+
			"    gl_Position = vec4( pos * u_resolution + vec2( -1, 1) , 0, 1);"+
			"    vAlpha = 1.0;"+	//多分globalAlphaっぽく使えると思うんですけど
			"    texCoord = uv;"+
			"}";
		var shaderFsI =
			"precision highp float;"+
			"uniform sampler2D sampler2d;"+
			"varying vec2 texCoord;"+
			"varying float vAlpha;"+
			"void main(void)"+
			"{"+
			"    vec4 col = texture2D(sampler2d, texCoord);"+
			"    gl_FragColor = clamp(vec4(col.rgb, col.a * vAlpha), 0.0, 1.0);"+
			"}";

		this.spriteShaderI  = gl.createProgram();
		gl.attachShader( this.spriteShaderI, this.ggetShader( shaderVsI, gl.VERTEX_SHADER ) );
		gl.attachShader( this.spriteShaderI, this.ggetShader( shaderFsI, gl.FRAGMENT_SHADER ) );

		gl.linkProgram( this.spriteShaderI );
		gl.getProgramParameter( this.spriteShaderI, gl.LINK_STATUS );
		gl.useProgram( this.spriteShaderI );

		this.spriteShaderI.vertexPositionAttribute = gl.getAttribLocation( this.spriteShaderI, "pos" );
		gl.enableVertexAttribArray( this.spriteShaderI.vertexPositionAttribute );
		this.spriteShaderI.textureCoordAttribute = gl.getAttribLocation( this.spriteShaderI, "uv" );
		gl.enableVertexAttribArray( this.spriteShaderI.textureCoordAttribute );

		var resolutionLocation = gl.getUniformLocation( this.spriteShaderI, "u_resolution" );
		//Note: 無くても動くんだが？？
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform2f( resolutionLocation, 2/this.width, -2/this.height );
	}
	supportPolygon() {
		var gl = this.gl;
		var shaderVsP =
			"attribute vec2 pos;"+
			"uniform vec2 u_resolution;"+
			"void main(void)"+
			"{"+
			"    gl_Position = vec4( pos * u_resolution + vec2( -1, 1) , 0, 1);"+
			"}";
		var shaderFsP =
			"precision highp float;"+
			"uniform vec4 u_color;"+
			"void main(void)"+
			"{"+
			"    gl_FragColor = u_color;"+
			"}";
		this.spriteShaderP  = gl.createProgram();
		gl.attachShader( this.spriteShaderP, this.ggetShader( shaderVsP, gl.VERTEX_SHADER ) );
		gl.attachShader( this.spriteShaderP, this.ggetShader( shaderFsP, gl.FRAGMENT_SHADER ) );

		gl.linkProgram( this.spriteShaderP );
		gl.getProgramParameter( this.spriteShaderP, gl.LINK_STATUS );
		gl.useProgram( this.spriteShaderP );

		//========================
		this.spriteShaderP.vertexPositionAttribute = gl.getAttribLocation( this.spriteShaderP, "pos" );
		gl.enableVertexAttribArray( this.spriteShaderP.vertexPositionAttribute );
		this.colorLocation = gl.getUniformLocation( this.spriteShaderP, "u_color");
		gl.uniform4f( this.colorLocation, 1, 0, 1, 1 );
		var resolutionLocation2 = gl.getUniformLocation( this.spriteShaderP, "u_resolution" );
		gl.uniform2f( resolutionLocation2, 2/this.width, -2/this.height );
	}

	ggetShader(str, type) {
		var shader;
		var gl = this.gl;

		shader = gl.createShader( type )
		gl.shaderSource( shader, str );
		gl.compileShader( shader );
		if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
			alert( gl.getShaderInfoLog( shader ) );
			return null;
		}
		return shader;
	};

	createTexture(image) {
		var gl = this.gl;
		var	tex = gl.createTexture();

		gl.bindTexture( gl.TEXTURE_2D, tex );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );	

		gl.generateMipmap(gl.TEXTURE_2D);
		//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

		gl.bindTexture(gl.TEXTURE_2D, null);

		return tex;
	}

	spriteMode() {
		var gl = this.gl;

		gl.useProgram( this.spriteShaderI );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.spriteUV );
		gl.vertexAttribPointer( this.spriteShaderI.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	}
	polygonMode() {

	}

	drawImage(image: HTMLElement, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number): void {
		var gl = this.gl;

		var texture = this.textureMap.get(image);
		if (! texture)
			texture = this.textureMap.add(image, this.createTexture(image));
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.bindBuffer( gl.ARRAY_BUFFER, this.spriteVertex );
		gl.vertexAttribPointer( this.spriteShaderI.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0 );

		var	vertices = [
			this.p.x+offsetX, this.p.y+offsetY,
			this.p.x+offsetX+width, this.p.y+offsetY,
			this.p.x+offsetX, this.p.y+offsetY+height,
			this.p.x+offsetX+width, this.p.y+offsetY+height,
		];
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );

		//if (width === undefined) width = image.width;
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	}
	*/

	program:any;
	viewMat:any;
	projMat:any;
	uniformLocationsForSprite:any;

	constructor(canvas:HTMLCanvasElement) {
		this.canvas = canvas;
		this.textureMap = new TextureMap();

		var gl = this.gl = WebGL2dContext.getContext(canvas);
		this.width = canvas.width;
		this.height = canvas.height;

		var VERTICES = [
			-1,  1, 0,
			-1, -1, 0,
			 1,  1, 0,
			 1, -1, 0
		];

		/*
		var TEXTURE_COORDS = [
			0, 0,
			0, 64/512,
			64/512, 0,
			64/512, 64/512
		];
		*/
		var TEXTURE_COORDS = [
			0.0, 0.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 1.0
		];

		var VERTEX_SHADER = ""+
			"attribute vec3 position;"+
			"attribute vec2 texCoord;"+
			"uniform mat4 pvMat;"+
			"uniform mat4 status;"+
			"varying vec2 vTextureCoord;"+
			"varying float vAlpha;"+
			""+
			"mat4 model(vec2 xy, vec2 scale, float rot) {"+
			"	mat4 result = mat4("+
			"		1.0, 0.0, 0.0, 0.0,"+
			"		0.0, 1.0, 0.0, 0.0,"+
			"		0.0, 0.0, 1.0, 0.0,"+
			"		0.0, 0.0, 0.0, 1.0"+
			"	);"+
			"	result = result * mat4("+
			"		1.0, 0.0, 0.0, 0.0,"+
			"		0.0, 1.0, 0.0, 0.0,"+
			"		0.0, 0.0, 1.0, 0.0,"+
			"		xy.x, xy.y, 0.0, 1.0"+
			"	);"+
			"	result = result * mat4("+
			"		scale.x, 0.0, 0.0, 0.0,"+
			"		0.0, scale.y, 0.0, 0.0,"+
			"		0.0, 0.0, 1.0, 0.0,"+
			"		0.0, 0.0, 0.0, 1.0"+
			"	);"+
			"	result = result * mat4("+
			"		cos(radians(rot)), -sin(radians(rot)), 0.0, 0.0,"+
			"		sin(radians(rot)), cos(radians(rot)), 0.0, 0.0,"+
			"		0.0, 0.0, 1.0, 0.0,"+
			"		0.0, 0.0, 0.0, 1.0"+
			"	);"+
			"	return result;"+
			"}"+
			""+
			"void main(void) {"+
			"	vAlpha = status[2][0];"+
			"	vTextureCoord = vec2(status[1][1], status[1][2]) + (texCoord * status[1][3]);"+
			"	gl_Position = pvMat * model(vec2(status[0][0], status[0][1]), vec2(status[0][2], status[0][3]), status[1][0]) * vec4(position, 1.0);"+
			"}"+
			"";
			//"    gl_Position = vec4( pos * u_resolution + vec2( -1, 1) , 0, 1);"+
			//"    vAlpha = 1.0;"+	//多分globalAlphaっぽく使えると思うんですけど
			//"    texCoord = uv;"+

		var FRAGMENT_SHADER = ""+
			"precision mediump float;"+
			""+
			"uniform sampler2D texture;"+
			"varying vec2 vTextureCoord;"+
			"varying float vAlpha;"+
			""+
			"void main(void) {"+
			"	vec4 col = texture2D(texture, vTextureCoord);"+
			"	gl_FragColor = clamp(vec4(col.rgb, col.a * vAlpha), 0.0, 1.0);"+
			"}"+
			"";


		gl.clearColor(0.0, 0.0, 0.0, 0.0);
	    gl.enable(gl.BLEND);
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

		var program = this.program = this.createProgram(
			this.createShader("vs", VERTEX_SHADER),
			this.createShader("fs", FRAGMENT_SHADER)
		);

		var attrPosition = gl.getAttribLocation(program, "position");
		var positionBuffer = this.createVbo(VERTICES);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(attrPosition);
		gl.vertexAttribPointer(attrPosition, 3, gl.FLOAT, false, 0, 0);

		var attrTexCoord = gl.getAttribLocation(program, "texCoord");
		var texCoordBuffer = this.createVbo(TEXTURE_COORDS);
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.enableVertexAttribArray(attrTexCoord);
		gl.vertexAttribPointer(attrTexCoord, 2, gl.FLOAT, false, 0, 0);

		this.viewMat = mat4.identity(mat4.create());
		this.projMat = mat4.identity(mat4.create());

		//mat4.lookAt([0,0,16], [0,0,0], [0,1,0], this.viewMat)
		//mat4.ortho(-16, 16, -16, 16, 0.1, 32, this.projMat);
		var w = this.width;
		var h = this.height;
		var w2 = w/2;
		var h2 = h/2;
		mat4.lookAt([w2,-h2,(w2+h2)/2], [w2,-h2,0], [0,1,0], this.viewMat)
		mat4.ortho(-w2, h2, -w2, h2, 0.1, w2+h2, this.projMat);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1f(gl.getUniformLocation(program, "texture"), 0);

		this.uniformLocationsForSprite = this.getUniformLocationsForSprite(program, ["status"]);

		this.updateMatrix();
		this.textureMap = new TextureMap();

		this.p = {x:0, y:0};	//仮
	}

	updateMatrix() {
		var temp = mat4.create();
		mat4.multiply(this.projMat, this.viewMat, temp);
		this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "pvMat"), false, temp);
	}

	createProgram(vs, fs):WebGLProgram {
		var gl = this.gl;
		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
			gl.useProgram(program);
			return program;
		} else {
			alert(gl.getProgramInfoLog(program));
			throw new Error();
		}
	}

	createShader(type, script) {
		var gl = this.gl;
		var shader;
		switch (type) {
			case "vs":
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
			case "fs":
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default:
				throw new Error();
		}

		gl.shaderSource(shader, script);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			alert(gl.getShaderInfoLog(shader));
			throw new Error();
		}
	}

	createVbo(data) {
		var gl = this.gl;
		var vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return vbo;
	}

	createTexture(image) {
		var gl = this.gl;
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return tex;
	}

	getUniformLocationsForSprite(program, names) {
		var result = {};
		names.map((name) => {
			result[name] = this.gl.getUniformLocation(program, name);
		});
		return result;
	}

	beforeImage:any;

	drawImage(image: HTMLElement, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number): void {
		var gl = this.gl;
		if (this.beforeImage != image) {
			this.beforeImage = image;
			var texture = this.textureMap.get(image);
			if (! texture)
				texture = this.textureMap.add(image, this.createTexture(image));
			gl.bindTexture(gl.TEXTURE_2D, texture);
		}

		var status = [
			this.p.x+canvasOffsetX, -(this.p.y+canvasOffsetY), width/2, height/2,
			0, 1, 1, 1,
			1, 0, 0, 0,
			0, 0, 0, 0
		];
		gl.uniformMatrix4fv(this.uniformLocationsForSprite["status"], false, status);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	restore():void {
		this.p = {x:0, y:0}
	}
	setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number):void {

	}
	save(): void {

	}
	arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: bool): void {

	}
	measureText(text: string): TextMetrics {
		return null;
	}
	isPointInPath(x: number, y: number): bool {
		return false;
	}
	quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {

	}
	putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void {

	}
	rotate(angle: number): void {

	}
	fillText(text: string, x: number, y: number, maxWidth?: number): void {

	}
	translate(x: number, y: number): void {
		this.p.x += x;
		this.p.y += y;
	}
	scale(x: number, y: number): void {

	}
	createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
		return null;
	}
	lineTo(x: number, y: number): void {

	}
	fill(): void {

	}
	createPattern(image: HTMLElement, repetition: string): CanvasPattern {
		return null;
	}
	closePath(): void {

	}
	rect(x: number, y: number, w: number, h: number): void {

	}
	clip(): void {

	}
	createImageData(imageDataOrSw: any, sh?: number): ImageData {
		return null;
	}
	clearRect(x: number, y: number, w: number, h: number): void {

	}
	moveTo(x: number, y: number): void {

	}
	getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
		return null;
	}
	fillRect(x: number, y: number, w: number, h: number): void {

	}
	bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {

	}

	transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void {
	}
	stroke(): void {
	}
	strokeRect(x: number, y: number, w: number, h: number): void {
	}
	strokeText(text: string, x: number, y: number, maxWidth?: number): void {
	}
	beginPath(): void {
	}
	arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
	}
	createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
		return null;
	}
	clear() {
		var gl = this.gl;
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	}
}