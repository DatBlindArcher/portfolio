import * as Components from './components.js';
import Systems from './systems.js';

var Engine = Matter.Engine,
    Render = Matter.Render,
    Bodies = Matter.Bodies;

export default class Scene {
    constructor(game) {
        let ui = game.find('#ui');
        let canvas = game.find('canvas');
        this.ecs = new ApeECS.World();
        
        // Include this once polycomp becomes a problem
        //Common.setDecomp(decomp);

        this.engine = Engine.create({ 
            gravity: { x: 0, y: 0 } 
        });

        this.render = Render.create({ 
            canvas: canvas, 
            engine: this.engine, 
            options: { 
                wireframes: false,
                background: '#020008'
            }
        });

        // Register Components

        this.ecs.registerComponent(Components.Globals, 1);
        this.ecs.registerComponent(Components.Time, 1);
        this.ecs.registerComponent(Components.Input, 1);
        this.ecs.registerComponent(Components.Physics, 1);
        this.ecs.registerComponent(Components.Render, 1);
        this.ecs.registerComponent(Components.UI, 1);
        this.ecs.registerComponent(Components.Audio, 1);

        this.ecs.registerComponent(Components.Player, 1);
        this.ecs.registerComponent(Components.Cursor, 1);
        this.ecs.registerComponent(Components.Spawner, 1);
        this.ecs.registerComponent(Components.Bullet, 32);
        this.ecs.registerComponent(Components.Enemy, 32);
        this.ecs.registerComponent(Components.Hit, 32);
        
        this.ecs.registerComponent(Components.Position, 32);
        this.ecs.registerComponent(Components.Rotation, 32);
        this.ecs.registerComponent(Components.Scale, 32);
        this.ecs.registerComponent(Components.Sprite, 32);
        this.ecs.registerComponent(Components.Matter, 32);

        this.ecs.registerTags('Destroy');

        // Create Singleton

        const singleton_entity = this.ecs.createEntity({
            id: 'singleton_entity',
            components: [{
                type: 'Globals',
                key: 'globals',
                width: canvas.width,
                height: canvas.height
            }, {
                type: 'Time',
                key: 'time'
            }, {
                type: 'Input',
                key: 'input'
            }, {
                type: 'Physics',
                key: 'physics',
                engine: this.engine,
                gravity: 0.02
            }, {
                type: 'Render',
                key: 'render',
                canvas: canvas,
                ctx: canvas.getContext("2d"),
                render: this.render
            }, {
                type: 'UI',
                key: 'ui',
                root: ui
            }]
        });

        this.singleton = singleton_entity.c;

        // System Register

        this.ecs.registerSystem('logic', Systems.Spawn);
        this.ecs.registerSystem('logic', Systems.PlayerMovement);
        this.ecs.registerSystem('logic', Systems.Cursor);
        this.ecs.registerSystem('logic', Systems.Bullet);
        this.ecs.registerSystem('logic', Systems.Enemy);
        this.ecs.registerSystem('physics', Systems.Physics);
        this.ecs.registerSystem('render', Systems.Render);
        this.ecs.registerSystem('render', Systems.UI);

        // Create Entities

        this.ecs.createEntity({
            id: 'player_entity',
            components: [{
                type: 'Sprite',
                setOptions: function(render) {
                    render.fillStyle = 'transparent';
                    render.strokeStyle = '#80FF00';
                    render.lineWidth = 1;
                }
            }, {
                type: 'Position',
                x: game.canvas.width / 2, 
                y: game.canvas.height - 65
            }, {
                type: 'Rotation',
                angle: 0
            }, {
                type: 'Scale',
                x: 1, y : 1
            }, { type: 'Player' }, { 
                type: 'Matter', 
                key: 'matter',
                static: true,
                objectCreate: (pos) => Bodies.circle(pos.x, pos.y, 16, 16)
            }]
        });

        this.ecs.createEntity({
            id: 'cursor_entity',
            components: [{
                type: 'Sprite',
                setOptions: function(render) {
                    render.fillStyle = 'transparent';
                    render.strokeStyle = '#80FF00';
                    render.lineWidth = 1;
                }
            }, {
                type: 'Position',
                x: game.canvas.width / 2, 
                y: game.canvas.height - 65
            }, {
                type: 'Rotation',
                angle: 0
            }, {
                type: 'Scale',
                x: 1, y : 1
            }, { type: 'Cursor' }, { 
                type: 'Matter', 
                key: 'matter',
                static: true,
                trigger: true,
                objectCreate: (pos) => Bodies.polygon(pos.x, pos.y, 3, 8, { angle: 0.5 * Math.PI })
            }]
        });

        this.ecs.createEntity({
            id: 'spawner_entity',
            components: [{ type: 'Spawner' }]
        });
    }

    update(time, deltaTime, input) {
        if (this.singleton.globals.health <= 0)
            return;

        this.singleton.time.deltaTime = deltaTime;
        this.singleton.input.x = input.mouse.x;
        this.singleton.input.y = input.mouse.y;
        this.singleton.input.buttons = input.mouse.buttons;
        this.singleton.input.keys = input.keys;

        let width = this.singleton.globals.width;
        let height = this.singleton.globals.height;
        let ctx = this.singleton.render.ctx;

        // Color effects
        ctx.shadowBlur = 8;
        ctx.shadowColor = "white";
        ctx.strokeStyle = '#80FF00D0';
        ctx.lineWidth = 1;  
        
        // Clear
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.fill();
        
        // Update
        this.ecs.tick();
        this.ecs.runSystems('logic');
        this.ecs.runSystems('physics');
        this.ecs.runSystems('render');

        // Draw waves
        this.drawSine(width, height, 12, 1.5, 10, time, -0.03, '#80FF00D0');
        this.drawSine(width, height, 12, 1, 5, time, -0.03, '#80FF00D0');
        this.drawSine(width, height, 12, 1.25, 7.5, time, -0.03, '#80FF00D0');

        this.drawSine(width, height, 160, 0.1, 16, time, -0.005, '#80809E60');
        this.drawSine(width, height, 320, 0.05, 16, time, -0.002, '#4284FF40');
        this.drawSine(width, height, 480, 0.02, 16, time, -0.002, '#C249FF20');
    }

    drawSine(width, height, alt, interval, amplitude, time, speed, color) {
        let ctx = this.singleton.render.ctx;
        ctx.strokeStyle = color;
        var counter = 0, x = 0, y = height - alt - Math.sin(time * speed + counter) * amplitude;
        var increase = interval * (90 / 180 * Math.PI / 9);
        ctx.beginPath();

        for (let i = 0; i <= width; i += 2) {
            ctx.moveTo(x,y);
            x = i;
            y = height - alt - Math.sin(time * speed + counter) * amplitude;
            counter += increase;
            ctx.lineTo(x,y);
        }

        ctx.stroke();
    }
}