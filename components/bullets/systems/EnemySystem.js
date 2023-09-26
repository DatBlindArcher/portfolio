var Body = Matter.Body,
	Vector = Matter.Vector;

export default class EnemySystem extends ApeECS.System {
	init() {
		this.playerQuery = this.createQuery().fromAll('Position', 'Player', 'Matter').persist();
		this.query = this.createQuery().fromAll('Position', 'Enemy', 'Matter').persist();
        this.singleton = this.world.getEntity('singleton_entity').c;
	}

	update() {
		const player = this.playerQuery.execute().values().next().value;
		let globals = this.singleton.globals;
		let deltaTime = this.singleton.time.deltaTime;

        if (player) {
            const playerObj = player.getOne('Matter').object;

            for (const entity of this.query.execute()) {
                const obj = entity.getOne('Matter').object;
                let enemy = entity.c.enemy;

                if (obj) {
                    let speed = .25;
					let delta = Vector.normalise(Vector.create((playerObj.position.x - obj.position.x), (playerObj.position.y - obj.position.y)));
                    let angle = Math.atan2(delta.y, delta.x) + Math.PI;
                    Body.setAngle(obj, angle);

                    delta = Vector.mult(delta, speed * deltaTime);
                    Body.translate(obj, delta);
                    
                    if (entity.has('Hit')) {
                        let hits = entity.getComponents('Hit');

                        for (let hit of hits) {
                            if (hit.other.has('Player')) {
                                entity.addTag('Destroy');
                            }

                            if (hit.other.has('Bullet')) {
                                enemy.health -= 34;
                            }

                            entity.removeComponent(hit);
                        }
                    }
                    
                    if (enemy.health <= 0) {
                        globals.score += 1;
                        entity.addTag('Destroy');
                    }
                }
            }
        }
	}
}