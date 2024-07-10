import { Base, define } from "../components/base.js";

const template = /*html*/`
<style>
.bg {
    --c1: #9C2F28;
    --c2: #C1893E;

    background-color: var(--c2);
    background-image: 
        radial-gradient(circle at center center, var(--c1), var(--c2)), 
        repeating-radial-gradient(circle at center center, var(--c1), var(--c1), 40px, transparent 50px, transparent 10px);
    background-blend-mode: multiply;

    /* #aa1816; */
    min-height: 100%;
    text-align: center;
    position: relative;
}

.content {
    font-size: 2em !important;
}

.content > a.header {
    font-size: 2.5em !important;
    font-family: "Graduate", serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
    color: #C1893E !important;
}

.ui.fluid.card {
    padding: 10px;
    width: 80%;
    position: absolute;
    left: 50%; top: 45%;
    transform: translate(-50%, -50%);
}
</style>
<div class="bg">
    <div class="ui fluid card">
        <div class="image"><img src="../images/rotterdam_bridge.jpg"></div>
        <div class="content">
            <a class="header">TICKET ROTTERDAM</a>
            <div class="meta">
                <span class="date">13 - 15 September</span>
            </div>
            <div class="description">
                Wij willen jou mee op een weekendtrip Rotterdam!
                <br>
                Van Thibault, Rune, Michiel, Bert, Roeland, Evy, Fleur en Robbe.
            </div>
            </div>
            <div class="extra content">
            <div>De Harmonietjes</div>
        </div>
        <div class="ui bottom attached image">
        <img src="../images/koolkerke_harmonietjes.jpg">
        </div>
    </div>
</div>
`;

define('elina-ticket', template, class extends Base {
    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
    }
});