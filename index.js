function loadPlugins(plugins, callback) {
    let loaded = plugins.length;

    plugins.forEach(plugin => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `./plugins/${plugin}.js`;
        script.onload = function() {
            if (--loaded == 0 && callback) {
                callback();
            }
        };

        document.head.appendChild(script);
    });
}

function loadApp() {
    var script = document.createElement('script');
    script.type = 'module';
    script.src = './app.js';
    script.onload = function() {
        document.body.appendChild(document.createElement('app-χ'));
    };
    
    document.head.appendChild(script);
}

function init() {
    const plugins = ['config', 'globals', 'ape-ecs', 'matter', 'decomp'];

    loadPlugins(plugins, async () => {
        await loadConfigJson();
        loadApp();
    });
}

init();