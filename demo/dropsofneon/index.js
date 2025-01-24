import Scene from "./dropsofneon/scene.js";

export default class Demo {    
    init() {
        this.setup();
        this.scene = new Scene(this);
    }

    setup() {
        let self = this;

        this.music = new Audio('/audio/don/music2.wav');
        this.music.loop = true;
        this.bg_slider = document.querySelector("#bg_slider");
        this.music.volume = this.bg_slider.value / 100;

        this.difficulty = 1;
        this.isPlaying = true;
        this.lastTime = 0;

        // canvas
        this.canvas = document.querySelector("canvas");

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
    }

    update(time) {
        this.music.volume = this.bg_slider.value / 100;

        const deltaTime = Math.min(time - this.lastTime, 500);
        this.lastTime = time;

        // Update scene
        if (!this.scene.update(time, deltaTime, this.input)) {
            this.isPlaying = false;
            this.music.pause();
            document.querySelector("#game_over").style.display = "block";
        }

        if (this.isPlaying) window.requestAnimationFrame(this.update.bind(this));
    }

    start() {
        this.music.currentTime = 0;
        this.music.play();
        this.isPlaying = true;
        this.update(this.lastTime);
        document.querySelector("#game_start").style.display = "none";
    }

    retry() {
        this.music.currentTime = 0;
        this.music.play();
        this.scene = new Scene(this);
        this.isPlaying = true;
        this.update(this.lastTime);
        document.querySelector("#game_over").style.display = "none";
    }

    resetMenu() {
        for(const item of document.querySelectorAll('.item')) {
            item.classList.remove('active');
        }
    }

    setEasy() {
        this.difficulty = 0;
        this.resetMenu();
        document.querySelector('#easy').classList.add('active');
    }
    
    setMedium() {
        this.difficulty = 1;
        this.resetMenu();
        document.querySelector('#medium').classList.add('active');
    }
    
    setHard() {
        this.difficulty = 2;
        this.resetMenu();
        document.querySelector('#hard').classList.add('active');
    }
};