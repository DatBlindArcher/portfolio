import { Base, define } from "../components/base.js";

import "../components/mast.js";

const template = /*html*/`
<style>
    .games {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, 0);
        text-align: center;
        color: white;
    }
</style>
<mast-X></mast-X>
<div class="games">
    <h1 class="ui inverted dividing header">some games</h1>
    <a class="ui button" route="/dropsofneon">DROPS OF NEON</a>
    <a class="ui button" route="/bullets">BULLET HELL</a>
</div>
`;

define('home-page', template, class extends Base {
    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
    }
});