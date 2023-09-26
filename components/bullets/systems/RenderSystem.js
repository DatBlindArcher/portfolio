export default class RenderSystem extends ApeECS.System {
  init() {
    this.singleton = this.world.getEntity('singleton_entity').c;
  }

  update() {
    Matter.Render.world(this.singleton.render.render);
  }
}