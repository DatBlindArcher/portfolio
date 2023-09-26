var Render = Matter.Render;

export default class RenderSystem extends ApeECS.System {
  init() {
    this.singleton = this.world.getEntity('singleton_entity').c;
  }

  update() {
    const render = this.singleton.draw.render;
    Render.world(render);
  }
}