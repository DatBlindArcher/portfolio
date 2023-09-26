import { Base, define } from "./base.js";
import Scene from "./bullets/scene.js";

const template = /*html*/`
<style>
    .screen {
        width: 100%;
        height: 100%;
        text-align: center;
    }

    .play {
        width: 800px;
        height: 600px;
        margin: auto;
        position: relative;
    }

    #ui {
        text-align: left;
        color: white;
        position: absolute;
        pointer-events: none;
        width: 100%;
        height: 100%;
    }

    #ui > * {
        margin: 1em;
    }

    #fps {
        top: 0;
        right: 0;
        position: absolute;
    }

    #reset {
        display: none;
        pointer-events: auto;
    }
</style>
<div class="screen">
    <div class="play">
        <div id="ui">
            <p id="fps">xx FPS</p>
            <p id="score">Score: 0</p>
            <p id="health">Health: 0</p>
            <button id="reset">Try Again</button>
        </div>
        <canvas width="800" height="600"></canvas>
    </div>
</div>
`;

define('bullets', template, class extends Base {
    created() {
        this.setup();;
        this.scene = new Scene(this);
    }

    setup() {
        let self = this;
        this.isPlaying = true;
        this.lastTime = 0;

        // canvas
        this.canvas = this.find("canvas");

        // input
        this.input = {
            mouse: {
                x: 0,
                y: 0,
                buttons: {}
            },
            keys: {}
        };

        this.canvas.addEventListener('mousedown', (e) => {
            self.input.mouse.buttons[e.button] = true;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            self.input.mouse.buttons[e.button] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            self.input.mouse.x = e.offsetX;
            self.input.mouse.y = e.offsetY;
        });

        document.addEventListener('keydown', (e) => {
            self.input.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            self.input.keys[e.code] = false;
        });

        // Prevent right clicking menu
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        window.requestAnimationFrame(this.update.bind(this));
    }

    update(time) {
        const deltaTime = Math.min(time - this.lastTime, 500);
        this.lastTime = time;

        // Update scene
        this.scene.update(time, deltaTime, this.input);

        if (this.isPlaying) window.requestAnimationFrame(this.update.bind(this));
    }
});