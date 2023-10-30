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
</style>
<button bind="toggle_anim" class="ui basic mini black icon button" id="pause"><i class="pause black icon"></i></button>
<mast-X></mast-X>
<div class="games hex_pattern">
    <div class="ui center aligned text container">
        <h1 class="ui inverted dividing header">content</h1>
        <a class="ui button" route="/dropsofneon">DROPS OF NEON</a>
        <a class="ui button" route="/bullets">BULLET HELL</a>
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