import { Base, define } from "./base.js";

const template = /*html*/`
<div><slot></slot></div>
`;

define('if', template, class extends Base {
    #value;

    created() {
        this.$container = this.find('div');
        this.value = this.getAttribute('value') ?? false;
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "value") {
            this.value = newValue;
        }
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value === 'true';

        if (this.shadowRoot != undefined) {
            this.$container.style.display = this.#value ? "block" : "none";
        }

        this.dispatchEvent(new CustomEvent('valueChanged'));
        if (this.valueChanged) this.valueChanged();
        else eval(this.getAttribute('valueChanged'));
    }
});

define('else', template, class extends Base {
    #value;

    created() {
        this.#value = false;
        this.$container = this.find('div');

        for (let i = 0; i < this.parentNode.childNodes.length; i++) {
            if (this.parentNode.childNodes[i] == this) {
                this.if_element = this.parentNode.childNodes[i - 1];
                this.if_element.addEventListener('valueChanged', this.ifElemChanged.bind(this));
                this.#value = !this.if_element.value;
                this.$container.style.display = this.#value ? "block" : "none";
                break;
            }
        }

        if (this.if_element == undefined) {
            console.warn("Else conditional must be placed after if conditional.");
        }
    }

    ifElemChanged() {
        this.#value = !this.if_element.value;

        if (this.shadowRoot != undefined) {
            this.$container.style.display = this.#value ? "block" : "none";
        }

        this.dispatchEvent(new CustomEvent('valueChanged'));
        if (this.valueChanged) this.valueChanged();
        else eval(this.getAttribute('valueChanged'));
    }

    get value() {
        return this.#value;
    }
});