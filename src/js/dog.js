import {Application, Sprite, Rectangle, Texture} from "pixi.js";
import * as PIXI from "pixi.js";

const IDLE = 0;
const WAIT = 1
const MOVE_IN = 2;
const MOVE_OUT = 3;
const PUPPY_NAP = 4;
const STARE_OUT_THE_WINDOW = 5;
const BARK_FOR_A_WHILE_FOR_NO_REASON = 6;
const CHASE_TAIL_LIKE_A_DUMMY = 7;
const TAKE_UP_THE_WHOLE_COUCH = 8;
const STRETCH_IN_THE_MIDDLE_OF_THE_FLOOR = 9;

function randrange(min, max) {
    return Math.round(Math.random() * (max-min) + min);
}

class Dog {
	constructor(others, x, y) {
        this.time = 0;
        this.others = others;

        this.dogThoughts = {
            mode: IDLE,
            dest: {
                x: 0,
                y: 0,
                outY: 0
            },
            goalMode: IDLE
        }

        this.area = new PIXI.Polygon([
            89, 70,
            79, 77,
            58, 77,
            10, 126,
            400, 126,
            353, 75,
            320, 74,
            320, 88,
            270, 88,
            270, 80,
            217, 80,
            200, 80,
            200, 96,
            118, 96,
            118, 70,
            89, 70
        ]);

		const dog = Texture.fromImage('images/dog.png');
		const frames = [
			new Rectangle(0, 0, 14, 24),
			new Rectangle(17, 0, 24, 24),
			new Rectangle(44, 0, 16, 24),
			new Rectangle(63, 0, 24, 24),
			new Rectangle(89, 0, 14, 24),
			new Rectangle(107, 0, 23, 24),
			new Rectangle(133, 0, 16, 24),
			new Rectangle(152, 0, 23, 24),
			new Rectangle(178, 0, 15, 24),
			new Rectangle(196, 0, 15, 24),
			new Rectangle(212, 0, 24, 24),
			new Rectangle(237, 0, 23, 24),
			new Rectangle(262, 0, 24, 24),
			new Rectangle(289, 0, 24, 24)
		]
		let dogTex = [];
		for (let rect of frames) {
			dogTex.push(new Texture(dog, rect));
		}
		this.dog = new PIXI.extras.AnimatedSprite(dogTex);

		this.dog.anchor.set(0.5, 0.9);

        if (x === undefined || y === undefined) {
            let found = false;
            while (!found) {
                const x = randrange(10, 400);
                const y = randrange(70, 126);

                if (this.area.contains(x, y)) {
                    found = true;
                    this.dog.x = x;
                    this.dog.y = y;
                }
            }
        } else {
            this.dog.x = x;
            this.dog.y = y;
        }

        this.states = {
            [IDLE]: {transition: ()=>{}, update: this.doDogStuff},
            [MOVE_IN]: {transition: ()=>{}, update: this.updateMoveIn},
            [MOVE_OUT]: {transition: this.transitionMoveOut, update: this.updateMoveOut},
            [PUPPY_NAP]: {transition: this.transitionNapTime, update: this.updateNapTime},
            [STARE_OUT_THE_WINDOW]: {transition: this.transitionWindow, update: this.updateWindow},
            [BARK_FOR_A_WHILE_FOR_NO_REASON]: {transition: ()=>{}, update: ()=>{}},
            [CHASE_TAIL_LIKE_A_DUMMY]: {transition: this.transitionTail, update: this.updateTail},
            [TAKE_UP_THE_WHOLE_COUCH]: {transition: this.transitionCouch, update: this.updateCouch},
            [STRETCH_IN_THE_MIDDLE_OF_THE_FLOOR]: {transition: this.transitionStretch, update: this.updateStretch},
            [WAIT]: {transition: ()=>{}, update: ()=>{}},
        }
    }

	update(delta) { 
		this.time += delta;
        this.states[this.dogThoughts.mode].update.bind(this)();
	}

    // idle state

    doDogStuff() {
        console.log("woof woof woof");
        let {dogThoughts} = this;
        let {dest} = dogThoughts;

        if (dogThoughts.goalMode != IDLE) {
            dogThoughts.mode = dogThoughts.goalMode;
            dogThoughts.goalMode = IDLE;
        } else {
            const n = randrange(0, 100);

            const windowOccupied = this.taskOccupied(STARE_OUT_THE_WINDOW);
            const chairOccupied = this.taskOccupied(TAKE_UP_THE_WHOLE_COUCH);

            dogThoughts.mode = n < 10 ? CHASE_TAIL_LIKE_A_DUMMY :
                n < 20 ? (!windowOccupied ? STARE_OUT_THE_WINDOW : MOVE_OUT) :
                n < 30 ? PUPPY_NAP :
                n < 40 ? (!chairOccupied ? TAKE_UP_THE_WHOLE_COUCH : MOVE_OUT) :
                n < 50 ? STRETCH_IN_THE_MIDDLE_OF_THE_FLOOR :
                MOVE_OUT;
        }

        this.states[dogThoughts.mode].transition.bind(this)();
    }

    // move out state

    transitionMoveOut() {
        let {dogThoughts} = this;
        let {dest} = dogThoughts;

        let foundSpotButNotADogSpotButALocationSpot = false;

        while (foundSpotButNotADogSpotButALocationSpot == false) {
            console.log("sniff sniff");
            const x = randrange(10, 400);
            const y = randrange(70, 126);
            const outY = Math.max(y, randrange(96, 126));

            if (Math.abs(dest.x - x) < 20 || Math.abs(dest.y - y) < 20) {
                continue;
            }

            if (!this.area.contains(x, y)) {
                continue;
            }
            
            foundSpotButNotADogSpotButALocationSpot = true;
            dest.x = x;
            dest.y = y;
            dest.outY = outY;
        }       
    }

    updateMoveOut() {
        let {dog, dogThoughts} = this;
        let {mode, dest} = dogThoughts;

        if (dest.outY <= dog.y) {
            dogThoughts.mode = WAIT;
            setTimeout(() => { dogThoughts.mode = MOVE_IN }, randrange(250, 750))
            console.log("bark!");
        }
        else {
            this.moveDown();
        }
    }

    // move in state
    
    updateMoveIn() {
        let {dog, dogThoughts} = this;
        let {mode, dest} = dogThoughts;

        if (dog.x == dest.x && dog.y == dest.y) {
            dogThoughts.mode = WAIT;
            this.faceRandomDirection();
            setTimeout(() => { dogThoughts.mode = IDLE }, dogThoughts.goalMode != IDLE ? 0 : randrange(1000, 4000))
            return;
        }

        if (dest.x > dog.x) {
            this.moveRight();
        }
        else if (dest.x < dog.x) { 
            this.moveLeft();
        }
        else if (dest.y < dog.y) {
            this.moveUp();
        }
        else {
            this.moveDown();
        }
    }

    // sleepy puppy time

    transitionNapTime() {
        console.log('yawn');
        let {dogThoughts} = this;
        setTimeout(() => { dogThoughts.mode = IDLE }, randrange(5000, 10000));
    }

    updateNapTime() {
        console.log('zzz zzz');
        const rem = Math.floor(this.time / 10) % 2;
		this.dog.gotoAndStop(rem == 0 ? 12 : 13);
    }

    // stare out the window

    transitionWindow() {
        console.log('wag wag wag');
        let {dog, dogThoughts} = this;
        let {mode, dest} = dogThoughts;

        const wx = 111, wy = 64
        if (dog.x != wx || dog.y != wy) {
            dest.x = wx;
            dest.y = wy;
            dest.outY = 104;
            dogThoughts.mode = MOVE_OUT;
            dogThoughts.goalMode = STARE_OUT_THE_WINDOW;
        } else {
            setTimeout(() => { dogThoughts.mode = IDLE }, randrange(3000, 7000));            
        }
    }

    updateWindow() {
        const rem = Math.floor(this.time / 10) % 2;
		this.dog.gotoAndStop(rem == 0 ? 8 : 9);
    }

    // sleep on the couch

    transitionCouch() {
        console.log('wag wag wag');
        let {dog, dogThoughts} = this;
        let {mode, dest} = dogThoughts;

        const wx = 295, wy = 81
        if (dog.x != wx || dog.y != wy) {
            dest.x = wx;
            dest.y = wy;
            dest.outY = 104;
            dogThoughts.mode = MOVE_OUT;
            dogThoughts.goalMode = TAKE_UP_THE_WHOLE_COUCH;
        } else {
            setTimeout(() => { dogThoughts.mode = IDLE }, randrange(7000, 14000));            
        }
    }

    updateCouch() {
        const rem = Math.floor(this.time / 10) % 2;
		this.dog.gotoAndStop(rem == 0 ? 12 : 13);
    }

    // chase tail

    transitionTail() {
        console.log('ruff ruff ruff ruff');
        let {dogThoughts} = this;
        setTimeout(() => { dogThoughts.mode = IDLE }, randrange(2000, 5000));
    }

    updateTail() {
        const rem = Math.floor(this.time / 5) % 4;
		this.dog.gotoAndStop(rem);
    }

    // stretch on the floor

    transitionStretch() {
        console.log('low pitched grumble');
        let {dogThoughts} = this;
        setTimeout(() => { dogThoughts.mode = IDLE }, randrange(3000, 6000));
    }

    updateStretch() {
        const rem = Math.floor(this.time / 10) % 2;
		this.dog.gotoAndStop(rem == 0 ? 10 : 11);
    }

    // utils

    taskOccupied(task) {
        for (let other of this.others) {
            if (task == other.dogThoughts.mode || task == other.dogThoughts.goalMode) {
                return true;
            }
        }

        return false;
    }

    moveLeft() {
        let {dog} = this;
        const rem = Math.floor(this.time / 10) % 2;
		dog.gotoAndStop(rem == 0 ? 1 : 5);
        dog.x -= 0.5;
    }
    
    moveRight() {
        let {dog} = this;
        const rem = Math.floor(this.time / 10) % 2;
		dog.gotoAndStop(rem == 0 ? 3 : 7);
        dog.x += 0.5;
    }

    moveUp() {
        let {dog} = this;
        const rem = Math.floor(this.time / 10) % 2;
		dog.gotoAndStop(rem == 0 ? 2 : 6);
        dog.y -= 0.5;
    }

    moveDown() {
        let {dog} = this;
        const rem = Math.floor(this.time / 10) % 2;
		dog.gotoAndStop(rem == 0? 0 : 4);
        dog.y += 0.5;
    }

    faceRandomDirection() {
        const dir = randrange(0,7);
        this.dog.gotoAndStop(dir);
    }
}

export default Dog