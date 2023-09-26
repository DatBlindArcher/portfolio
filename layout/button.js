import { Base, define } from "../components/base.js";

const template = /*html*/`
<style>
/*******************************
            Button
*******************************/

button {
    cursor: pointer;
    display: inline-block;
    min-height: 1em;
    outline: none;
    border: none;
    vertical-align: baseline;
    background: #E0E1E2 none;
    color: rgba(0, 0, 0, 0.6);
    font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    margin: 0em 0.25em 0em 0em;
    padding: 0.78571429em 1.5em 0.78571429em;
    text-transform: none;
    text-shadow: none;
    font-weight: bold;
    line-height: 1em;
    font-style: normal;
    text-align: center;
    text-decoration: none;
    border-radius: 0.28571429rem;
    box-shadow: 0px 0px 0px 1px transparent inset, 0px 0em 0px 0px rgba(34, 36, 38, 0.15) inset;
    -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    transition: opacity 0.1s ease, background-color 0.1s ease, color 0.1s ease, box-shadow 0.1s ease, background 0.1s ease;
    will-change: '';
    -webkit-tap-highlight-color: transparent;
}


/*******************************
            States
*******************************/


/*--------------
    Hover
---------------*/

button:hover {
    background-color: #CACBCD;
    background-image: none;
    box-shadow: 0px 0px 0px 1px transparent inset, 0px 0em 0px 0px rgba(34, 36, 38, 0.15) inset;
    color: rgba(0, 0, 0, 0.8);
}
button:hover .icon {
    opacity: 0.85;
}

/*--------------
    Focus
---------------*/

button:focus {
    background-color: #CACBCD;
    color: rgba(0, 0, 0, 0.8);
    background-image: '' !important;
    box-shadow: '' !important;
}
button:focus .icon {
    opacity: 0.85;
}

/*--------------
    Down
---------------*/

button:active {
    background-color: #BABBBC;
    background-image: '';
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0px 0px 0px 1px transparent inset, none;
}

/*-------------------
    Disabled
--------------------*/

button:disabled {
    cursor: default;
    opacity: 0.45 !important;
    background-image: none !important;
    box-shadow: none !important;
    pointer-events: none !important;
}
</style>
<button><slot></slot></button>`;

define('button', template, class extends Base {
    created() {

    }
});