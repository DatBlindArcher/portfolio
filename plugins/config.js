let config = {};

async function loadConfigJson() {
    let isDev = window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1';
    config = await (await fetch(isDev ? './config-dev.json' : './config.json')).json();
}