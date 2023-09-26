import { Router } from "./router.js";

export class Base extends HTMLElement {
    async connectedCallback() {
        await this.init();

        this.$shadowRoot = this.attachShadow({ 'mode': 'open' });
        await this.styles((style) => this.$shadowRoot.appendChild(style));
        this.$shadowRoot.appendChild(this.temp.content.cloneNode(true));
        this._setupBindings();

        await this.created();
        Router.bindRoutes(this.$shadowRoot);
    }

    _setupBindings() {
        let self = this;

        this.bindings = new Proxy(this, {
            set: function (_, key, value) {
                self._updatingBindings(key, value);
                return true;
            }
        });

        this.$shadowRoot.querySelectorAll(`input[bind]`).forEach(input => {
            let binding = input.getAttribute('bind');

            input.addEventListener('input', function() {
                self._updatingBindings(binding, this.value);
            });
        });

        this.$shadowRoot.querySelectorAll(`textarea[bind]`).forEach(input => {
            let binding = input.getAttribute('bind');

            input.addEventListener('input', function() {
                self._updatingBindings(binding, this.value);
            });
        });

        this.$shadowRoot.querySelectorAll(`button[bind]`).forEach(button => {
            let binding = button.getAttribute('bind');

            button.addEventListener('click', function() {
                self[binding]();
            });
        });

        this.$shadowRoot.querySelectorAll(`*[bind]`).forEach(button => {
            let binding = button.getAttribute('bind');

            // bind="cmd:func"
            if (binding.includes(':')) {
                let spl = binding.split(':');
                let cmd = spl[0]; let func = spl[1];

                button.addEventListener(cmd, self[func].bind(self));
            }
        });
    }

    _updatingBindings(binding, value) {
        let old = this[binding]; 
        this[binding] = value;

        this.$shadowRoot.querySelectorAll(`*[bind=${binding}]`).forEach(e => {
            if (e.nodeName == "INPUT" && e.getAttribute("type") != "file") e.value = value;
            if (e.nodeName == "TEXTAREA") e.value = value;
            if (e.nodeName == "IF" + TAGS.X) e.setAttribute('value', value);
            if (e.nodeName == "BUTTON") { /* ignore */ }
            else e.innerHTML = value;
        });

        this.bindingChanged(binding, old, value);
    }

    async disconnectedCallback() {
        await this.destroyed();
    }

    async init() { }
    async styles() { }
    async created() { }
    async destroyed() { }
    async bindingChanged(name, oldValue, newValue) { }

    find(selector) {
        return this.$shadowRoot.querySelector(selector);
    }

    findAll(selector) {
        return this.$shadowRoot.querySelectorAll(selector);
    }

    findjQ(selector) {
        return $(this.$shadowRoot).find(selector); 
    }

    go(path) {
        Router.go(path);
    }

    back() {
        Router.back();
    }

    refresh() {
        Router.refresh();
    }
};

export function define(name, template, body) {
    for (const tag in TAGS) {
        let re = new RegExp(`[A-z]*(-${tag})`, 'g');
        let matches = template.matchAll(re);

        for (const match of matches) { 
            let tag = match[1];
            let component = match[0];
    
            if (TAGS[tag.substring(1)] != undefined) {
                let replacement = component.replace(tag, TAGS[tag.substring(1)]);
                template = template.replaceAll(component, replacement);
            }
        }
    }
    
    let temp = document.createElement('template');
    temp.innerHTML = template;
    body.prototype.temp = temp;
    window.customElements.define(name + TAGS.X, body);
}