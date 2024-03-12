import { dotnet } from './core/dotnet.js'

let status = document.getElementById("status");
status.innerHTML = "Loading ...";

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

status.innerHTML = "Initializing ...";

setModuleImports('main.js', {
    debug: {
        render: renderDebug,
    },
    render: {
        camera: setCameraObject,
        setup: createRenderObject,
        update: updateRenderObject,
        model: onModelLoaded
    }
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
await dotnet.run();

exports.Game.Bootstrap.Init(window.location.href);
await setup_render(exports.GltfLoader.LoadModel);
selectEntity = exports.Game.Bootstrap.SelectEntity;

document.body.onkeyup = function (e) {
    exports.Game.Bootstrap.KeyUp(e.code);
};

document.body.onkeydown = function (e) {
    exports.Game.Bootstrap.KeyDown(e.code);
};

document.getElementById('surface').onmousemove = function (e) {
    exports.Game.Bootstrap.MouseMove(e.offsetX, e.offsetY);
};

function updateTick(time) {
    if (exports.Game.Bootstrap.Update(time)) {
        render();
        window.requestAnimationFrame(updateTick);
    }
}

window.requestAnimationFrame(updateTick);

var hidden = true;
var button = document.getElementById("showdebug");

button.onclick = () => {
    hidden = !hidden;
    button.innerHTML = hidden ? 'Show ECS' : 'Hide ECS';
    document.getElementById("ecs").className = hidden ? 'hidden' : '';
};

status.innerHTML = "Initialized";
status.classList.add('hidden');