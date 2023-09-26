import { Base, define } from "./base.js";

import Scene from "./dropsofneon/scene.js";

const template = /*html*/`
<style>
* {
    font-family: Robotech;
    font-size: 20px;
}

.ui.rail > .ui.segment > h3 {
    font-family: Robotech;
    font-size: 30px;
}

.ui.button {
    font-family: Robotech;
    font-size: 24px;
    line-height: 8px;
    height: 50px;
}

.ui.container > .ui.inverted.header {
    font-family: University;
    font-size: 40px !important;
    color: #80FF00C0;
    text-shadow: -3px -3px #FFFFFF80;
}

#game {
    padding: 0;
    margin: auto;
    display: block;
    width: 800px;
}

.strong {
    font-size: 24px;
}

.ui.container {
    width: 830px;
    box-sizing: border-box;
}

.ui.rail > .ui.segment {
    height: 630px;
}

.ui.right.rail {
    margin: 0;
}

.ui.left.rail {
    margin: 0;
}

.heart {
    position: absolute;
    top: 24px;
}

.score {
    position: absolute;
    top: 24px;
    right: 30px;
}

.score_value {
    margin: 10px;
    font-size: 24px;
}

#heart_0 {
    left: 30px;
}
#heart_1 {
    left: 50px;
}
#heart_2 {
    left: 70px;
}
#heart_3 {
    left: 90px;
}

.overlay {
  position: absolute;
  width: 800px;
  height: 600px;
  top: 15px;
  background-color: rgba(40, 40, 40, 0.5);
  z-index: 2;
}

#game_start {
  display: block;
}

#game_over {
  display: none;
}

.overlay > .ui.header {
  position: absolute;
  width: 400px;
  top: 180px;
  left: 200px;
}

.overlay > .ui.button {
  position: absolute;
  width: 200px;
  top: 260px;
  left: 300px;
}

.overlay > div {
  position: absolute;
  text-align: center;
  width: 600px;
  top: 225px;
  left: 100px;
  font-size: 20px;
}

.overlay > .div2 {
  position: absolute;
  text-align: center;
  width: 600px;
  top: 330px;
  left: 100px;
  font-size: 18px;
}

.overlay > p {
  position: absolute;
  text-align: center;
  width: 600px;
  top: 160px;
  left: 100px;
  font-size: 20px;
}

#sfx_slider {
    width: 200px;
}

#bg_slider {
    width: 200px;
}

#difficulty {
  position: absolute;
  text-align: center;
  width: 600px;
  top: 340px;
  left: 100px;
  font-size: 20px;
}
</style>
<div class="ui container">
    <h1 class="ui inverted center aligned huge header">Drops of Neon</h1>
    <div class="ui inverted segment">      
        <div class="ui left rail">
            <div class="ui inverted segment">
                <h3 class="ui dividing inverted header">Controls</h3>
                <div class="ui list">
                    <div class="item">Guide the hover container with your <b class="strong">mouse</b> to catch the falling neon drops.</div>
                    <div class="item">When the container scans <b class="strong">4 drops</b> or more of the <b class="strong">same color</b> touching, it will disintegrate them.</div>
                    <div class="item"><b class="strong">Score</b> as many points as you can by disintegrating drops.</div>
                    <div class="item">But don't drop them or you will catch a <b class="strong">game over</b>.</div>
                </div>
            </div>
        </div>
        <div class="ui right rail">
            <div class="ui inverted segment">
                <h3 class="ui dividing inverted header">Description</h3>
                <div class="ui list">
                    <div class="item">Ludum Dare 49</div>
                    <div class="item">Theme: Unstable</div>
                    <div class="item">Made By: Blind Archer</div>
                    <div class="item">Framework:</div>
                    <div class="item">&nbsp;&nbsp;Architecture: Ape ECS</div>
                    <div class="item">&nbsp;&nbsp;Physics: Matter JS</div>
                    <div class="item">&nbsp;&nbsp;Layout: Semantic UI</div>
                    <div class="item">Audio:</div>
                    <div class="item">&nbsp;&nbsp;Sound Effects: SFXR</div>
                    <div class="item">&nbsp;&nbsp;
                        <input type="range" id="sfx_slider" min="0" max="100" value="50">
                    </div>
                    <div class="item">&nbsp;&nbsp;Music: Bespoke Synth</div>
                    <div class="item">&nbsp;&nbsp;
                        <input type="range" id="bg_slider" min="0" max="100" value="50">
                    </div>
                </div>
            </div>
        </div>
        <img id="heart_0" class="heart" width="16" height="16" src="images/heart.png" />
        <img id="heart_1" class="heart" width="16" height="16" src="images/heart.png" />
        <img id="heart_2" class="heart" width="16" height="16" src="images/heart.png" />
        <img id="heart_3" class="heart" width="16" height="16" src="images/heart.png" />
        <div class="score"><span class="score_value">1</span><img class="drop" width="12" height="12" src="images/drop.png" /></div>    
        <canvas id='game' width="800" height="600"></canvas>
        <div id="game_start" class="overlay">
            <p>Somewhere deep in the dark web drops suddenly appeared to turn neon. Your job is to capture and destroy them. 
                Are you the one fit enough in this unstable environment?</p>
            <button bind="start" class="ui primary button">Start Game</button>
        </div>
        <div id="game_over" class="overlay">
            <h2 class="ui center aligned inverted huge header">Game Over</h2>
            <div>Score: <span class="score_value">1</span><img class="drop" width="12" height="12" src="images/drop.png" /></div>
            <button bind="retry" class="ui primary button">Try Again</button>
            <div class="div2">Want to change difficulty?</div>
            <div id="difficulty" class="ui three item inverted menu">
                <a id="easy" bind="click:setEasy" class="item">Easy</a>
                <a id="medium" bind="click:setMedium" class="active item">Default</a>
                <a id="hard" bind="click:setHard" class="item">Hard</a>
            </div>
        </div>
    </div>
</div>
`;

define('dropsofneon', template, class extends Base {    
    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
    }

    created() {
        this.setup();
        this.scene = new Scene(this);
    }

    setup() {
        let self = this;

        this.music = new Audio(config.base_path + '/audio/don/music2.wav');
        this.music.loop = true;
        this.bg_slider = this.find("#bg_slider");
        this.music.volume = this.bg_slider.value / 100;

        this.difficulty = 1;
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
    }

    update(time) {
        this.music.volume = this.bg_slider.value / 100;

        const deltaTime = Math.min(time - this.lastTime, 500);
        this.lastTime = time;

        // Update scene
        if (!this.scene.update(time, deltaTime, this.input)) {
            this.isPlaying = false;
            this.music.pause();
            this.find("#game_over").style.display = "block";
        }

        if (this.isPlaying) window.requestAnimationFrame(this.update.bind(this));
    }

    start() {
        this.music.currentTime = 0;
        this.music.play();
        this.isPlaying = true;
        this.update(this.lastTime);
        this.find("#game_start").style.display = "none";
    }

    retry() {
        this.music.currentTime = 0;
        this.music.play();
        this.scene = new Scene(this);
        this.isPlaying = true;
        this.update(this.lastTime);
        this.find("#game_over").style.display = "none";
    }

    resetMenu() {
        for(const item of this.findAll('.item')) {
            item.classList.remove('active');
        }
    }

    setEasy() {
        this.difficulty = 0;
        this.resetMenu();
        this.find('#easy').classList.add('active');
    }
    
    setMedium() {
        this.difficulty = 1;
        this.resetMenu();
        this.find('#medium').classList.add('active');
    }
    
    setHard() {
        this.difficulty = 2;
        this.resetMenu();
        this.find('#hard').classList.add('active');
    }
});