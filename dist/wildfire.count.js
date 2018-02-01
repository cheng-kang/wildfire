/*!
 *   wildfire.count.js
 * 
 *   wildfire@0.3.8
 *   Copyright (C) 2017-2018 LahK
 *   A drop-in replacement for other comment systems.
 * 
 *   You can get more infomation from https://wildfire.js.org
 * 
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 * 
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 * 
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
!function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t){(()=>{const{databaseProvider:e,databaseConfig:t}=window.wildfireConfig();if("firebase"!==e&&"wilddog"!==e)return void console.error("Invalid `databaseProvider`.");if(!t)return void console.error("Missing wildfire config: `databaseConfig`.");let n;n="firebase"===e?e.databaseURL:`https://${t.siteId}.wilddogio.com`;const o=document.getElementsByClassName("wf-discussion-count-unit");for(let e=0;e<o.length;e++){const t=o[e],r=t.getAttribute("wf-page-url");if(!r)return void console.error("Missing attribute: `wf-page-url`.");let i=`${n}/pages/${(e=>btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,(e,t)=>String.fromCharCode("0x"+t))))(r)}/discussionCount.json`;fetch(i).then(e=>{let t=e.headers.get("content-type");if(t&&t.includes("application/json"))return e.json();throw new TypeError("Oops, we haven't got JSON!")}).then(e=>{const n=e||0;t.innerHTML=n}).catch(e=>{console.error(e)})}})()}]);
//# sourceMappingURL=wildfire.count.js.map