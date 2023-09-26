var Engine = Matter.Engine,
    Composite = Matter.Composite,
    Body = Matter.Body;

export default class PhysicsSystem extends ApeECS.System {
    init() {
        this.query = this.createQuery()
            .fromAll('Position', 'Rotation', 'Scale', 'Matter', 'Sprite')
            .persist(true);

        this.destroyQuery = this.createQuery()
            .fromAll('Matter', 'Destroy')
            .persist();

        this.singleton = this.world.getEntity('singleton_entity').c;

        this.entityTable = {};
    }

    update() {
        const delta = this.singleton.time.deltaTime;
        const engine = this.singleton.physics.engine;

        for (const entity of this.query.added) {
            const matter = entity.c.matter;

            if (!matter.object) {
                const pos = entity.getOne('Position');
                const rot = entity.getOne('Rotation').angle;
                const scale = entity.getOne('Scale');
                const sprite = entity.getOne('Sprite');

                matter.object = matter.objectCreate(pos);

                for (const part of matter.object.parts) {
                    sprite.setOptions(part.render);
                }

                Body.rotate(matter.object, rot * (Math.PI / 180));
                Body.scale(matter.object, scale.x, scale.y);
                Body.setStatic(matter.object, matter.static);
                matter.object.isSensor = matter.trigger;

                Composite.add(engine.world, matter.object);
                this.entityTable[matter.object.id] = entity;

                matter.update();
            }
        }

        this.query.added.clear();

        for (const collision of Matter.Detector.collisions(engine.detector)) {
            let entityA = this.entityTable[collision.bodyA.id];
            let entityB = this.entityTable[collision.bodyB.id];

            entityA.addComponent({ type: 'Hit', other: entityB });
            entityB.addComponent({ type: 'Hit', other: entityA });
        }

        for (const entity of this.destroyQuery.execute()) {
            const obj = entity.c.matter.object;
            Composite.remove(engine.world, obj);
            delete this.entityTable[obj.id];
            entity.destroy();
        }

        Engine.update(engine, delta);

        for (const entity of this.query.execute()) {
            const pos = entity.getOne('Position');
            const rot = entity.getOne('Rotation');
            const obj = entity.c.matter.object;

            pos.x = obj.position.x;
            pos.y = obj.position.y;

            rot.angle = obj.angle;

            pos.update();
            rot.update();
        }
    }
}