import { Base, define } from "../components/base.js";

import '../components/dropsofneon.js'

const template = /*html*/`
<style>
    div {
        width: 100%;
        height: calc(100% - 100px);
        padding-top: 100px;
        background-color: #04040A;
    }
</style>
<div>
    <dropsofneon-X></dropsofneon-X>
</div>
`;

define('dropsofneon-page', template, class extends Base {

});