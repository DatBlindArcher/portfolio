var Body = Matter.Body,
	Vector = Matter.Vector;

export default class BulletSystem extends ApeECS.System {
	init() {
		this.query = this.createQuery().fromAll('Position', 'Bullet', 'Matter').persist();
        this.singleton = this.world.getEntity('singleton_entity').c;
	}

	update() {
		let deltaTime = this.singleton.time.deltaTime;

        for (const entity of this.query.execute()) {
			const m = entity.getOne('Matter');
			let bullet = entity.c.bullet;

			if (m.object) {
				let speed = 1;
				let delta = Vector.rotate(Vector.create(1, 0), m.object.angle);

				delta = Vector.mult(delta, speed * deltaTime);
        		Body.translate(m.object, delta);
                bullet.lifetime -= deltaTime;

				if (bullet.lifetime <= 0 || entity.has('Hit')) {
                    entity.addTag('Destroy');
                }
			}
		}
	}
}