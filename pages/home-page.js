import { Base, define } from "../components/base.js";

import "../components/mast.js";
import "../components/footer.js";

const template = /*html*/`
<style>
#pause {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1;
}

.games {
    color: white;
    padding: 100px 0px;
}

.filters {
    font-family: Fira;
    font-size: 20px;
    font-weight: 800;
    margin-left: 9em;
    margin-bottom: .5em;
}

.filters > .label:hover {
    cursor: pointer;
}

.ui.grid {
    margin: 0em 8em;
    box-sizing: border-box;
}

.ui.grid > div {
    padding: 2em 2em !important;
}

.project {
    display: block;
    width: 100%;
    height: 22em;
    transition: 0.3s;
    background-color: rgb(255, 255, 255, 0);
    padding: 8px;
    border-radius: 8px;
}

.project:hover {
    cursor: pointer;
    transform: rotate3d(-.2, 1, .01, 16deg);
    background-color: rgb(255, 255, 255, .05);
}

.project > h2 {
    margin: 0;
    color: white;
    font-family: Fira;
    font-size: 26px;
    font-weight: 0;
    text-align: left;
    text-shadow: rgb(255, 255, 255, .5) -2px 0px 4px;
}

.project > img {
    width: 100%;
    height: 18.8em;
    box-shadow: rgb(0, 0, 0, .4) 0px 20px 30px -10px;
    object-fit: cover;
    background-color: black;
}

.label {
    vertical-align: middle;
    text-indent: -9999px;
    line-height: 0;

    color: white;
    font-family: Fira;
    font-size: 12px;
    font-weight: 0;
}

.label::after {
    text-indent: 0;
    line-height: initial;
    border-radius: 10px;
    padding: 4px 12px;
}

.self.label:after {
    content: "Self-Made";
    background-color: cyan;
}

.xplab.label:after {
    content: "XPLab";
    background-color: purple;
}

.dileoz.label:after {
    content: "Dileoz";
    background-color: brown;
}

.ordina.label:after {
    content: "Ordina";
    background-color: orange;
}

.game.label:after {
    content: "Game-Dev";
    background-color: gray;
}

.web.label:after {  
    content: "Web-Dev";
    background-color: gray;
}

.software.label:after {
    content: "Software";
    background-color: gray;
}

.tech.label:after {
    content: "Tech";
    background-color: gray;
}

.art.label:after {
    content: "Art";
    background-color: gray;
}

.vr.label:after {
    content: "VR";
    background-color: gray;
}

.ar.label:after {
    content: "AR";
    background-color: gray;
}

.mobile.label:after {
    content: "Mobile App";
    background-color: gray;
}
</style>
<button bind="toggle_anim" class="ui basic mini black icon button" id="pause"><i class="pause black icon"></i></button>
<mast-X></mast-X>
<div class="games hex_pattern">
    <div class="filters">Companies: <span class="self label"></span> <span class="xplab label"></span> <span class="dileoz label"></span> <span class="ordina label"></span></div>
    <div class="filters">Filters: <span class="game label"></span> <span class="web label"></span> <span class="tech label"></span> <span class="art label"></span> <span class="software label"></span> <span class="vr label"></span> <span class="ar label"></span> <span class="mobile label"></span></div>
    <div class="ui three column grid">
        <div class="column">
            <a route="/dropsofneon" class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Drops of Neon <span class="self label"></span> <span class="game label"></span></h2>                
            </a>
        </div>
        <div class="column">
            <a route="/webgpu" class="project">
                <img src="images/webgpu.png" />
                <h2>WebGPU Demo <span class="self label"></span> <span class="tech label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a href="https://github.com/DatBlindArcher/DiscordUnity" class="project" target="_blank">
                <img src="images/c_sharp_hero.webp" />
                <h2>Discord Unity <span class="self label"></span> <span class="software label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/Kytharos.gif" />
                <h2>Kytharos <span class="self label"></span> <span class="game label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/Tron_LightCycle_Render.png" />
                <h2>Tron Bike <span class="self label"></span> <span class="art label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/BlueDemon.gif" style="object-fit: contain" />
                <h2>Blue Devil <span class="self label"></span> <span class="art label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a href="https://www.youtube.com/watch?v=Yl5jlBUigmU" target="_blank" class="project">
                <img src="images/ua.png" />
                <h2>UA Stroke Recovery <span class="xplab label"></span> <span class="vr label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/zmp.png" />
                <h2>Suicide Prevention <span class="xplab label"></span> <span class="vr label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a class="project">
                <img src="images/elz.png" />
                <h2>Eerste Lijn Zorg <span class="xplab label"></span> <span class="game label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a href="https://www.youtube.com/watch?v=BI_GpvyNDz4" target="_blank" class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Visit Leuven <span class="xplab label"></span> <span class="ar label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a href="https://www.youtube.com/watch?v=GwdyTGCNNCE" target="_blank" class="project">
                <img src="images/eclips.png" />
                <h2>ECLIPS <span class="xplab label"></span> <span class="vr label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>PVC Xylo <span class="xplab label"></span> <span class="mobile label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a class="project">
                <img src="images/movingMindsLevel5.png" />
                <h2>Movings Minds App <span class="xplab label"></span> <span class="game label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a href="https://www.ucll.be/sites/default/files/CampusMap/index.html" target="_blank" class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>360 Campus Map <span class="xplab label"></span> <span class="tech label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Leuven Stadhuis <span class="xplab label"></span> <span class="tech label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Energie Fiets <span class="xplab label"></span> <span class="tech label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Artemis Game <span class="xplab label"></span> <span class="game label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a href="https://uashome.eu" target="_blank" class="project">
                <img src="images/uashome.png" style="object-fit: contain; background-color: white" />
                <h2>UASHome <span class="xplab label"></span> <span class="web label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Roots <span class="xplab label"></span> <span class="tech label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Robots <span class="xplab label"></span> <span class="tech label"></span></h2>
            </a>
        </div>

        <div class="column">
            <a href="https://vacatures.oost-vlaanderen.be" class="project" target="_blank">
                <img src="images/vacatures.png" />
                <h2>Website Oost-Vlaanderen <span class="dileoz label"></span> <span class="web label"></span></h2>
            </a>
        </div>
        <div class="column">
            <a class="project">
                <img src="images/drops_of_neon2.png" />
                <h2>Meeting Online in VR <span class="ordina label"></span> <span class="vr label"></span></h2>
            </a>
        </div>
    </div>
</div>
<footer-X></footer-X>
`;

define('home-page', template, class extends Base {
    #paused;

    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
        add(await getStyle('/css/hex.css'));
    }

    created() {
        this.#paused = false;
    }

    toggle_anim() {
        this.#paused = !this.#paused;
        let icon = this.find("#pause").querySelector("i");
        let mast_anim = this.find("mast" + TAGS.X);
        let hex_anim = this.find(".hex_pattern");
        
        mast_anim.isRunning = !this.#paused;
        if (!this.#paused) hex_anim.classList.remove("reset");
        else hex_anim.classList.add("reset");

        if (this.#paused) {
            icon.classList.remove("pause");
            icon.classList.add("play");
        }

        else {
            icon.classList.remove("play");
            icon.classList.add("pause");
        }
    }
});