import { Base, define } from "../components/base.js";

const template = /*html*/`
<style>
/*******************************
            Container
*******************************/

/* All Sizes */
div {
    display: block;
    max-width: 100% !important;
}

/* Mobile */
@media only screen and (max-width: 767px) {
    div {
        width: auto !important;
        margin-left: 1em !important;
        margin-right: 1em !important;
    }
}

/* Tablet */
@media only screen and (min-width: 768px) and (max-width: 991px) {
    div {
        width: 723px;
        margin-left: auto !important;
        margin-right: auto !important;
    }
}

/* Small Monitor */
@media only screen and (min-width: 992px) and (max-width: 1199px) {
    div {
        width: 933px;
        margin-left: auto !important;
        margin-right: auto !important;
    }
}

/* Large Monitor */
@media only screen and (min-width: 1200px) {
    div {
        width: 1127px;
        margin-left: auto !important;
        margin-right: auto !important;
    }
}


/*******************************
             Types
*******************************/


/* Text Container */
.text {
    font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    max-width: 700px !important;
    line-height: 1.5;
    font-size: 1.14285714rem;
}

/* Fluid */
.fluid {
    width: 100%;
}


/*******************************
           Variations
*******************************/

.ui[class*="left aligned"].container {
  text-align: left;
}
.ui[class*="center aligned"].container {
  text-align: center;
}
.ui[class*="right aligned"].container {
  text-align: right;
}
.ui.justified.container {
  text-align: justify;
  -webkit-hyphens: auto;
      -ms-hyphens: auto;
          hyphens: auto;
}
</style>
<div><slot></slot></div>`;

define('container', template, class extends Base {
    created() {
        if (this.getAttribute('text') != undefined) {
            this.find('div').classList.add('text');
        }
        
        if (this.getAttribute('fluid') != undefined) {
            this.find('div').classList.add('fluid');
        }
    }
});