var Bodies = Matter.Bodies;

export default class FruitSpawnerSystem extends ApeECS.System {
    init() {
        this.fruits = ['Apple', 'Orange', 'Banana'];
        this.colorTable = new Map([
            ['Apple', 'red'], ['Orange', 'orange'], ['Banana', 'yellow']
        ]);
        this.singleton = this.world.getEntity('singleton_entity').c;
    }

    update() {
        const deltaTime = this.singleton.time.deltaTime;
        const spawner = this.singleton.spawner; 

        if (!spawner.enabled) 
            return;
        
        spawner.timer -= deltaTime;

        if (spawner.timer <= 0) {
            spawner.timer = spawner.time;
            this.spawnfruit();
        }
    }

    spawnfruit() {
        let audio = this.singleton.audio.samples.get('spawn');
        audio.currentTime = 0;
        audio.play();

        let fruit = this.fruits[Math.floor(Math.random() * this.fruits.length)];
        let self = this;

        let border = 150;
        let randomX = border + Math.random() * (this.singleton.game.width - border * 2);

        this.world.createEntity({
            components: [{
                type: 'Sprite',
                setOptions: function(render) {
                    render.fillStyle = 'transparent';
                    render.strokeStyle = self.colorTable.get(fruit);
                    render.lineWidth = 1;
                }
            }, {
                type: 'Position',
                x: randomX, 
                y: this.singleton.game.height * (1/8)
            }, {
                type: 'Rotation',
                angle: Math.random() * 360
            }, {
                type: 'Scale',
                x: 1, y: 1
            }, { 
                type: 'Fruit',
                fruit_type: fruit.toUpperCase()
            }, { 
                type: 'Matter',
                objectCreate: function(pos) { 
                    return Bodies.circle(pos.x, pos.y, 16, 16); 
                } 
            }]
        });
    }
}