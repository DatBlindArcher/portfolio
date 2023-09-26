var Body = Matter.Body,
	Bodies = Matter.Bodies,
	Vector = Matter.Vector;

export default class SpawnSystem extends ApeECS.System {
	init() {
		this.query = this.createQuery().fromAll('Spawner',).persist();
        this.singleton = this.world.getEntity('singleton_entity').c;
	}

	update() {
		const entity = this.query.execute().values().next().value;
		let deltaTime = this.singleton.time.deltaTime;
        let globals = this.singleton.globals;

		if (entity) {
			const spawner = entity.getOne('Spawner');
            spawner.timer -= deltaTime;

            if (spawner.timer < 0) {
                spawner.timer = 500.0;

                let x = 0, y = 0;
                let side = Math.floor(Math.random() * 3);

                switch (side) {
                    case 0: // left
                        x = -50;
                        y = Math.random() * globals.height;
                        break;
                    case 1: // right
                        x = globals.width + 50;
                        y = Math.random() * globals.height;
                        break;
                    case 2: // top
                        x = Math.random() * globals.width;
                        y = -50;
                        break;
                }

                this.spawnEnemy(x, y);
            }
		}
	}

	spawnEnemy(x, y) {
		this.world.createEntity({
            id: 'enemy_entity',
            components: [{
                type: 'Sprite',
                setOptions: function(render) {
                    render.fillStyle = 'transparent';
                    render.strokeStyle = '#FF0000';
                    render.lineWidth = 1;
                }
            }, {
                type: 'Position',
                x: x,
                y: y
            }, {
                type: 'Rotation',
                angle: 0.0
            }, {
                type: 'Scale',
                x: 1, y : 1
            }, { type: 'Enemy', key: 'enemy' }, { 
                type: 'Matter', 
                key: 'matter',
                objectCreate: (pos) => Bodies.polygon(pos.x, pos.y, 5, 12)
            }]
        });
	}
}