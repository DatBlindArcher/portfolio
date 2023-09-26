var Body = Matter.Body,
	Vector = Matter.Vector;

// Could also just make Cursor a child of Player and avoid a System
export default class CursorSystem extends ApeECS.System {
	init() {
        this.setOnce = false;
		this.playerQuery = this.createQuery().fromAll('Position', 'Player', 'Matter').persist();
		this.query = this.createQuery().fromAll('Position', 'Cursor', 'Matter').persist();
        this.singleton = this.world.getEntity('singleton_entity').c;
	}

	update() {
        const entity = this.query.execute().values().next().value;
		const playerEntity = this.playerQuery.execute().values().next().value;
        let globals = this.singleton.globals;
		let input = this.singleton.input;

		if (playerEntity && entity) {
            const m = entity.getOne('Matter');
			const playerM = playerEntity.getOne('Matter');

			if (playerM.object && m.object) {
                if (!this.setOnce) {
                    Body.setCentre(m.object, { x: 0, y: 24 }, true);
                    this.setOnce = true;
                }

                Body.setPosition(m.object, playerM.object.position);

                let direction = Vector.normalise(Vector.create((input.x - playerM.object.position.x) / globals.width, (input.y - playerM.object.position.y) / globals.height));
                let angle = Math.atan2(direction.y, direction.x) + Math.PI;
                Body.setAngle(m.object, angle);
                Body.setAngle(playerM.object, angle);
			}
		}
	}
}