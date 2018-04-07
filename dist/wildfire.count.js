/*!
 *   wildfire.count.js
 * 
 *   wildfire@0.3.8
 *   Copyright (C) 2017-2018 LahK
 *   A drop-in replacement for other comment plug-ins.
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
!function(e){function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}var t={};n.m=e,n.c=t,n.i=function(e){return e},n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},n.p="",n(n.s=0)}([function(e,n){(()=>{const e=e=>btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,(e,n)=>String.fromCharCode(`0x${n}`))),{databaseProvider:n,databaseConfig:t}=window.wildfireConfig();if("firebase"!==n&&"wilddog"!==n)return void console.error("Invalid `databaseProvider`.");if(!t)return void console.error("Missing wildfire config: `databaseConfig`.");let o;o="firebase"===n?n.databaseURL:`https://${t.siteId}.wilddogio.com`,document.getElementsByClassName("wf-discussion-count-unit").forEach(n=>{const t=n.getAttribute("wf-page-url");if(!t)return void console.error("Missing attribute: `wf-page-url`.");const r=`${o}/pages/${e(t)}/discussionCount.json`;fetch(r).then(e=>{const n=e.headers.get("content-type");if(n&&n.includes("application/json"))return e.json();throw new TypeError("Oops, we haven't got JSON!")}).then(e=>{const t=e||0;n.innerHTML=t}).catch(e=>{console.error(e)})})})()}]);
//# sourceMappingURL=wildfire.count.js.map