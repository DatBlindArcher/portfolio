var dbgcontainer;
var selectEntity;

function renderDebug(fps, deltaTime, entities, systems, times, entity) {
    var html = "";
    html += `<h2>Stats</h2>`;
    html += `<p>${fps.toFixed(2)} FPS : ${deltaTime.toFixed(0)} MS</p>`;
    
    html += `<h2>Systems</h2>`;
    for (var i = 0; i < systems.length; i++) {
        html += `<p>${systems[i]} : ${times[i].toFixed(0)} MS</p>`;
    }

    if (entity) {
        html += `<h2>Selected Entity</h2>`;
        html += `<span style="white-space: pre-wrap">${entity}</span>`;
    }

    html += `<h2>Entities</h2>`;
    for (var i = 0; i < entities.length; i++) {
        if (entities[i]) {
            html += `<p>${entities[i]}</p>`;
        }
    }

    if (!dbgcontainer) dbgcontainer = document.getElementById('debug');
    dbgcontainer.innerHTML = html;
}