import { dotnet } from './core/dotnet.js'

let status = document.getElementById("status");
status.innerHTML = "Loading Runtime ...";

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

status.innerHTML = "Loading Engine ...";

setModuleImports('main.js', {
    debug: {
        render: renderDebug,
    },
    render: {
        camera: setCameraObject,
        setup: createRenderObject,
        update: updateRenderObject,
        model: onModelLoaded
    },
    audio: {
        play: playAudio,
        time: getTime
    }
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
await dotnet.run();

status.innerHTML = "Waiting for user input ...";

var playButton = document.getElementById('play');

playButton.onclick = async function () {
    status.innerHTML = "Initializing ...";

    var width = window.innerWidth;
    var height = window.innerHeight;

    var surface = document.getElementById('surface');
    surface.width = width;
    surface.height = height;

    playButton.classList.add('hidden');
    document.getElementById('container').classList.remove('hidden');
    exports.Game.Bootstrap.Init(window.location.href, width, height);
    await setup_render(exports.GltfLoader.LoadModel);
    selectEntity = exports.Game.Bootstrap.SelectEntity;

    window.onresize = function () {
        var width = window.innerWidth;
        var height = window.innerHeight;

        var surface = document.getElementById('surface');
        surface.width = width;
        surface.height = height;

        exports.Game.Bootstrap.Resize(width, height);
        renderResize(width, height);
    }

    document.body.onkeyup = function (e) {
        exports.Game.Bootstrap.KeyUp(e.code);
    };

    document.body.onkeydown = function (e) {
        exports.Game.Bootstrap.KeyDown(e.code);
    };

    surface.onmousemove = function (e) {
        exports.Game.Bootstrap.MouseMove(e.offsetX, e.offsetY);
    };

    surface.onmousedown = function (e) {
        exports.Game.Bootstrap.MouseDown(e.button);
    };

    surface.onmouseup = function (e) {
        exports.Game.Bootstrap.MouseUp(e.button);
    };

    function updateTick(time) {
        if (exports.Game.Bootstrap.Update(time)) {
            render();
            window.requestAnimationFrame(updateTick);
        }
    }

    window.requestAnimationFrame(updateTick);

    document.getElementById("fullscreen").onclick = toggleFullscreen;

    var hidden = true;
    var button = document.getElementById("showdebug");

    button.onclick = () => {
        hidden = !hidden;
        button.innerHTML = hidden ? 'Show ECS' : 'Hide ECS';
        document.getElementById("ecs").className = hidden ? 'hidden' : '';
    };

    status.innerHTML = "Initialized";
    status.classList.add('hidden');
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        closeFullscreen();
    }

    else {
        openFullscreen();
    }
}

/* View in fullscreen */
function openFullscreen() {
    var elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}