var Composite = Matter.Composite;

export default class FruitScoreSystem extends ApeECS.System {
    init() {
        this.query = this.createQuery()
                        .fromAll('Position', 'Matter', 'Fruit')
                        .persist();

        this.spacer = Math.pow(2 * 16 + 4, 2);
        this.singleton = this.world.getEntity('singleton_entity').c;
    }

    update() {
        const entities = this.query.execute();
        let bodies = [];

        // Get all fruit bodies
        for (const entity of entities) {
            const pos = entity.getOne('Position');
            const m = entity.getOne('Matter');
            const t = entity.getOne('Fruit').fruit_type;
            bodies.push({body: m.object, pos: pos, entity: entity, type: t});
        }

        let pairs = new Map();

        // Check all distances
        for (let i = 0; i < bodies.length; i++) {
            let current = bodies[i].pos;
            let tc = bodies[i].type;

            for (let j = i + 1; j < bodies.length; j++) {
                let other = bodies[j].pos;
                let to = bodies[j].type;

                if (tc === to && Math.pow(other.x - current.x, 2) + Math.pow(other.y - current.y, 2) < this.spacer) {
                    if (!pairs.has(tc)) pairs.set(tc, []);
                    pairs.get(tc).push({ bodyA: bodies[i], bodyB: bodies[j] });
                }
            }
        }

        // Make set chains on A | B | AB | none
        let largeChains = [];

        for (let type of pairs.keys()) {
            let chains = new Array();

            for (let pair of pairs.get(type)) {
                let chainAIdx = -1;
                let chainBIdx = -1;
                let chainIdx = 0;

                for (let chain of chains) {
                    if (chainAIdx == -1 && chain.has(pair.bodyA)) chainAIdx = chainIdx;
                    if (chainBIdx == -1 && chain.has(pair.bodyB)) chainBIdx = chainIdx;
                    if (chainAIdx != -1 && chainBIdx != -1) break;
                    chainIdx++;
                }

                if (chainAIdx != -1 && chainBIdx != -1) {
                    // merge chains
                    let merge = new Set([...chains[chainAIdx], ...chains[chainBIdx]]);
                    chains.splice(Math.min(chainAIdx, chainBIdx), 1);
                    chains.splice(Math.max(chainAIdx - 1, chainBIdx - 1), 1);
                    chains.push(merge);
                }

                else if (chainAIdx != -1) {
                    // add to chain A
                    chains[chainAIdx].add(pair.bodyB);
                }

                else if (chainBIdx != -1) {
                    // add to chain B
                    chains[chainBIdx].add(pair.bodyA);
                }

                else {
                    // create new chain
                    chains.push(new Set([pair.bodyA, pair.bodyB]));
                }
            }

            // Map them back to entities
            for (let chain of chains) {
                if (chain.size >= 4) {
                    largeChains.push(chain);
                }
            }
        }

        // Remove large chains
        for (let chain of largeChains) {
            let audio = this.singleton.audio.samples.get('points');
            audio.currentTime = 0;
            audio.play();

            for (let body of chain) {
                Composite.remove(this.singleton.physics.engine.world, body.body);
                this.world.removeEntity(body.entity.id);
            }

            this.singleton.game.score += chain.size;
        }
    }
}