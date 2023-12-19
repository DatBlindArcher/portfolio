import { Base, define } from "../../components/base.js";

import "../../components/bullets.js";

const template = /*html*/`
<style>
.outer {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-content: center;

    height: 100%;
    background-color: black;
}

.screen {
    position: relative;
    width: 800px;
    height: 600px;

    margin: auto;
    background-color: gray;
    border-radius: 8px;
}

.node {
    position: absolute;
    width: 64px;
    height: 64px;

    background-color: #0A1B35;
    border-radius: 8px;

    color: white;
    display: flex;
    justify-content: center;
    align-content: center;
}

.node > p {
    margin: auto;
}

.line {
    position: absolute;
    width: 800px;
    height: 600px;
}
</style>
<div class="outer">
    <div class="screen" width="800" height="600">
        <svg class="line"><line x1="110" y1="80" x2="305" y2="80" stroke="white" stroke-width="5" /></svg>
        <svg class="line"><line x1="360" y1="80" x2="655" y2="80" stroke="white" stroke-width="5" /></svg>
        <div class="node" style="left: 50px; top: 50px"><p>Input</p></div>
        <div class="node" style="left: 300px; top: 50px"><p>Filter</p></div>
        <div class="node" style="left: 650px; top: 50px"><p>Graph</p></div>
    </div>
</div>
`;

define('data-game-page', template, class extends Base {
    created() {

    }
});