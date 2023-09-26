export default class UISystem extends ApeECS.System {
	init() {
        this.singleton = this.world.getEntity('singleton_entity').c;
		this.query = this.createQuery().fromAny('Enemy', 'Bullet').persist();
		
        this.singleton.ui.root.querySelector("#reset").addEventListener('click', this.resetGame.bind(this));
	}

	update() {
        // For some reason, the query Set is empty in resetGame without this call
        this.query.execute();

		let ui = this.singleton.ui.root;
		let globals = this.singleton.globals;
		let deltaTime = this.singleton.time.deltaTime;

        if (globals.health <= 0.0) {
            globals.health = 0;
            ui.querySelector("#reset").style.display = 'block';
        }

        ui.querySelector("#score").innerHTML = `Score: ${globals.score}`;
        ui.querySelector("#health").innerHTML = `Health: ${globals.health}`;
        ui.querySelector("#fps").innerHTML = `${Math.trunc(1000 / deltaTime)} FPS`;
	}

    resetGame() {
        for (const entity of this.query.execute()) {
            entity.addTag('Destroy');
        }

        this.singleton.globals.health = 100.0;
        this.singleton.globals.score = 0.0;
        this.singleton.ui.root.querySelector("#reset").style.display = 'none';
    }
}