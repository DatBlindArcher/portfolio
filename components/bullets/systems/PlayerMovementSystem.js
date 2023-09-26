var Body = Matter.Body,
	Bodies = Matter.Bodies,
	Vector = Matter.Vector;

export default class PlayerMovementSystem extends ApeECS.System {
	init() {
		this.query = this.createQuery().fromAll('Position', 'Player', 'Matter');
        this.singleton = this.world.getEntity('singleton_entity').c;
	}

	update() {
		const entity = this.query.execute().values().next().value;
		let deltaTime = this.singleton.time.deltaTime;
        let globals = this.singleton.globals;
		let input = this.singleton.input;

		if (entity) {
			const playerObj = entity.c.matter.object;

			if (playerObj) {
				let speed = 0.5;
				let delta = Vector.create(0, 0);

				if (input.keys['KeyA']) delta.x = -1;
				if (input.keys['KeyD']) delta.x = 1;
				if (input.keys['KeyW']) delta.y = -1;
				if (input.keys['KeyS']) delta.y = 1;
				if (input.keys['ShiftLeft'] || input.keys['ShiftRight']) speed *= 2;

				delta = Vector.mult(Vector.normalise(delta), speed * deltaTime);
        		Body.translate(playerObj, delta);

				let radius = 20;
				if (playerObj.position.x < radius) playerObj.position.x = radius;
				if (playerObj.position.x > globals.width - radius) playerObj.position.x = globals.width - radius;
				if (playerObj.position.y < radius) playerObj.position.y = radius;
				if (playerObj.position.y > globals.height - radius) playerObj.position.y = globals.height - radius;

				if (input.buttons[0]) {
					let direction = Vector.normalise(Vector.create((input.x - playerObj.position.x), (input.y - playerObj.position.y)));
					let angle = Math.atan2(direction.y, direction.x);

					this.spawnBullet(playerObj.position.x + direction.x * 45, playerObj.position.y + direction.y * 45, angle);
				}
			}

			if (entity.has('Hit')) {
				for (let hit of entity.getComponents('Hit')) {
					if (hit.other.has('Enemy')) {
						globals.health -= 10.0;
					}

					entity.removeComponent(hit);
				}
			}
		}
	}

	spawnBullet(x, y, angle) {
		this.world.createEntity({
            id: 'bullet_entity',
            components: [{
                type: 'Sprite',
                setOptions: function(render) {
                    render.fillStyle = 'transparent';
                    render.strokeStyle = '#80FF00';
                    render.lineWidth = 1;
                }
            }, {
                type: 'Position',
                x: x,
                y: y
            }, {
                type: 'Rotation',
                angle: angle / (Math.PI / 180)
            }, {
                type: 'Scale',
                x: 1, y : 1
            }, { type: 'Bullet', key: 'bullet', lifetime: 1000.0 }, { 
                type: 'Matter',
				key: 'matter',
				trigger: true, 
                objectCreate: (pos) => Bodies.circle(pos.x, pos.y, 4, 4)
            }]
        });
	}
}