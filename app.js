import { Base, define } from "./components/base.js";

import "./pages/pages.js";

const template = /*html*/`
<router-X>
    <route-X path="/" title="Home" component="home-page"></route-X>
    <route-X path="/contact" title="Contact" component="contact-page"></route-X>
    <route-X path="/dropsofneon" title="Drops Of Neon" component="dropsofneon-page"></route-X>
    <route-X path="/bullets" title="Bullet Hell" component="bullets-page"></route-X>
    <route-X path="/webgpu" title="webgpu" component="webgpu-page"></route-X>
    <route-X path="/webgpu-dist" title="webgpu distance" component="webgpu-dist-page"></route-X>

    <route-X path="/demo/data" title="Data Science Game" component="data-game-page"></route-X>
    <outlet-X></outlet-X>
</router-X>
`;

define('app', template, class extends Base {});