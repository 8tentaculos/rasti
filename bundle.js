(()=>{var e={269:(e,t,n)=>{"use strict";t.__esModule=!0,t.default=void 0;var o,i=(o=n(125))&&o.__esModule?o:{default:o};function r(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,a(e,t)}function a(e,t){return a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},a(e,t)}var s={key:!0,state:!0,onCreate:!0,onChange:!0,onRender:!0},d=function(e,t){var n=e&&e.match&&e.match(new RegExp(c.EXPRESSION_PLACEHOLDER_TEMPLATE("(\\d+)")));return n&&n[1]?t[n[1]]:e},l=function(e,t){for(var n=arguments.length,o=new Array(n>2?n-2:0),i=2;i<n;i++)o[i-2]=arguments[i];return"function"==typeof e?e.apply(t,o):e},c=t.default=function(e){function t(){var t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return t=e.apply(this,arguments)||this,Object.keys(n).forEach((function(e){s[e]&&(t[e]=n[e])})),t.options=n,t.onChange=t.onChange.bind(t),t.model&&t.model.on&&t.model.on("change",t.onChange),t.state&&t.state.on&&t.state.on("change",t.onChange),t.onCreate.apply(t,arguments),t}r(t,e);var n=t.prototype;return n.isContainer=function(){return!(this.tag||!this.template||!this.template.inner||!this.template.expressions||1!==this.template.expressions.length)},n.ensureElement=function(){this.el&&(this.delegateEvents(),this.id=this.el.id),this.isContainer()||this.id||(this.id=this.attributes&&this.attributes.id?l(this.attributes.id,this,this):t.ID_TEMPLATE(this.uid))},n.findElement=function(e){return(e||document).querySelector("#"+this.id)},n.getAttributes=function(){var e=this,t={id:this.id},n={},o=['id="'+this.id+'"'];return this.attributes&&Object.keys(this.attributes).forEach((function(i){if("id"!==i){var r=l(e.attributes[i],e,e);!1===r?n[i]=!0:!0===r?(t[i]="",o.push(i)):(null==r&&(r=""),t[i]=r,o.push(i+'="'+r+'"'))}})),{add:t,remove:n,html:o.join(" ")}},n.hydrate=function(e){var t=this;return this.isContainer()?(this.children[0].hydrate(e),this.el=this.children[0].el):(this.el=this.findElement(e),this.delegateEvents(),this.children.forEach((function(e){return e.hydrate(t.el)}))),this.onRender.call(this,"hydrate"),this},n.recycle=function(e){return(this.isContainer()?this.children[0]:this).findElement(e).replaceWith(this.el),this.onRender.call(this,"recycle"),this},n.destroy=function(){return e.prototype.destroy.apply(this,arguments),this.model&&this.model.off&&this.model.off("change",this.onChange),this.state&&this.state.off&&this.state.off("change",this.onChange),this.destroyed=!0,this},n.onCreate=function(){},n.onChange=function(){this.render()},n.onRender=function(){},n.onDestroy=function(){},n.replaceExpressions=function(e,n){var o=this;return e.replace(new RegExp(t.EXPRESSION_PLACEHOLDER_TEMPLATE("(\\d+)"),"g"),(function(e){var i=d(e,o.template.expressions),r=l(i,o,o);return(r instanceof Array?r:[r]).reduce((function(e,o){return e+(!0===o?t.TRUE_PLACEHOLDER:!1===o?t.FALSE_PLACEHOLDER:null==o?"":o&&"function"==typeof o.render?n(o):o)}),"")})).replace(new RegExp("([\\w|data-]+)=([\"'])?("+t.TRUE_PLACEHOLDER+"|"+t.FALSE_PLACEHOLDER+")\\2","g"),(function(e,n,o,i){return i===t.TRUE_PLACEHOLDER?n:""})).replace(new RegExp(t.TRUE_PLACEHOLDER+"|"+t.FALSE_PLACEHOLDER,"g"),"")},n.toString=function(){var e=this;this.destroyChildren();var t=this.template&&this.template.inner,n=t&&this.replaceExpressions(this.template.inner,(function(t){return e.addChild(t)}));if(this.isContainer())return n;var o=this.tag||"div",i=this.getAttributes().html;return t?"<"+o+" "+i+">"+n+"</"+o+">":"<"+o+" "+i+" />"},n.render=function(){var e=this;if(this.destroyed)return this;if(!this.isContainer()){this.el||(this.el=this.createElement(this.tag),this.delegateEvents());var t=this.getAttributes();Object.keys(t.remove).forEach((function(t){e.el.removeAttribute(t)})),Object.keys(t.add).forEach((function(n){e.el.setAttribute(n,t.add[n])}))}if(this.template&&this.template.inner){var n=document.activeElement,o=[],i=[],r=this.children;this.children=[];var a=this.replaceExpressions(this.template.inner,(function(e){var t=e,n=e.key&&r.find((function(t){return t.key===e.key}));if(n){var a=n.el.tagName.toLowerCase();t="<"+a+' id="'+n.el.id+'"></'+a+">",i.push(n),e.destroy()}else o.push(e);return t}));if(this.isContainer())if(o[0]){var s=this.createElement("template");s.innerHTML=a,this.addChild(o[0]).hydrate(s.content);var d=s.content.children[0];this.el&&this.el.replaceWith(d),this.el=d}else i[0]&&this.addChild(i[0]);else this.el.innerHTML=a,o.forEach((function(t){e.addChild(t).hydrate(e.el)})),i.forEach((function(t){e.addChild(t).recycle(e.el)}));r.forEach((function(e){i.indexOf(e)>-1||e.destroy()})),this.el.contains(n)&&n.focus()}return this.onRender.call(this,"render"),this},t.extend=function(e){var t=function(e){function t(){return e.apply(this,arguments)||this}return r(t,e),t}(this);return Object.assign(t.prototype,"function"==typeof e?e(this.prototype):e),t},t.mount=function(e,t,n){var o=new this(e);if(t){if(n)o.toString();else{var i=this.prototype.createElement("template");i.innerHTML=o,t.appendChild(i.content.children[0])}o.hydrate(t)}return o},t.create=function(e){for(var n=arguments.length,o=new Array(n>1?n-1:0),i=1;i<n;i++)o[i-1]=arguments[i];var r,a,s,l;"function"==typeof e&&(o=[e],e=["",""]);var c=[];e.forEach((function(e,n){c.push(e),o[n]&&c.push("function"==typeof o[n]||"object"==typeof o[n]?t.EXPRESSION_PLACEHOLDER_TEMPLATE(n):o[n])}));var h=c.join("").trim().replace(/\n/g,t.NEW_LINE_PLACEHOLDER),u=h.match(/^<([a-z]+[1-6]?)(.*?)>(.*)<\/\1>$/)||h.match(/^<([a-z]+)(.*?)\/>$/);return u?(r=u[1],s=u[3]&&u[3].replace(new RegExp(t.NEW_LINE_PLACEHOLDER,"g"),"\n"),a=function(e){for(var t,n={},o=/([\w|data-]+)(?:=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?)?/g;null!==(t=o.exec(e));)n[t[1]]=void 0===t[2]||t[2];return n}(u[2].replace(new RegExp(t.NEW_LINE_PLACEHOLDER,"g"),"")),l={},a=Object.keys(a).reduce((function(e,t){var n=t.match(/on(([A-Z]{1}[a-z]+)+)/),i=d(a[t],o);if(n&&n[1]){var r=n[1].toLowerCase();return Object.keys(i).forEach((function(e){return l[r+("&"===e?"":" "+e)]=i[e]})),e}return e[t]=i,e}),{})):s=h,this.extend({tag:r,attributes:a,events:l,template:{inner:s,expressions:o}})},t}(i.default);c.ID_TEMPLATE=function(e){return"rasti-component-"+e},c.EXPRESSION_PLACEHOLDER_TEMPLATE=function(e){return"__RASTI_EXPRESSION_{"+e+"}__"},c.TRUE_PLACEHOLDER="__RASTI_TRUE__",c.FALSE_PLACEHOLDER="__RASTI_FALSE__",c.NEW_LINE_PLACEHOLDER="__RASTI_NEW_LINE__"},828:(e,t)=>{"use strict";t.__esModule=!0,t.default=void 0,t.default=function(){function e(){}var t=e.prototype;return t.on=function(e,t){if("function"!=typeof t)throw TypeError("Listener must be a function");this.listeners||(this.listeners={}),this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t)},t.once=function(e,t){if("function"==typeof t){var n=this,o=t;t=function(){o.apply(void 0,arguments),n.off(e,t)}}this.on(e,t)},t.off=function(e,t){if(e)if(t){var n=this.listeners[e];n&&(n.slice().forEach((function(e,o){e===t&&n.splice(o,1)})),n.length||delete this.listeners[e])}else delete this.listeners[e];else this.listeners={}},t.emit=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];var i=this.listeners&&this.listeners[e];i&&i.length&&i.slice().forEach((function(e){e.apply(void 0,n)}))},e}()},691:(e,t,n)=>{"use strict";t.__esModule=!0,t.default=void 0;var o,i=(o=n(828))&&o.__esModule?o:{default:o};function r(e,t){return r=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},r(e,t)}t.default=function(e){function t(){var t,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(t=e.call(this)||this).preinitialize.apply(t,arguments),t.attributes=Object.assign({},t.defaults||{},n),t.previous={},Object.keys(t.attributes).forEach(t.defineAttribute.bind(t)),t}var n,o;o=e,(n=t).prototype=Object.create(o.prototype),n.prototype.constructor=n,r(n,o);var i=t.prototype;return i.preinitialize=function(){},i.defineAttribute=function(e){var t=this;Object.defineProperty(this,e,{get:function(){return t.get(e)},set:function(n){t.set(e,n)}})},i.get=function(e){return this.attributes[e]},i.set=function(e,t){for(var n,o,i,r=this,a=arguments.length,s=new Array(a>2?a-2:0),d=2;d<a;d++)s[d-2]=arguments[d];"object"==typeof e?(n=e,o=[t].concat(s)):((i={})[e]=t,n=i,o=s);var l=this._changing;this._changing=!0;var c={};l||(this.previous=Object.assign({},this.attributes)),Object.keys(n).forEach((function(e){n[e]!==r.attributes[e]&&(c[e]=n[e],r.attributes[e]=n[e])}));var h=Object.keys(c);if(h.length&&(this._pending=["change",this,c].concat(o)),h.forEach((function(e){r.emit.apply(r,["change:"+e,r,n[e]].concat(o))})),l)return this;for(;this._pending;){var u=this._pending;this._pending=null,this.emit.apply(this,u)}return this._pending=null,this._changing=!1,this},i.toJSON=function(){return this.attributes},t}(i.default)},125:(e,t,n)=>{"use strict";t.__esModule=!0,t.default=void 0;var o,i=(o=n(828))&&o.__esModule?o:{default:o};function r(e,t){return r=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},r(e,t)}var a={el:!0,tag:!0,attributes:!0,events:!0,model:!0,template:!0,onDestroy:!0};(t.default=function(e){function t(){var n,o=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(n=e.call(this)||this).preinitialize.apply(n,arguments),n.uid="uid"+ ++t.uid,n.delegatedEventListeners=[],n.children=[],Object.keys(o).forEach((function(e){a[e]&&(n[e]=o[e])})),n.ensureElement(),n}var n,o;o=e,(n=t).prototype=Object.create(o.prototype),n.prototype.constructor=n,r(n,o);var i=t.prototype;return i.preinitialize=function(){},i.$=function(e){return this.el.querySelector(e)},i.$$=function(e){return this.el.querySelectorAll(e)},i.destroy=function(){return this.destroyChildren(),this.undelegateEvents(),this.off(),this.onDestroy.apply(this,arguments),this},i.onDestroy=function(){},i.addChild=function(e){return this.children.push(e),e},i.destroyChildren=function(){for(;this.children.length;)this.children.shift().destroy()},i.ensureElement=function(){this.el||(this.el=this.createElement(this.tag,this.attributes)),this.delegateEvents()},i.createElement=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"div",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=document.createElement(e);return Object.keys(t).forEach((function(e){return n.setAttribute(e,t[e])})),n},i.removeElement=function(){return this.el.parentNode.removeChild(this.el),this},i.delegateEvents=function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.events;if(!t)return this;this.delegatedEventListeners.length&&this.undelegateEvents();var n={};return Object.keys(t).forEach((function(o){var i=o.split(" "),r=i.shift(),a=i.join(" "),s=t[o];s=("string"==typeof s?e[s]:s).bind(e),n[r]||(n[r]=[]),n[r].push({selector:a,listener:s})})),Object.keys(n).forEach((function(t){var o=function(o){n[t].forEach((function(t){var n=t.selector,i=t.listener;n&&!o.target.closest(n)||i(o,e)}))};e.delegatedEventListeners.push({type:t,listener:o}),e.el.addEventListener(t,o)})),this},i.undelegateEvents=function(){var e=this;return this.delegatedEventListeners.forEach((function(t){var n=t.type,o=t.listener;e.el.removeEventListener(n,o)})),this.delegatedEventListeners=[],this},i.render=function(){return this.template&&(this.el.innerHTML=this.template(this.model)),this},t}(i.default)).uid=0},390:(e,t,n)=>{"use strict";r(n(828)).default;var o=r(n(691));t.Kx=o.default,r(n(125)).default;var i=r(n(269));function r(e){return e&&e.__esModule?e:{default:e}}t.uA=i.default},416:e=>{function t(e){return e instanceof Map?e.clear=e.delete=e.set=function(){throw new Error("map is read-only")}:e instanceof Set&&(e.add=e.clear=e.delete=function(){throw new Error("set is read-only")}),Object.freeze(e),Object.getOwnPropertyNames(e).forEach((n=>{const o=e[n],i=typeof o;"object"!==i&&"function"!==i||Object.isFrozen(o)||t(o)})),e}class n{constructor(e){void 0===e.data&&(e.data={}),this.data=e.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}}function o(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function i(e,...t){const n=Object.create(null);for(const t in e)n[t]=e[t];return t.forEach((function(e){for(const t in e)n[t]=e[t]})),n}const r=e=>!!e.scope;class a{constructor(e,t){this.buffer="",this.classPrefix=t.classPrefix,e.walk(this)}addText(e){this.buffer+=o(e)}openNode(e){if(!r(e))return;const t=((e,{prefix:t})=>{if(e.startsWith("language:"))return e.replace("language:","language-");if(e.includes(".")){const n=e.split(".");return[`${t}${n.shift()}`,...n.map(((e,t)=>`${e}${"_".repeat(t+1)}`))].join(" ")}return`${t}${e}`})(e.scope,{prefix:this.classPrefix});this.span(t)}closeNode(e){r(e)&&(this.buffer+="</span>")}value(){return this.buffer}span(e){this.buffer+=`<span class="${e}">`}}const s=(e={})=>{const t={children:[]};return Object.assign(t,e),t};class d{constructor(){this.rootNode=s(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(e){this.top.children.push(e)}openNode(e){const t=s({scope:e});this.add(t),this.stack.push(t)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(e){return this.constructor._walk(e,this.rootNode)}static _walk(e,t){return"string"==typeof t?e.addText(t):t.children&&(e.openNode(t),t.children.forEach((t=>this._walk(e,t))),e.closeNode(t)),e}static _collapse(e){"string"!=typeof e&&e.children&&(e.children.every((e=>"string"==typeof e))?e.children=[e.children.join("")]:e.children.forEach((e=>{d._collapse(e)})))}}class l extends d{constructor(e){super(),this.options=e}addText(e){""!==e&&this.add(e)}startScope(e){this.openNode(e)}endScope(){this.closeNode()}__addSublanguage(e,t){const n=e.root;t&&(n.scope=`language:${t}`),this.add(n)}toHTML(){return new a(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}}function c(e){return e?"string"==typeof e?e:e.source:null}function h(e){return p("(?=",e,")")}function u(e){return p("(?:",e,")*")}function g(e){return p("(?:",e,")?")}function p(...e){return e.map((e=>c(e))).join("")}function m(...e){const t=function(e){const t=e[e.length-1];return"object"==typeof t&&t.constructor===Object?(e.splice(e.length-1,1),t):{}}(e);return"("+(t.capture?"":"?:")+e.map((e=>c(e))).join("|")+")"}function f(e){return new RegExp(e.toString()+"|").exec("").length-1}const b=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function v(e,{joinWith:t}){let n=0;return e.map((e=>{n+=1;const t=n;let o=c(e),i="";for(;o.length>0;){const e=b.exec(o);if(!e){i+=o;break}i+=o.substring(0,e.index),o=o.substring(e.index+e[0].length),"\\"===e[0][0]&&e[1]?i+="\\"+String(Number(e[1])+t):(i+=e[0],"("===e[0]&&n++)}return i})).map((e=>`(${e})`)).join(t)}const y="[a-zA-Z]\\w*",w="[a-zA-Z_]\\w*",_="\\b\\d+(\\.\\d+)?",x="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",E="\\b(0b[01]+)",C={begin:"\\\\[\\s\\S]",relevance:0},k={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[C]},$={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[C]},S=function(e,t,n={}){const o=i({scope:"comment",begin:e,end:t,contains:[]},n);o.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});const r=m("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return o.contains.push({begin:p(/[ ]+/,"(",r,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),o},L=S("//","$"),R=S("/\\*","\\*/"),A=S("#","$"),j={scope:"number",begin:_,relevance:0},O={scope:"number",begin:x,relevance:0},M={scope:"number",begin:E,relevance:0},T={scope:"regexp",begin:/\/(?=[^/\n]*\/)/,end:/\/[gimuy]*/,contains:[C,{begin:/\[/,end:/\]/,relevance:0,contains:[C]}]},N={scope:"title",begin:y,relevance:0},I={scope:"title",begin:w,relevance:0},D={begin:"\\.\\s*"+w,relevance:0};var z=Object.freeze({__proto__:null,APOS_STRING_MODE:k,BACKSLASH_ESCAPE:C,BINARY_NUMBER_MODE:M,BINARY_NUMBER_RE:E,COMMENT:S,C_BLOCK_COMMENT_MODE:R,C_LINE_COMMENT_MODE:L,C_NUMBER_MODE:O,C_NUMBER_RE:x,END_SAME_AS_BEGIN:function(e){return Object.assign(e,{"on:begin":(e,t)=>{t.data._beginMatch=e[1]},"on:end":(e,t)=>{t.data._beginMatch!==e[1]&&t.ignoreMatch()}})},HASH_COMMENT_MODE:A,IDENT_RE:y,MATCH_NOTHING_RE:/\b\B/,METHOD_GUARD:D,NUMBER_MODE:j,NUMBER_RE:_,PHRASAL_WORDS_MODE:{begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},QUOTE_STRING_MODE:$,REGEXP_MODE:T,RE_STARTERS_RE:"!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",SHEBANG:(e={})=>{const t=/^#![ ]*\//;return e.binary&&(e.begin=p(t,/.*\b/,e.binary,/\b.*/)),i({scope:"meta",begin:t,end:/$/,relevance:0,"on:begin":(e,t)=>{0!==e.index&&t.ignoreMatch()}},e)},TITLE_MODE:N,UNDERSCORE_IDENT_RE:w,UNDERSCORE_TITLE_MODE:I});function P(e,t){"."===e.input[e.index-1]&&t.ignoreMatch()}function H(e,t){void 0!==e.className&&(e.scope=e.className,delete e.className)}function B(e,t){t&&e.beginKeywords&&(e.begin="\\b("+e.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",e.__beforeBegin=P,e.keywords=e.keywords||e.beginKeywords,delete e.beginKeywords,void 0===e.relevance&&(e.relevance=0))}function W(e,t){Array.isArray(e.illegal)&&(e.illegal=m(...e.illegal))}function F(e,t){if(e.match){if(e.begin||e.end)throw new Error("begin & end are not supported with match");e.begin=e.match,delete e.match}}function U(e,t){void 0===e.relevance&&(e.relevance=1)}const V=(e,t)=>{if(!e.beforeMatch)return;if(e.starts)throw new Error("beforeMatch cannot be used with starts");const n=Object.assign({},e);Object.keys(e).forEach((t=>{delete e[t]})),e.keywords=n.keywords,e.begin=p(n.beforeMatch,h(n.begin)),e.starts={relevance:0,contains:[Object.assign(n,{endsParent:!0})]},e.relevance=0,delete n.beforeMatch},K=["of","and","for","in","not","or","if","then","parent","list","value"];function Z(e,t,n="keyword"){const o=Object.create(null);return"string"==typeof e?i(n,e.split(" ")):Array.isArray(e)?i(n,e):Object.keys(e).forEach((function(n){Object.assign(o,Z(e[n],t,n))})),o;function i(e,n){t&&(n=n.map((e=>e.toLowerCase()))),n.forEach((function(t){const n=t.split("|");o[n[0]]=[e,G(n[0],n[1])]}))}}function G(e,t){return t?Number(t):function(e){return K.includes(e.toLowerCase())}(e)?0:1}const X={},q=e=>{console.error(e)},J=(e,...t)=>{console.log(`WARN: ${e}`,...t)},Y=(e,t)=>{X[`${e}/${t}`]||(console.log(`Deprecated as of ${e}. ${t}`),X[`${e}/${t}`]=!0)},Q=new Error;function ee(e,t,{key:n}){let o=0;const i=e[n],r={},a={};for(let e=1;e<=t.length;e++)a[e+o]=i[e],r[e+o]=!0,o+=f(t[e-1]);e[n]=a,e[n]._emit=r,e[n]._multi=!0}function te(e){!function(e){e.scope&&"object"==typeof e.scope&&null!==e.scope&&(e.beginScope=e.scope,delete e.scope)}(e),"string"==typeof e.beginScope&&(e.beginScope={_wrap:e.beginScope}),"string"==typeof e.endScope&&(e.endScope={_wrap:e.endScope}),function(e){if(Array.isArray(e.begin)){if(e.skip||e.excludeBegin||e.returnBegin)throw q("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),Q;if("object"!=typeof e.beginScope||null===e.beginScope)throw q("beginScope must be object"),Q;ee(e,e.begin,{key:"beginScope"}),e.begin=v(e.begin,{joinWith:""})}}(e),function(e){if(Array.isArray(e.end)){if(e.skip||e.excludeEnd||e.returnEnd)throw q("skip, excludeEnd, returnEnd not compatible with endScope: {}"),Q;if("object"!=typeof e.endScope||null===e.endScope)throw q("endScope must be object"),Q;ee(e,e.end,{key:"endScope"}),e.end=v(e.end,{joinWith:""})}}(e)}function ne(e){function t(t,n){return new RegExp(c(t),"m"+(e.case_insensitive?"i":"")+(e.unicodeRegex?"u":"")+(n?"g":""))}class n{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(e,t){t.position=this.position++,this.matchIndexes[this.matchAt]=t,this.regexes.push([t,e]),this.matchAt+=f(e)+1}compile(){0===this.regexes.length&&(this.exec=()=>null);const e=this.regexes.map((e=>e[1]));this.matcherRe=t(v(e,{joinWith:"|"}),!0),this.lastIndex=0}exec(e){this.matcherRe.lastIndex=this.lastIndex;const t=this.matcherRe.exec(e);if(!t)return null;const n=t.findIndex(((e,t)=>t>0&&void 0!==e)),o=this.matchIndexes[n];return t.splice(0,n),Object.assign(t,o)}}class o{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(e){if(this.multiRegexes[e])return this.multiRegexes[e];const t=new n;return this.rules.slice(e).forEach((([e,n])=>t.addRule(e,n))),t.compile(),this.multiRegexes[e]=t,t}resumingScanAtSamePosition(){return 0!==this.regexIndex}considerAll(){this.regexIndex=0}addRule(e,t){this.rules.push([e,t]),"begin"===t.type&&this.count++}exec(e){const t=this.getMatcher(this.regexIndex);t.lastIndex=this.lastIndex;let n=t.exec(e);if(this.resumingScanAtSamePosition())if(n&&n.index===this.lastIndex);else{const t=this.getMatcher(0);t.lastIndex=this.lastIndex+1,n=t.exec(e)}return n&&(this.regexIndex+=n.position+1,this.regexIndex===this.count&&this.considerAll()),n}}if(e.compilerExtensions||(e.compilerExtensions=[]),e.contains&&e.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return e.classNameAliases=i(e.classNameAliases||{}),function n(r,a){const s=r;if(r.isCompiled)return s;[H,F,te,V].forEach((e=>e(r,a))),e.compilerExtensions.forEach((e=>e(r,a))),r.__beforeBegin=null,[B,W,U].forEach((e=>e(r,a))),r.isCompiled=!0;let d=null;return"object"==typeof r.keywords&&r.keywords.$pattern&&(r.keywords=Object.assign({},r.keywords),d=r.keywords.$pattern,delete r.keywords.$pattern),d=d||/\w+/,r.keywords&&(r.keywords=Z(r.keywords,e.case_insensitive)),s.keywordPatternRe=t(d,!0),a&&(r.begin||(r.begin=/\B|\b/),s.beginRe=t(s.begin),r.end||r.endsWithParent||(r.end=/\B|\b/),r.end&&(s.endRe=t(s.end)),s.terminatorEnd=c(s.end)||"",r.endsWithParent&&a.terminatorEnd&&(s.terminatorEnd+=(r.end?"|":"")+a.terminatorEnd)),r.illegal&&(s.illegalRe=t(r.illegal)),r.contains||(r.contains=[]),r.contains=[].concat(...r.contains.map((function(e){return function(e){return e.variants&&!e.cachedVariants&&(e.cachedVariants=e.variants.map((function(t){return i(e,{variants:null},t)}))),e.cachedVariants?e.cachedVariants:oe(e)?i(e,{starts:e.starts?i(e.starts):null}):Object.isFrozen(e)?i(e):e}("self"===e?r:e)}))),r.contains.forEach((function(e){n(e,s)})),r.starts&&n(r.starts,a),s.matcher=function(e){const t=new o;return e.contains.forEach((e=>t.addRule(e.begin,{rule:e,type:"begin"}))),e.terminatorEnd&&t.addRule(e.terminatorEnd,{type:"end"}),e.illegal&&t.addRule(e.illegal,{type:"illegal"}),t}(s),s}(e)}function oe(e){return!!e&&(e.endsWithParent||oe(e.starts))}class ie extends Error{constructor(e,t){super(e),this.name="HTMLInjectionError",this.html=t}}const re=o,ae=i,se=Symbol("nomatch"),de=function(e){const o=Object.create(null),i=Object.create(null),r=[];let a=!0;const s="Could not find the language '{}', did you forget to load/include a language module?",d={disableAutodetect:!0,name:"Plain text",contains:[]};let c={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:l};function f(e){return c.noHighlightRe.test(e)}function b(e,t,n){let o="",i="";"object"==typeof t?(o=e,n=t.ignoreIllegals,i=t.language):(Y("10.7.0","highlight(lang, code, ...args) has been deprecated."),Y("10.7.0","Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277"),i=e,o=t),void 0===n&&(n=!0);const r={code:o,language:i};$("before:highlight",r);const a=r.result?r.result:v(r.language,r.code,n);return a.code=r.code,$("after:highlight",a),a}function v(e,t,i,r){const d=Object.create(null);function l(){if(!$.keywords)return void L.addText(R);let e=0;$.keywordPatternRe.lastIndex=0;let t=$.keywordPatternRe.exec(R),n="";for(;t;){n+=R.substring(e,t.index);const i=x.case_insensitive?t[0].toLowerCase():t[0],r=(o=i,$.keywords[o]);if(r){const[e,o]=r;if(L.addText(n),n="",d[i]=(d[i]||0)+1,d[i]<=7&&(A+=o),e.startsWith("_"))n+=t[0];else{const n=x.classNameAliases[e]||e;u(t[0],n)}}else n+=t[0];e=$.keywordPatternRe.lastIndex,t=$.keywordPatternRe.exec(R)}var o;n+=R.substring(e),L.addText(n)}function h(){null!=$.subLanguage?function(){if(""===R)return;let e=null;if("string"==typeof $.subLanguage){if(!o[$.subLanguage])return void L.addText(R);e=v($.subLanguage,R,!0,S[$.subLanguage]),S[$.subLanguage]=e._top}else e=y(R,$.subLanguage.length?$.subLanguage:null);$.relevance>0&&(A+=e.relevance),L.__addSublanguage(e._emitter,e.language)}():l(),R=""}function u(e,t){""!==e&&(L.startScope(t),L.addText(e),L.endScope())}function g(e,t){let n=1;const o=t.length-1;for(;n<=o;){if(!e._emit[n]){n++;continue}const o=x.classNameAliases[e[n]]||e[n],i=t[n];o?u(i,o):(R=i,l(),R=""),n++}}function p(e,t){return e.scope&&"string"==typeof e.scope&&L.openNode(x.classNameAliases[e.scope]||e.scope),e.beginScope&&(e.beginScope._wrap?(u(R,x.classNameAliases[e.beginScope._wrap]||e.beginScope._wrap),R=""):e.beginScope._multi&&(g(e.beginScope,t),R="")),$=Object.create(e,{parent:{value:$}}),$}function m(e,t,o){let i=function(e,t){const n=e&&e.exec(t);return n&&0===n.index}(e.endRe,o);if(i){if(e["on:end"]){const o=new n(e);e["on:end"](t,o),o.isMatchIgnored&&(i=!1)}if(i){for(;e.endsParent&&e.parent;)e=e.parent;return e}}if(e.endsWithParent)return m(e.parent,t,o)}function f(e){return 0===$.matcher.regexIndex?(R+=e[0],1):(M=!0,0)}function b(e){const n=e[0],o=t.substring(e.index),i=m($,e,o);if(!i)return se;const r=$;$.endScope&&$.endScope._wrap?(h(),u(n,$.endScope._wrap)):$.endScope&&$.endScope._multi?(h(),g($.endScope,e)):r.skip?R+=n:(r.returnEnd||r.excludeEnd||(R+=n),h(),r.excludeEnd&&(R=n));do{$.scope&&L.closeNode(),$.skip||$.subLanguage||(A+=$.relevance),$=$.parent}while($!==i.parent);return i.starts&&p(i.starts,e),r.returnEnd?0:n.length}let w={};function _(o,r){const s=r&&r[0];if(R+=o,null==s)return h(),0;if("begin"===w.type&&"end"===r.type&&w.index===r.index&&""===s){if(R+=t.slice(r.index,r.index+1),!a){const t=new Error(`0 width match regex (${e})`);throw t.languageName=e,t.badRule=w.rule,t}return 1}if(w=r,"begin"===r.type)return function(e){const t=e[0],o=e.rule,i=new n(o),r=[o.__beforeBegin,o["on:begin"]];for(const n of r)if(n&&(n(e,i),i.isMatchIgnored))return f(t);return o.skip?R+=t:(o.excludeBegin&&(R+=t),h(),o.returnBegin||o.excludeBegin||(R=t)),p(o,e),o.returnBegin?0:t.length}(r);if("illegal"===r.type&&!i){const e=new Error('Illegal lexeme "'+s+'" for mode "'+($.scope||"<unnamed>")+'"');throw e.mode=$,e}if("end"===r.type){const e=b(r);if(e!==se)return e}if("illegal"===r.type&&""===s)return R+="\n",1;if(O>1e5&&O>3*r.index)throw new Error("potential infinite loop, way more iterations than matches");return R+=s,s.length}const x=E(e);if(!x)throw q(s.replace("{}",e)),new Error('Unknown language: "'+e+'"');const C=ne(x);let k="",$=r||C;const S={},L=new c.__emitter(c);!function(){const e=[];for(let t=$;t!==x;t=t.parent)t.scope&&e.unshift(t.scope);e.forEach((e=>L.openNode(e)))}();let R="",A=0,j=0,O=0,M=!1;try{if(x.__emitTokens)x.__emitTokens(t,L);else{for($.matcher.considerAll();;){O++,M?M=!1:$.matcher.considerAll(),$.matcher.lastIndex=j;const e=$.matcher.exec(t);if(!e)break;const n=_(t.substring(j,e.index),e);j=e.index+n}_(t.substring(j))}return L.finalize(),k=L.toHTML(),{language:e,value:k,relevance:A,illegal:!1,_emitter:L,_top:$}}catch(n){if(n.message&&n.message.includes("Illegal"))return{language:e,value:re(t),illegal:!0,relevance:0,_illegalBy:{message:n.message,index:j,context:t.slice(j-100,j+100),mode:n.mode,resultSoFar:k},_emitter:L};if(a)return{language:e,value:re(t),illegal:!1,relevance:0,errorRaised:n,_emitter:L,_top:$};throw n}}function y(e,t){t=t||c.languages||Object.keys(o);const n=function(e){const t={value:re(e),illegal:!1,relevance:0,_top:d,_emitter:new c.__emitter(c)};return t._emitter.addText(e),t}(e),i=t.filter(E).filter(k).map((t=>v(t,e,!1)));i.unshift(n);const r=i.sort(((e,t)=>{if(e.relevance!==t.relevance)return t.relevance-e.relevance;if(e.language&&t.language){if(E(e.language).supersetOf===t.language)return 1;if(E(t.language).supersetOf===e.language)return-1}return 0})),[a,s]=r,l=a;return l.secondBest=s,l}function w(e){let t=null;const n=function(e){let t=e.className+" ";t+=e.parentNode?e.parentNode.className:"";const n=c.languageDetectRe.exec(t);if(n){const t=E(n[1]);return t||(J(s.replace("{}",n[1])),J("Falling back to no-highlight mode for this block.",e)),t?n[1]:"no-highlight"}return t.split(/\s+/).find((e=>f(e)||E(e)))}(e);if(f(n))return;if($("before:highlightElement",{el:e,language:n}),e.dataset.highlighted)return void console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.",e);if(e.children.length>0&&(c.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(e)),c.throwUnescapedHTML))throw new ie("One of your code blocks includes unescaped HTML.",e.innerHTML);t=e;const o=t.textContent,r=n?b(o,{language:n,ignoreIllegals:!0}):y(o);e.innerHTML=r.value,e.dataset.highlighted="yes",function(e,t,n){const o=t&&i[t]||n;e.classList.add("hljs"),e.classList.add(`language-${o}`)}(e,n,r.language),e.result={language:r.language,re:r.relevance,relevance:r.relevance},r.secondBest&&(e.secondBest={language:r.secondBest.language,relevance:r.secondBest.relevance}),$("after:highlightElement",{el:e,result:r,text:o})}let _=!1;function x(){if("loading"===document.readyState)return _||window.addEventListener("DOMContentLoaded",(function(){x()}),!1),void(_=!0);document.querySelectorAll(c.cssSelector).forEach(w)}function E(e){return e=(e||"").toLowerCase(),o[e]||o[i[e]]}function C(e,{languageName:t}){"string"==typeof e&&(e=[e]),e.forEach((e=>{i[e.toLowerCase()]=t}))}function k(e){const t=E(e);return t&&!t.disableAutodetect}function $(e,t){const n=e;r.forEach((function(e){e[n]&&e[n](t)}))}Object.assign(e,{highlight:b,highlightAuto:y,highlightAll:x,highlightElement:w,highlightBlock:function(e){return Y("10.7.0","highlightBlock will be removed entirely in v12.0"),Y("10.7.0","Please use highlightElement now."),w(e)},configure:function(e){c=ae(c,e)},initHighlighting:()=>{x(),Y("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")},initHighlightingOnLoad:function(){x(),Y("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")},registerLanguage:function(t,n){let i=null;try{i=n(e)}catch(e){if(q("Language definition for '{}' could not be registered.".replace("{}",t)),!a)throw e;q(e),i=d}i.name||(i.name=t),o[t]=i,i.rawDefinition=n.bind(null,e),i.aliases&&C(i.aliases,{languageName:t})},unregisterLanguage:function(e){delete o[e];for(const t of Object.keys(i))i[t]===e&&delete i[t]},listLanguages:function(){return Object.keys(o)},getLanguage:E,registerAliases:C,autoDetection:k,inherit:ae,addPlugin:function(e){!function(e){e["before:highlightBlock"]&&!e["before:highlightElement"]&&(e["before:highlightElement"]=t=>{e["before:highlightBlock"](Object.assign({block:t.el},t))}),e["after:highlightBlock"]&&!e["after:highlightElement"]&&(e["after:highlightElement"]=t=>{e["after:highlightBlock"](Object.assign({block:t.el},t))})}(e),r.push(e)},removePlugin:function(e){const t=r.indexOf(e);-1!==t&&r.splice(t,1)}}),e.debugMode=function(){a=!1},e.safeMode=function(){a=!0},e.versionString="11.11.1",e.regex={concat:p,lookahead:h,either:m,optional:g,anyNumberOfTimes:u};for(const e in z)"object"==typeof z[e]&&t(z[e]);return Object.assign(e,z),e},le=de({});le.newInstance=()=>de({}),e.exports=le,le.HighlightJS=le,le.default=le}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}(()=>{"use strict";const e=n(416),t="[A-Za-z$_][0-9A-Za-z$_]*",o=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends","using"],i=["true","false","null","undefined","NaN","Infinity"],r=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],a=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],s=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],d=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],l=[].concat(s,r,a);e.registerLanguage("javascript",(function(e){const n=e.regex,c=t,h={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(e,t)=>{const n=e[0].length+e.index,o=e.input[n];if("<"===o||","===o)return void t.ignoreMatch();let i;">"===o&&(((e,{after:t})=>{const n="</"+e[0].slice(1);return-1!==e.input.indexOf(n,t)})(e,{after:n})||t.ignoreMatch());const r=e.input.substring(n);((i=r.match(/^\s*=/))||(i=r.match(/^\s+extends\s+/))&&0===i.index)&&t.ignoreMatch()}},u={$pattern:t,keyword:o,literal:i,built_in:l,"variable.language":d},g="[0-9](_?[0-9])*",p=`\\.(${g})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",f={className:"number",variants:[{begin:`(\\b(${m})((${p})|\\.)?|(${p}))[eE][+-]?(${g})\\b`},{begin:`\\b(${m})\\b((${p})\\b|\\.)?|(${p})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},b={className:"subst",begin:"\\$\\{",end:"\\}",keywords:u,contains:[]},v={begin:".?html`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"xml"}},y={begin:".?css`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"css"}},w={begin:".?gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"graphql"}},_={className:"string",begin:"`",end:"`",contains:[e.BACKSLASH_ESCAPE,b]},x={className:"comment",variants:[e.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:c+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),e.C_BLOCK_COMMENT_MODE,e.C_LINE_COMMENT_MODE]},E=[e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,v,y,w,_,{match:/\$\d+/},f];b.contains=E.concat({begin:/\{/,end:/\}/,keywords:u,contains:["self"].concat(E)});const C=[].concat(x,b.contains),k=C.concat([{begin:/(\s*)\(/,end:/\)/,keywords:u,contains:["self"].concat(C)}]),$={className:"params",begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:u,contains:k},S={variants:[{match:[/class/,/\s+/,c,/\s+/,/extends/,/\s+/,n.concat(c,"(",n.concat(/\./,c),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,c],scope:{1:"keyword",3:"title.class"}}]},L={relevance:0,match:n.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...r,...a]}},R={variants:[{match:[/function/,/\s+/,c,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[$],illegal:/%/},A={match:n.concat(/\b/,(j=[...s,"super","import"].map((e=>`${e}\\s*\\(`)),n.concat("(?!",j.join("|"),")")),c,n.lookahead(/\s*\(/)),className:"title.function",relevance:0};var j;const O={begin:n.concat(/\./,n.lookahead(n.concat(c,/(?![0-9A-Za-z$_(])/))),end:c,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},M={match:[/get|set/,/\s+/,c,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},$]},T="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+e.UNDERSCORE_IDENT_RE+")\\s*=>",N={match:[/const|var|let/,/\s+/,c,/\s*/,/=\s*/,/(async\s*)?/,n.lookahead(T)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[$]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:u,exports:{PARAMS_CONTAINS:k,CLASS_REFERENCE:L},illegal:/#(?![$_A-z])/,contains:[e.SHEBANG({label:"shebang",binary:"node",relevance:5}),{label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,v,y,w,_,x,{match:/\$\d+/},f,L,{scope:"attr",match:c+n.lookahead(":"),relevance:0},N,{begin:"("+e.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[x,e.REGEXP_MODE,{className:"function",begin:T,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:e.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:u,contains:k}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:"<>",end:"</>"},{match:/<[A-Za-z0-9\\._:-]+\s*\/>/},{begin:h.begin,"on:begin":h.isTrulyOpeningTag,end:h.end}],subLanguage:"xml",contains:[{begin:h.begin,end:h.end,skip:!0,contains:["self"]}]}]},R,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+e.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[$,e.inherit(e.TITLE_MODE,{begin:c,className:"title.function"})]},{match:/\.\.\./,relevance:0},O,{match:"\\$"+c,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[$]},A,{relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"},S,M,{match:/\$[(.]/}]}})),e.registerLanguage("xml",(function(e){const t=e.regex,n=t.concat(/[\p{L}_]/u,t.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),o={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},i={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},r=e.inherit(i,{begin:/\(/,end:/\)/}),a=e.inherit(e.APOS_STRING_MODE,{className:"string"}),s=e.inherit(e.QUOTE_STRING_MODE,{className:"string"}),d={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:/[\p{L}0-9._:-]+/u,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[o]},{begin:/'/,end:/'/,contains:[o]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[i,s,a,r,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[i,r,s,a]}]}]},e.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},o,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[s]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[d],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[d],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:t.concat(/</,t.lookahead(t.concat(n,t.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:n,relevance:0,starts:d}]},{className:"tag",begin:t.concat(/<\//,t.lookahead(t.concat(n,/>/))),contains:[{className:"name",begin:n,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}})),e.registerLanguage("bash",(function(e){const t=e.regex,n={},o={begin:/\$\{/,end:/\}/,contains:["self",{begin:/:-/,contains:[n]}]};Object.assign(n,{className:"variable",variants:[{begin:t.concat(/\$[\w\d#@][\w\d_]*/,"(?![\\w\\d])(?![$])")},o]});const i={className:"subst",begin:/\$\(/,end:/\)/,contains:[e.BACKSLASH_ESCAPE]},r=e.inherit(e.COMMENT(),{match:[/(^|\s)/,/#.*$/],scope:{2:"comment"}}),a={begin:/<<-?\s*(?=\w+)/,starts:{contains:[e.END_SAME_AS_BEGIN({begin:/(\w+)/,end:/(\w+)/,className:"string"})]}},s={className:"string",begin:/"/,end:/"/,contains:[e.BACKSLASH_ESCAPE,n,i]};i.contains.push(s);const d={begin:/\$?\(\(/,end:/\)\)/,contains:[{begin:/\d+#[0-9a-f]+/,className:"number"},e.NUMBER_MODE,n]},l=e.SHEBANG({binary:`(${["fish","bash","zsh","sh","csh","ksh","tcsh","dash","scsh"].join("|")})`,relevance:10}),c={className:"function",begin:/\w[\w\d_]*\s*\(\s*\)\s*\{/,returnBegin:!0,contains:[e.inherit(e.TITLE_MODE,{begin:/\w[\w\d_]*/})],relevance:0};return{name:"Bash",aliases:["sh","zsh"],keywords:{$pattern:/\b[a-z][a-z0-9._-]+\b/,keyword:["if","then","else","elif","fi","time","for","while","until","in","do","done","case","esac","coproc","function","select"],literal:["true","false"],built_in:["break","cd","continue","eval","exec","exit","export","getopts","hash","pwd","readonly","return","shift","test","times","trap","umask","unset","alias","bind","builtin","caller","command","declare","echo","enable","help","let","local","logout","mapfile","printf","read","readarray","source","sudo","type","typeset","ulimit","unalias","set","shopt","autoload","bg","bindkey","bye","cap","chdir","clone","comparguments","compcall","compctl","compdescribe","compfiles","compgroups","compquote","comptags","comptry","compvalues","dirs","disable","disown","echotc","echoti","emulate","fc","fg","float","functions","getcap","getln","history","integer","jobs","kill","limit","log","noglob","popd","print","pushd","pushln","rehash","sched","setcap","setopt","stat","suspend","ttyctl","unfunction","unhash","unlimit","unsetopt","vared","wait","whence","where","which","zcompile","zformat","zftp","zle","zmodload","zparseopts","zprof","zpty","zregexparse","zsocket","zstyle","ztcp","chcon","chgrp","chown","chmod","cp","dd","df","dir","dircolors","ln","ls","mkdir","mkfifo","mknod","mktemp","mv","realpath","rm","rmdir","shred","sync","touch","truncate","vdir","b2sum","base32","base64","cat","cksum","comm","csplit","cut","expand","fmt","fold","head","join","md5sum","nl","numfmt","od","paste","ptx","pr","sha1sum","sha224sum","sha256sum","sha384sum","sha512sum","shuf","sort","split","sum","tac","tail","tr","tsort","unexpand","uniq","wc","arch","basename","chroot","date","dirname","du","echo","env","expr","factor","groups","hostid","id","link","logname","nice","nohup","nproc","pathchk","pinky","printenv","printf","pwd","readlink","runcon","seq","sleep","stat","stdbuf","stty","tee","test","timeout","tty","uname","unlink","uptime","users","who","whoami","yes"]},contains:[l,e.SHEBANG(),c,d,r,a,{match:/(\/[a-z._-]+)+/},s,{match:/\\"/},{className:"string",begin:/'/,end:/'/},{match:/\\'/},n]}}));var c=n(390);class h{constructor(e,t={}){this.styles=e,this.classes={},this.uid=0,["idPrefix","generateId","generateClassName","attributes","renderers"].forEach((e=>{e in t&&(this[e]=t[e])})),this.id||(this.id=this.attributes&&this.attributes.id||this.generateId()),Object.keys(e).forEach((e=>{e.match(h.classRegex)&&(this.classes[e]=this.generateClassName(e))}))}generateId(){return`${this.idPrefix||h.prefix}-${++h.uid}`}generateClassName(e){return`${this.id}-${e}-${++this.uid}`}isBrowser(){return"undefined"!=typeof document}render(){return((...e)=>e.reduce(((e,t)=>(...n)=>e(t(...n)))))(...(this.renderers||["renderStyles","parseStyles"]).map((e=>("string"==typeof e?this[e]:e).bind(this))))(this.styles)}renderStyles(e,t=1){return Object.keys(e).reduce(((n,o)=>{const i=e[o];let r="",a="",s="";if(h.debug&&(r=h.indent.repeat(t),a="\n",s=" "),i.constructor===Object){if(Object.keys(i).length>0){const e=this.renderStyles(i,t+1);n.push(`${r}${o}${s}{${a}${e}${r}}${a}`)}}else n.push(`${r}${o}:${s}${i};${a}`);return n}),[]).join("")}parseStyles(e,t,n,o){const i=e=>e in this.classes?`.${this.classes[e]}`:e,r=e=>o&&n?`${n} ${e}`:e.match(h.globalPrefixRegex)?`${n?`${n} `:""}${e.replace(h.globalPrefixRegex,"")}`:i(e).replace(h.referenceRegex,((e,t)=>i(t))).replace(h.nestedRegex,n);return Object.keys(e).reduce(((o,i)=>{const a=e[i];if(a.constructor===Object)if(i.match(h.globalRegex))Object.assign(t||o,this.parseStyles(a,o,n,!0));else if((i.match(h.nestedRegex)||i.match(h.globalPrefixRegex))&&t){const e=r(i);t[e]={},Object.assign(t[e],this.parseStyles(a,t,e))}else{const e=r(i);o[e]={},Object.assign(o[e],this.parseStyles(a,o,e))}else o[i.includes("-")?i:(s=i,s.replace(/([A-Z])/g,(e=>`-${e[0].toLowerCase()}`)))]=a;var s;return o}),{})}toString(){const e=Object.assign({},this.attributes,{id:this.id}),t=Object.keys(e).map((t=>` ${t}="${e[t]}"`)),n=h.debug?"\n":"";return`<style${t.join("")}>${n}${this.render()}</style>${n}`}attach(){if(-1==h.registry.indexOf(this)&&h.registry.push(this),this.isBrowser()&&!document.getElementById(this.id)){const e=document.createElement("template");e.innerHTML=this.toString(),this.el=e.content.firstElementChild,document.head.appendChild(this.el)}return this}destroy(){const e=h.registry.indexOf(this);return e>-1&&h.registry.splice(e,1),this.isBrowser()&&this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null),this}static toString(){return h.registry.join("")}static attach(){h.registry.forEach((e=>e.attach()))}static destroy(){h.registry.forEach((e=>e.destroy()))}}h.classRegex=/^\w+$/,h.globalRegex=/^@global$/,h.globalPrefixRegex=/^@global\s+/,h.referenceRegex=/\$(\w+)/g,h.nestedRegex=/&/g,h.prefix="fun",h.indent="    ",h.registry=[],h.uid=0,h.debug=!1;var u=["#f8f9fa","#f1f3f5","#e9ecef","#dee2e6","#ced4da","#adb5bd","#868e96","#495057","#343a40","#212529"],g=["#e7f5ff","#d0ebff","#a5d8ff","#74c0fc","#4dabf7","#339af0","#228be6","#1c7ed6","#1971c2","#1864ab"],p=["#f3f0ff","#e5dbff","#d0bfff","#b197fc","#9775fa","#845ef7","#7950f2","#7048e8","#6741d9","#5f3dc4"],m=["#fff5f5","#ffe3e3","#ffc9c9","#ffa8a8","#ff8787","#ff6b6b","#fa5252","#f03e3e","#e03131","#c92a2a"],f=["#fff9db","#fff3bf","#ffec99","#ffe066","#ffd43b","#fcc419","#fab005","#f59f00","#f08c00","#e67700"],b=["#ebfbee","#d3f9d8","#b2f2bb","#8ce99a","#69db7c","#51cf66","#40c057","#37b24d","#2f9e44","#2b8a3e"],v="#000000",y="#ffffff";const w=(e,t="xs",n="xl")=>{const o=["xs","sm","md","lg","xl","xxl","xxxl","xxxxl"];return o.slice(o.indexOf(t),o.indexOf(n)+1).reduce(((t,n,o)=>(Object.assign(t,e(n,o)),t)),{})},_=(e,t,n)=>w(((t,n)=>({[t]:e(t,n)})),t,n),x=e=>`@media (min-width: ${{sm:640,md:768,lg:1024,xl:1280,xxl:1536}[e]}px)`,E=e=>["primary","secondary","neutral","error","warning","success"].reduce(((t,n)=>(Object.assign(t,e(n)),t)),{}),C=(e,t,n,o)=>{const i=(t,i)=>({main:t(n[o]),light:t(n[o+-2]),dark:t(n[o+2]),contrastMain:t(o<6?v:y),contrastLight:t(o+-2<6?v:y),contrastDark:t(o+2<6?v:y),foregroundMain:t("light"===e?n[9]:n[2]),foregroundLight:t("light"===e?n[8]:y),foregroundDark:t("light"===e?v:n[3]),backgroundMain:t("light"===e?n[1]:n[8]),backgroundLight:t("light"===e?n[0]:n[7]),backgroundDark:t("light"===e?n[2]:n[9]),level1:"light"===e?`var(--rui-palette-${i}-light)`:`var(--rui-palette-${i}-dark)`,level2:`var(--rui-palette-${i}-main)`,level3:"light"===e?`var(--rui-palette-${i}-dark)`:`var(--rui-palette-${i}-light)`,contrastLevel1:"light"===e?`var(--rui-palette-${i}-contrastLight)`:`var(--rui-palette-${i}-contrastDark)`,contrastLevel2:`var(--rui-palette-${i}-contrastMain)`,contrastLevel3:"light"===e?`var(--rui-palette-${i}-contrastDark)`:`var(--rui-palette-${i}-contrastLight)`,foregroundLevel1:"light"===e?`var(--rui-palette-${i}-foregroundDark)`:`var(--rui-palette-${i}-foregroundLight)`,foregroundLevel2:`var(--rui-palette-${i}-foregroundMain)`,foregroundLevel3:"light"===e?`var(--rui-palette-${i}-foregroundLight)`:`var(--rui-palette-${i}-foregroundDark)`,backgroundLevel1:"light"===e?`var(--rui-palette-${i}-backgroundLight)`:`var(--rui-palette-${i}-backgroundDark)`,backgroundLevel2:`var(--rui-palette-${i}-backgroundMain)`,backgroundLevel3:"light"===e?`var(--rui-palette-${i}-backgroundDark)`:`var(--rui-palette-${i}-backgroundLight)`});return{...i((e=>e),t),rgb:i((e=>(e=>{const t=e.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:null})(e).join(" ")),`${t}-rgb`)}},k=e=>"light"===e?{black:v,white:y,primary:C("light","primary",g,7),secondary:C("light","secondary",p,7),neutral:C("light","neutral",u,7),error:C("light","error",m,7),warning:C("light","warning",f,7),success:C("light","success",b,7)}:{black:v,white:y,primary:C("dark","primary",g,3),secondary:C("dark","secondary",p,3),neutral:C("dark","neutral",u,3),error:C("dark","error",m,3),warning:C("dark","warning",f,3),success:C("dark","success",b,3)},$=e=>{const t="0 0 #000",n="light"===e?"21 21 21":"0 0 0",o="light"===e?"0.2":"0.4";return{xs:`${t}, 0px 1px 2px 0px rgb(${n} / ${o})`,sm:`${t}, 0px 1px 2px 0px rgb(${n} / ${o}), 0px 2px 4px 0px rgb(${n} / ${o})`,md:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 6px 12px -2px rgb(${n} / ${o})`,lg:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 12px 16px -4px rgb(${n} / ${o})`,xl:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 20px 24px -4px rgb(${n} / ${o})`}},S=(_(((e,t)=>`${["0.75","0.875","1","1.125","1.25","1.5","1.875","2.25"][t]}rem`),"xs","xxxxl"),_(((e,t)=>200+100*(t+1))),_(((e,t)=>["1.33334","1.42858","1.5","1.55556","1.66667"][t])),_(((e,t)=>2+2*(t+1)+"px")),_(((e,t)=>4*(t+1)+"px"),"xs","xxxxl"),k("light"),$("light"),k("dark"),$("dark"),(e,t)=>((...e)=>new h(...e).attach())(e,{idPrefix:"rui",...t})),L=S({root:{display:"inline-flex",alignItems:"center",justifyContent:"space-evenly",borderRadius:"var(--rui-borderRadius-xs)",padding:"var(--rui-spacing-sm)",maxHeight:"100%",fontFamily:"var(--rui-typography-button-fontFamily)",fontWeight:"var(--rui-typography-button-fontWeight)",fontSize:"var(--rui-typography-button-fontSize)",lineHeight:"var(--rui-typography-button-lineHeight)",textTransform:"var(--rui-typography-button-textTransform)",textDecoration:"var(--rui-typography-button-textDecoration)",transition:"background-color 0.1s, color 0.1s, border-color 0.1s","&>svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"&>svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"&>svg:only-child":{padding:"0"}},...E((e=>({[e]:{}}))),disabled:{},solid:{...E((e=>({[`&$${e}`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-main)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-dark)`,border:`1px solid var(--rui-palette-${e}-dark)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`}}}})))},outlined:{...E((e=>({[`&$${e}`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-main)`,backgroundColor:"transparent","&:hover":{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-light) / 0.2)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,border:`1px solid rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,backgroundColor:"transparent"}}}})))},plain:{...E((e=>({[`&$${e}`]:{border:"none",background:"transparent",color:`var(--rui-palette-${e}-main)`,"&:hover":{color:`var(--rui-palette-${e}-dark)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`}}}})))},group:{"&:not(:first-child)":{marginLeft:-1,...E((e=>({[`&$solid$${e}`]:{borderLeftColor:`var(--rui-palette-${e}-dark)`}})))},"&:not(:first-child):not(:last-child)":{borderRadius:"0"},"&:first-child":{borderTopRightRadius:"0",borderBottomRightRadius:"0"},"&:last-child":{borderTopLeftRadius:"0",borderBottomLeftRadius:"0"}},lg:{fontSize:"var(--rui-fontSize-xl)"},sm:{fontSize:"var(--rui-fontSize-xs)"}}),R=c.uA.create`
    <button
        class="${({options:e})=>(e=>{const t=e.classes?{...L.classes,...e.classes}:L.classes;return[e.className||null,t.root,t[e.size||"md"],t[e.variant||"solid"],t[e.color||"neutral"],e.disabled?t.disabled:null,e.group?t.group:null].join(" ")})(e)}"
        onClick="${{"&":(e,t)=>t.options.onClick&&t.options.onClick(e,t)}}"
        href="${({options:e})=>e.href||!1}"
        type="${({options:e})=>e.type||!1}"
        value="${({options:e})=>e.type&&e.label||!1}"
        disabled="${({options:e})=>e.disabled||!1}"
        target="${({options:e})=>e.target||!1}"
        title="${({options:e})=>e.title||!1}"
    >
        ${e=>e.renderChildren()}
    </button>
`.extend({onCreate:function(){this.options.href?this.tag="a":this.options.type&&(this.tag="input")},renderChildren:function(){return this.options.type?null:this.options.renderChildren&&this.options.renderChildren()||[this.options.renderLeftIcon&&this.options.renderLeftIcon(),`<span>${this.options.label}</span>`,this.options.renderRightIcon&&this.options.renderRightIcon()]}}),A=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),j=S({root:{color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-md) 0"},h1:A("h1"),h2:A("h2"),h3:A("h3"),h4:A("h4"),titleLg:A("titleLg"),titleMd:A("titleMd"),titleSm:A("titleSm"),bodyLg:A("bodyLg"),bodyMd:A("bodyMd"),bodySm:A("bodySm"),caption:A("caption")}),O=c.uA.create`
    <p class="${({options:e})=>(e=>{const t=e.classes?{...j.classes,...e.classes}:j.classes;return[e.className||null,t.root,t[e.level||"bodyMd"]].join(" ")})(e)}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()||e.text}
    </p>
`.extend({preinitialize:function(e){switch(e.level){case"h1":this.tag="h1";break;case"h2":case"titleLg":case"titleMd":case"titleSm":this.tag="h2";break;case"h3":this.tag="h3";break;case"h4":this.tag="h4";break;default:this.tag="p"}}}),M=e=>`\n    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">\n        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>\n    </svg>\n`,T=e=>`\n    <svg class="${e}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 32 32">\n        <path d="M 0 10 L 0 21 L 9 21 L 9 23 L 16 23 L 16 21 L 32 21 L 32 10 L 0 10 z M 1.7773438 11.777344 L 8.8886719 11.777344 L 8.890625 11.777344 L 8.890625 19.445312 L 7.1113281 19.445312 L 7.1113281 13.556641 L 5.3339844 13.556641 L 5.3339844 19.445312 L 1.7773438 19.445312 L 1.7773438 11.777344 z M 10.667969 11.777344 L 17.777344 11.777344 L 17.779297 11.777344 L 17.779297 19.443359 L 14.222656 19.443359 L 14.222656 21.222656 L 10.667969 21.222656 L 10.667969 11.777344 z M 19.556641 11.777344 L 30.222656 11.777344 L 30.224609 11.777344 L 30.224609 19.445312 L 28.445312 19.445312 L 28.445312 13.556641 L 26.667969 13.556641 L 26.667969 19.445312 L 24.890625 19.445312 L 24.890625 13.556641 L 23.111328 13.556641 L 23.111328 19.445312 L 19.556641 19.445312 L 19.556641 11.777344 z M 14.222656 13.556641 L 14.222656 17.667969 L 16 17.667969 L 16 13.556641 L 14.222656 13.556641 z"></path>\n    </svg>\n`,{classes:N}=S({root:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",flexDirection:"column",backgroundColor:"var(--rui-palette-neutral-backgroundLevel3)",boxShadow:"var(--rui-shadow-sm)",padding:"0 var(--rui-spacing-xl)",overflow:"hidden","@global":{h1:{textAlign:"center",margin:"var(--rui-app-appBarHeight) 0 0 0"},h2:{color:"var(--rui-palette-neutral-foregroundLevel2)",marginTop:0,marginBottom:"var(--rui-spacing-sm)"},h4:{color:"var(--rui-palette-neutral-foregroundLevel3)",marginBottom:"var(--rui-spacing-md)"},"h1 img":{width:"90%"},pre:{maxWidth:"100%"},code:{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"}}},buttons:{"& a":{margin:"var(--rui-spacing-md) var(--rui-spacing-xs)"},display:"flex",justifyContent:"center"},[x("sm")]:{"$root h1":{margin:"var(--rui-app-appBarHeight) 0 0 0"},"$root h2":{marginBottom:"var(--rui-spacing-xl)"},"$root h4":{marginBottom:"var(--rui-spacing-xxl)"},"$root h1 img":{width:"75%"},"$buttons a":{margin:"var(--rui-spacing-xxxl) var(--rui-spacing-lg)"}},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-secondary-main)"},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),I=c.uA.create`
    <section class="${N.root}">
        <h1>
            <img class="${N.hiddenIfLight}" alt="Rasti.js" src="/logo-dark.svg">
            <img class="${N.hiddenIfDark}" alt="Rasti.js" src="/logo.svg">
        </h1>
        ${()=>O.mount({level:"h2",text:"Modern MVC for building user interfaces"})}
        ${'<pre><code class="javascript language-javascript">\nconst model = new Model({ value : 0 });\n\nconst Counter = Component.create`\n    &lt;div\n        onClick=${{\n            \'button.up\' : () => model.value++,\n            \'button.down\' : () => model.value--,\n        }}\n    &gt;\n        &lt;div&gt;Counter: ${() => model.value}&lt;/div&gt;\n        &lt;button class="up"&gt;Increment&lt;/button&gt;\n        &lt;button class="down"&gt;Decrement&lt;/button&gt;\n    &lt;/div&gt;\n`;\n\nCounter.mount({ model }, document.body);\n</code></pre>'}
        <div class="${N.buttons}">
            ${()=>R.mount({label:"Getting Started",color:"primary",variant:"outlined",href:"#gettingstarted"})}
            ${()=>R.mount({label:"GitHub",color:"secondary",variant:"outlined",href:"https://github.com/8tentaculos/rasti",target:"_blank",renderLeftIcon:()=>M(N.icon)})}
        </div>
    </section>
`,{classes:D}=S({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)"}}),z=c.uA.create`
    <div class="${D.root}">
        ${()=>O.mount({level:"h4",text:"<strong>Rasti</strong> is a lightweight MVC library for building fast, reactive user interfaces.<br> Inspired by <strong>Backbone.js</strong>, it retains a familiar API while removing non-essential features and introducing modern, declarative, and composable components to simplify complex UI development."})}
    </div>
`,P=e=>e.charAt(0).toUpperCase()+e.slice(1),H=S({root:{borderRadius:"var(--rui-borderRadius-xs)",padding:"var(--rui-spacing-md)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",fontFamily:"var(--rui-fontFamily-body)",fontSize:"var(--rui-fontSize-bodyMd)"},...E((e=>({[e]:{color:`var(--rui-palette-${e}-foregroundMain)`}}))),outlined:{...E((e=>({[`&$${e}`]:{border:`1px solid rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`}})))},solid:{...E((e=>({[`&$${e}`]:{backgroundColor:`var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-contrastMain)`}})))},...w((e=>({[`shadow${P(e)}`]:{boxShadow:`var(--rui-shadow-${e})`}})))}),B=c.uA.create`
    <section class="${({options:e})=>(e=>{const t=e.classes?{...H.classes,...e.classes}:H.classes;return[e.className||null,t.root,t[e.variant||"outlined"],t[e.color||"neutral"],e.shadow?t[`shadow${P(e.shadow)}`]:null].join(" ")})(e)}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </section>
`,W=S({root:{position:"fixed",top:0,right:0,bottom:0,left:0,display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"rgb(var(--rui-palette-neutral-rgb-level3) / 0.1)",zIndex:1e3,padding:"var(--rui-spacing-md)"},modal:{position:"relative",padding:"var(--rui-spacing-xs)"},left:{justifyContent:"flex-start"},right:{justifyContent:"flex-end"},top:{alignItems:"flex-start"},bottom:{alignItems:"flex-end"},header:{display:"flex",justifyContent:"flex-end",marginBottom:"var(--rui-spacing-sm)","& button":{margin:0,padding:0,borderRadius:"50%"}},content:{padding:"var(--rui-spacing-sm)",marginBottom:"var(--rui-spacing-md)"},footer:{display:"flex",justifyContent:"space-evenly",marginBottom:"var(--rui-spacing-sm)"}}),F=c.uA.create`
    <div class="${({options:e})=>K(e).header}">
        ${({options:e})=>R.mount({renderChildren:()=>'\n    <svg class="undefined" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">\n        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>\n    </svg>\n',onClick:e.handleClose&&e.handleClose,color:"neutral",variant:"outlined",size:"sm"})}
    </div>
`,U=c.uA.create`
    <div class="${({options:e})=>K(e).content}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </div>
`,V=c.uA.create`
    <div class="${({options:e})=>K(e).footer}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </div>
`,K=e=>e.classes?{...W.classes,...e.classes}:W.classes,Z=({variant:e,color:t,shadow:n})=>({variant:e,color:t,shadow:n}),G=c.uA.create`
    <div
        class="${({options:e})=>(e=>{const t=K(e);return[e.className||null,t.root,e.top?t.top:null,e.bottom?t.bottom:null,e.left?t.left:null,e.right?t.right:null].join(" ")})(e)}"
        onClick=${{"&":function(e){this.options.handleClose&&e.target===this.el&&this.options.handleClose()}}}
    >
        ${({options:e})=>B.mount({...Z(e),className:K(e).modal,renderChildren:e.renderChildren?e.renderChildren:()=>[e.handleClose?F.mount(e):null,U.mount({...e,renderChildren:e.renderContent}),e.renderButtons?V.mount({...e,renderChildren:e.renderButtons}):null]})}
    </div>
`,{classes:X}=S({root:{display:"flex",justifyContent:"right",alignItems:"center",height:"60px","& ul":{padding:0}},icon:{width:"24px",height:"24px",cursor:"pointer",fill:"var(--rui-palette-neutral-main)","&:hover":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),q=c.uA.create`
    <div class="${X.root}">
        <ul>
            <li class="${X.hiddenIfDark}">
                ${()=>R.mount({variant:"plain",renderChildren:()=>`\n    <svg class="${X.icon}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">\n        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"/>\n    </svg>\n`,onClick:()=>document.documentElement.setAttribute("data-color-scheme","dark")})}
            </li>
            <li class="${X.hiddenIfLight}">
                ${()=>R.mount({variant:"plain",renderChildren:()=>`\n    <svg class="${X.icon}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">\n        <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd"/>\n    </svg>\n`,onClick:()=>document.documentElement.setAttribute("data-color-scheme","light")})}
            </li>
        </ul>
    </div>
`,{classes:J}=S({root:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"var(--rui-app-appBarHeight)",position:"fixed",top:0,left:0,right:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",boxShadow:"var(--rui-shadow-sm)","& nav":{maxWidth:"100%",display:"flex",justifyContent:"flex-end",alignItems:"center","& ul":{display:"flex",justifyContent:"center",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"0 var(--rui-spacing-xs)"}}},"& nav$left":{flexGrow:1,justifyContent:"flex-start","& ul":{justifyContent:"flex-start"}},"& nav$lg":{display:"none"}},[x("sm")]:{"$root nav$lg":{display:"flex"},"$root li$sm":{display:"none"}},left:{},sm:{},lg:{},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-neutral-main)","a:hover &":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"},menuContent:{"& nav":{maxWidth:"100%",display:"flex",justifyContent:"flex-end",alignItems:"center","& ul":{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"var(--rui-spacing-xs)"}}}}}),Y=c.uA.create`
    <div class="${J.menuContent}">
        ${({options:e})=>["<nav><ul><li>",R.mount({href:"/api/",onClick:t=>{t.preventDefault(),e.handleNavigate("/api/"),e.handleOpen(!1)},label:"API",variant:"plain"}),"</li><li>",R.mount({href:"https://plnkr.co/edit/hLIWLlAHGsE2ojO1?preview",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"Playground",variant:"plain"}),"</li><li>",R.mount({href:"https://github.com/8tentaculos/rasti",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"GitHub",variant:"plain",renderLeftIcon:()=>M(J.icon)}),"</li><li>",R.mount({href:"https://www.npmjs.com/package/rasti",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"npm",variant:"plain",renderLeftIcon:()=>T(J.icon)}),"</li></ul></nav>"]}
    </div>
`,Q=c.uA.create`
    <div class="">
        ${({options:e})=>R.mount({renderChildren:()=>'\n    <svg class="undefined" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">\n        <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>\n    </svg>\n',color:"primary",variant:"plain",size:"lg",onClick:()=>e.handleOpen(!0)})}
        ${({options:e})=>e.open?G.mount({handleClose:()=>e.handleOpen(!1),renderContent:e.renderContent,shadow:"lg"}):null}
    </div>
`,ee=c.uA.create`
    <div class="${J.root}">
        <nav class="${J.left}">
            <ul>
                <li>
                    ${({options:e})=>R.mount({href:"/",onClick:t=>{t.preventDefault(),e.handleNavigate("/")},variant:"plain",renderChildren:()=>`\n                            <span>\n                                <img height="24" class="${J.hiddenIfLight}" alt="Rasti.js" src="/logo-dark.svg">\n                                <img height="24" class="${J.hiddenIfDark}" alt="Rasti.js" src="/logo.svg">\n                            </span>\n                        `})}
                </li>
            </ul>
        </nav>
        <nav class="${J.lg}">
            <ul>
                <li>
                    ${({options:e})=>R.mount({href:"/api/",onClick:t=>{t.preventDefault(),e.handleNavigate("/api/")},label:"API",variant:"plain"})}
                </li>
                <li>
                    ${()=>R.mount({href:"https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010",target:"_blank",label:"Playground",variant:"plain"})}
                </li>
                <li>
                    ${()=>R.mount({href:"https://github.com/8tentaculos/rasti",target:"_blank",variant:"plain",renderChildren:()=>M(J.icon)})}
                </li>
                <li>
                    ${()=>R.mount({href:"https://www.npmjs.com/package/rasti",target:"_blank",variant:"plain",renderChildren:()=>T(J.icon)})}
                </li>
            </ul>
        </nav>
        <nav>
            <ul>
                <li>
                    ${()=>q.mount()}
                </li>
                <li class="${J.sm}">
                    ${e=>Q.mount({open:e.state.open,handleOpen:t=>{e.state.open=t},renderContent:()=>Y.mount({handleNavigate:e.options.handleNavigate,handleOpen:t=>{e.state.open=t}})})}
                </li>
            </ul>
        </nav>
    </div>
`.extend({preinitialize(){this.state=new c.Kx({open:!1})}}),te=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:ne}=S({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-dark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...te("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...te("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"center","& section":{"& h5":{margin:"var(--rui-spacing-xs) 0",padding:"0"},margin:"var(--rui-spacing-md)"}},[x("md")]:{$root:{justifyContent:"space-between"},"$root section":{maxWidth:"400px"}}}),oe=c.uA.create`
            <section class="${({options:e})=>(e=>[e.className||null,ne.root].join(" "))(e)}">${()=>[B.mount({shadow:"md",renderChildren:()=>'<h5 id="declarativecomponentsbuilddynamicuicomponentsusingintuitivetemplateliterals">🌟 Declarative Components: Build dynamic UI components using intuitive template literals.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="eventdelegationsimplifyeventhandlingwithbuiltindelegation">🎯 Event Delegation: Simplify event handling with built-in delegation.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="modelviewbindingkeepyouruianddatainsyncwithease">🔗 Model-View Binding: Keep your UI and data in sync with ease.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="serversiderenderingrenderasplaintextforserversideuseorstaticbuilds">🌐 Server-Side Rendering: Render as plain text for server-side use or static builds.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="lightweightandfastminimaloverheadwithefficientrendering">⚡ Lightweight and Fast: Minimal overhead with efficient rendering.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="legacycompatibilityseamlesslyintegratesintoexistingbackbonejsprojects">🕰️ Legacy Compatibility: Seamlessly integrates into existing Backbone.js projects.</h5>'}),B.mount({shadow:"md",renderChildren:()=>'<h5 id="standardsbasedbuiltonmodernwebstandardsnotoolingrequired">📐 Standards-Based: Built on modern web standards, no tooling required.</h5>'})]}</section>
        `,ie=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:re}=S({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-dark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...ie("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...ie("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}}}}),ae=c.uA.create`
            <section class="${({options:e})=>(e=>[e.className||null,re.root].join(" "))(e)}"><h2 id="gettingstarted">Getting Started</h2>
<h3 id="usingnpm">Using npm</h3>
<pre><code class="bash language-bash">\$ npm install rasti
</code></pre>
<pre><code class="javascript language-javascript">import \{ Model, Component \} from 'rasti';
</code></pre>
<h3 id="usingesmodules">Using ES modules</h3>
<pre><code class="javascript language-javascript">import \{ Model, Component \} from 'https://esm.run/rasti';
</code></pre>
<h3 id="usingscripttag">Using <code>&lt;script&gt;</code> tag</h3>
<pre><code class="html language-html">&lt;script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js"&gt;&lt;/script&gt;
</code></pre>
<pre><code class="javascript language-javascript">const \{ Model, Component \} = Rasti;
</code></pre>
<h3 id="asimplecomponent">A simple <code>Component</code></h3>
<pre><code class="javascript language-javascript">// Create Timer component.
const Timer = Component.create\`
    &lt;div&gt;
        Seconds: &lt;span&gt;\$\{(\{ model \}) =&gt; model.seconds\}&lt;/span&gt;
    &lt;/div&gt;
\`;
// Create model to store seconds.
const model = new Model(\{ seconds: 0 \});
// Mount timer on body.
Timer.mount(\{ model \}, document.body);
// Increment \`model.seconds\` every second.
setInterval(() =&gt; model.seconds++, 1000);
</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010">Try it on CodePen</a></p>
<h3 id="addingsubcomponents">Adding sub components</h3>
<pre><code class="javascript language-javascript">// Create Button component.
const Button = Component.create\`
    &lt;button
        onClick="\$\{\{ '&amp;' : function() \{ this.options.onClick() \} \}\}"
    &gt;
        \$\{(\{ options \}) =&gt; options.label\}
    &lt;/button&gt;
\`;
// Create Counter component.
const Counter = Component.create\`
    &lt;div&gt;
        \$\{(\{ model \}) =&gt; Button.mount(\{ label : '-', onClick : () =&gt; model.count-- \})\}
        &lt;span&gt;\$\{(\{ model \}) =&gt; model.count\}&lt;/span&gt;
        \$\{(\{ model \}) =&gt; Button.mount(\{ label : '+', onClick : () =&gt; model.count++ \})\}
    &lt;/div&gt;
\`;
// Create model to store count.
const model = new Model(\{ count: 0 \});
// Mount counter on body.
Counter.mount(\{ model \}, document.body);
</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/ZEZarEQ?editors=0010">Try it on CodePen</a></p>
<h2 id="whychooserasti">Why Choose <strong>Rasti</strong>?</h2>
<ul>
<li><strong>Small Projects</strong>: Perfect for lightweight apps, free from unnecessary overhead or tooling.  </li>
<li><strong>Efficient Rendering</strong>: Ideal for rendering large dynamic tables or datasets without requiring virtual scrolling.  </li>
<li><strong>Legacy Maintenance</strong>: Modernize your <strong>Backbone.js</strong> views gradually, allowing for incremental updates without the need for a complete rewrite.</li>
</ul>
<h2 id="example">Example</h2>
<p>The rasti <a target="_blank" href="https://github.com/8tentaculos/rasti">GitHub repository</a> includes, in the <a target="_blank" href="https://github.com/8tentaculos/rasti/tree/master/example/todo">example folder</a>, an example <a target="_blank" href="https://rasti.js.org/example/todo/index.html">TODO application</a> that can be used as starter project.</p>
<h2 id="api">API</h2>
<p>Complete <a href="/api/">API documentation</a>.</p>
<h2 id="poweredbyrasti">Powered by <strong>Rasti</strong></h2>
<h3 id="cryptobabylonhttpscryptobabylonnet"><a target="_blank" href="https://cryptobabylon.net">Crypto Babylon</a></h3>
<p>A market analytics platform efficiently rendering over 300 dynamic rows, updated in real-time with thousands of messages per second via multiple WebSocket connections.  </p>
<h3 id="jspacmanhttpspacmanjsorg"><a target="_blank" href="https://pacman.js.org">jsPacman</a></h3>
<p>A DOM-based remake of the classic Ms. Pac-Man game. <strong>Rasti</strong> powers its custom game engine.  </p></section>
        `,se=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:de}=S({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-dark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...se("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...se("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},marginTop:"var(--rui-app-appBarHeight)"}}),le=c.uA.create`
            <section class="${({options:e})=>(e=>[e.className||null,de.root].join(" "))(e)}"><p><a name="module_component" id="module_component"></a></p>
<h2 id="componentc0c">Component ⇐ <code>Rasti.View</code></h2>
<p>Components are a special kind of <code>View</code> that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.<br />
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.<br />
Components are defined with the <code>create</code> static method, which takes a tagged template.</p>
<p><strong>Extends</strong>: <code>Rasti.View</code>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>Object containing options. The following keys will be merged to <code>this</code>: model, state, key, onDestroy, onRender, onCreate, onChange.</td>
</tr>
</tbody>
</table>
<p><strong>Properties</strong></p>
<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>key</td>
<td><code>string</code></td>
<td>A unique key to identify the component. Used to recycle child components.</td>
</tr>
<tr>
<td>model</td>
<td><code>object</code></td>
<td>A <code>Rasti.Model</code> or any emitter object containing data and business logic.</td>
</tr>
<tr>
<td>state</td>
<td><code>object</code></td>
<td>A <code>Rasti.Model</code> or any emitter object containing data and business logic, to be used as internal state.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">import \{ Component, Model \} from 'rasti';
// Create Timer component.
const Timer = Component.create\`
    &lt;div&gt;
        Seconds: &lt;span&gt;\$\{(\{ model \}) =&gt; model.seconds\}&lt;/span&gt;
    &lt;/div&gt;
\`;
// Create model to store seconds.
const model = new Model(\{ seconds: 0 \});
// Mount timer on body.
Timer.mount(\{ model \}, document.body);
// Increment \`model.seconds\` every second.
setInterval(() =&gt; model.seconds++, 1000);
</code></pre>
<ul>
<li><a href="#module_component">Component</a> ⇐ <code>Rasti.View</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_component__oncreate">.onCreate(options)</a></li>
<li><a href="#module_component__onchange">.onChange(model, changed)</a></li>
<li><a href="#module_component__onrender">.onRender(type)</a></li>
<li><a href="#module_component__ondestroy">.onDestroy(options)</a></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_component_extend">.extend(object)</a></li>
<li><a href="#module_component_mount">.mount(options, el, hydrate)</a> ⇒ <code>Rasti.Component</code></li>
<li><a href="#module_component_create">.create(HTML)</a> ⇒ <code>Rasti.Component</code></li></ul></li></ul></li>
</ul>
<p><a name="module_component__oncreate" id="module_component__oncreate"></a></p>
<h3 id="componentoncreateoptions">component.onCreate(options)</h3>
<p>Lifecycle method. Called when the view is created at the end of the constructor.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>The view options.</td>
</tr>
</tbody>
</table>
<p><a name="module_component__onchange" id="module_component__onchange"></a></p>
<h3 id="componentonchangemodelchanged">component.onChange(model, changed)</h3>
<p>Lifecycle method. Called when model emits <code>change</code> event.
By default calls render method.
This method should be extended with custom logic.
Maybe comparing new attributes with previous ones and calling
render when needed. Or doing some dom transformation.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>model</td>
<td><code>Rasti.Model</code></td>
<td>The model that emitted the event.</td>
</tr>
<tr>
<td>changed</td>
<td><code>object</code></td>
<td>Object containing keys and values that has changed.</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>any</code></td>
<td>Any extra arguments passed to set method.</td>
</tr>
</tbody>
</table>
<p><a name="module_component__onrender" id="module_component__onrender"></a></p>
<h3 id="componentonrendertype">component.onRender(type)</h3>
<p>Lifecycle method. Called when the view is rendered.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>The render type. Can be <code>render</code>, <code>hydrate</code> or <code>recycle</code>.</td>
</tr>
</tbody>
</table>
<p><a name="module_component__ondestroy" id="module_component__ondestroy"></a></p>
<h3 id="componentondestroyoptions">component.onDestroy(options)</h3>
<p>Lifecycle method. Called when the view is destroyed.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>Options object or any arguments passed to <code>destroy</code> method.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_extend" id="module_component_extend"></a></p>
<h3 id="componentextendobject">Component.extend(object)</h3>
<p>Helper method used to extend a <code>Component</code>, creating a subclass.</p>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>object</td>
<td><code>object</code></td>
<td>Object containing methods to be added to the new <code>Component</code> subclass. Also can be a function that receives the parent prototype and returns an object.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_mount" id="module_component_mount"></a></p>
<h3 id="componentmountoptionselhydratec21c">Component.mount(options, el, hydrate) ⇒ <code>Rasti.Component</code></h3>
<p>Mount the component into the dom.
It instantiate the Component view using options, 
appends its element into the DOM (if <code>el</code> is provided).
And returns the view instance.
<br><br> &#9888; <strong>Security Notice:</strong> <code>Component</code> utilizes <code>innerHTML</code> on a document fragment for rendering, which may introduce Cross - Site Scripting (XSS) risks. Ensure that any user-generated content is properly sanitized before inserting it into the DOM. For best practices on secure data handling, refer to the <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html">OWASP's XSS Prevention Cheat Sheet</a>.<br><br></p>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>The view options.</td>
</tr>
<tr>
<td>el</td>
<td><code>node</code></td>
<td>Dom element to append the view element.</td>
</tr>
<tr>
<td>hydrate</td>
<td><code>boolean</code></td>
<td>If true, the view will use existing html.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_create" id="module_component_create"></a></p>
<h3 id="componentcreatehtmlc26c">Component.create(HTML) ⇒ <code>Rasti.Component</code></h3>
<p>Takes a tagged template containing an HTML string, 
and returns a new <code>Component</code> class.</p>
<ul>
<li>The template outer tag and attributes will be used to create the view's root element.</li>
<li>Boolean attributes should be passed in the form of <code>attribute="\$\{() =&gt; true\}"</code>.</li>
<li>Event handlers should be passed, at the root element, in the form of <code>onEventName=\$\{\{'selector' : listener \}\}</code>. Where <code>selector</code> is a css selector. The event will be delegated to the view's root element.</li>
<li>The template inner HTML will be used as the view's template.</li>
<li>Template interpolations that are functions will be evaluated on the render process. Receiving the view instance as argument. And being bound to it.</li>
<li>If the function returns <code>null</code>, <code>undefined</code>, <code>false</code> or empty string, the interpolation won't render any content.</li>
<li>If the function returns a component instance, it will be added as a child component.</li>
<li>If the function returns an array, each item will be evaluated as above.</li>
</ul>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>HTML</td>
<td><code>string</code></td>
<td>template for the component.</td>
</tr>
</tbody>
</table>
<p><a name="module_emitter" id="module_emitter"></a></p>
<h2 id="emitter">Emitter</h2>
<p><code>Emitter</code> is a class that provides an easy way to implement the observer pattern 
in your applications.<br />
It can be extended to create new classes that have the ability to emit and bind custom named events.<br />
Emitter is used by <code>Model</code> and <code>View</code> classes, which inherit from it to implement 
event-driven functionality.</p>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">import \{ Emitter \} from 'rasti';
// Custom cart
class ShoppingCart extends Emitter \{
    constructor() \{
        super();
        this.items = [];
    \}

    addItem(item) \{
        this.items.push(item);
        // Emit a custom event called \`itemAdded\`.
        // Pass the added item as an argument to the event listener.
        this.emit('itemAdded', item);
    \}
\}
// Create an instance of ShoppingCart and Logger
const cart = new ShoppingCart();
// Listen to the \`itemAdded\` event and log the added item using the logger.
cart.on('itemAdded', (item) =&gt; \{
    console.log(\`Item added to cart: \$\{item.name\} - Price: \$\$\{item.price\}\`);
\});
// Simulate adding items to the cart
const item1 = \{ name : 'Smartphone', price : 1000 \};
const item2 = \{ name : 'Headphones', price : 150 \};

cart.addItem(item1); // Output: "Item added to cart: Smartphone - Price: \$1000"
cart.addItem(item2); // Output: "Item added to cart: Headphones - Price: \$150"
</code></pre>
<ul>
<li><a href="#module_emitter">Emitter</a><ul>
<li><a href="#module_emitter__on">.on(type, listener)</a></li>
<li><a href="#module_emitter__once">.once(type, listener)</a></li>
<li><a href="#module_emitter__off">.off([type], [listener])</a></li>
<li><a href="#module_emitter__emit">.emit(type)</a></li></ul></li>
</ul>
<p><a name="module_emitter__on" id="module_emitter__on"></a></p>
<h3 id="emitterontypelistener">emitter.on(type, listener)</h3>
<p>Adds event listener.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>Type of the event (e.g. <code>change</code>).</td>
</tr>
<tr>
<td>listener</td>
<td><code>function</code></td>
<td>Callback function to be called when the event is emitted.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">this.model.on('change', this.render.bind(this)); // Re render when model changes.
</code></pre>
<p><a name="module_emitter__once" id="module_emitter__once"></a></p>
<h3 id="emitteroncetypelistener">emitter.once(type, listener)</h3>
<p>Adds event listener that executes once.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>Type of the event (e.g. <code>change</code>).</td>
</tr>
<tr>
<td>listener</td>
<td><code>function</code></td>
<td>Callback function to be called when the event is emitted.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">this.model.once('change', () =&gt; console.log('This will happen once'));
</code></pre>
<p><a name="module_emitter__off" id="module_emitter__off"></a></p>
<h3 id="emitterofftypelistener">emitter.off([type], [listener])</h3>
<p>Removes event listeners.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>[type]</td>
<td><code>string</code></td>
<td>Type of the event (e.g. <code>change</code>). If is not provided, it removes all listeners.</td>
</tr>
<tr>
<td>[listener]</td>
<td><code>function</code></td>
<td>Callback function to be called when the event is emitted. If listener is not provided, it removes all listeners for specified type.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">this.model.off('change'); // Stop listening to changes.
</code></pre>
<p><a name="module_emitter__emit" id="module_emitter__emit"></a></p>
<h3 id="emitteremittype">emitter.emit(type)</h3>
<p>Emits event of specified type. Listeners will receive specified arguments.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>Type of the event (e.g. <code>change</code>).</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>any</code></td>
<td>Arguments to be passed to listener.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">this.emit('invalid'); // Emit validation error event.
</code></pre>
<p><a name="module_model" id="module_model"></a></p>
<h2 id="modelc41c">Model ⇐ <code>Rasti.Emitter</code></h2>
<ul>
<li>Orchestrates data and business logic.</li>
<li>Emits events when data changes.</li>
</ul>
<p>A <code>Model</code> manages an internal table of data attributes and triggers change events when any of its data is modified.<br />
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.<br />
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.<br />
Rasti models store their attributes in <code>this.attributes</code>, which is extended from <code>this.defaults</code> and the 
constructor <code>attrs</code> parameter. For every attribute, a getter is generated to retrieve the model property 
from <code>this.attributes</code>, and a setter is created to set the model property in <code>this.attributes</code> and emit <code>change</code> 
and <code>change:attribute</code> events.</p>
<p><strong>Extends</strong>: <code>Rasti.Emitter</code>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>attrs</td>
<td><code>object</code></td>
<td>Object containing model attributes to extend <code>this.attributes</code>. Getters and setters are generated for <code>this.attributes</code>, in order to emit <code>change</code> events.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">import \{ Model \} from 'rasti';
// Product model
class ProductModel extends Model \{
    preinitialize() \{
        // The Product model has \`name\` and \`price\` default attributes.
        // \`defaults\` will extend \`this.attributes\`.
        // Getters and setters are generated for \`this.attributes\`,
        // in order to emit \`change\` events.
        this.defaults = \{
            name: '',
            price: 0
        \};
    \}

    setDiscount(discountPercentage) \{
        // Apply a discount to the price property.
        // This will call a setter that will update \`price\` in \`this.attributes\`,
        // and emit \`change\` and \`change:price\` events.
        const discount = this.price * (discountPercentage / 100);
        this.price -= discount;
    \}
\}
// Create a product instance with a name and price.
const product = new ProductModel(\{ name: 'Smartphone', price: 1000 \});
// Listen to the \`change:price\` event.
product.on('change:price', () =&gt; console.log('New Price:', product.price));
// Apply a 10% discount to the product.
product.setDiscount(10); // Output: "New Price: 900"
</code></pre>
<ul>
<li><a href="#module_model">Model</a> ⇐ <code>Rasti.Emitter</code><ul>
<li><a href="#module_model__preinitialize">.preinitialize(attrs)</a></li>
<li><a href="#module_model__defineattribute">.defineAttribute(key)</a></li>
<li><a href="#module_model__get">.get(key)</a> ⇒ <code>any</code></li>
<li><a href="#module_model__set">.set(key, [value])</a> ⇒ <code>this</code></li>
<li><a href="#module_model__tojson">.toJSON()</a> ⇒ <code>object</code></li></ul></li>
</ul>
<p><a name="module_model__preinitialize" id="module_model__preinitialize"></a></p>
<h3 id="modelpreinitializeattrs">model.preinitialize(attrs)</h3>
<p>If you define a preinitialize method, it will be invoked when the Model is first created, before any instantiation logic is run for the Model.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>attrs</td>
<td><code>object</code></td>
<td>Object containing model attributes to extend <code>this.attributes</code>.</td>
</tr>
</tbody>
</table>
<p><a name="module_model__defineattribute" id="module_model__defineattribute"></a></p>
<h3 id="modeldefineattributekey">model.defineAttribute(key)</h3>
<p>Generate getter/setter for the given key. In order to emit <code>change</code> events.
This method is called internally by the constructor
for <code>this.attributes</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>key</td>
<td><code>string</code></td>
<td>Attribute key.</td>
</tr>
</tbody>
</table>
<p><a name="module_model__get" id="module_model__get"></a></p>
<h3 id="modelgetkeyc52c">model.get(key) ⇒ <code>any</code></h3>
<p>Get an attribute from <code>this.attributes</code>.
This method is called internally by generated getters.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>any</code> - The attribute value.  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>key</td>
<td><code>string</code></td>
<td>Attribute key.</td>
</tr>
</tbody>
</table>
<p><a name="module_model__set" id="module_model__set"></a></p>
<h3 id="modelsetkeyvaluec56c">model.set(key, [value]) ⇒ <code>this</code></h3>
<p>Set an attribute into <code>this.attributes</code>.<br />
Emit <code>change</code> and <code>change:attribute</code> if a value changes.<br />
Could be called in two forms, <code>this.set('key', value)</code> and
<code>this.set(\{ key : value \})</code>.<br />
This method is called internally by generated setters.<br />
The <code>change</code> event listener will receive the model instance, an object containing the changed attributes, and the rest of the arguments passed to <code>set</code> method.<br />
The <code>change:attribute</code> event listener will receive the model instance, the new attribute value, and the rest of the arguments passed to <code>set</code> method.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>this</code> - This model.<br />
<strong>Emits</strong>: <code>event:change</code>, <code>change:attribute</code>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>key</td>
<td><code>string</code></td>
<td>Attribute key or object containing keys/values.</td>
</tr>
<tr>
<td>[value]</td>
<td></td>
<td>Attribute value.</td>
</tr>
</tbody>
</table>
<p><a name="module_model__tojson" id="module_model__tojson"></a></p>
<h3 id="modeltojsonc62c">model.toJSON() ⇒ <code>object</code></h3>
<p>Return object representation of the model to be used for JSON serialization.
By default returns <code>this.attributes</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>object</code> - Object representation of the model to be used for JSON serialization.<br />
<a name="module_view" id="module_view"></a></p>
<h2 id="viewc65c">View ⇐ <code>Rasti.Emitter</code></h2>
<ul>
<li>Listens for changes and renders UI.</li>
<li>Handles user input and interactivity.</li>
<li>Sends captured input to the model.</li>
</ul>
<p>A <code>View</code> is an atomic unit of the user interface that can render data from a specific model or multiple models.
However, views can also be independent and have no associated data.<br />
Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
emitted by the models to re-render themselves based on changes.<br />
Each <code>View</code> has a root element, <code>this.el</code>, which is used for event delegation.<br />
All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
If <code>this.el</code> is not present, an element will be created using <code>this.tag</code> (defaulting to div) and <code>this.attributes</code>.</p>
<p><strong>Extends</strong>: <code>Rasti.Emitter</code>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>Object containing options. The following keys will be merged to <code>this</code>: el, tag, attributes, events, model, template, onDestroy.</td>
</tr>
</tbody>
</table>
<p><strong>Properties</strong></p>
<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>el</td>
<td><code>node</code></td>
<td>Every view has a root element, <code>this.el</code>. If not present it will be created.</td>
</tr>
<tr>
<td>tag</td>
<td><code>string</code></td>
<td>If <code>this.el</code> is not present, an element will be created using <code>this.tag</code>. Default is <code>div</code>.</td>
</tr>
<tr>
<td>attributes</td>
<td><code>object</code></td>
<td>If <code>this.el</code> is not present, an element will be created using <code>this.attributes</code>.</td>
</tr>
<tr>
<td>events</td>
<td><code>object</code></td>
<td>Object in the format <code>\{'event selector' : 'listener'\}</code>. Used to bind delegated event listeners to the root element.</td>
</tr>
<tr>
<td>model</td>
<td><code>object</code></td>
<td>A <code>Rasti.Model</code> or any object containing data and business logic.</td>
</tr>
<tr>
<td>template</td>
<td><code>function</code></td>
<td>A function that receives data and returns a markup string (e.g., HTML).</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">import \{ View \} from 'rasti';

class Timer extends View \{
    constructor(options) \{
        super(options);
        // Create model to store internal state. Set \`seconds\` attribute to 0.
        this.model = new Model(\{ seconds : 0 \});
        // Listen to changes in model \`seconds\` attribute and re-render.
        this.model.on('change:seconds', this.render.bind(this));
        // Increment model \`seconds\` attribute every 1000 milliseconds.
        this.interval = setInterval(() =&gt; this.model.seconds++, 1000);
    \}

    template(model) \{
        return \`Seconds: &lt;span&gt;\$\{model.seconds\}&lt;/span&gt;\`;
    \}
\}
// Render view and append view's element into the body.
document.body.appendChild(new Timer().render().el);
</code></pre>
<ul>
<li><a href="#module_view">View</a> ⇐ <code>Rasti.Emitter</code><ul>
<li><a href="#module_view__preinitialize">.preinitialize(attrs)</a></li>
<li><a href="#module_view__\$">.\$(selector)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__\$\$">.\$\$(selector)</a> ⇒ <code>Array.&amp;lt;node&amp;gt;</code></li>
<li><a href="#module_view__destroy">.destroy()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_view__addchild">.addChild(child)</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__destroychildren">.destroyChildren()</a></li>
<li><a href="#module_view__ensureelement">.ensureElement()</a></li>
<li><a href="#module_view__createelement">.createElement(tag, attrs)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__removeelement">.removeElement()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__delegateevents">.delegateEvents([events])</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__undelegateevents">.undelegateEvents()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__render">.render()</a> ⇒ <code>Rasti.View</code></li></ul></li>
</ul>
<p><a name="module_view__preinitialize" id="module_view__preinitialize"></a></p>
<h3 id="viewpreinitializeattrs">view.preinitialize(attrs)</h3>
<p>If you define a preinitialize method, it will be invoked when the view is first created, before any instantiation logic is run.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>attrs</td>
<td><code>object</code></td>
<td>Object containing model attributes to extend <code>this.attributes</code>.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__\$" id="module_view__\$"></a></p>
<h3 id="viewdselectorc86c">view.\$(selector) ⇒ <code>node</code></h3>
<p>Returns the first element that matches the selector, 
scoped to DOM elements within the current view's root element (<code>this.el</code>).</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>node</code> - Element matching selector within the view's root element (<code>this.el</code>).  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>selector</td>
<td><code>string</code></td>
<td>CSS selector.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__\$\$" id="module_view__\$\$"></a></p>
<h3 id="viewddselectorc90c">view.\$\$(selector) ⇒ <code>Array.&amp;lt;node&amp;gt;</code></h3>
<p>Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (<code>this.el</code>).</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Array.&amp;lt;node&amp;gt;</code> - List of elements matching selector within the view's root element (<code>this.el</code>).  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>selector</td>
<td><code>string</code></td>
<td>CSS selector.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__destroy" id="module_view__destroy"></a></p>
<h3 id="viewdestroyc94c">view.destroy() ⇒ <code>Rasti.View</code></h3>
<p>Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call <code>onDestroy</code> lifecycle method.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__ondestroy" id="module_view__ondestroy"></a></p>
<h3 id="viewondestroyoptions">view.onDestroy(options)</h3>
<p><code>onDestroy</code> lifecycle method is called after the view is destroyed.
Override with your code. Useful to stop listening to model's events.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>options</td>
<td><code>object</code></td>
<td>Options object or any arguments passed to <code>destroy</code> method.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__addchild" id="module_view__addchild"></a></p>
<h3 id="viewaddchildchildc99c">view.addChild(child) ⇒ <code>Rasti.View</code></h3>
<p>Add a view as a child.
Children views are stored at <code>this.children</code>, and destroyed when the parent is destroyed.
Returns the child for chaining.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a>  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
</tr>
</thead>
<tbody>
<tr>
<td>child</td>
<td><code>Rasti.View</code></td>
</tr>
</tbody>
</table>
<p><a name="module_view__destroychildren" id="module_view__destroychildren"></a></p>
<h3 id="viewdestroychildren">view.destroyChildren()</h3>
<p>Call destroy method on children views.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__ensureelement" id="module_view__ensureelement"></a></p>
<h3 id="viewensureelement">view.ensureElement()</h3>
<p>Ensure that the view has a root element at <code>this.el</code>.
You shouldn't call this method directly. It's called from the constructor.
You may override it if you want to use a different logic or to 
postpone element creation.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__createelement" id="module_view__createelement"></a></p>
<h3 id="viewcreateelementtagattrsc104c">view.createElement(tag, attrs) ⇒ <code>node</code></h3>
<p>Create an element.
Called from the constructor if <code>this.el</code> is undefined, to ensure
the view has a root element.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>node</code> - The created element.  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>tag</td>
<td><code>string</code></td>
<td><code>&amp;quot;div&amp;quot;</code></td>
<td>Tag for the element. Default to <code>div</code></td>
</tr>
<tr>
<td>attrs</td>
<td><code>object</code></td>
<td></td>
<td>Attributes for the element.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__removeelement" id="module_view__removeelement"></a></p>
<h3 id="viewremoveelementc110c">view.removeElement() ⇒ <code>Rasti.View</code></h3>
<p>Remove <code>this.el</code> from the DOM.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__delegateevents" id="module_view__delegateevents"></a></p>
<h3 id="viewdelegateeventseventsc113c">view.delegateEvents([events]) ⇒ <code>Rasti.View</code></h3>
<p>Provide declarative listeners for DOM events within a view. If an events hash is not passed directly, uses <code>this.events</code> as the source.<br />
Events are written in the format <code>\{'event selector' : 'listener'\}</code>. The listener may be either the name of a method on the view, or a direct function body.
Omitting the selector causes the event to be bound to the view's root element (<code>this.el</code>).<br />
By default, <code>delegateEvents</code> is called within the View's constructor, 
so if you have a simple events hash, all of your DOM events will always already be connected, and you will never have to call this function yourself.<br />
All attached listeners are bound to the view automatically, so when the listeners are invoked, <code>this</code> continues to refer to the view object.<br />
When <code>delegateEvents</code> is run again, perhaps with a different events hash, all listeners are removed and delegated afresh.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>[events]</td>
<td><code>object</code></td>
<td>Object in the format <code>\{'event selector' : 'listener'\}</code>. Used to bind delegated event listeners to the root element.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js">MyView.prototype.events = \{
     'click button.ok' : 'onClickOkButton',
     'click button.cancel' : function() \{\}
\};
</code></pre>
<p><a name="module_view__undelegateevents" id="module_view__undelegateevents"></a></p>
<h3 id="viewundelegateeventsc117c">view.undelegateEvents() ⇒ <code>Rasti.View</code></h3>
<p>Removes all of the view's delegated events. Useful if you want to disable or remove a view from the DOM temporarily. Called automatically when the view is destroyed.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__render" id="module_view__render"></a></p>
<h3 id="viewrenderc120c">view.render() ⇒ <code>Rasti.View</code></h3>
<p>Render the view.
This method should be overridden with custom logic.
The default implementation sets innerHTML of <code>this.el</code> with <code>this.template</code>.
Conventions are to only manipulate the DOM in the scope of <code>this.el</code>, 
and to return <code>this</code> for chaining.
If you added any child view, you must call <code>this.destroyChildren</code>.
<br><br> &#9888; <strong>Security Notice:</strong> The default implementation utilizes <code>innerHTML</code> on the root elementfor rendering, which may introduce Cross - Site Scripting (XSS) risks. Ensure that any user-generated content is properly sanitized before inserting it into the DOM. For best practices on secure data handling, refer to the <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html">OWASP's XSS Prevention Cheat Sheet</a>.<br><br></p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.  </p></section>
        `,{classes:ce}=S({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-xl) 0 var(--rui-spacing-xxxxl) 0",borderTop:"1px solid rgb(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)","@global":{a:{color:"var(--rui-palette-neutral-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-neutral-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-neutral-dark)"}}}},text:{color:"var(--rui-palette-neutral-foregroundLevel3)"}}),he=c.uA.create`
    <footer class="${ce.root}">
        ${()=>O.mount({level:"titleMd",className:ce.text,renderChildren:()=>'Released under the <a href="https://github.com/8tentaculos/rasti/blob/master/LICENSE" target="_blank">MIT License</a>'})}
        ${()=>O.mount({level:"titleSm",className:ce.text,renderChildren:()=>`Copyright © ${(()=>{const e=(new Date).getFullYear();return 2018===e?e:`2018-${e}`})()} <a href="https://github.com/8tentaculos" target="_blank">8tentaculos</a>`})}
    </footer>
`,{classes:ue}=S({"@global":{body:{margin:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel1)"}},root:{}}),ge=(e="")=>{const t=e.match(/\/([^/]+)\//),n=t?t[1]:e;return["api"].includes(n)?n:""};c.uA.create`
    <div class="${ue.root}">
        ${e=>ee.mount({handleNavigate:e.navigate.bind(e)})}

        ${({state:e})=>"api"===e.route?le.mount():[I.mount(),z.mount(),oe.mount(),ae.mount()]}

        ${()=>he.mount()}
    </div>
`.extend({preinitialize(e={}){this.state=new c.Kx({route:ge(e.route)}),"undefined"!=typeof window&&(window.history.replaceState({route:this.state.route},""),window.addEventListener("popstate",(e=>{e.state&&(this.state.route=ge(e.state.route))})))},navigate(e){this.state.route=ge(e),window.history.pushState({route:this.state.route},"",this.state.route?`/${this.state.route}/`:"/"),document.title=this.getTitle(),window.scrollTo(0,0)},getTitle(){return"Rasti.js"+("api"===this.state.route?" - API Documentation":"")}}).mount({route:window.location.pathname,onRender:t=>{e.highlightAll()}},document.getElementById("root"),!0)})()})();