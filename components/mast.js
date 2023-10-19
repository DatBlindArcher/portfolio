import { Base, define } from "./base.js";

const template = /*html*/`
<style>
    .main {
        width: 100%;
        height: 100%;
        background-color: #111111;
    }

    .header {
        position: absolute;
        text-align: center;
        top: 48%;
        left: 50%;
        color: white;
        font-size: 48px;
        transform: translate(-50%, -50%)
    }
    
    .meta {
        position: absolute;
        text-align: center;
        top: calc(48% + 54px);
        left: 50%;
        color: white;
        font-size: 16px;
        font-weight: 0;
        font-style: italic;
        transform: translate(-50%, -50%)
    }

    #screen {
        width: 100%;
        height: 100%;
    }
</style>
<div class="main">
    <h1 class="header">Robbe Decraemer</h1>
    <h2 class="meta">a.k.a. Archer</h2>
    <canvas id="screen"></canvas>
</div>
`;

define('mast', template, class extends Base {
    created() {
        this.imageObj = new Image();
        this.imageObj.onload = this.start.bind(this);
        this.imageObj.src = "http://www.blog.jonnycornwell.com/wp-content/uploads/2012/07/Smoke10.png";
    }

    start() {
        this.canvas = this.find("#screen");
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext("2d");

        this.clouds = [];

        for (let i = 0; i < 10; i++) {
            this.clouds.push([Math.random(), Math.random(), Math.random(), Math.random() * 0.0002 - 0.0001, Math.random() * 0.0002 - 0.0001]);
        }

        window.requestAnimationFrame(this.update.bind(this));
    }

    update(time) {
        let ctx = this.ctx;
        let width = this.width;
        let height = this.height;

        ctx.clearRect(0, 0, width, height)
        ctx.strokeStyle = '#EEEEEE';
        ctx.fillStyle = '#111111';
        ctx.lineWidth = 2;

        this.drawClouds(ctx, width, height, time);

        this.drawComplexSine(ctx, width, height, 700, [
            [0.02, 80], [0.05, 50], [0.25, 4] 
        ], time, 0.0008);

        this.drawClouds(ctx, width, height, time);

        this.drawComplexSine(ctx, width, height, 580, [
            [0.015, 60], [0.035, 30], [0.2, 3] 
        ], time, 0.0007);

        this.drawClouds(ctx, width, height, time);

        this.drawComplexSine(ctx, width, height, 400, [
            [0.01, 40], [0.025, 50], [0.15, 5] 
        ], time, 0.0005);

        window.requestAnimationFrame(this.update.bind(this));
    }

    // sine : interval, amplitude
    drawComplexSine(ctx, width, height, altitude, sines, time, speed) {
        ctx.globalAlpha = 1;
        var counters = sines.map(_ => 0);
        var intervals = sines.map(sine => sine[0] * (90 / 180 * Math.PI / 9));
        var amplitudes = sines.map(sine => sine[1]);
        
        var x = 0, y = height - altitude;
        ctx.beginPath();
        ctx.moveTo(x,y);

        for (let i = 0; i <= width; i += 2) {
            x = i;
            y = height - altitude;
            
            for (let s = 0; s < sines.length; s++) {
                y += Math.sin(time * speed + counters[s]) * amplitudes[s];
                counters[s] += intervals[s];
            }

            ctx.lineTo(x,y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        //ctx.stroke();
        ctx.fill();
    }

    // cloud : x, y, speedX, speedY
    drawClouds(ctx, width, height, time) {
        ctx.globalAlpha = 0.6;

        for (let cloud of this.clouds) {
            let x = cloud[0] * width;
            let y = cloud[1] * height + 100;
            let size = cloud[2] * 8 + 3;

            let xOff = x + Math.sin(time * cloud[3]) * width / 2;
            let yOff = y + Math.sin(time * cloud[4]) * height / 2;

            this.drawSmoke(ctx, xOff, yOff, size, size);
        }
    }

    drawSmoke(ctx, x, y, scaleX, scaleY) {
        let imageSize = 256;
        let half = imageSize / 2;
        ctx.drawImage(this.imageObj, x - half * scaleX, y - half * scaleY, scaleX * imageSize, scaleY * imageSize);
    }
});