import { dotnet } from './core/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

var dbgcontainer = document.getElementById('debug');
var gridcontainer = document.getElementById('grid');

function renderDebug(dbg) {
    var entities = JSON.parse(dbg);
    var html = "";

    for (var entity of entities) {
        html += `<h2>${entity.Name}</h2>\n`;

        for (var component of entity.Components) {
            html += `<h3>${component.Type}</h3><p>${JSON.stringify(component.Properties)}</p>\n`;
        }
    }

    dbgcontainer.innerHTML = html;
}

var gameOverAlert = false;

function renderGrid(grid, width, height, gameOver) {
    var html = "";

    for (var y = 0; y < height; y++) {
        html += "<tr>";

        for (var x = 0; x < width; x++) {
            var id = grid[y * width + x]
            var color = id == 1 ? 'green' : id == 2 ? 'red' : '';
            html += `<td class="${color}"></td>`;
        }

        html += "</tr>";
    }
    
    gridcontainer.innerHTML = html;

    if (gameOver && !gameOverAlert) {
        alert('Game Over!');
        gameOverAlert = true;
    }
}

setModuleImports('main.js', {
    render: {
        debug: renderDebug,
        grid: renderGrid
    }
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
await dotnet.run();

exports.Bootstrap.Init();

document.body.onkeyup = function (e) {
    exports.Bootstrap.KeyUp(e.code);
};

document.body.onkeydown = function (e) {
    exports.Bootstrap.KeyDown(e.code);
};

function updateTick(time) {
    exports.Bootstrap.Update(time);
    window.requestAnimationFrame(updateTick);
}

window.requestAnimationFrame(updateTick);

var hidden = true;
var button = document.getElementById("showdebug");
button.onclick = () => {
    hidden = !hidden;
    button.innerHTML = hidden ? 'Show ECS' : 'Hide ECS';
    document.getElementById("ecs").className = hidden ? 'hidden' : '';
};