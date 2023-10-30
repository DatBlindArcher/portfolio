import { Base, define } from "./base.js";

const template = /*html*/`
<style>
    .main {
        width: 100%;
        height: 80px;
        background-color: #222222;
        padding-top: 40px;
        box-shadow: 5px 10px 18px white;
    }
</style>
<div class="main">
    <div class="ui center aligned text container">
        <a target="_blank" href="https://github.com/DatBlindArcher" class="ui github button"><i class="github icon"></i>Github</a>
        <a target="_blank" href="https://www.linkedin.com/in/robbe-decraemer/" class="ui linkedin button"><i class="linkedin icon"></i>LinkedIn</a>
        <a target="_blank" href="https://discord.com/users/153270093885865984" class="ui discord button"><i class="discord icon"></i>Discord</a>
        <a target="_blank" href="mailto:robbedecraemer@hotmail.com" class="ui mail button"><i class="mail icon"></i>Email</a>
    </div>
</div>
`;

define('footer', template, class extends Base {
    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
    }
});