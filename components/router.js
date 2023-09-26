"use strict";

export let Router;

customElements.define("router" + TAGS.X, class extends HTMLElement {
  /**
   * Router looks for a wc-outlet tag for updating the views on history updates.
   * Example:
   *
   * <router>
   *  <outlet>
   *    <!-- All DOM update will be happening here on route change -->
   *  </outlet>
   * </router>
   */
  get outlet() {
	return this.querySelector("outlet" + TAGS.X);
  }

  get root() {
	return window.location.pathname;
  }

  /**
   * Get all routes from the direct wc-route child element.
   * The document title can be updated by providing an
   * title attribute to the wc-route tag
   */
  get routes() {
	return Array.from(this.querySelectorAll("route" + TAGS.X))
	  .filter(node => node.parentNode === this)
	  .map(r => ({
		path: config.base_path + r.getAttribute("path"),
		// Optional: document title
		title: r.getAttribute("title"),
		// name of the web component the should be displayed
		component: r.getAttribute("component"),
		// Bundle path if lazy loading the component
		resourceUrl: r.getAttribute("resourceUrl")
	  }));
  }

  constructor() {
	super();
	Router = this;
  }

  connectedCallback() {
	this.bindRoutes(this);
	this.navigate(window.location.pathname);

	window.addEventListener("popstate", this._handlePopstate);
  }

  disconnectedCallback() {
	window.removeEventListener("popstate", this._handlePopstate);
  }

  _handlePopstate = () => {
	this.navigate(window.location.pathname);
  };

  bindRoutes(elem) {
	/**
	 * Find all child link elements with route attribute to update the
	 * href with route attribute value.
	 *
	 * Add custom click event handler to prevent the default
	 * behaviour and navigate to the registered route onclick.
	 */
	elem.querySelectorAll("a[route]").forEach(link => {
	  const target = config.base_path + link.getAttribute("route");
	  if (target == 'undefined') return;
	  link.setAttribute("href", target);
	  link.onclick = e => {
		e.preventDefault();
		Router.navigate(target);
	  };
	});

	elem.shadowRoot?.querySelectorAll("a[route]").forEach(link => {
	  const target = config.base_path + link.getAttribute("route");
	  if (target == 'undefined') return;
	  link.setAttribute("href", target);
	  link.onclick = e => {
		e.preventDefault();
		Router.navigate(target);
	  };
	});
  }

  navigate(url) {
	const matchedRoute = match(this.routes, url);
	if (matchedRoute !== null) {
	  this.activeRoute = matchedRoute;
	  window.history.pushState(null, null, url);
	  this.update();
	}
  }

  /**
   * Update the DOM under outlet based on the active
   * selected route.
   */
  update() {
	const {
	  component,
	  title,
	  params = {},
	  resourceUrl = null
	} = this.activeRoute;

	if (component) {
	  // Remove all child nodes under outlet element
	  while (this.outlet.firstChild) {
		this.outlet.removeChild(this.outlet.firstChild);
	  }

	  const updateView = () => {
		const view = document.createElement(component + TAGS.X);
		document.title = title || document.title;
		for (let key in params) {
		  /**
		   * all dynamic param value will be passed
		   * as the attribute to the newly created element
		   * except * value.
		   */
		  if (key !== "*") view.setAttribute(key, params[key]);
		}

		this.outlet.appendChild(view);
		// Update the route links once the DOM is updated
		this.bindRoutes(this);
        this.dispatchEvent(new CustomEvent('routeChanged'));
	  };

	  if (resourceUrl !== null) {
		import(resourceUrl).then(updateView);
	  } else {
		updateView();
	  }
	}
  }

  go(url) {
	this.navigate(url);
  }

  back() {
	window.history.go(-1);
  }

  refresh() {
	this.update();
  }
});

let paramRe = /^:(.+)/;

function segmentize(uri) {
  return uri.replace(/(^\/+|\/+$)/g, "").split("/");
}
/**
 * The url matching function. Pass the route definitions and url to the match
 * and the method will return the matched definition or null if there is no
 * fallback scnario found is the definisions.
 *
 * Code is extracted from Reach router path match implementation
 * https://github.com/reach/router/blob/master/src/lib/utils.js
 *
 * @param {Array} routes - Route defenitions
 * @param {string} uri - Url to match
 */
export function match(routes, uri) {
  let match;
  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "/";
  for (let i = 0; i < routes.length; i++) {
	const route = routes[i];
	const routeSegments = segmentize(route.path);
	const max = Math.max(uriSegments.length, routeSegments.length);
	let index = 0;
	let missed = false;
	let params = {};
	for (; index < max; index++) {
	  const uriSegment = uriSegments[index];
	  const routeSegment = routeSegments[index];
	  const fallback = routeSegment === "*";

	  if (fallback) {
		params["*"] = uriSegments
		  .slice(index)
		  .map(decodeURIComponent)
		  .join("/");
		break;
	  }

	  if (uriSegment === undefined) {
		missed = true;
		break;
	  }

	  let dynamicMatch = paramRe.exec(routeSegment);

	  if (dynamicMatch && !isRootUri) {
		let value = decodeURIComponent(uriSegment);
		params[dynamicMatch[1]] = value;
	  } else if (routeSegment !== uriSegment) {
		missed = true;
		break;
	  }
	}

	if (!missed) {
	  match = {
		params,
		...route
	  };
	  break;
	}
  }

  return match || null;
}