/*     New Caches

Aluno 1: 60045 name Guilherme Fernandes
Aluno 2: 60182 name Guilherme Santana

Comment:

The file "newCaches.js" must include, in the first lines,
an opening comment containing: the name and number of the two students who
developd the project; indication of which parts of the work
made and which were not made; possibly alerts to some aspects of the
implementation that may be less obvious to the teacher.

Every work has been done

GENERATE CACHES:
Our algorithm to generate the largest number of caches basically goes to 
a random cache that already exists on the map and within a radius of about
211 meters it generates random positions and sees if any are valid
(this process takes a maximum of 800ms) if not, it goes to the 
next cache and increment the number of fails, when the number
of fails is more than three then the algorithm ends

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789

HTML DOM documentation: https://www.w3schools.com/js/js_htmldom.asp
Leaflet documentation: https://leafletjs.com/reference.html
*/



/* GLOBAL CONSTANTS */

const MAP_INITIAL_CENTRE =
	[38.661, -9.2044];  // FCT coordinates
const MAP_INITIAL_ZOOM =
	14
const MAP_ID =
	"mapid";
const MAP_ATTRIBUTION =
	'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
	+ 'contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>';
const MAP_URL =
	'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
const MAP_ERROR =
	"https://upload.wikimedia.org/wikipedia/commons/e/e0/SNice.svg";
const MAP_LAYERS =
	["streets-v11", "outdoors-v11", "light-v10", "dark-v10", "satellite-v9",
		"satellite-streets-v11", "navigation-day-v1", "navigation-night-v1"]
//const RESOURCES_DIR =
//	"http//ctp.di.fct.unl.pt/lei/lap/projs/proj2122-3/resources/";
const RESOURCES_DIR =
	"resources/";
const CACHE_KINDS = ["CITO", "Earthcache", "Event",
	"Letterbox", "Mega", "Multi", "Mystery", "Other",
	"Traditional", "Virtual", "Webcam", "Wherigo"];
const CACHE_RADIUS =
	161	// meters
const CACHES_FILE_NAME =
	"caches.xml";
const STATUS_ENABLED =
	"E"


const CACHE_PAGE_URL = `\'https://coord.info/`;

// constant url from google maps to use for street view
const MAPS_PAGE_URL = `http://maps.google.com/maps?layer=c&cbll=`;

//TODO
const UNKNOWN_HEIGHT = -32768;

// the minimum distant to have from a implemented cache
const MIN_DIST = 160;

// the maximim distant to have from a implemented cache
const MAX_DIST = 400;

// the range used to generate randoms caches
const RANGE_SEARCH = 0.0015;

//the time(ms) to search a valid position
const TIME_VALID_DIST = 800;

/* GLOBAL VARIABLES */

let map = null;

// function used to display the menu after press the button
// "MENU"  
function menu() {
	let menu = document.getElementById("menu");
	let map = document.getElementById('mapid');
	let menuButton = document.getElementById('menuButton');

	if (menu.style.display === "none") {
		menu.style.display = "block";
		map.style.left = "200px";
		menuButton.style.left = "170px";
		menuButton.value = "X";
		menuButton.style.width = "23px";
	} else {
		menu.style.display = "none";
		map.style.left = "0px";
		menuButton.style.left = "50px";
		menuButton.value = "MENU";
		menuButton.style.width = "50px";
	}
}

/* USEFUL FUNCTIONS */
//kilometers to meters 
function kmToM(dist) {
	return dist * 1000;
}
// Capitalize the first letter of a string.
function capitalize(str) {
	return str.length > 0
		? str[0].toUpperCase() + str.slice(1)
		: str;
}

// Distance in km between to pairs of coordinates over the earth's surface.
// https://en.wikipedia.org/wiki/Haversine_formula
function haversine(lat1, lon1, lat2, lon2) {
	function toRad(deg) { return deg * 3.1415926535898 / 180.0; }
	let dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
	let sa = Math.sin(dLat / 2.0), so = Math.sin(dLon / 2.0);
	let a = sa * sa + so * so * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
	return 6372.8 * 2.0 * Math.asin(Math.sqrt(a));
}

function loadXMLDoc(filename) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET", filename, false);
	try {
		xhttp.send();
	}
	catch (err) {
		alert("Could not access the geocaching database via AJAX.\n"
			+ "Therefore, no POIs will be visible.\n");
	}
	return xhttp.responseXML;
}

function getAllValuesByTagName(xml, name) {
	return xml.getElementsByTagName(name);
}

function getFirstValueByTagName(xml, name) {
	return getAllValuesByTagName(xml, name)[0].childNodes[0].nodeValue;
}

function kindIsPhysical(kind) {
	return kind === CACHE_KINDS[8];
}

function isPermanentPhysicalCache(cache) {
	return cache instanceof PermanentPhysicalCache;
}

//alert to invalid pos
function invalidPos(lat, lng) {
	alert(`${lat}, ${lng} is an invalid position!`);
}

/* POI CLASS + Cache CLASS */

class POI {
	constructor(xml) {
		this.decodeXML(xml);
	}

	decodeXML(xml) {
		if (xml === null)
			return;
		this.name = getFirstValueByTagName(xml, "name");
		this.latitude = getFirstValueByTagName(xml, "latitude");
		this.longitude = getFirstValueByTagName(xml, "longitude");
	}

	installCircle(radius, color) {
		let pos = [this.latitude, this.longitude];
		let style = { color: color, fillColor: color, weight: 1, fillOpacity: 0.1 };

		this.circle = L.circle(pos, 0, style);
		let c = this.circle;
		let interval = setInterval(function (rad, circle) {
			if (circle._mRadius >= rad) {
				clearInterval(interval);
				return;
			} else {
				map.remove(circle);
				circle._mRadius += 5;
				map.add(circle);
			}
		}, 15, radius, c);
		this.circle.bindTooltip(this.name);
	}
}

/**
 * Caches
 */
class Cache extends POI {
	constructor(xml) {
		super(xml);
		this.decodeXML(xml);
	}

	decodeXML(xml) {
		if (xml === null) return;
		super.decodeXML(xml);
		this.code = getFirstValueByTagName(xml, "code");
		this.owner = getFirstValueByTagName(xml, "owner");
		this.altitude = getFirstValueByTagName(xml, "altitude");

		this.kind = getFirstValueByTagName(xml, "kind");
		this.size = getFirstValueByTagName(xml, "size");
		this.difficulty = getFirstValueByTagName(xml, "difficulty");
		this.terrain = getFirstValueByTagName(xml, "terrain");


		this.favorites = getFirstValueByTagName(xml, "favorites");
		this.founds = getFirstValueByTagName(xml, "founds");
		this.not_founds = getFirstValueByTagName(xml, "not_founds");
		this.state = getFirstValueByTagName(xml, "state");
		this.county = getFirstValueByTagName(xml, "county");

		this.publish = new Date(getFirstValueByTagName(xml, "publish"));
		this.status = getFirstValueByTagName(xml, "status");
		this.last_log = new Date(getFirstValueByTagName(xml, "last_log"));
	}

	/**
	 * installs the Markers and their respective
	 * circles in the map. 
	 * 
	 */
	installMarker() {
		let pos = [this.latitude, this.longitude];
		this.marker = L.marker(pos, { icon: map.getIcon(this.kind) });
		this.marker.bindTooltip(this.name);
		const mapsPageUrl = MAPS_PAGE_URL + `${this.latitude},${this.longitude}`
		const mapsCacheButton = `<input type = 'button' onclick= 
								\"window.location.href =\'${mapsPageUrl}\' \" VALUE='Maps'/>`;
		this.marker.bindPopup("I'm the marker of the cache <b>"
			+ this.name + "</b>.<br/>" + mapsCacheButton);
		map.add(this.marker);
	}

	/**
	 * removes a marker and their respective circle
	 * from the map
	 */
	remove() {
		map.remove(this.marker);
		map.remove(this.circle);
	}

	/**
	 * change the position of the marker
	 * @param {*} lat the new latitute of the marker
	 * @param {*} lng  the new longitude of the marker
	 */
	updateMarkerPos(lat, lng) {
		let popup = this.marker.getPopup();
		let mesg = popup.getContent().replaceAll(`${this.latitude}`, `${lat}`)
			.replaceAll(`${this.longitude}`, `${lng}`);
		map.remove(this.marker);
		let pos = [lat, lng];
		this.marker = L.marker(pos, { icon: map.getIcon(this.kind) });
		this.marker.bindTooltip(this.name);
		this.marker.bindPopup(mesg);
		map.add(this.marker);
		this.latitude = lat;
		this.longitude = lng;
	}
}


/**
 * not physical caches 
 */
class NotPhysical extends Cache {
	constructor(xml) {
		super(xml);
		this.installMarker();
	}
}

/**
 * physical caches with container hidden
 */
class PhysicalHidden extends Cache {
	constructor(xml) {
		super(xml);
		this.installMarker();
		this.updatePopup();
	}

	/**
	 * Uptades the content of the popup
	 */
	updatePopup() {
		const popup = this.marker.getPopup();
		const changeCoordinatesButton = `<input type = 'button' onclick= 
		"map.changeCoordinates(${this.latitude}, ${this.longitude})" VALUE='Change Coordinates'/>`;
		popup.setContent(popup.getContent() + `&emsp;` + changeCoordinatesButton);
	}
}

/**
 * physical caches with container not hidden
 */
class PhysicalNotHidden extends Cache {
	constructor(xml, lat, lng, kind) {
		super(xml);
		if (xml == null) {
			this.latitude = lat;
			this.longitude = lng;
			this.name = kind;
			this.kind = kind;
		}
		this.installCircle(CACHE_RADIUS, 'red');
	}
}

/**
 * removable caches with physical container
 */
class RemovablePhysicalCache extends PhysicalNotHidden {
	constructor(lat, lng, kind) {
		super(null, lat, lng, kind);
		this.installMarker();
		this.updatePopup();

	}
	/**
	* Uptades the content of the popup
	*/
	updatePopup() {
		const popup = this.marker.getPopup();
		const changeCoordinatesButton = `<input type = 'button' onclick= 
		"map.changeCoordinates(${this.latitude}, ${this.longitude})" VALUE='Change Coordinates'/>`;
		const deleteCacheButton = `<input type = 'button' onclick= 
		"map.deleteCache(${this.latitude}, ${this.longitude})" VALUE='Delete'/>`;
		popup.setContent(popup.getContent() + `&emsp;` +
			changeCoordinatesButton + `&emsp;` + deleteCacheButton);
	}

	/**
	 * update the pos of cache circle
	 */
	upcircle() {
		map.remove(this.circle);
		this.installCircle(CACHE_RADIUS, this.circle.options.color);
	}

	/**
	 * update the marker position
	 * @param {*} lat new latitude
	 * @param {*} lng new longitude
	 */
	updateMarkerPos(lat, lng) {
		super.updateMarkerPos(lat, lng);
		this.upcircle();
	}
}
/**
 * removable caches generated with physical container
 */
class RemovablePhysicalCacheGenerated extends RemovablePhysicalCache {
	constructor(lat, lng, kind) {
		super(lat, lng, kind);
		this.circle.setStyle({ color: 'blue', fillColor: 'blue' });
	}
}

/**
 * removable caches introduced by the user with physical container
 */
class RemovablePhysicalCacheIntroduced extends RemovablePhysicalCache {
	constructor(lat, lng, kind) {
		super(lat, lng, kind);
		this.circle.setStyle({ color: 'green', fillColor: 'green' });
	}

}

/**
 * permanent caches with physical container
 */
class PermanentPhysicalCache extends PhysicalNotHidden {
	constructor(xml) {
		super(xml);
		this.cachePageUrl = CACHE_PAGE_URL + `${this.code}\'`;
		this.installMarker();
		this.updatePopup();
	}

	/**
	 * Uptades the content of the popup
	 */
	updatePopup() {
		const popup = this.marker.getPopup();
		const cachePageButton = `<input type = 'button' onclick= 
		\"window.location.href =${this.cachePageUrl} \" VALUE='Cache Page'/>`;
		popup.setContent(popup.getContent() + "&emsp;" + cachePageButton);
	}
}

class Place extends POI {
	constructor(name, pos) {
		super(null);
		this.name = name;
		this.latitude = pos[0];
		this.longitude = pos[1];
		this.installCircle(CACHE_RADIUS, 'black');
	}
}

/* Map CLASS */

class Map {
	constructor(center, zoom) {
		this.lmap = L.map(MAP_ID).setView(center, zoom);
		this.addBaseLayers(MAP_LAYERS);
		this.icons = this.loadIcons(RESOURCES_DIR);
		this.caches = [];
		this.addClickHandler(e =>
			L.popup()
				.setLatLng(e.latlng)
				.setContent("You clicked the map at " + e.latlng.toString() + "<br/>" +
					`<input type = 'button' onclick= \"window.location.href =\'${MAPS_PAGE_URL
					+ `${e.latlng.lat},${e.latlng.lng}`}\' \" VALUE='Maps'/>` +
					"&emsp;" + `<input type = 'button' onclick=
					"map.newTraditionalCacheIntroduced(${e.latlng.lat}, ${e.latlng.lng})" 
					VALUE='Add Cache'/>`)
		);
	}

	/**
	 * uptade all the statistics of a cache
	 */
	updateStatistics() {
		for (let i = 0; i < this.caches.length; i++) {
			const elem = document.getElementById(this.caches[i].kind);
			elem.innerHTML = "0";
		}
		let max = -32768;
		let cache = null;
		for (let i = 0; i < this.caches.length; i++) {
			this.addOneToCacheStatistics(this.caches[i]);
			if (this.caches[i].altitude && this.caches[i].altitude > max) {
				max = this.caches[i].altitude;
				cache = this.caches[i];
			}
		}
		const elem = document.getElementById('height');
		if (max == UNKNOWN_HEIGHT)
			elem.innerHTML = `<ul><li>Unknown</li></ul>`
		else
			elem.innerHTML = `<ul><li>${cache.name}(${cache.code}-${cache.kind}):
								${cache.altitude}m</li></ul>`;
	}

	/**
	 * Increments the stats of a specific cache
	 * @param {*} cache that will be incremented
	 */
	addOneToCacheStatistics(cache) {
		const elem = document.getElementById(cache.kind);
		elem.innerHTML = parseInt(elem.innerHTML) + 1;
	}

	/**
	 * Adds a new tradicional cache in the map
	 * @param {*} lat the latitute of the new cache
	 * @param {*} lng  the longitude of the new cache
	 */
	newTraditionalCacheIntroduced(lat, lng) {
		if (!this.validPos(lat, lng))
			invalidPos(lat, lng);
		else {
			this.caches.push(new RemovablePhysicalCacheIntroduced(lat, lng, CACHE_KINDS[8]));
			const elem = document.getElementById(this.caches[8].kind);
			elem.innerHTML = parseInt(elem.innerHTML) + 1;
		}
	}

	/**
	 * checks if a cache is at a lower distance than MIN_DIST
	 * @param {*} cache cache
	 * @returns 
	 */
	isTooClose(cache, lat, lng) {
		if (kmToM(haversine(cache.latitude, cache.longitude, lat, lng))
			< MIN_DIST)
			return true;
		return false;
	}
	/**
	 * checks if the new coordenates are valid
	 * @param {*} lat the new latitude
	 * @param {*} lng  the new longitude
	 * @returns if the distance is less then MAX_DIST of a permanent and PhysicalCache
	 * 			return true, otherwise return false
	 */
	validPos(lat, lng) {
		let isLessThanMaxDist = false;
		for (let i = 0; i < this.caches.length; i++) {
			if (this.isTooClose(this.caches[i], lat, lng))
				return false;
			if (isPermanentPhysicalCache(this.caches[i]) &&
				kmToM(haversine(this.caches[i].latitude, this.caches[i].longitude, lat, lng))
				<= MAX_DIST)
				isLessThanMaxDist = true;
		}
		return isLessThanMaxDist;
	}
	/**
	 *  - Auxiliar method - 
	 * Generate random traditional caches where the rules are valid
	 * @returns true if it generated false otherwise
	 */
	newTraditionalCacheGenerated() {
		let newLat, newlng;
		let startTime = performance.now();
		let endTime;
		let i;
		do {
			i = Math.floor(Math.random() * (this.caches.length - 1));
			const cacheLat = parseFloat(this.caches[i].latitude);
			const cachelng = parseFloat(this.caches[i].longitude);
			newLat = Math.random() *
				(cacheLat + RANGE_SEARCH - (cacheLat - RANGE_SEARCH)) + cacheLat - RANGE_SEARCH;
			newlng = Math.random() *
				(cachelng + RANGE_SEARCH - (cachelng - RANGE_SEARCH)) + cachelng - RANGE_SEARCH;
			endTime = performance.now();
		} while (endTime - startTime <= TIME_VALID_DIST && !this.validPos(newLat, newlng));

		if (endTime - startTime >= TIME_VALID_DIST)
			return false;
		if (this.validPos(newLat, newlng)) {
			this.caches.push(new RemovablePhysicalCacheGenerated(newLat, newlng, CACHE_KINDS[8]))
			const elem = document.getElementById(CACHE_KINDS[8]);
			elem.innerHTML = parseInt(elem.innerHTML) + 1;
			return true;
		}
		return false;
	}
	/**
	 *  Generate random traditional caches where the rules are valid
	 */
	createTraditionalCacheGenerated() {
		if (!this.newTraditionalCacheGenerated())
			alert('Can not find a valid position!');
	}
	/**
	 * pop up with the value of new caches random generated
	 */
	generateManyCaches() {
		this.openPopup();
		let count = 0;
		let fails = 0;
		let interval = setInterval(function () {
			if (map.newTraditionalCacheGenerated())
				count++;
			else fails++;
			if (fails > 3) {
				clearInterval(interval);
				map.openPopup();
				document.querySelector('#popup p').innerHTML = `${count} markers created.`
				return;
			}
		}, 100);

	}
	/**
	 * opens the popup from generateManyCaches
	 */
	openPopup() {
		this.closePopup();
		document.getElementById('popup').style.display = "block";
	}
	/**
	 *  close the popup from generateManyCaches
	 */
	closePopup() {
		document.getElementById('popup').style.display = "none";
		document.querySelector('#popup p').innerHTML = "Wait, caches are being generated...";
	}
	/**
	 *  gets one cache from the vector
	 * @param {*} lat wanted latitude for the cache
	 * @param {*} lng wanted longitude for the cache
	 * @returns If the vector have a cache with lat
	 * and lng return the cache. NULL otherwise
	 */
	getCache(lat, lng) {
		for (let i = 0; i < this.caches.length; i++) {
			let c = this.caches[i];
			if (c.latitude == lat && c.longitude == lng)
				return c;

		}
		return null;
	}

	/**
	 * delete one cache with lat and lng. If that cache
	 * is a physical one removes the circul and the marker
	 * in the map
	 * @param {*} lat latitude of the cache to be removed
	 * @param {*} lng  longitude of the cache to be removed
	 */
	deleteCache(lat, lng) {
		let cache = this.getCache(lat, lng);
		if (kindIsPhysical(cache.kind)) {
			cache.remove();
			let i = map.getCaches().indexOf(cache);
			this.caches.splice(i, 1);
			this.updateStatistics();
		}

	}
	/**
	 * change the coordenates of a cache
	 * @param {*} lat new latitude for the cache
	 * @param {*} lng  new longitude for the cache
	 * @returns 
	 */
	changeCoordinates(lat, lng) {
		let cache = this.getCache(lat, lng);
		if (cache == null) return;
		const latitude = prompt("Insert latitude:", 38.662824);
		if (latitude == null)
			return;
		const longitude = prompt("Insert longitude:", -9.208328);
		if (longitude == null)
			return;
		for (let i = 0; i < map.getCaches().length; i++)
			if (map.isTooClose(map.caches[i], latitude, longitude)) {
				invalidPos(latitude, longitude);
				return false;
			}
		cache.updateMarkerPos(parseFloat(latitude), parseFloat(longitude));
		return true;
	}
	/**
	 * adds the markers in the map and update the statistics
	 */
	populate() {
		this.caches = this.loadCaches(RESOURCES_DIR + CACHES_FILE_NAME);
		this.mostProlific();
		this.updateStatistics();
	}

	/**
	 * calculate the user with more caches
	 */
	mostProlific() {
		let ht = {};
		const caches = this.caches;
		for (let i = 0; i < caches.length; i++) {
			if (!(caches[i].owner in ht))
				ht[caches[i].owner] = 0;
			ht[caches[i].owner]++;
		}
		const owner = this.maxDic(ht);
		if (owner == null)
			document.getElementById('prolific').innerHTML = `<ul><li>Unknown</li></ul>`
		else
			document.getElementById('prolific').innerHTML = `<ul><li>${owner}</li></ul>`
	}

	/**
	 * gets the user with more caches in the system
	 * @param {*} dic where all the users are  stored
	 * @returns the user with more caches
	 */
	maxDic(dic) {
		let maxKey = null;
		let maxValue = 0;
		for (const [key, value] of Object.entries(dic)) {
			if (value >= maxValue) {
				maxValue = value;
				maxKey = key;
			}
		}
		return maxKey;
	}

	/**
	 * shows a popup related to the FCT
	 */
	showFCT() {
		this.fct = new Place("FCT/UNL", MAP_INITIAL_CENTRE);
	}

	/**
	 * gets the respective icon according their kind/type
	 * @param {*} kind the type of the icon
	 * @returns the respective icon
	 */
	getIcon(kind) {
		return this.icons[kind];
	}

	/**
	 * gets the vector caches
	 * @returns the vector caches
	 */
	getCaches() {
		return this.caches;
	}


	makeMapLayer(name, spec) {
		let urlTemplate = MAP_URL;
		let attr = MAP_ATTRIBUTION;
		let errorTileUrl = MAP_ERROR;
		let layer =
			L.tileLayer(urlTemplate, {
				minZoom: 6,
				maxZoom: 19,
				errorTileUrl: errorTileUrl,
				id: spec,
				tileSize: 512,
				zoomOffset: -1,
				attribution: attr
			});
		return layer;
	}

	addBaseLayers(specs) {
		let baseMaps = [];
		for (let i in specs)
			baseMaps[capitalize(specs[i])] =
				this.makeMapLayer(specs[i], "mapbox/" + specs[i]);
		baseMaps[capitalize(specs[0])].addTo(this.lmap);
		L.control.scale({ maxWidth: 150, metric: true, imperial: false })
			.setPosition("topleft").addTo(this.lmap);
		L.control.layers(baseMaps, {}).setPosition("topleft").addTo(this.lmap);
		return baseMaps;
	}

	loadIcons(dir) {
		let icons = [];
		let iconOptions = {
			iconUrl: "??",
			shadowUrl: "??",
			iconSize: [16, 16],
			shadowSize: [16, 16],
			iconAnchor: [8, 8], // marker's location
			shadowAnchor: [8, 8],
			popupAnchor: [0, -6] // offset the determines where the popup should open
		};
		for (let i = 0; i < CACHE_KINDS.length; i++) {
			iconOptions.iconUrl = dir + CACHE_KINDS[i] + ".png";
			iconOptions.shadowUrl = dir + "Alive.png";
			icons[CACHE_KINDS[i]] = L.icon(iconOptions);
			iconOptions.shadowUrl = dir + "Archived.png";
			icons[CACHE_KINDS[i] + "_archived"] = L.icon(iconOptions);
		}
		return icons;
	}

	/**
	*creates a new cache based in type 
	*/
	newCache(xs) {
		switch (getFirstValueByTagName(xs, "kind")) {
			case CACHE_KINDS[8]:
				return new PermanentPhysicalCache(xs);
			case CACHE_KINDS[5]:
				return new PhysicalHidden(xs);
			case CACHE_KINDS[6]:
				return new PhysicalHidden(xs);
			case CACHE_KINDS[3]:
				return new PhysicalHidden(xs);
			default:
				return new NotPhysical(xs);
		}
	}

	loadCaches(filename) {
		let xmlDoc = loadXMLDoc(filename);
		let xs = getAllValuesByTagName(xmlDoc, "cache");
		let caches = [];
		if (xs.length === 0)
			alert("Empty cache file");
		else {
			for (let i = 0; i < xs.length; i++)  // Ignore the disables caches
				if (getFirstValueByTagName(xs[i], "status") === STATUS_ENABLED)
					caches.push(this.newCache(xs[i]));
		}
		return caches;
	}

	add(marker) {
		marker.addTo(map.lmap);
	}

	remove(marker) {
		marker.remove();
	}

	addClickHandler(handler) {
		let m = this.lmap;
		function handler2(e) {
			return handler(e).openOn(m);
		}
		return this.lmap.on('click', handler2);
	}
}


/* Some FUNCTIONS are conveniently placed here to be directly called from HTML.
   These functions must invoke operations defined in the classes, because
   this program must be written using the object-oriented style.
*/

function onLoad() {
	map = new Map(MAP_INITIAL_CENTRE, MAP_INITIAL_ZOOM);
	map.showFCT();
	map.populate();
}

