var Engine = Matter.Engine,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Body = Matter.Body;

export default class PhysicsSystem extends ApeECS.System {
    init() {
        this.query = this.createQuery()
                        .fromAll('Position', 'Rotation', 'Scale', 'Matter', 'Sprite')
                        .persist(true, true);

        let self = this;
        this.singleton = this.world.getEntity('singleton_entity').c;

        Events.on(this.singleton.physics.engine, 'collisionStart', function(event) {
            for (var p of event.pairs) {
                let forceSqr = Math.pow(p.bodyB.velocity.x - p.bodyA.velocity.x, 2) + Math.pow(p.bodyB.velocity.y - p.bodyA.velocity.y, 2);

                if (forceSqr > 40) {
                    let audio = self.singleton.audio.samples.get('bounce');
                    audio.currentTime = 0;
                    audio.play();
                }
            }
        });
    }

    update() {
        const delta = this.singleton.time.deltaTime;
        const engine = this.singleton.physics.engine;

        for (const entity of this.query.added) {
            const pos = entity.getOne('Position');
            const rot = entity.getOne('Rotation').angle;
            const scale = entity.getOne('Scale');
            const matter = entity.getOne('Matter');
            const sprite = entity.getOne('Sprite');

            matter.object = matter.objectCreate(pos);

            for (const part of matter.object.parts) {
                sprite.setOptions(part.render);
            }

            Body.rotate(matter.object, rot * (Math.PI / 180));
            Body.scale(matter.object, scale.x, scale.y);
            Body.setStatic(matter.object, matter.static);

            Composite.add(engine.world, matter.object);
            matter.update();
        }

        this.query.added.clear();
        this.query.removed.clear();

        Engine.update(engine, delta);

        const entities = this.query.execute();

        for (const entity of entities) {
            const pos = entity.getOne('Position');
            const rot = entity.getOne('Rotation');
            const matter = entity.getOne('Matter');

            pos.x = matter.object.position.x;
            pos.y = matter.object.position.y;

            rot.angle = matter.object.angle;

            pos.update();
            rot.update();
        }
    }
}