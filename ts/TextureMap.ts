interface TextureMapValue {
	src: HTMLElement;
	texture: WebGLTexture;
}
class TextureMap {
	buf:TextureMapValue[];
	constructor() {
		this.buf = new TextureMapValue[];
	}

	add(image:HTMLElement, texture:WebGLTexture) {
		this.buf.push({
			src: image,
			texture: texture
		});
		return texture;
	}

	get(image:HTMLElement) {
		for (var i=0; i<this.buf.length; i++) {
			if (this.buf[i].src == image)
				return this.buf[i].texture;
		}
		return null;
	}

	clear() {
		this.buf = new TextureMapValue[];
	}
}
