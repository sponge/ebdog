import {Application, Sprite, Rectangle, Texture} from "pixi.js";
import * as PIXI from "pixi.js";
import Dog from "./dog.js"

document.addEventListener("DOMContentLoaded", () => {
	let game = new Game();
	window.game = game;
});

class Game {
	constructor() {
		const app = new Application(415, 128, {backgroundColor : 0x000000});
		this.app = app;
		container.appendChild(app.view);

		let setScale = () => {
			let scale = Math.floor(window.innerWidth / app.renderer.view.width);
			scale = Math.max(scale, 1);
			app.renderer.view.style.width = (scale * app.renderer.view.width) + 'px';
		}

		window.onresize = setScale;
		setScale();

		this.time = 0;

		this.bg = Sprite.fromImage('images/bg.png');
		this.dogs = []
		
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		app.renderer.roundPixels = true;

		app.stage.addChild(this.bg);

        let gfx = new PIXI.Graphics();
		gfx.lineStyle(2, 0xFF0000, 1);
		app.stage.addChild(gfx);

		this.dogContainer = new PIXI.Container();
		app.stage.addChild(this.dogContainer);

		for (let i = 0; i < 3; i++) {
			const dog = new Dog(this.dogs);
			this.dogs.push( dog );
			this.dogContainer.addChild(dog.dog);
		}

        //gfx.drawPolygon(this.dogs[0].area);

		app.ticker.add(this.update.bind(this));

	}

	update(delta) {
		this.time += delta;
		for (let dog of this.dogs) {
			dog.update(delta);
		}

		this.dogContainer.children.sort((a,b) => { return a.y - b.y });
	}
}
