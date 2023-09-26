export class Game extends ApeECS.Component {
    static properties = {
        width: 0,
        height: 0,
        score: 0,
        lifes: 4
    }
}

export class Time extends ApeECS.Component {
    static properties = {
        deltaTime: 0
    }
}

export class Input extends ApeECS.Component {
    static properties = {
        x: 0,
        y: 0
    }
}

export class Physics extends ApeECS.Component {
    static properties = {
        engine: undefined,
        gravity: -0.5,
        difficulty: 1
    }
}

export class Draw extends ApeECS.Component {
    static properties = {
        canvas: undefined,
        ctx: undefined,
        render: undefined
    }
}

export class Audio extends ApeECS.Component {
    static properties = {
        samples: undefined
    }
}

export class Spawner extends ApeECS.Component {
    static properties = {
        timer: 2000,
        time: 1000,
        enabled: true
    }
}

export class Position extends ApeECS.Component {
    static properties = {
        x: 0,
        y: 0
    }
}

export class Rotation extends ApeECS.Component {
    static properties = {
        angle: 0
    }
}

export class Scale extends ApeECS.Component {
    static properties = {
        x: 1,
        y: 1
    }
}

export class Matter extends ApeECS.Component {
    static properties = {
        object: undefined,
        objectCreate: undefined,
        static: false
    }
}

export class Sprite extends ApeECS.Component {
    static properties = {
        sprite: null,
        setOptions: undefined
    }
}

export class Fruit extends ApeECS.Component {
    static properties = {
        fruit_type: 'APPLE'
    }
}

export class Basket extends ApeECS.Component {}