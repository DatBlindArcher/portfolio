import { Base, define } from "../components/base.js";

import "../components/bullets.js";

const template = /*html*/`
<style>
div {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-content: center;

    height: 100%;
    background-color: black;
}
</style>
<div>
    <bullets-X></bullets-X>
</div>
`;

define('bullets-page', template, class extends Base {
    
});