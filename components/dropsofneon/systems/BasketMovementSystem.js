var Body = Matter.Body;

export default class BasketMovementSystem extends ApeECS.System {
  init() {
    this.query = this.createQuery()
                    .fromAll('Position', 'Basket', 'Matter')
                    .persist();
    
    this.singleton = this.world.getEntity('singleton_entity').c;
  }

  update() {
    const difficulty = this.singleton.game.difficulty;
    const entity = this.query.execute().values().next().value;

    if (entity) {
      const m = entity.getOne('Matter');

      if (m.object) {
        const pos = entity.getOne('Position');
        const delta = this.singleton.time.deltaTime;
        const targetX = this.singleton.input.x;
        let amp = difficulty == 0 ? 0.6 : difficulty == 1 ? 1 : 1.5;

        let trans = (targetX - pos.x) * (delta / 50) * amp;
        if (trans > 8 * amp) trans = 8 * amp;
        if (trans < -8 * amp) trans = -8 * amp;

        Body.setVelocity(m.object, { x: trans, y: 0 });
        Body.translate(m.object, { x: trans, y: 0 });
        
        let targetAngle = (trans / 50) * Math.PI;
        let transAngle = (targetAngle - m.object.angle) * (delta / 100);
        
        Body.rotate(m.object, -m.object.angle);
        Body.rotate(m.object, transAngle);
      }
    }
  }
}