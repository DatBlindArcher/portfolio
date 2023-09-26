export class Globals extends ApeECS.Component {
    static properties = {
        width: 0,
        height: 0,
        score: 0,
        health: 100
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
        y: 0,
        keys: {},
        buttons: {}
    }
}

export class Physics extends ApeECS.Component {
    static properties = {
        engine: undefined
    }
}

export class Render extends ApeECS.Component {
    static properties = {
        canvas: undefined,
        ctx: undefined,
        render: undefined
    }
}

export class UI extends ApeECS.Component {
    static properties = {
        root: undefined
    }
}

export class Audio extends ApeECS.Component {
    static properties = {
        samples: undefined
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
        static: false,
        trigger: false
    }
}

export class Sprite extends ApeECS.Component {
    static properties = {
        sprite: null,
        setOptions: undefined
    }
}

export class Player extends ApeECS.Component {}

export class Cursor extends ApeECS.Component {}

export class Bullet extends ApeECS.Component {
    static properties = {
        lifetime: 500.0
    }
}

export class Spawner extends ApeECS.Component {
    static properties = {
        timer: 1000.0
    }
}

export class Enemy extends ApeECS.Component {
    static properties = {
        health: 100.0
    }
}

export class Hit extends ApeECS.Component {
    static properties = {
        other: undefined
    }
}