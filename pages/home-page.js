import { Base, define } from "../components/base.js";

import "../components/mast.js";
import "../components/footer.js";

const template = /*html*/`
<style>
    .games {
        color: white;
        padding: 100px 0px;
    }
</style>
<mast-X></mast-X>
<div class="games hex_pattern">
    <div class="ui center aligned text container">
        <h1 class="ui inverted dividing header">content</h1>
        <a class="ui button" route="/dropsofneon">DROPS OF NEON</a>
        <a class="ui button" route="/bullets">BULLET HELL</a>
        <button class="ui button" bind="pause_anim">PAUSE ANIMATIONS</button>
    </div>
</div>
<footer-X></footer-X>
`;

define('home-page', template, class extends Base {
    async styles(add) {
        add(await getStyle('/semantic/semantic.min.css'));
        add(await getStyle('/css/hex.css'));
    }

    pause_anim() {
        let mast_anim = this.find("mast" + TAGS.X);
        let hex_anim = this.find(".hex_pattern");
        
        mast_anim.isRunning = !mast_anim.isRunning;
        if (hex_anim.classList.contains("reset")) hex_anim.classList.remove("reset");
        else hex_anim.classList.add("reset");
    }
});