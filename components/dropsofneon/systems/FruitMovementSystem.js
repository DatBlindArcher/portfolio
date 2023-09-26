var Body = Matter.Body;

export default class FruitMovementSystem extends ApeECS.System {
  init() {
    this.query = this.createQuery()
                    .fromAll('Matter', 'Fruit')
                    .persist();
    
    this.singleton = this.world.getEntity('singleton_entity').c;
  }

  update() {
    const entities = this.query.execute();
    const gravity = this.singleton.physics.gravity;
    const delta = this.singleton.time.deltaTime;

    for (const entity of entities) {
        const m = entity.getOne('Matter');

        if (m.object) {
          Body.setVelocity(m.object, { x: m.object.velocity.x, y: m.object.velocity.y + gravity * delta });
        }
    }
  }
}