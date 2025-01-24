var Composite = Matter.Composite;

export default class LifeSystem extends ApeECS.System {
    init() {
        this.query = this.createQuery()
                        .fromAll('Position', 'Matter', 'Fruit')
                        .persist();

        this.singleton = this.world.getEntity('singleton_entity').c;
    }

    update() {
        const entities = this.query.execute();

        // Get all fruit bodies
        for (const entity of entities) {
            const pos = entity.getOne('Position');
            const m = entity.getOne('Matter');
            
            if (pos.y >= this.singleton.game.height + 50) {
                Composite.remove(this.singleton.physics.engine.world, m.object);
                this.world.removeEntity(entity.id);
                this.singleton.game.lifes--;

                let audio = this.singleton.audio.samples.get('hit');
                audio.currentTime = 0;
                audio.play();
            }
        }
    }
}