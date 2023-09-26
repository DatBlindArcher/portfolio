let config = {};

async function loadConfigJson() {
    config = await (await fetch('./config.json')).json();
}