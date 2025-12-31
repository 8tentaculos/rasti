(()=>{"use strict";var e={663(e,t){t.wE=function(e,t={}){const{encode:a=encodeURIComponent,delimiter:n=s}=t,o=d(("object"==typeof e?e:p(e,t)).tokens,n,a);return function(e={}){const[t,...s]=o(e);if(s.length)throw new TypeError(`Missing parameters: ${s.join(", ")}`);return t}},t.YW=function(e,t={}){const{decode:n=decodeURIComponent,delimiter:o=s}=t,{regexp:r,keys:i}=function(e,t={}){const{delimiter:a=s,end:n=!0,sensitive:o=!1,trailing:r=!0}=t,i=[],c=o?"":"i",d=[];for(const s of h(e,[])){const e="object"==typeof s?s:p(s,t);for(const t of u(e.tokens,0,[]))d.push(m(t,a,i,e.originalPath))}let g=`^(?:${d.join("|")})`;return r&&(g+=`(?:${l(a)}$)?`),g+=n?"$":`(?=${l(a)}|$)`,{regexp:new RegExp(g,c),keys:i}}(e,t),c=i.map(e=>!1===n?a:"param"===e.type?n:e=>e.split(o).map(n));return function(e){const t=r.exec(e);if(!t)return!1;const s=t[0],a=Object.create(null);for(let e=1;e<t.length;e++){if(void 0===t[e])continue;const s=i[e-1],n=c[e-1];a[s.name]=n(t[e])}return{path:s,params:a}}};const s="/",a=e=>e,n=/^[$_\p{ID_Start}]$/u,o=/^[$\u200c\u200d\p{ID_Continue}]$/u,r={"{":"{","}":"}","(":"(",")":")","[":"[","]":"]","+":"+","?":"?","!":"!"};function l(e){return e.replace(/[.+*?^${}()[\]|/\\]/g,"\\$&")}class i{constructor(e,t){this.tokens=e,this.originalPath=t}}class c extends TypeError{constructor(e,t){let s=e;t&&(s+=`: ${t}`),s+="; visit https://git.new/pathToRegexpError for info",super(s),this.originalPath=t}}function p(e,t={}){const{encodePath:s=a}=t,l=[...e],p=[];let d=0,h=0;function u(){let t="";if(n.test(l[d]))do{t+=l[d++]}while(o.test(l[d]));else if('"'===l[d]){let s=d;for(;d++<l.length;){if('"'===l[d]){d++,s=0;break}"\\"===l[d]&&d++,t+=l[d]}if(s)throw new c(`Unterminated quote at index ${s}`,e)}if(!t)throw new c(`Missing parameter name at index ${d}`,e);return t}for(;d<l.length;){const e=l[d],t=r[e];t?p.push({type:t,index:d++,value:e}):"\\"===e?p.push({type:"escape",index:d++,value:l[d++]}):":"===e?p.push({type:"param",index:d++,value:u()}):"*"===e?p.push({type:"wildcard",index:d++,value:u()}):p.push({type:"char",index:d++,value:e})}return p.push({type:"end",index:d,value:""}),new i(function t(a){const n=[];for(;;){const o=p[h++];if(o.type===a)break;if("char"===o.type||"escape"===o.type){let e=o.value,t=p[h];for(;"char"===t.type||"escape"===t.type;)e+=t.value,t=p[++h];n.push({type:"text",value:s(e)});continue}if("param"!==o.type&&"wildcard"!==o.type){if("{"!==o.type)throw new c(`Unexpected ${o.type} at index ${o.index}, expected ${a}`,e);n.push({type:"group",tokens:t("}")})}else n.push({type:o.type,name:o.value})}return n}("end"),e)}function d(e,t,s){const n=e.map(e=>function(e,t,s){if("text"===e.type)return()=>[e.value];if("group"===e.type){const a=d(e.tokens,t,s);return e=>{const[t,...s]=a(e);return s.length?[""]:[t]}}const n=s||a;return"wildcard"===e.type&&!1!==s?s=>{const a=s[e.name];if(null==a)return["",e.name];if(!Array.isArray(a)||0===a.length)throw new TypeError(`Expected "${e.name}" to be a non-empty array`);return[a.map((t,s)=>{if("string"!=typeof t)throw new TypeError(`Expected "${e.name}/${s}" to be a string`);return n(t)}).join(t)]}:t=>{const s=t[e.name];if(null==s)return["",e.name];if("string"!=typeof s)throw new TypeError(`Expected "${e.name}" to be a string`);return[n(s)]}}(e,t,s));return e=>{const t=[""];for(const s of n){const[a,...n]=s(e);t[0]+=a,t.push(...n)}return t}}function h(e,t){if(Array.isArray(e))for(const s of e)h(s,t);else t.push(e);return t}function*u(e,t,s){if(t===e.length)return yield s;const a=e[t];if("group"===a.type)for(const n of u(a.tokens,0,s.slice()))yield*u(e,t+1,n);else s.push(a);yield*u(e,t+1,s)}function m(e,t,s,a){let n="",o="",r=!0;for(const i of e)if("text"!==i.type)if("param"!==i.type&&"wildcard"!==i.type);else{if(!r&&!o)throw new c(`Missing text before "${i.name}" ${i.type}`,a);"param"===i.type?n+=`(${g(t,r?"":o)}+)`:n+="([\\s\\S]+)",s.push(i),o="",r=!1}else n+=l(i.value),o+=i.value,r||(r=i.value.includes(t));return n}function g(e,t){return t.length<2?e.length<2?`[^${l(e+t)}]`:`(?:(?!${l(e)})[^${l(t)}])`:e.length<2?`(?:(?!${l(t)})[^${l(e)}])`:`(?:(?!${l(t)}|${l(e)})[\\s\\S])`}}},t={};function s(e){if("function"!=typeof e){throw new TypeError("Event listener must be a function")}}class a{on(e,t){return s(t),this.listeners||(this.listeners={}),this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t),()=>this.off(e,t)}once(e,t){s(t);const a=(...s)=>{t(...s),this.off(e,a)};return this.on(e,a)}off(e,t){this.listeners&&(e?this.listeners[e]&&(t?(this.listeners[e]=this.listeners[e].filter(e=>e!==t),this.listeners[e].length||delete this.listeners[e]):delete this.listeners[e],Object.keys(this.listeners).length||delete this.listeners):delete this.listeners)}emit(e,...t){this.listeners&&this.listeners[e]&&this.listeners[e].slice().forEach(e=>e(...t))}listenTo(e,t,s){return e.on(t,s),this.listeningTo||(this.listeningTo=[]),this.listeningTo.push({emitter:e,type:t,listener:s}),()=>this.stopListening(e,t,s)}listenToOnce(e,t,a){s(a);const n=(...s)=>{a(...s),this.stopListening(e,t,n)};return this.listenTo(e,t,n)}stopListening(e,t,s){this.listeningTo&&(this.listeningTo=this.listeningTo.filter(a=>!(!e||e===a.emitter&&!t||e===a.emitter&&t===a.type&&!s||e===a.emitter&&t===a.type&&s===a.listener)||(a.emitter.off(a.type,a.listener),!1)),this.listeningTo.length||delete this.listeningTo)}}const n=(e,t,...s)=>"function"!=typeof e?e:e.apply(t,s);class o extends a{constructor(){super(),this.preinitialize.apply(this,arguments),this.attributes=Object.assign({},n(this.defaults,this),this.parse.apply(this,arguments)),this.previous={},Object.keys(this.attributes).forEach(this.defineAttribute.bind(this))}preinitialize(){}defineAttribute(e){Object.defineProperty(this,`${this.constructor.attributePrefix}${e}`,{get:()=>this.get(e),set:t=>{this.set(e,t)}})}get(e){return this.attributes[e]}set(e,t,...s){let a,n;"object"==typeof e?(a=e,n=[t,...s]):(a={[e]:t},n=s);const o=this._changing;this._changing=!0;const r={};o||(this.previous=Object.assign({},this.attributes)),Object.keys(a).forEach(e=>{a[e]!==this.attributes[e]&&(r[e]=a[e],this.attributes[e]=a[e])});const l=Object.keys(r);if(l.length&&(this._pending=["change",this,r,...n]),l.forEach(e=>{this.emit(`change:${e}`,this,a[e],...n)}),o)return this;for(;this._pending;){const e=this._pending;this._pending=null,this.emit.apply(this,e)}return this._pending=null,this._changing=!1,this}parse(e){return e}toJSON(){return Object.assign({},this.attributes)}}o.attributePrefix="";const r=["el","tag","attributes","events","model","template","onDestroy"];class l extends a{constructor(e={}){super(),this.preinitialize.apply(this,arguments),this.delegatedEventListeners=[],this.children=[],this.destroyQueue=[],this.viewOptions=[],r.forEach(t=>{t in e&&(this[t]=e[t],this.viewOptions.push(t))}),this.ensureUid(),this.ensureElement()}preinitialize(){}$(e){return this.el.querySelector(e)}$$(e){return this.el.querySelectorAll(e)}destroy(){return this.destroyChildren(),this.undelegateEvents(),this.stopListening(),this.off(),this.destroyQueue.forEach(e=>e()),this.destroyQueue=[],this.onDestroy.apply(this,arguments),this.destroyed=!0,this}onDestroy(){}addChild(e){return this.children.push(e),e}destroyChildren(){this.children.forEach(e=>e.destroy()),this.children=[]}ensureUid(){this.uid||(this.uid="r"+ ++l.uid)}ensureElement(){if(this.el)this.el=n(this.el,this);else{const e=n(this.tag,this),t=n(this.attributes,this);this.el=this.createElement(e,t)}this.delegateEvents()}createElement(e="div",t={}){let s=document.createElement(e);return Object.keys(t).forEach(e=>s.setAttribute(e,t[e])),s}removeElement(){return this.el.parentNode.removeChild(this.el),this}delegateEvents(e){if(e||(e=n(this.events,this)),!e)return this;this.delegatedEventListeners.length&&this.undelegateEvents();let t={};return Object.keys(e).forEach(a=>{const n=a.split(" "),o=n.shift(),r=n.join(" ");let l=e[a];"string"==typeof l&&(l=this[l]),s(l),t[o]||(t[o]=[]),t[o].push({selector:r,listener:l})}),Object.keys(t).forEach(e=>{const s=s=>{t[e].forEach(({selector:e,listener:t})=>{if(!e)return void t.call(this,s,this,this.el);let a=s.target;for(;a&&a!==this.el;)a.matches&&a.matches(e)&&t.call(this,s,this,a),a=a.parentElement})};this.delegatedEventListeners.push({type:e,listener:s}),this.el.addEventListener(e,s)}),this}undelegateEvents(){return this.delegatedEventListeners.forEach(({type:e,listener:t})=>{this.el.removeEventListener(e,t)}),this.delegatedEventListeners=[],this}render(){return this}static sanitize(e){return`${e}`.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[e]))}static resetUid(){l.uid=0}}l.uid=0;class i{constructor(e){this.value=e}toString(){return this.value}}class c{constructor(e){this.items=e}}class p{constructor(){this.listeners=[],this.types=new Set,this.previousSize=0}addListener(e,t){return this.types.add(t),this.listeners.push(e),this.listeners.length-1}reset(){this.listeners=[],this.previousSize=this.types.size}hasPendingTypes(){return this.types.size>this.previousSize}}const d=["value","checked","selected"];class h{constructor(e){this.getSelector=e.getSelector,this.getAttributes=e.getAttributes,this.previousAttributes={}}hydrate(e){this.ref=e.querySelector(this.getSelector())}update(){const e=this.getAttributes(),{remove:t,add:s}=function(e,t={}){const s={},a=[];return Object.keys(e).forEach(a=>{let n=e[a];n!==t[a]&&(!0===n?s[a]="":!1!==n&&(null==n&&(n=""),s[a]=n))}),Object.keys(t).forEach(s=>{(!(s in e)||t[s]!==e[s]&&!1===e[s])&&a.push(s)}),{add:s,remove:a}}(e,this.previousAttributes);this.previousAttributes=e,t.forEach(e=>{this.ref.removeAttribute(e),-1!==d.indexOf(e)&&e in this.ref&&(this.ref[e]="value"===e&&"")}),Object.keys(s).forEach(e=>{const t=s[e];this.ref.setAttribute(e,t),-1!==d.indexOf(e)&&e in this.ref&&(this.ref[e]="value"===e?t:!1!==t&&"false"!==t)})}}class u{constructor(){}reset(){this.paused=0,this.previous=this.tracked||new Map,this.tracked=new Map,this.positionStack=[0]}push(){this.positionStack.push(0)}pop(){this.positionStack.pop()}increment(){this.positionStack[this.positionStack.length-1]++}pause(){this.paused++}resume(){this.paused--}getPath(){return this.positionStack.join("-")}track(e){return 0===this.paused&&this.tracked.set(this.getPath(),e),e}hasSingleComponent(){if(1!==this.tracked.size||1!==this.previous.size)return!1;const[e,t]=this.tracked.entries().next().value,[s,a]=this.previous.entries().next().value;return"0"===e&&"0"===s&&t===a}findRecyclable(e){const t=this.previous.get(this.getPath());return t&&!t.key&&t.constructor===e.constructor?t:null}}const m=["value","checked","selected"];function g(e,t,s=()=>!1,a){let n=a||e.firstChild;for(;n;){if(n.nodeType===Node.COMMENT_NODE&&n.data.trim()===t)return n;if(n.nodeType!==Node.ELEMENT_NODE||s(n)||!n.firstChild){for(;n&&!n.nextSibling;)if(n=n.parentNode,!n||n===e)return null;n&&(n=n.nextSibling)}else n=n.firstChild}return null}class f{constructor(e){this.getStart=e.getStart,this.getEnd=e.getEnd,this.expression=e.expression,this.shouldSkipFind=e.shouldSkipFind,this.shouldSkipSync=e.shouldSkipSync,this.tracker=new u}hydrate(e){const t=g(e,this.getStart(),this.shouldSkipFind),s=g(e,this.getEnd(),this.shouldSkipFind,t);this.ref=[t,s]}update(e,t){let s;const[a,n]=this.ref,o=a.nextSibling,r=o===n,l=!r&&o.nextSibling===n;if(r?n.parentNode.insertBefore(e,n):!l||1!==e.children.length||this.shouldSkipSync(o)||this.shouldSkipSync(e.firstChild)?(s=document.createComment(""),n.parentNode.insertBefore(s,n),n.parentNode.insertBefore(e,n)):(i=o,c=e.firstChild,i.nodeType===c.nodeType?i.nodeType!==Node.TEXT_NODE?i.tagName===c.tagName?(((e,t)=>{const s=t.attributes,a=e.attributes,n=new Set;for(let t=0,a=s.length;t<a;t++){const{name:a,value:o}=s[t];n.add(a),e.getAttribute(a)!==o&&e.setAttribute(a,o)}for(let t=a.length-1;t>=0;t--){const{name:s}=a[t];n.has(s)||e.removeAttribute(s)}for(let s=0,a=m.length;s<a;s++){const a=m[s];a in e&&e[a]!==t[a]&&(e[a]=t[a])}})(i,c),((e,t)=>{const s=e.childNodes,a=t.childNodes,n=s.length;if(n!==a.length)return!1;for(let e=0;e<n;e++)if(!s[e].isEqualNode(a[e]))return!1;return!0})(i,c)||((e,t)=>{const s=Array.from(t.childNodes);e.replaceChildren(...s)})(i,c)):i.replaceWith(c):i.nodeValue!==c.nodeValue&&(i.nodeValue=c.nodeValue):i.replaceWith(c)),t(),s)if(this.ref[0].nextSibling===s)s.parentNode.removeChild(s);else{const e=document.createRange();e.setStartAfter(this.ref[0]),e.setEndAfter(s),e.deleteContents()}var i,c}updateElement(e,t,s){const a=document.createComment("");e.parentNode.insertBefore(a,e.nextSibling),a.parentNode.insertBefore(t.firstChild,a.nextSibling),s(),e.nextSibling===a&&e.parentNode.removeChild(e),a.parentNode.removeChild(a)}}const v=e=>e.reduce((e,t)=>(Array.isArray(t)?e.push(...v(t)):e.push(t),e),[]);function y(e){const t=document.createElement("template");return t.innerHTML=`${e}`.trim(),t.content}function b(e){const t=[];return Object.keys(e).forEach(s=>{let a=e[s];!0===a?t.push(s):!1!==a&&(null==a&&(a=""),t.push(`${s}="${a}"`))}),t.join(" ")}let j,_,w,x;"undefined"!=typeof document&&(j=!!navigator.userAgent.match(/Chrome/),_=!!Element.prototype.moveBefore,w=!_||j,x=_&&j);const $=(e,t,s)=>{try{return"function"!=typeof e?e:e.call(t,t)}catch(e){if(s&&!e._rasti){let s;s=`Error in ${t.constructor.name}#${t.uid} expression`;const a=new Error(s,{cause:e});throw a._rasti=!0,a}throw e}},k=e=>!!(e&&e.dataset&&e.dataset[B.DATASET_ELEMENT]&&e.dataset[B.DATASET_ELEMENT].endsWith("-1")),C=e=>!(!e||!(e.dataset&&e.dataset[B.DATASET_ELEMENT]||e.querySelector&&e.querySelector(`[${B.ATTRIBUTE_ELEMENT}]`))),E=(e,t)=>e.reduce((e,s,a)=>(e.push(s),void 0!==t[a]&&e.push(B.PLACEHOLDER(a)),e),[]).join(""),T=(e,t)=>{const s=B.PLACEHOLDER("(\\d+)"),a=e.match(new RegExp(`^${s}$`));if(a)return[t[parseInt(a[1],10)]];const n=new RegExp(`${s}`,"g"),o=[];let r,l=0;for(;null!==(r=n.exec(e));){const s=e.slice(l,r.index);o.push(B.markAsSafeHTML(s),t[parseInt(r[1],10)]),l=r.index+r[0].length}return o.push(B.markAsSafeHTML(e.slice(l))),o},L=(e,t)=>e.reduce((e,s)=>{const a=t(s[0]);if(1===s.length)"object"==typeof a?e=Object.assign(e,a):"string"==typeof a&&(e[a]=!0);else{const n=s[2]?t(s[1]):s[1];e[a]=n}return e},{}),S=(e,t,s)=>{const a={};return Object.keys(e).forEach(n=>{const o=n.match(/on(([A-Z]{1}[a-z]+)+)/);if(o&&o[1]){const r=o[1].toLowerCase(),l=e[n];if(l){const e=t.addListener(l,r);a[s(r)]=e}}else a[n]=e[n]}),a},M=(e,t,s=!1)=>{const a=B.PLACEHOLDER("(\\d+)"),n=new Map;return s||(e=e.replace(new RegExp(a,"g"),(e,s)=>{const a=t[s];if(a&&a.prototype instanceof B){if(n.has(a))return n.get(a);n.set(a,e)}return e})),e.replace(new RegExp(`<(${a})([^>]*)/>|<(${a})([^>]*)>([\\s\\S]*?)</\\4>`,"g"),(e,s,a,n,o,r,l,i)=>{let p,d,h;if(o?(p=t[r],d=l):(p=void 0!==a?t[a]:s,d=n),!(p.prototype instanceof B))return e;if(o){const e=M(i,t,!0),s=O(e,t);h=T(s,t)}const u=H(d,t);return t.push(function(){const e=L(u,e=>$(e,this,"children options"));return h&&(e.renderChildren=()=>new c(h.map(e=>$(e,this,"children")))),p.mount(e)}),B.PLACEHOLDER(t.length-1)})},A=(e,t)=>{const s=B.PLACEHOLDER("(?:\\d+)");return e.replace(new RegExp(`<(${s}|[a-z]+[1-6]?)(?:\\s*)((?:"[^"]*"|'[^']*'|[^>])*)(/?>)`,"gi"),t)},R=(e,t,s)=>{const a=B.PLACEHOLDER("(?:\\d+)");if(e.match(new RegExp(`^\\s*${a}\\s*$`)))return e;const o=e.match(new RegExp(`^\\s*<([a-z]+[1-6]?|${a})([^>]*)>([\\s\\S]*?)</(\\1|${a})>\\s*$|^\\s*<([a-z]+[1-6]?|${a})([^>]*)/>\\s*$`));if(!o)throw new Error("Invalid component template");let r=0;return A(o[0],(e,o,l,i)=>{const c=0===r,p=++r;if(!c&&!l.match(new RegExp(a)))return e;const d=H(l,t),h=e=>`${e}-${p}`,u=s.length;return s.push({getSelector:function(){return`[${B.ATTRIBUTE_ELEMENT}="${h(this.uid)}"]`},getAttributes:function(){const e=S(L(d,e=>$(e,this,"element attribute")),this.eventsManager,e=>B.ATTRIBUTE_EVENT(e,this.uid));return c&&this.attributes&&Object.assign(e,n(this.attributes,this)),e[B.ATTRIBUTE_ELEMENT]=h(this.uid),e}}),t.push(function(){const e=this.template.elements[u],t=e.getAttributes.call(this);return e.previousAttributes=t,B.markAsSafeHTML(b(t))}),`<${o} ${B.PLACEHOLDER(t.length-1)}${i}`})},O=(e,t)=>{const s=B.PLACEHOLDER("(?:\\d+)");return A(e,(e,a,n,o)=>{if(!n.match(new RegExp(s)))return e;const r=H(n,t),l=function(){return S(L(r,e=>$(e,this,"partial element attribute")),this.eventsManager,e=>B.ATTRIBUTE_EVENT(e,this.uid))};return t.push(function(){const e=l.call(this);return B.markAsSafeHTML(b(e))}),`<${a} ${B.PLACEHOLDER(t.length-1)}${o}`})},D=(e,t,s)=>{const a=B.PLACEHOLDER("(\\d+)");let n=0;return e.replace(new RegExp(a,"g"),function(a,o,r){const l=e.substring(0,r);if(l.lastIndexOf("<")>l.lastIndexOf(">"))return a;const i=++n,c=s.length;return s.push({getStart:function(){return B.MARKER_START(`${this.uid}-${i}`)},getEnd:function(){return B.MARKER_END(`${this.uid}-${i}`)},expression:t[o]}),t.push(function(){return this.template.interpolations[c]}),B.PLACEHOLDER(t.length-1)})},H=(e,t)=>{const s=B.PLACEHOLDER("(\\d+)"),a=[],n=new RegExp(`(?:${s}|([\\w-]+))(?:=(["']?)(?:${s}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/>|\\s*[>"']))+.))?\\3)?`,"g");let o;for(;null!==(o=n.exec(e));){const[,e,s,n,r,l]=o,i=!!n;let c=void 0!==e?t[parseInt(e,10)]:s,p=void 0!==r?t[parseInt(r,10)]:l;i&&void 0===p&&(p=""),void 0!==p?a.push([c,p,i]):a.push([c])}return a},I=["key","state","onCreate","onChange","onHydrate","onBeforeRecycle","onRecycle","onBeforeUpdate","onUpdate"];class B extends l{constructor(e={}){super(...arguments),this.componentOptions=[],I.forEach(t=>{t in e&&(this[t]=e[t],this.componentOptions.push(t))});const t={};Object.keys(e).forEach(s=>{-1===this.viewOptions.indexOf(s)&&-1===this.componentOptions.indexOf(s)&&(t[s]=e[s])}),this.props=new o(t),this.options=e,this.partial=this.partial.bind(this),this.onChange=this.onChange.bind(this),this.onCreate.apply(this,arguments)}events(){const e={};return this.eventsManager.types.forEach(t=>{const a=B.ATTRIBUTE_EVENT(t,this.uid),n=function(e,t,n){const o=n.getAttribute(a);if(o){let a=this.eventsManager.listeners[parseInt(o,10)];"string"==typeof a&&(a=this[a]),s(a),a.call(this,e,t,n)}};e[`${t} [${a}]`]=n,e[t]=n}),e}ensureElement(){if(this.eventsManager=new p,this.template=n(this.template,this),this.el){if(this.el=n(this.el,this),!this.el.parentNode){const e=`Hydration failed in ${this.constructor.name}#${this.uid}`;throw new Error(e)}this.toString(),this.hydrate(this.el.parentNode)}}isContainer(){return 0===this.template.elements.length&&1===this.template.interpolations.length}subscribe(e,t="change",s=this.onChange){return e.on&&this.listenTo(e,t,s),this}hydrate(e){return["model","state","props"].forEach(e=>{this[e]&&this.subscribe(this[e])}),this.isContainer()?(this.children[0].hydrate(e),this.el=this.children[0].el):(this.template.elements.forEach((t,s)=>{0===s?(t.hydrate(e),this.el=t.ref):t.hydrate(this.el)}),this.delegateEvents(),this.template.interpolations.forEach(e=>e.hydrate(this.el)),this.children.forEach(e=>e.hydrate(this.el))),this.onHydrate.call(this),this}recycle(e){return this.onBeforeRecycle.call(this),e&&function(e,t){const s=w&&document.activeElement&&t.contains(document.activeElement)?document.activeElement:null;s&&x&&s.blur(),e.parentNode[_?"moveBefore":"insertBefore"](t,e),e.parentNode.removeChild(e),s&&s!==document.activeElement&&t.contains(s)&&s.focus()}(g(e,B.MARKER_RECYCLED(this.uid),k),this.el),this}updateProps(e){return this.props.set(e),this.onRecycle.call(this),this}getRecycledMarker(){return`\x3c!--${B.MARKER_RECYCLED(this.uid)}--\x3e`}partial(e,...t){const s=T(O(M(E(e,t).trim(),t),t),t).map(e=>$(e,this,"partial"));return new c(s)}renderTemplatePart(e,t,s){const a=$(e,this,"template part");if(null==a||!1===a||!0===a)return"";if(a instanceof i)return`${a}`;if(a instanceof B)return`${t(a,s)}`;if(a instanceof c){if(1===a.items.length)return this.renderTemplatePart(a.items[0],t,s);s.push();const e=a.items.map(e=>(s.increment(),this.renderTemplatePart(e,t,s))).join("");return s.pop(),e}if(Array.isArray(a)){s.pause();const e=v(a).map(e=>this.renderTemplatePart(e,t,s)).join("");return s.resume(),e}if(a instanceof f){const e=a.tracker;e.reset();const s=this.isContainer()?"":`\x3c!--${a.getStart()}--\x3e`,n=this.isContainer()?"":`\x3c!--${a.getEnd()}--\x3e`;return`${s}${this.renderTemplatePart(a.expression,t,e)}${n}`}return`${B.sanitize(a)}`}toString(){this.destroyChildren(),this.eventsManager.reset();const e=(e,t)=>(t.track(e),this.addChild(e));return this.template.parts.map(t=>this.renderTemplatePart(t,e)).join("")}render(){if(this.destroyed)return this;if(!this.el){const e=y(this);return this.hydrate(e),this}this.onBeforeUpdate.call(this),this.eventsManager.reset();const e=this.children;this.children=[];const t=[];return this.template.interpolations.forEach(s=>{const a=s.tracker;a.reset();const n=[],o=[],r=this.renderTemplatePart(s.expression,t=>{let s=t,r=null;return r=t.key?e.find(e=>e.key===t.key):a.findRecyclable(t),r?(s=r.getRecycledMarker(),o.push([r,t]),a.track(r)):(n.push(t),a.track(t)),s},a),l=([e,s],a)=>{t.push([e,s.props.toJSON()]),this.addChild(e).recycle(a),s.destroy()};if(a.hasSingleComponent())return void l(o[0],null);const i=y(r),c=e=>()=>{o.forEach(t=>l(t,e)),n.forEach(t=>this.addChild(t).hydrate(e))};this.isContainer()?s.updateElement(this.el,i,c(this.el.parentNode)):s.update(i,c(this.el))}),e.forEach(e=>{this.children.indexOf(e)<0&&e.destroy()}),t.forEach(([e,t])=>{e.updateProps(t)}),this.isContainer()?this.el=this.children[0].el:(this.template.elements.forEach(e=>e.update()),this.eventsManager.hasPendingTypes()&&this.delegateEvents()),this.onUpdate.call(this),this}onCreate(){}onChange(){this.render()}onHydrate(){}onBeforeRecycle(){}onRecycle(){}onBeforeUpdate(){}onUpdate(){}onDestroy(){}static markAsSafeHTML(e){return new i(e)}static extend(e){const t=this;class s extends t{}return Object.assign(s.prototype,"function"==typeof e?e(t.prototype):e),s}static mount(e,t,s){const a=new this(e);return t&&(s?a.toString():t.append(y(a)),a.hydrate(t)),a}static create(e,...t){"function"==typeof e&&(t=[e],e=["",""]);const s=[],a=[],n=T(D(R(M(E(e,t).trim(),t),t,s),t,a),t);return this.extend({source:null,template(){return{elements:s.map(e=>new h({getSelector:e.getSelector.bind(this),getAttributes:e.getAttributes.bind(this)})),interpolations:a.map(e=>new f({getStart:e.getStart.bind(this),getEnd:e.getEnd.bind(this),expression:e.expression,shouldSkipFind:k,shouldSkipSync:C})),parts:n}}})}}B.ATTRIBUTE_ELEMENT="data-rst-el",B.ATTRIBUTE_EVENT=(e,t)=>`data-rst-on-${e}-${t}`,B.DATASET_ELEMENT="rstEl",B.PLACEHOLDER=e=>`__RASTI_PLACEHOLDER_${e}__`,B.MARKER_RECYCLED=e=>`rst-r-${e}`,B.MARKER_START=e=>`rst-s-${e}`,B.MARKER_END=e=>`rst-e-${e}`;var z=B.create`<div></div>`;const N=e=>null!==e&&"object"==typeof e&&!Array.isArray(e),U=["prefix","generateUid","generateClassName","shouldAttachToDOM","attributes","renderers"];class P{constructor(e,t={}){this.styles=e,this.classes={},U.forEach(e=>{e in t&&(this[e]=t[e])}),this.renderers||(this.renderers=[this.renderStyles,this.parseStyles]),this.prefix||(this.prefix=P.prefix),this.uid=this.generateUid();let s=0;Object.keys(e).forEach(e=>{e.match(P.classRegex)&&(this.classes[e]=this.generateClassName(e,++s))})}generateUid(){const e=JSON.stringify(this.styles);let t=2166136261;for(let s=0;s<e.length;s++)t^=e.charCodeAt(s),t=16777619*t>>>0;return t.toString(36)}generateClassName(e,t){return`${this.prefix[0]}-${this.uid}-${t}`}render(){return this.renderers.map(e=>("string"==typeof e?this[e]:e).bind(this)).reduce((e,t)=>(...s)=>e(t(...s)))(this.styles)}renderStyles(e,t=1){return Object.keys(e).reduce((s,a)=>{const n=e[a];if(N(n)){if(Object.keys(n).length>0){const e=this.renderStyles(n,t+1);s.push(`${a}{${e}}`)}}else null!=n&&s.push(`${a}:${n};`);return s},[]).join("")}parseStyles(e,t,s,a){const n=e=>e in this.classes?`.${this.classes[e]}`:e,o=e=>a&&s?`${s} ${e}`:e.match(P.globalPrefixRegex)?`${s?`${s} `:""}${e.replace(P.globalPrefixRegex,"")}`:n(e).replace(P.referenceRegex,(e,t)=>n(t)).replace(P.nestedRegex,s);return Object.keys(e).reduce((a,n)=>{const r=e[n];if(N(r))if(n.match(P.globalRegex))Object.assign(t||a,this.parseStyles(r,a,s,!0));else if((n.match(P.nestedRegex)||n.match(P.globalPrefixRegex))&&t){const e=o(n);t[e]={},Object.assign(t[e],this.parseStyles(r,t,e))}else{const e=o(n);a[e]={};const t=e.match(/@/)?[]:[a,e];Object.assign(a[e],this.parseStyles(r,...t))}else null!=r&&(a[n.match(/-/)?n:(l=n,l.replace(/([A-Z])/g,e=>`-${e[0].toLowerCase()}`))]=r);var l;return a},{})}getAttributes(){const e=Object.assign({},this.attributes);return e[`data-${this.prefix}-uid`]=this.uid,e}toString(){const e=this.getAttributes();return`<style${Object.keys(e).map(t=>` ${t}="${e[t]}"`).join("")}>${this.render()}</style>`}shouldAttachToDOM(){return"undefined"!=typeof document&&!document.querySelector(`style[data-${this.prefix}-uid="${this.uid}"]`)}attach(){if(P.registry.some(({uid:e})=>e===this.uid)||P.registry.push(this),this.shouldAttachToDOM()){this.el=document.createElement("style");const e=this.getAttributes();Object.keys(e).forEach(t=>{this.el.setAttribute(t,e[t])}),this.el.textContent=this.render(),document.head.appendChild(this.el)}return this}destroy(){const e=P.registry.indexOf(this);return e>-1&&P.registry.splice(e,1),this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null),this}static toString(){return P.registry.join("")}static toCSS(){return P.registry.map(e=>e.render()).join("")}static destroy(){P.registry.slice().forEach(e=>e.destroy())}}P.classRegex=/^\w+$/,P.globalRegex=/^@global$/,P.globalPrefixRegex=/^@global\s+/,P.referenceRegex=/\$(\w+)/g,P.nestedRegex=/&/g,P.prefix="fun",P.indent="    ",P.registry=[],P.debug=!1;const W=(e,t)=>e.reduce((e,s,a)=>(Object.assign(e,t(s,a)),e),{}),F=e=>`@media (min-width: ${{sm:640,md:768,lg:1024,xl:1280,xxl:1536}[e]}px)`,V=e=>W(["primary","secondary","neutral","error","warning","success"],e),q=(e,t)=>new P(e,t).attach(),K=e=>e.charAt(0).toUpperCase()+e.slice(1),Z=q({root:{borderRadius:"var(--rui-components-Surface-borderRadius, var(--rui-borderRadius-md))",padding:"var(--rui-components-Surface-padding, var(--rui-spacing-md))",backgroundColor:"var(--rui-components-Surface-backgroundColor, var(--rui-palette-neutral-backgroundLevel2))",fontFamily:"var(--rui-fontFamily-body)",fontSize:"var(--rui-fontSize-bodyMd)"},...V(e=>({[e]:{color:`var(--rui-palette-${e}-foregroundMain)`}})),outlined:{...V(e=>({[`&:where($${e})`]:{border:`1px solid var(--rui-components-Surface-borderColor, rgb(var(--rui-palette-${e}-rgb-level1) / 0.4))`}}))},solid:{...V(e=>({[`&:where($${e})`]:{backgroundColor:`var(--rui-components-Surface-backgroundColor, var(--rui-palette-${e}-main))`,color:`var(--rui-palette-${e}-contrastMain)`}}))},...((e,t="xs",s="xl")=>{const a=["xxs","xs","sm","md","lg","xl","xxl","xxxl","xxxxl"],n=a.slice(a.indexOf(t),a.indexOf(s)+1);return W(n,e)})(e=>({[`shadow${K(e)}`]:{boxShadow:`var(--rui-shadow-${e})`}}))}),J=z.create`
    <${({options:e})=>e.tag||"div"} class="${({props:e})=>{const t=e.classes?{...Z.classes,...e.classes}:Z.classes;return[t.root,t[e.variant||"outlined"],t[e.color||"neutral"],e.shadow?t[`shadow${K(e.shadow)}`]:null,e.className||null].filter(Boolean).join(" ")}}">
        ${({props:e})=>e.renderChildren&&e.renderChildren()}
    </${({options:e})=>e.tag||"div"}>
`,Y=q({root:{display:"inline-flex",alignItems:"center",justifyContent:"space-evenly",borderRadius:"var(--rui-components-Button-borderRadius, var(--rui-borderRadius-xs))",padding:"var(--rui-components-Button-padding, var(--rui-spacing-sm))",maxHeight:"100%",fontFamily:"var(--rui-typography-button-fontFamily)",fontWeight:"var(--rui-typography-button-fontWeight)",fontSize:"var(--rui-typography-button-fontSize)",lineHeight:"var(--rui-typography-button-lineHeight)",textTransform:"var(--rui-typography-button-textTransform)",textDecoration:"var(--rui-typography-button-textDecoration)",transition:"background-color 0.1s, color 0.1s, border-color 0.1s","&>svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"&>svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"&>svg:only-child":{padding:"0"}},...V(e=>({[e]:{}})),disabled:{},solid:{...V(e=>({[`&:where($${e})`]:{border:`1px solid var(--rui-components-Button-borderColor, var(--rui-palette-${e}-main))`,color:`var(--rui-components-Button-color, rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95))`,backgroundColor:`var(--rui-components-Button-backgroundColor, var(--rui-palette-${e}-main))`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-dark)`,border:`1px solid var(--rui-palette-${e}-dark)`},"&:where($disabled)":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`}}}}))},outlined:{...V(e=>({[`&:where($${e})`]:{border:`1px solid var(--rui-components-Button-borderColor, var(--rui-palette-${e}-main))`,color:`var(--rui-components-Button-color, var(--rui-palette-${e}-foregroundMain))`,backgroundColor:"transparent","&:hover":{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-light) / 0.2)`},"&:where($disabled)":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,border:`1px solid rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,backgroundColor:"transparent"}}}}))},plain:{...V(e=>({[`&:where($${e})`]:{border:"none",background:"transparent",color:`var(--rui-palette-${e}-foregroundMain)`,"&:hover":{color:`var(--rui-palette-${e}-foregroundDark)`},"&:where($disabled)":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`}}}}))},group:{"&:not(:first-child)":{marginLeft:"-1px",...V(e=>({[`&$solid$${e}`]:{borderLeftColor:`var(--rui-palette-${e}-dark)`}}))},"&:not(:first-child):not(:last-child)":{borderRadius:"0"},"&:first-child":{borderTopRightRadius:"0",borderBottomRightRadius:"0"},"&:last-child":{borderTopLeftRadius:"0",borderBottomLeftRadius:"0"}},lg:{fontSize:"var(--rui-fontSize-xl)"},sm:{fontSize:"var(--rui-fontSize-xs)"}}),X=z.create`
    <${({props:e})=>e.href?"a":e.type?"input":"button"}
        class="${({props:e})=>(e=>{const t=e.classes?{...Y.classes,...e.classes}:Y.classes;return[t.root,t[e.size||"md"],t[e.variant||"solid"],t[e.color||"neutral"],e.disabled?t.disabled:null,e.group?t.group:null,e.className||null].filter(Boolean).join(" ")})(e)}"
        onClick="${({props:e})=>e.onClick||!1}"
        href="${({props:e})=>e.href||!1}"
        type="${({props:e})=>e.type||!1}"
        value="${({props:e})=>e.type&&e.label||!1}"
        disabled="${({props:e})=>e.disabled||!1}"
        target="${({props:e})=>e.target||!1}"
        title="${({props:e})=>e.title||!1}"
    >
        ${e=>e.renderChildren()}
    </${({props:e})=>e.href?"a":e.type?"input":"button"}>
`.extend({renderChildren:function(){return this.props.type?null:this.props.renderChildren?this.props.renderChildren():this.partial`
            ${this.props.renderLeftIcon&&this.props.renderLeftIcon()}
            <span>${this.props.label}</span>
            ${this.props.renderRightIcon&&this.props.renderRightIcon()}
        `}});var G=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
    </svg>
`;const Q=q({root:{position:"fixed",top:0,right:0,bottom:0,left:0,display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"var(--rui-components-Dialog-backgroundColor, rgb(var(--rui-palette-neutral-rgb-level3) / 0.2))",backdropFilter:"blur(5px)",zIndex:"var(--rui-zIndex-dialogBackdrop, 1500)",padding:"var(--rui-components-Dialog-padding, var(--rui-spacing-md))"},dialog:{position:"relative",display:"flex",flexDirection:"column",maxHeight:"calc(var(--rui-viewport-height) * 0.9)",maxWidth:"calc(var(--rui-viewport-width) * 0.9)",width:"auto",minWidth:"250px",padding:"var(--rui-spacing-sm)"},left:{justifyContent:"flex-start"},right:{justifyContent:"flex-end"},top:{alignItems:"flex-start"},bottom:{alignItems:"flex-end"},header:{position:"relative",display:"flex",justifyContent:"center",alignItems:"center",minHeight:"var(--rui-spacing-xxxl)","& :where(button)":{position:"absolute",top:0,right:0,margin:0,padding:0,borderRadius:"50%"}},title:{fontSize:"var(--rui-fontSize-md)",fontWeight:"var(--rui-fontWeight-md)",color:"var(--rui-palette-neutral-foregroundMain)",textAlign:"center",padding:0,margin:"var(--rui-spacing-xs)"},content:{flex:1,overflowY:"auto",overflowX:"hidden",padding:"var(--rui-spacing-md)",minHeight:0},footer:{display:"flex",justifyContent:"space-evenly",paddingTop:"var(--rui-spacing-md)",flexShrink:0}}),ee=z.create`
    <div class="${({props:e})=>[ae(e).header,e.className||null].filter(Boolean).join(" ")}">
        ${e=>e.renderHeaderContent()}
    </div>
`.extend({renderHeaderContent(){if(this.props.renderChildren)return this.props.renderChildren();const e=ae(this.props);return this.partial`
            ${this.props.title?this.partial`<h2 class="${e.title}">${this.props.title}</h2>`:null}
            ${this.props.handleClose&&this.props.closeButton?this.partial`<${X}
                    onClick=${this.props.handleClose}
                    color="neutral"
                    variant="outlined"
                    size="sm"
                >
                    <${G} />
                </${X}>`:null}
        `}}),te=z.create`
    <div class="${({props:e})=>[ae(e).content,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,se=z.create`
    <div class="${({props:e})=>[ae(e).footer,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,ae=e=>e.classes?{...Q.classes,...e.classes}:Q.classes,ne=({variant:e,color:t,shadow:s})=>({variant:e,color:t,shadow:s}),oe=z.create`
    <div
        class="${({props:e})=>(e=>{const t=ae(e);return[t.root,e.top?t.top:null,e.bottom?t.bottom:null,e.left?t.left:null,e.right?t.right:null,e.className||null].filter(Boolean).join(" ")})(e)}"
        onClick=${function(e){this.props.handleClose&&e.target===this.el&&this.props.handleClose()}}}
    >
        <${J} 
            ${({props:e})=>({...ne(e),className:ae(e).dialog})}
            onClick=${function(e){e.stopPropagation()}}
        >
            ${({props:e})=>e.renderChildren()}
        </${J}>
    </div>
`.extend({onCreate(){this.handleEscape=e=>{"Escape"===e.key&&this.props.handleClose&&this.props.handleClose()},this.handleClickOutside=e=>{this.props.handleClose&&!this.el.contains(e.target)&&this.props.handleClose()}},onHydrate(){const e=document.body.style.overflow;document.body.style.overflow="hidden",this._originalOverflow=e,document.addEventListener("keydown",this.handleEscape),setTimeout(()=>{document.addEventListener("click",this.handleClickOutside)},0)},onDestroy(){void 0!==this._originalOverflow&&(document.body.style.overflow=this._originalOverflow),document.removeEventListener("keydown",this.handleEscape),document.removeEventListener("click",this.handleClickOutside)}});oe.Header=ee,oe.Content=te,oe.Footer=se;var re=function s(a){var n=t[a];if(void 0!==n)return n.exports;var o=t[a]={exports:{}};return e[a](o,o.exports,s),o.exports}(663);const le=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),ie=q({root:{color:"var(--rui-components-Text-color, var(--rui-palette-neutral-foregroundLevel1))",margin:"var(--rui-components-Text-margin, var(--rui-spacing-md) 0)"},h1:le("h1"),h2:le("h2"),h3:le("h3"),h4:le("h4"),titleLg:le("titleLg"),titleMd:le("titleMd"),titleSm:le("titleSm"),bodyLg:le("bodyLg"),bodyMd:le("bodyMd"),bodySm:le("bodySm"),caption:le("caption")}),ce=e=>{switch(e.level){case"h1":return"h1";case"h2":case"titleLg":case"titleMd":case"titleSm":return"h2";case"h3":return"h3";case"h4":return"h4";case"caption":return"caption";default:return"p"}},pe=z.create`
    <${({props:e})=>ce(e)} class="${({props:e})=>(e=>{const t=e.classes?{...ie.classes,...e.classes}:ie.classes;return[t.root,t[e.level||"bodyMd"],e.className||null].filter(Boolean).join(" ")})(e)}">
        ${({props:e})=>e.renderChildren&&e.renderChildren()}
    </${({props:e})=>ce(e)}>
`;var de=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-3.536-3.475a.75.75 0 0 0 1.061 0 3.5 3.5 0 0 1 4.95 0 .75.75 0 1 0 1.06-1.06 5 5 0 0 0-7.07 0 .75.75 0 0 0 0 1.06ZM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5Zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5Z" clip-rule="evenodd"/>
    </svg>
`;const{classes:he}=q({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",minHeight:"var(--rui-viewport-height)"},iconContainer:{display:"flex",justifyContent:"center",alignItems:"center",width:"140px",height:"140px",borderRadius:"50%",backgroundColor:"var(--rui-palette-neutral-main)",marginBottom:"var(--rui-spacing-md)"},icon:{width:"120px",height:"120px",fill:"var(--rui-palette-warning-main)"}}),ue=z.create`
    <div class="${he.root}">
        <div class="${he.iconContainer}">
            <${de} className=${he.icon} />
        </div>
        <${pe} level="h1">
            404
        </${pe}>
        <${pe} level="h3">
            Page Not Found
        </${pe}>
        <${pe} level="bodyMd">
            The page you are looking for does not exist.
        </${pe}>
    </div>
`,{classes:me}=q({"@global":{body:{margin:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel1)",fontFamily:"var(--rui-fontFamily-body)"},"a.anchor, h2":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-sm))"}},root:{},appBarMenuDialog:{},[F("sm")]:{$appBarMenuDialog:{display:"none"}}}),{classes:ge}=q({section:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-sm)"},left:{flex:"0 0 auto",justifyContent:"flex-start"},center:{flex:"1 1 auto",justifyContent:"center"},right:{flex:"0 0 auto",justifyContent:"flex-end"}}),fe=z.create`
    <div class="${({props:e})=>[ge.section,ge.left,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,ve=z.create`
    <div class="${({props:e})=>[ge.section,ge.center,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,ye=z.create`
    <div class="${({props:e})=>[ge.section,ge.right,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,be=q({root:{position:"sticky",top:0,zIndex:"var(--rui-zIndex-appBar, 1000)",display:"flex",alignItems:"center",minHeight:"56px",padding:"var(--rui-components-AppBar-padding, var(--rui-spacing-sm) var(--rui-spacing-md))",gap:"var(--rui-spacing-md)",borderBottom:"1px solid var(--rui-components-AppBar-borderColor, rgba(var(--rui-palette-neutral-rgb-foregroundSoftLevel3) / 0.5))",transition:"background-color 0.2s ease, border-color 0.2s ease",backgroundColor:"var(--rui-components-AppBar-backgroundColor, var(--rui-palette-neutral-backgroundLevel1))"},outlined:{...V(e=>({[`&:where($${e})`]:{borderBottomColor:`var(--rui-palette-${e}-foregroundSoftLevel3)`}}))},solid:{...V(e=>({[`&:where($${e})`]:{backgroundColor:`var(--rui-components-AppBar-backgroundColor, var(--rui-palette-${e}-main))`,borderBottomColor:`var(--rui-components-AppBar-borderColor, var(--rui-palette-${e}-main))`,color:`var(--rui-palette-${e}-contrastMain)`},[`&:where($${e}) *`]:{color:`var(--rui-palette-${e}-contrastMain)`}}))},...V(e=>({[e]:{}}))}),je=z.create`
    <header
        class="${({props:e})=>(e=>{const t=e.classes?{...be.classes,...e.classes}:be.classes;return[t.root,t[e.variant||"outlined"],t[e.color||"neutral"],e.className||null].filter(Boolean).join(" ")})(e)}"
    >
        ${({props:e})=>e.renderChildren()}
    </header>
`;je.Left=fe,je.Center=ve,je.Right=ye;var _e=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>
    </svg>
`,we=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"/>
    </svg>
`,xe=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd"/>
    </svg>
`;const{classes:$e}=q({root:{display:"flex",justifyContent:"right",alignItems:"center",height:"60px","& ul":{padding:0}},icon:{width:"24px",height:"24px",cursor:"pointer",fill:"var(--rui-palette-neutral-main)","&:hover":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),ke=z.create`
    <div class="${$e.root}">
        <ul>
            <li class="${$e.hiddenIfDark}">
                ${()=>X.mount({variant:"plain",renderChildren:()=>we.mount({className:$e.icon}),onClick:()=>document.documentElement.setAttribute("data-color-scheme","dark")})}
            </li>
            <li class="${$e.hiddenIfLight}">
                ${()=>X.mount({variant:"plain",renderChildren:()=>xe.mount({className:$e.icon}),onClick:()=>document.documentElement.setAttribute("data-color-scheme","light")})}
            </li>
        </ul>
    </div>
`,Ce=z.create`
    <svg class="${({props:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
    </svg>
`,Ee=z.create`
    <svg class="${({props:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 32 32">
        <path d="M 0 10 L 0 21 L 9 21 L 9 23 L 16 23 L 16 21 L 32 21 L 32 10 L 0 10 z M 1.7773438 11.777344 L 8.8886719 11.777344 L 8.890625 11.777344 L 8.890625 19.445312 L 7.1113281 19.445312 L 7.1113281 13.556641 L 5.3339844 13.556641 L 5.3339844 19.445312 L 1.7773438 19.445312 L 1.7773438 11.777344 z M 10.667969 11.777344 L 17.777344 11.777344 L 17.779297 11.777344 L 17.779297 19.443359 L 14.222656 19.443359 L 14.222656 21.222656 L 10.667969 21.222656 L 10.667969 11.777344 z M 19.556641 11.777344 L 30.222656 11.777344 L 30.224609 11.777344 L 30.224609 19.445312 L 28.445312 19.445312 L 28.445312 13.556641 L 26.667969 13.556641 L 26.667969 19.445312 L 24.890625 19.445312 L 24.890625 13.556641 L 23.111328 13.556641 L 23.111328 19.445312 L 19.556641 19.445312 L 19.556641 11.777344 z M 14.222656 13.556641 L 14.222656 17.667969 L 16 17.667969 L 16 13.556641 L 14.222656 13.556641 z"></path>
    </svg>
`,{classes:Te}=q({root:{height:"var(--rui-app-appBarHeight)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",position:"fixed",top:0,left:0,right:0,zIndex:1e3,padding:0},leftContent:{display:"flex",alignItems:"center"},rightContent:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-xs)"},navLinks:{display:"none","& ul":{display:"flex",justifyContent:"center",alignItems:"center",listStyle:"none",padding:0,margin:0,gap:"var(--rui-spacing-xs)","& li":{margin:0}}},menuButton:{display:"block"},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-neutral-main)","a:hover &":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"},logoInactive:{opacity:.5},menuContent:{"& nav":{maxWidth:"100%",display:"flex",justifyContent:"center",alignItems:"center","& ul":{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"var(--rui-spacing-md)"}}}},[F("sm")]:{$navLinks:{display:"block"},$menuButton:{display:"none"}}}),{classes:Le}=q({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-xl) 0 var(--rui-spacing-xxxxl) 0",borderTop:"1px solid rgb(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)","@global":{a:{color:"var(--rui-palette-neutral-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-neutral-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-neutral-dark)"}}}},text:{color:"var(--rui-palette-neutral-foregroundLevel3)"}}),{classes:Se}=q({root:{display:"flex",justifyContent:"center",alignItems:"center",height:"var(--rui-viewport-height)",flexDirection:"column",backgroundColor:"var(--rui-palette-neutral-backgroundLevel3)",boxShadow:"var(--rui-shadow-xs)",padding:"0 var(--rui-spacing-xl)",overflow:"hidden","@global":{h1:{textAlign:"center",margin:"var(--rui-app-appBarHeight) 0 0 0"},h2:{color:"var(--rui-palette-neutral-foregroundLevel2)",marginTop:0,marginBottom:"var(--rui-spacing-sm)"},h4:{color:"var(--rui-palette-neutral-foregroundLevel3)",marginBottom:"var(--rui-spacing-md)"},"h1 img":{width:"90%"},pre:{maxWidth:"100%"},code:{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"}}},buttons:{"& a":{margin:"var(--rui-spacing-md) var(--rui-spacing-xs)"},display:"flex",justifyContent:"center"},[F("sm")]:{"$root h1":{margin:"var(--rui-app-appBarHeight) 0 0 0"},"$root h2":{marginBottom:"var(--rui-spacing-xl)"},"$root h4":{marginBottom:"var(--rui-spacing-xxl)"},"$root h1 img":{width:"75%"},"$buttons a":{margin:"var(--rui-spacing-xxxl) var(--rui-spacing-lg)"}},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-secondary-main)"},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),Me=(e=>{const{logoAlt:t,tagline:s,renderSubtitle:a,CoverCodeExample:n,githubUrl:o}=e;return z.create`
        <section class="${Se.root}">
            <h1>
                <img class="${Se.hiddenIfLight}" alt="${t}" src="/logo-dark.svg">
                <img class="${Se.hiddenIfDark}" alt="${t}" src="/logo.svg">
            </h1>

            <${pe} level="h2">${s}</${pe}>

            ${({partial:e})=>a?e`<${pe} level="h4">${a}</${pe}>`:null}

            <${n} />

            <div class="${Se.buttons}">
                <${X} 
                    label="Getting Started"
                    color="primary"
                    variant="outlined"
                    href="#gettingstarted"
                />
                <${X} 
                    label="GitHub"
                    color="secondary"
                    variant="outlined"
                    href="${o}"
                    target="_blank"
                    renderLeftIcon=${()=>Ce.mount({className:Se.icon})}
                />
            </div>
        </section>
    `})({logoAlt:"Rasti.js",tagline:"Modern MVC for building user interfaces",CoverCodeExample:z.create`
    <pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ count : <span class="hljs-number">0</span> \});

<span class="hljs-keyword">const</span> <span class="hljs-title class_">Counter</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        &lt;div&gt;Counter: <span class="hljs-subst">\$\{() =&gt; model.count\}</span>&lt;/div&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{() =&gt; model.count++\}</span>&gt;Increment&lt;/button&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{() =&gt; model.count--\}</span>&gt;Decrement&lt;/button&gt;
    &lt;/div&gt;
\`</span>;

<span class="hljs-title class_">Counter</span>.<span class="hljs-title function_">mount</span>(\{ model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);</code></pre>
`,githubUrl:"https://github.com/8tentaculos/rasti"}),{classes:Ae}=q({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)"}}),Re=z.create`
    <div class="${Ae.root}">
        <${pe} level="h3">
            <strong>Rasti</strong> is a lightweight MVC library for building fast, reactive user interfaces.
        </${pe}>
        <${pe} level="h4">
            It provides declarative, composable <strong>components</strong> for building state-driven UIs.<br>
            Its low-level MVC core, inspired by <strong>Backbone.js</strong>’s architecture, provides <strong>models</strong>, <strong>views</strong> and <strong>event emitters</strong> as the fundamental building blocks.
        </${pe}>
    </div>
`,Oe=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:De}=q({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Oe("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Oe("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"center","& section":{"& h5":{margin:"var(--rui-spacing-xs) 0",padding:"0"},margin:"var(--rui-spacing-md)",width:"400px"}},[F("md")]:{$root:{justifyContent:"space-between"}}}),He=z.create`
            <section class="${({props:e})=>(e=>[e.className||null,De.root].join(" "))(e)}"><${J} tag="section" shadow="sm"><h5 id="declarativecomponents">Declarative Components 🌟</h5>
<p>Build dynamic UI components using intuitive template literals.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="eventdelegation">Event Delegation 🎯</h5>
<p>Simplify event handling with built-in delegation.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="modelviewbinding">Model-View Binding 🔗</h5>
<p>Keep your UI and data in sync with ease.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="serversiderendering">Server-Side Rendering 🌐</h5>
<p>Render as plain text for server-side use or static builds.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="lightweightandfast">Lightweight and Fast ⚡</h5>
<p>Minimal overhead with efficient rendering.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="legacycompatibility">Legacy Compatibility 🕰️</h5>
<p>Seamlessly integrates into existing <strong>Backbone.js</strong> legacy projects.  </p></${J}><${J} tag="section" shadow="sm"><h5 id="standardsbased">Standards-Based 📐</h5>
<p>Built on modern web standards, no tooling required.  </p></${J}></section>
        `,Ie=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Be}=q({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Ie("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Ie("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}}}}),ze=z.create`
            <section class="${({props:e})=>(e=>[e.className||null,Be.root].join(" "))(e)}"><h2 id="gettingstarted">Getting Started</h2>
<h3 id="installingvianpm">Installing via npm</h3>
<pre><code class="bash language-bash">\$ npm install rasti</code></pre>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Model</span>, <span class="hljs-title class_">Component</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;</code></pre>
<h3 id="usingesmodulesviacdn">Using ES modules via CDN</h3>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Model</span>, <span class="hljs-title class_">Component</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;https://esm.run/rasti&#x27;</span>;</code></pre>
<h3 id="usingaumdbuildviacdn">Using a UMD build via CDN</h3>
<p>Include <strong>Rasti</strong> directly in your HTML using a CDN. Available UMD builds:</p>
<ul>
<li><a target="_blank" href="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.js">rasti.js</a></li>
<li><a target="_blank" href="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js">rasti.min.js</a></li>
</ul>
<pre><code class="html language-html"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">&quot;https://cdn.jsdelivr.net/npm/rasti&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span></code></pre>
<p>The UMD build exposes the <code>Rasti</code> global object:</p>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> \{ <span class="hljs-title class_">Model</span>, <span class="hljs-title class_">Component</span> \} = <span class="hljs-title class_">Rasti</span>;</code></pre>
<h3 id="createacomponent">Create a <code>Component</code></h3>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Define a Timer component that displays the number of seconds from the model.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Timer</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        Seconds: &lt;span&gt;<span class="hljs-subst">\$\{(\{ model \}) =&gt; model.seconds\}</span>&lt;/span&gt;
    &lt;/div&gt;
\`</span>;

<span class="hljs-comment">// Create a model to store the seconds.</span>
<span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ seconds : <span class="hljs-number">0</span> \});

<span class="hljs-comment">// Mount the Timer component to the body and pass the model as an option.</span>
<span class="hljs-title class_">Timer</span>.<span class="hljs-title function_">mount</span>(\{ model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);

<span class="hljs-comment">// Increment the \`seconds\` property of the model every second.</span>
<span class="hljs-comment">// Only the text node inside the &lt;span&gt; gets updated on each render.</span>
<span class="hljs-built_in">setInterval</span>(<span class="hljs-function">() =&gt;</span> model.<span class="hljs-property">seconds</span>++, <span class="hljs-number">1000</span>);</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010">Try it on CodePen</a></p>
<h3 id="addingsubcomponents">Adding sub components</h3>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Define the routes for the navigation menu.</span>
<span class="hljs-keyword">const</span> routes = [
    \{ label : <span class="hljs-string">&#x27;Home&#x27;</span>, href : <span class="hljs-string">&#x27;#&#x27;</span> \},
    \{ label : <span class="hljs-string">&#x27;Faq&#x27;</span>, href : <span class="hljs-string">&#x27;#faq&#x27;</span> \},
    \{ label : <span class="hljs-string">&#x27;Contact&#x27;</span>, href : <span class="hljs-string">&#x27;#contact&#x27;</span> \},
];

<span class="hljs-comment">// Create a Link component for navigation items.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Link</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;a href=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.href\}</span>&quot;&gt;
        <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>
    &lt;/a&gt;
\`</span>;

<span class="hljs-comment">// Create a Navigation component that renders Link components for each route.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Navigation</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;nav&gt;
        <span class="hljs-subst">\$\{(\{ props, partial \}) =&gt; props.routes.map(
            (\{ label, href \}) =&gt; partial<span class="hljs-string">\`&lt;<span class="hljs-subst">\$\{Link\}</span> href=&quot;<span class="hljs-subst">\$\{href\}</span>&quot;&gt;<span class="hljs-subst">\$\{label\}</span>&lt;/<span class="hljs-subst">\$\{Link\}</span>&gt;\`</span>
        )\}</span>
    &lt;/nav&gt;
\`</span>;

<span class="hljs-comment">// Create a Main component that includes the Navigation and displays the current route&#x27;s label as the title.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Main</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;main&gt;
        &lt;<span class="hljs-subst">\$\{Navigation\}</span> routes=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.routes\}</span>&quot; /&gt;
        &lt;section&gt;
            &lt;h1&gt;
                <span class="hljs-subst">\$\{(\{ model, props \}) =&gt; props.routes.find(
                    (\{ href \}) =&gt; href === (model.location || <span class="hljs-string">&#x27;#&#x27;</span>)
                ).label\}</span>
            &lt;/h1&gt;
        &lt;/section&gt;
    &lt;/main&gt;
\`</span>;

<span class="hljs-comment">// Initialize a model to store the current location.</span>
<span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ location : <span class="hljs-variable language_">document</span>.<span class="hljs-property">location</span>.<span class="hljs-property">hash</span> \});

<span class="hljs-comment">// Update the model&#x27;s location state when the browser&#x27;s history changes.</span>
<span class="hljs-variable language_">window</span>.<span class="hljs-title function_">addEventListener</span>(<span class="hljs-string">&#x27;popstate&#x27;</span>, <span class="hljs-function">() =&gt;</span> model.<span class="hljs-property">location</span> = <span class="hljs-variable language_">document</span>.<span class="hljs-property">location</span>.<span class="hljs-property">hash</span>);

<span class="hljs-comment">// Mount the Main component to the body, passing the routes and model as options.</span>
<span class="hljs-title class_">Main</span>.<span class="hljs-title function_">mount</span>(\{ routes, model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/dyBMNbq?editors=0010">Try it on CodePen</a></p>
<h3 id="addingeventlisteners">Adding event listeners</h3>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Create a model to store the counter value.</span>
<span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ count : <span class="hljs-number">0</span> \});

<span class="hljs-comment">// Create a Counter component with increment and decrement buttons.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Counter</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        &lt;div&gt;Counter: <span class="hljs-subst">\$\{(\{ model \}) =&gt; model.count\}</span>&lt;/div&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{<span class="hljs-keyword">function</span>() \{ <span class="hljs-variable language_">this</span>.model.count++; \}\}</span>&gt;Increment&lt;/button&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{<span class="hljs-keyword">function</span>() \{ <span class="hljs-variable language_">this</span>.model.count--; \}\}</span>&gt;Decrement&lt;/button&gt;
    &lt;/div&gt;
\`</span>;

<span class="hljs-comment">// Mount the Counter component to the body and pass the model as an option.</span>
<span class="hljs-title class_">Counter</span>.<span class="hljs-title function_">mount</span>(\{ model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);

<span class="hljs-comment">// Event listeners are bound to &#x27;this&#x27; and use delegation from the root element.</span>
<span class="hljs-comment">// When buttons are clicked, only the text node gets updated, not the entire component.</span></code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/XJXVQOR?editors=0010">Try it on CodePen</a></p>
<h2 id="whychooserasti">Why Choose <strong>Rasti</strong>?</h2>
<p><strong>Rasti</strong> is built for developers who want a simple yet powerful way to create UI components without the complexity of heavy frameworks. Whether you're building a high-performance dashboard, or embedding a lightweight widget, <strong>Rasti</strong> lets you:  </p>
<ul>
<li><strong>Skip the Setup</strong><br />
No installations, no build tools—just load it and start coding.  </li>
<li><strong>Lightweight and Efficient</strong><br />
Minimal footprint with optimized performance, ensuring smooth updates.  </li>
<li><strong>Just the Right Abstraction</strong><br />
Keeps you close to the DOM with no over-engineering. Fully hackable, if you're curious about how something works, just check the source code.  </li>
</ul>
<h2 id="example">Example</h2>
<p>You can find a sample <strong>TODO application</strong> in the <a target="_blank" href="https://github.com/8tentaculos/rasti/tree/master/example/todo">example folder</a> of the <strong>Rasti</strong> <a target="_blank" href="https://github.com/8tentaculos/rasti">GitHub repository</a>. This example serves as a great starting point for your own projects. Try it live <a target="_blank" href="https://rasti.js.org/example/todo/index.html">here</a>.</p>
<h2 id="apidocumentation">API Documentation</h2>
<p>For detailed information on how to use <strong>Rasti</strong>, refer to the <a data-router href="/api/">API documentation</a>.</p>
<h2 id="workingwithllms">Working with LLMs</h2>
<p>For those working with LLMs, there is an <a target="_blank" target="_blank" href="https://github.com/8tentaculos/rasti/blob/master/docs/AGENTS.md">AI Agents reference guide</a> that provides API patterns, lifecycle methods, and best practices, optimized for LLM context. You can share this guide with AI assistants to help them understand <strong>Rasti</strong>'s architecture and component APIs.</p>
<h2 id="versionhistory">Version History</h2>
<p>We strive to minimize breaking changes between major versions. However, if you're migrating between major versions, please refer to the release notes below for details on any breaking changes and migration tips.</p>
<ul>
<li><strong><a target="_blank" href="https://github.com/8tentaculos/rasti/releases/tag/v4.0.0">v4.0.0</a></strong></li>
<li><strong><a target="_blank" href="https://github.com/8tentaculos/rasti/releases/tag/v3.0.0">v3.0.0</a></strong></li>
<li><strong><a target="_blank" href="https://github.com/8tentaculos/rasti/releases/tag/v2.0.0">v2.0.0</a></strong></li>
<li><strong><a target="_blank" href="https://github.com/8tentaculos/rasti/releases/tag/v1.0.0">v1.0.0</a></strong></li>
</ul></section>
        `;var Ne=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z" clip-rule="evenodd"/>
    </svg>
`;const{classes:Ue}=q({header:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-xs)",marginBottom:"var(--rui-spacing-sm)",flexShrink:0},collapseButton:{width:"32px",height:"32px",padding:0,opacity:.4,transition:"transform 0.2s ease, opacity 0.2s ease"},collapseButtonRotated:{transform:"rotate(180deg)"},...V(e=>({[e]:{}})),outlined:{...V(e=>({[`&$${e}`]:{}}))},solid:{...V(e=>({[`&$${e} $collapseButton`]:{opacity:1},[`&$${e} $collapseButton`]:{color:`var(--rui-palette-${e}-contrastMain) !important`}}))}}),Pe=z.create`
    <div class="${({props:e})=>[Ue.header,Ue[e.variant||"outlined"],Ue[e.color||"neutral"]].filter(Boolean).join(" ")}">
        <${X} 
            variant="outlined"
            color="${({props:e})=>e.color||"neutral"}"
            size="sm"
            className="${({props:e})=>`${Ue.collapseButton} ${e.collapsed?Ue.collapseButtonRotated:""}`}"
            onClick="${({props:e})=>e.handleToggle}"
        >
            <${Ne} />
        </${X}>
    </div>
`,{classes:We}=q({root:{position:"sticky",top:0,alignSelf:"flex-start",height:"100%",maxHeight:"var(--rui-viewport-height)",display:"flex",flexDirection:"column",maxWidth:"280px",borderRight:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundSoftLevel3) / 0.5)",transition:"max-width 0.2s ease, padding 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",padding:"var(--rui-spacing-lg)"},expanded:{},collapsed:{maxWidth:"32px",overflow:"hidden"},content:{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",opacity:1,transition:"opacity 0.2s ease, color 0.2s ease"},contentHidden:{opacity:0,visibility:"hidden"},outlined:{...V(e=>({[`&:where($${e})`]:{borderRightColor:`var(--rui-palette-${e}-foregroundSoftLevel3)`}}))},solid:{...V(e=>({[`&:where($${e})`]:{backgroundColor:`var(--rui-palette-${e}-main)`,borderRightColor:`var(--rui-palette-${e}-main)`},[`&:where($${e}) :where($content)`]:{color:`var(--rui-palette-${e}-contrastMain)`},[`&:where($${e}) :where($content) button`]:{color:`var(--rui-palette-${e}-contrastMain)`},[`&:where($${e}) :where($content) h3`]:{color:`var(--rui-palette-${e}-contrastMain)`}}))},...V(e=>({[e]:{}}))}),Fe=z.create`
    <div class="${({props:e})=>[We.content,e.collapsed?We.contentHidden:null,e.className||null].filter(Boolean).join(" ")}">
        ${({props:e})=>e.renderChildren()}
    </div>
`,Ve=z.create`
    <aside
        class="${({props:e})=>(e=>{const t=e.classes?{...We,...e.classes}:We;return[t.root,e.collapsed?t.collapsed:t.expanded,t[e.variant||"outlined"],t[e.color||"neutral"],e.className||null].filter(Boolean).join(" ")})(e)}"
    >
        ${({props:e})=>e.renderChildren()}
    </aside>
`;Ve.Header=Pe,Ve.Content=Fe;var qe=z.create`
    <svg class="${({props:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clip-rule="evenodd"/>
    </svg>
`;const{classes:Ke}=q({root:{display:"flex",flexDirection:"column",marginTop:"var(--rui-app-appBarHeight)",minHeight:"calc(var(--rui-viewport-height) - var(--rui-app-appBarHeight))","@global a.anchor":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) * 2 + var(--rui-spacing-lg) * 2)"},"@global h2":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) * 2 + var(--rui-spacing-lg) * 2)"}},aside:{display:"none",top:"var(--rui-app-appBarHeight)",maxHeight:"calc(var(--rui-viewport-height) - var(--rui-app-appBarHeight))","@global > *:last-child":{paddingBottom:"var(--rui-spacing-md)"}},content:{flex:1,minWidth:0,width:"100%",paddingTop:"var(--rui-app-appBarHeight)"},secondaryHeader:{position:"fixed",top:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-lg))",left:"var(--rui-spacing-md)",right:"var(--rui-spacing-md)",display:"flex",alignItems:"center",justifyContent:"flex-start",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)"},apiIndexDialog:{},[F("sm")]:{$root:{flexDirection:"row","@global a.anchor":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-sm))"},"@global h2":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-sm))"}},$aside:{display:"flex"},$content:{flex:1,minWidth:0,paddingTop:0,paddingLeft:"var(--rui-spacing-xl)",paddingRight:"var(--rui-spacing-xl)"},$secondaryHeader:{display:"none"},$apiIndexDialog:{display:"none"}}}),{classes:Ze}=q({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-sm)",lineHeight:"var(--rui-lineHeight-sm)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-sm) 0",padding:"0",borderBottom:"none"},ul:{listStyle:"none",padding:"0",margin:"0"},li:{margin:"var(--rui-spacing-xs) 0",padding:"0"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},code:{fontSize:"var(--rui-fontSize-sm)"}},"& > ul > li":{fontSize:"var(--rui-fontSize-md)",fontWeight:"var(--rui-fontWeight-md)"},"& ul ul":{paddingLeft:"var(--rui-spacing-lg)",marginTop:"var(--rui-spacing-xs)",fontSize:"var(--rui-fontSize-sm)",fontWeight:"var(--rui-fontWeight-sm)"}}}),Je=z.create`
            <nav class="${({props:e})=>(e=>[e.className||null,Ze.root].join(" "))(e)}"><h2 id="modules">Modules</h2>
<ul>
<li><a href="#module_component">Component</a><ul>
<li><em>instance</em><ul>
<li><a href="#module_component__subscribe">.subscribe(model, [type], [listener])</a></li>
<li><a href="#module_component__partial">.partial(strings, …expressions)</a></li>
<li><a href="#module_component__tostring">.toString()</a></li>
<li><a href="#module_component__render">.render()</a></li>
<li><a href="#module_component__oncreate">.onCreate(…args)</a></li>
<li><a href="#module_component__onchange">.onChange(model, changed)</a></li>
<li><a href="#module_component__onhydrate">.onHydrate()</a></li>
<li><a href="#module_component__onbeforerecycle">.onBeforeRecycle()</a></li>
<li><a href="#module_component__onrecycle">.onRecycle()</a></li>
<li><a href="#module_component__onbeforeupdate">.onBeforeUpdate()</a></li>
<li><a href="#module_component__onupdate">.onUpdate()</a></li>
<li><a href="#module_component__ondestroy">.onDestroy(…args)</a></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_component_markassafehtml">.markAsSafeHTML(value)</a></li>
<li><a href="#module_component_extend">.extend(object)</a></li>
<li><a href="#module_component_mount">.mount([options], [el], [hydrate])</a></li>
<li><a href="#module_component_create">.create(strings, …expressions)</a></li></ul></li></ul></li>
<li><a href="#module_emitter">Emitter</a><ul>
<li><a href="#module_emitter__on">.on(type, listener)</a></li>
<li><a href="#module_emitter__once">.once(type, listener)</a></li>
<li><a href="#module_emitter__off">.off([type], [listener])</a></li>
<li><a href="#module_emitter__emit">.emit(type, […args])</a></li>
<li><a href="#module_emitter__listento">.listenTo(emitter, type, listener)</a></li>
<li><a href="#module_emitter__listentoonce">.listenToOnce(emitter, type, listener)</a></li>
<li><a href="#module_emitter__stoplistening">.stopListening([emitter], [type], [listener])</a></li></ul></li>
<li><a href="#module_model">Model</a><ul>
<li><a href="#module_model__preinitialize">.preinitialize([attributes], […args])</a></li>
<li><a href="#module_model__defineattribute">.defineAttribute(key)</a></li>
<li><a href="#module_model__get">.get(key)</a></li>
<li><a href="#module_model__set">.set(key, [value], […args])</a></li>
<li><a href="#module_model__parse">.parse([data], […args])</a></li>
<li><a href="#module_model__tojson">.toJSON()</a></li></ul></li>
<li><a href="#module_view">View</a><ul>
<li><em>instance</em><ul>
<li><a href="#module_view__preinitialize">.preinitialize(options)</a></li>
<li><a href="#module_view__\$">.\$(selector)</a></li>
<li><a href="#module_view__\$\$">.\$\$(selector)</a></li>
<li><a href="#module_view__destroy">.destroy(options)</a></li>
<li><a href="#module_view__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_view__addchild">.addChild(child)</a></li>
<li><a href="#module_view__destroychildren">.destroyChildren()</a></li>
<li><a href="#module_view__ensureuid">.ensureUid()</a></li>
<li><a href="#module_view__ensureelement">.ensureElement()</a></li>
<li><a href="#module_view__createelement">.createElement(tag, attributes)</a></li>
<li><a href="#module_view__removeelement">.removeElement()</a></li>
<li><a href="#module_view__delegateevents">.delegateEvents([events])</a></li>
<li><a href="#module_view__undelegateevents">.undelegateEvents()</a></li>
<li><a href="#module_view__render">.render()</a></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_view_sanitize">.sanitize(value)</a></li>
<li><a href="#module_view_resetuid">.resetUid()</a></li></ul></li></ul></li>
</ul>
</nav>
        `,Ye=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Xe}=q({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Ye("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Ye("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},margin:0,width:"100%",boxSizing:"border-box"}}),Ge=(e=>{const{ApiIndex:t,Api:s}=e;return z.create`
        <div class="${Ke.root}">
            <${Ve} 
                className="${Ke.aside}"
                collapsed="${({state:e})=>e.collapsed}"
            >
                <${Ve.Header}
                    collapsed="${({state:e})=>e.collapsed}"
                    handleToggle="${({state:e})=>()=>{e.collapsed=!e.collapsed}}"
                />
                <${Ve.Content} collapsed="${({state:e})=>e.collapsed}">
                    <${t} />
                </${Ve.Content}>
            </${Ve}>
            <${J}
                className="${Ke.secondaryHeader}"
                color="neutral"
            >
                <${X}
                    label="api index"
                    variant="plain"
                    color="neutral"
                    renderLeftIcon=${()=>qe.mount()}
                    onClick="${({state:e})=>()=>{e.dialogOpen=!0}}"
                />
            </${J}>
            ${({state:e,partial:s})=>e.dialogOpen?s`<${oe}
                    className="${Ke.apiIndexDialog}"
                    handleClose="${({state:e})=>()=>{e.dialogOpen=!1}}"
                    shadow="lg"
                >
                    <${oe.Header}
                        title="API Index"
                        handleClose="${({state:e})=>()=>{e.dialogOpen=!1}}"
                        closeButton=${!0}
                    />
                    <${oe.Content}>
                        <${t} events="${({state:e})=>({"click a":()=>{e.dialogOpen=!1}})}" />
                    </${oe.Content}>
                </${oe}>`:null}
            <div class="${Ke.content}">
                <${s} />
            </div>
        </div>
    `.extend({onCreate(){this.state=new o({collapsed:!1,dialogOpen:!1})}})})({ApiIndex:Je,Api:z.create`
            <section class="${({props:e})=>(e=>[e.className||null,Xe.root].join(" "))(e)}"><p><a name="module_component" id="module_component" class="anchor"></a></p>
<h2 id="componentc28c">Component ⇐ <code>View</code></h2>
<p>Components are a special kind of <code>View</code> that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.<br />
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.<br />
Components are defined with the <a href="#module_component_create">Component.create</a> static method, which takes a tagged template string or a function that returns another component.</p>
<p><strong>Extends</strong>: <code>View</code><br />
<strong>See</strong>: <a href="#module_component_create">Component.create</a>  </p>
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
<td>Object containing options. The following keys will be merged to <code>this</code>: model, state, key, onDestroy, onHydrate, onBeforeRecycle, onRecycle, onBeforeUpdate, onUpdate, onCreate, onChange. Any additional options not in the component or view options list will be automatically extracted as props and stored as <code>this.props</code>.</td>
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
<td>[key]</td>
<td><code>string</code></td>
<td>A unique key to identify the component. Components with keys are recycled when the same key is found in the previous render. Unkeyed components are recycled based on type and position.</td>
</tr>
<tr>
<td>[model]</td>
<td><code>Model</code></td>
<td>A <code>Model</code> or any emitter object containing data and business logic. The component will listen to <code>change</code> events and call <code>onChange</code> lifecycle method.</td>
</tr>
<tr>
<td>[state]</td>
<td><code>Model</code></td>
<td>A <code>Model</code> or any emitter object containing data and business logic, to be used as internal state. The component will listen to <code>change</code> events and call <code>onChange</code> lifecycle method.</td>
</tr>
<tr>
<td>[props]</td>
<td><code>Model</code></td>
<td>Automatically created from any options not merged to the component instance. Contains props passed from parent component as a <code>Model</code>. The component will listen to <code>change</code> events on props and call <code>onChange</code> lifecycle method. When a component with a <code>key</code> is recycled during parent re-render, new props are automatically updated and any changes trigger a re-render.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Component</span>, <span class="hljs-title class_">Model</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;
<span class="hljs-comment">// Create Timer component.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Timer</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        Seconds: &lt;span&gt;<span class="hljs-subst">\$\{(\{ model \}) =&gt; model.seconds\}</span>&lt;/span&gt;
    &lt;/div&gt;
\`</span>;
<span class="hljs-comment">// Create model to store seconds.</span>
<span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ seconds : <span class="hljs-number">0</span> \});
<span class="hljs-comment">// Mount timer on body.</span>
<span class="hljs-title class_">Timer</span>.<span class="hljs-title function_">mount</span>(\{ model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);
<span class="hljs-comment">// Increment \`model.seconds\` every second.</span>
<span class="hljs-built_in">setInterval</span>(<span class="hljs-function">() =&gt;</span> model.<span class="hljs-property">seconds</span>++, <span class="hljs-number">1000</span>);</code></pre>
<ul>
<li><a href="#module_component">Component</a> ⇐ <code>View</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_component__subscribe">.subscribe(model, [type], [listener])</a> ⇒ <code>Component</code></li>
<li><a href="#module_component__partial">.partial(strings, …expressions)</a> ⇒ <a href="#new_partial_new"><code>Partial</code></a></li>
<li><a href="#module_component__tostring">.toString()</a> ⇒ <code>string</code></li>
<li><a href="#module_component__render">.render()</a> ⇒ <code>Component</code></li>
<li><a href="#module_component__oncreate">.onCreate(…args)</a></li>
<li><a href="#module_component__onchange">.onChange(model, changed)</a></li>
<li><a href="#module_component__onhydrate">.onHydrate()</a></li>
<li><a href="#module_component__onbeforerecycle">.onBeforeRecycle()</a></li>
<li><a href="#module_component__onrecycle">.onRecycle()</a></li>
<li><a href="#module_component__onbeforeupdate">.onBeforeUpdate()</a></li>
<li><a href="#module_component__onupdate">.onUpdate()</a></li>
<li><a href="#module_component__ondestroy">.onDestroy(…args)</a></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_component_markassafehtml">.markAsSafeHTML(value)</a> ⇒ <a href="#new_safehtml_new"><code>SafeHTML</code></a></li>
<li><a href="#module_component_extend">.extend(object)</a></li>
<li><a href="#module_component_mount">.mount([options], [el], [hydrate])</a> ⇒ <code>Component</code></li>
<li><a href="#module_component_create">.create(strings, …expressions)</a> ⇒ <code>Component</code></li></ul></li></ul></li>
</ul>
<p><a name="module_component__subscribe" id="module_component__subscribe" class="anchor"></a></p>
<h3 id="componentsubscribemodeltypelistenerc43c">component.subscribe(model, [type], [listener]) ⇒ <code>Component</code></h3>
<p>Subscribes to a <code>change</code> event on a model or emitter object and invokes the <code>onChange</code> lifecycle method.
The subscription is automatically cleaned up when the component is destroyed.
By default, the component subscribes to changes on <code>this.model</code>, <code>this.state</code>, and <code>this.props</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Component</code> - The current component instance for chaining.  </p>
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
<td>model</td>
<td><code>Object</code></td>
<td></td>
<td>The model or emitter object to listen to.</td>
</tr>
<tr>
<td>[type]</td>
<td><code>string</code></td>
<td><code>"'change'"</code></td>
<td>The event type to listen for.</td>
</tr>
<tr>
<td>[listener]</td>
<td><code>function</code></td>
<td><code>this.onChange</code></td>
<td>The callback to invoke when the event is emitted.</td>
</tr>
</tbody>
</table>
<p><a name="module_component__partial" id="module_component__partial" class="anchor"></a></p>
<h3 id="componentpartialstringsexpressionsc51cnew_partial_new">component.partial(strings, …expressions) ⇒ <a href="#new_partial_new"><code>Partial</code></a></h3>
<p>Tagged template helper method.
Used to create a partial template.<br />
It will return a Partial object that preserves structure for position-based recycling.
Components will be added as children by the parent component. Template strings literals 
will be marked as safe HTML to be rendered.
This method is bound to the component instance by default.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <a href="#new_partial_new"><code>Partial</code></a> - Partial object containing strings and expressions.  </p>
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
<td>strings</td>
<td><code>TemplateStringsArray</code></td>
<td>Template strings.</td>
</tr>
<tr>
<td>…expressions</td>
<td><code>any</code></td>
<td>Template expressions.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Component</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;
<span class="hljs-comment">// Create a Title component.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Title</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;h1&gt;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>&lt;/h1&gt;
\`</span>;
<span class="hljs-comment">// Create Main component.</span>
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Main</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;main&gt;
        <span class="hljs-subst">\$\{self =&gt; self.renderHeader()\}</span>
    &lt;/main&gt;
\`</span>.<span class="hljs-title function_">extend</span>(\{
    <span class="hljs-comment">// Render header method.</span>
    <span class="hljs-comment">// Use \`partial\` to render an HTML template adding children components.</span>
    <span class="hljs-title function_">renderHeader</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">partial</span><span class="hljs-string">\`
            &lt;header&gt;
                &lt;<span class="hljs-subst">\$\{Title\}</span>&gt;<span class="hljs-subst">\$\{(\{ model \}) =&gt; model.title\}</span>&lt;/<span class="hljs-subst">\$\{Title\}</span>&gt;
            &lt;/header&gt;
        \`</span>;
    \}
\});</code></pre>
<p><a name="module_component__tostring" id="module_component__tostring" class="anchor"></a></p>
<h3 id="componenttostringc56c">component.toString() ⇒ <code>string</code></h3>
<p>Render the component as a string.
Used internally on the render process.<br />
Use it for server-side rendering or static site generation.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>string</code> - The rendered component.<br />
<strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Component</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;
<span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;button class=&quot;button&quot;&gt;Click me&lt;/button&gt;
\`</span>;
<span class="hljs-keyword">const</span> <span class="hljs-title class_">App</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        &lt;<span class="hljs-subst">\$\{Button\}</span>&gt;Click me&lt;/<span class="hljs-subst">\$\{Button\}</span>&gt;
    &lt;/div&gt;
\`</span>;

<span class="hljs-keyword">const</span> app = <span class="hljs-keyword">new</span> <span class="hljs-title class_">App</span>();

<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(app.<span class="hljs-title function_">toString</span>());
<span class="hljs-comment">// &lt;div data-rst-el=&quot;r1-1&quot;&gt;&lt;!--rst-s-r1-1--&gt;&lt;button class=&quot;button&quot; data-rst-el=&quot;r2-1&quot;&gt;Click me&lt;/button&gt;&lt;!--rst-e-r1-1--&gt;&lt;/div&gt;</span>

<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">\`<span class="hljs-subst">\$\{app\}</span>\`</span>);
<span class="hljs-comment">// &lt;div data-rst-el=&quot;r1-1&quot;&gt;&lt;!--rst-s-r1-1--&gt;&lt;button class=&quot;button&quot; data-rst-el=&quot;r2-1&quot;&gt;Click me&lt;/button&gt;&lt;!--rst-e-r1-1--&gt;&lt;/div&gt;</span></code></pre>
<p><a name="module_component__render" id="module_component__render" class="anchor"></a></p>
<h3 id="componentrenderc59c">component.render() ⇒ <code>Component</code></h3>
<p>Render the <code>Component</code>.</p>
<p><strong>First render (when <code>this.el</code> is not present):</strong>
This is the initial render call. The component will be rendered as a string inside a <code>DocumentFragment</code> and hydrated, 
making <code>this.el</code> available. <code>this.el</code> is the root DOM element of the component that can be applied to the DOM. 
The <code>onHydrate</code> lifecycle method will be called. </p>
<p><strong>Note:</strong> Typically, you don't need to call <code>render()</code> directly for the first render. The static method <code>Component.mount()</code> 
handles this process automatically, creating the component instance, rendering it, and appending it to the DOM.</p>
<p><strong>Update render (when <code>this.el</code> is present):</strong>
This indicates the component is being updated. The method will:</p>
<ul>
<li>Update only the attributes of the root element and child elements</li>
<li>Update only the content of interpolations (the dynamic parts of the template)</li>
<li>For container components (components that render a single child component), update the single interpolation</li>
</ul>
<p>The <code>onBeforeUpdate</code> lifecycle method will be called at the beginning, followed by the <code>onUpdate</code> lifecycle method at the end.</p>
<p><strong>Child component handling:</strong>
When rendering child components, they can be either recreated or recycled:</p>
<ul>
<li><p><strong>Recreation:</strong> A new component instance is created, running the constructor again. This happens when no matching component 
is found for recycling.</p></li>
<li><p><strong>Recycling:</strong> The same component instance is reused. Recycling happens in two ways:</p></li>
<li><p>Components with a <code>key</code> are recycled if a previous child with the same key exists</p></li>
<li><p>Unkeyed components are recycled if they have the same type and position in the template or partial</p>
<p>When a component is recycled:</p></li>
<li><p>The <code>onBeforeRecycle</code> lifecycle method is called when recycling starts</p></li>
<li><p>The component's <code>this.props</code> is updated with the new props from the parent</p></li>
<li><p>The <code>onRecycle</code> lifecycle method is called after props are updated</p>
<p>A recycled component may not use props at all and remain unchanged, or it may be subscribed to a different model 
(or even the same model as the parent) and update independently in subsequent render cycles.</p></li>
</ul>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Component</code> - The component instance.<br />
<a name="module_component__oncreate" id="module_component__oncreate" class="anchor"></a></p>
<h3 id="componentoncreateargs">component.onCreate(…args)</h3>
<p>Lifecycle method. Called when the component is created, at the end of the constructor.
This method receives the same arguments passed to the constructor (options and any additional parameters).
It executes both on client and server.
Use this method to define models or state that will be used later in <code>onHydrate</code>.</p>
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
<td>…args</td>
<td><code>\*</code></td>
<td>The constructor arguments (options and any additional parameters).</td>
</tr>
</tbody>
</table>
<p><a name="module_component__onchange" id="module_component__onchange" class="anchor"></a></p>
<h3 id="componentonchangemodelchanged">component.onChange(model, changed)</h3>
<p>Lifecycle method. Called when model emits <code>change</code> event.
By default calls <code>render</code> method.
This method can be extended with custom logic.
Maybe comparing new attributes with previous ones and calling
render when needed.</p>
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
<td><code>Model</code></td>
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
<p><a name="module_component__onhydrate" id="module_component__onhydrate" class="anchor"></a></p>
<h3 id="componentonhydrate">component.onHydrate()</h3>
<p>Lifecycle method. Called when the component is rendered for the first time and hydrated in a DocumentFragment.
This method only executes on the client and only during the first render.
Use this method for client-only operations like making API requests or setting up browser-specific functionality.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<a name="module_component__onbeforerecycle" id="module_component__onbeforerecycle" class="anchor"></a></p>
<h3 id="componentonbeforerecycle">component.onBeforeRecycle()</h3>
<p>Lifecycle method. Called before the component is recycled and reused between renders.
This method is called at the beginning of the <code>recycle</code> method, before any recycling operations occur.</p>
<p>A component is recycled when:</p>
<ul>
<li>It has a <code>key</code> and a previous child with the same key exists</li>
<li>It doesn't have a <code>key</code> but has the same type and position in the template or partial</li>
</ul>
<p>Use this method to perform operations that need to happen before the component is recycled,
such as storing previous state or preparing for the recycling.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<a name="module_component__onrecycle" id="module_component__onrecycle" class="anchor"></a></p>
<h3 id="componentonrecycle">component.onRecycle()</h3>
<p>Lifecycle method. Called when the component is recycled and reused between renders.</p>
<p>A component is recycled when:</p>
<ul>
<li>It has a <code>key</code> and a previous child with the same key exists</li>
<li>It doesn't have a <code>key</code> but has the same type and position in the template or partial</li>
</ul>
<p>During recycling, the component instance is reused and its props are updated with new values.
The component's element may be moved in the DOM if the new template structure differs from the previous one.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<a name="module_component__onbeforeupdate" id="module_component__onbeforeupdate" class="anchor"></a></p>
<h3 id="componentonbeforeupdate">component.onBeforeUpdate()</h3>
<p>Lifecycle method. Called before the component is updated or re-rendered.
This method is called at the beginning of the <code>render</code> method when the component's state, model, or props change and trigger a re-render.
Use this method to perform operations that need to happen before the component is updated,
such as saving previous state or preparing for the update.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<a name="module_component__onupdate" id="module_component__onupdate" class="anchor"></a></p>
<h3 id="componentonupdate">component.onUpdate()</h3>
<p>Lifecycle method. Called when the component is updated or re-rendered.
This method is called when the component's state, model, or props change and trigger a re-render.
Use this method to perform operations that need to happen on every update.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<a name="module_component__ondestroy" id="module_component__ondestroy" class="anchor"></a></p>
<h3 id="componentondestroyargs">component.onDestroy(…args)</h3>
<p>Lifecycle method. Called when the component is destroyed.
Use this method to clean up resources, cancel timers, remove event listeners, etc.</p>
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
<td>…args</td>
<td><code>\*</code></td>
<td>Options object or any arguments passed to <code>destroy</code> method.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_markassafehtml" id="module_component_markassafehtml" class="anchor"></a></p>
<h3 id="componentmarkassafehtmlvaluec75cnew_safehtml_new">Component.markAsSafeHTML(value) ⇒ <a href="#new_safehtml_new"><code>SafeHTML</code></a></h3>
<p>Mark a string as safe HTML to be rendered.<br />
Normally you don't need to use this method, as Rasti will automatically mark string literals 
as safe HTML when the component is <a href="#module_component_create">created</a> and when 
using the <a href="#module_component__partial">Component.partial</a> method.<br />
Be sure that the string is safe to be rendered, as it will be inserted into the DOM without any sanitization.</p>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <a href="#new_safehtml_new"><code>SafeHTML</code></a> - A safe HTML object.  </p>
<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
</tr>
</thead>
<tbody>
<tr>
<td>value</td>
<td><code>string</code></td>
</tr>
</tbody>
</table>
<p><a name="module_component_extend" id="module_component_extend" class="anchor"></a></p>
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
<td><code>object</code> | <code>function</code></td>
<td>Object containing methods to be added to the new <code>Component</code> subclass. Also can be a function that receives the parent prototype and returns an object.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_mount" id="module_component_mount" class="anchor"></a></p>
<h3 id="componentmountoptionselhydratec82c">Component.mount([options], [el], [hydrate]) ⇒ <code>Component</code></h3>
<p>Mount the component into the DOM.
Creates a new component instance with the provided options and optionally mounts it into the DOM.</p>
<p><strong>Mounting modes:</strong></p>
<ul>
<li><strong>Normal mount</strong> (default): Renders the component as HTML and appends it to the provided element. Use this for client-side rendering.</li>
<li><strong>Hydration mode</strong>: Assumes the DOM already contains the component's HTML (from server-side rendering). </li>
</ul>
<p>If <code>el</code> is not provided, the component is instantiated but not mounted (the same as using <code>new Component(options)</code>). You can mount it later by calling <code>render()</code> and appending the element (<code>this.el</code>) to the DOM.</p>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Component</code> - The component instance.  </p>
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
<td>[options]</td>
<td><code>object</code></td>
<td><code>\{\}</code></td>
<td>The component options. These will be passed to the constructor and can include                               <code>model</code>, <code>state</code>, <code>props</code>, lifecycle methods, and any other component-specific options.</td>
</tr>
<tr>
<td>[el]</td>
<td><code>node</code></td>
<td></td>
<td>The DOM element where the component will be mounted. If provided, the component will be                     rendered and appended to this element. If not provided, the component is created but not mounted.</td>
</tr>
<tr>
<td>[hydrate]</td>
<td><code>boolean</code></td>
<td><code>false</code></td>
<td>If <code>true</code>, enables hydration mode for server-side rendering. The component will                                   assume the DOM already contains its HTML structure and will only hydrate it.                                  If <code>false</code> (default), the component will be rendered from scratch and appended to <code>el</code>.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Component</span>, <span class="hljs-title class_">Model</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;

<span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;button class=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.className\}</span>&quot;&gt;
        <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.label\}</span>
    &lt;/button&gt;
\`</span>;

<span class="hljs-comment">// Normal mount: render and append to DOM.</span>
<span class="hljs-keyword">const</span> button = <span class="hljs-title class_">Button</span>.<span class="hljs-title function_">mount</span>(\{
    <span class="hljs-attr">label</span>: <span class="hljs-string">&#x27;Click me&#x27;</span>
\}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);

<span class="hljs-comment">// Create without mounting (mount later).</span>
<span class="hljs-keyword">const</span> button2 = <span class="hljs-title class_">Button</span>.<span class="hljs-title function_">mount</span>(\{ className : <span class="hljs-string">&#x27;secondary&#x27;</span>, label : <span class="hljs-string">&#x27;Save&#x27;</span> \});
<span class="hljs-comment">// Later, render and append it to the DOM.</span>
<span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>.<span class="hljs-title function_">appendChild</span>(button2.<span class="hljs-title function_">render</span>().<span class="hljs-property">el</span>);

<span class="hljs-comment">// Hydration mode: hydrate existing server-rendered HTML</span>
<span class="hljs-comment">// Assuming document.body already contains the HTML structure of the button.</span>
<span class="hljs-keyword">const</span> hydratedButton = <span class="hljs-title class_">Button</span>.<span class="hljs-title function_">mount</span>(\{
    className : <span class="hljs-string">&#x27;primary&#x27;</span>,
    label : <span class="hljs-string">&#x27;Click me&#x27;</span>
\}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>, <span class="hljs-literal">true</span>);</code></pre>
<p><a name="module_component_create" id="module_component_create" class="anchor"></a></p>
<h3 id="componentcreatestringsexpressionsc90c">Component.create(strings, …expressions) ⇒ <code>Component</code></h3>
<p>Takes a tagged template string or a function that returns another component, and returns a new <code>Component</code> class.</p>
<ul>
<li>The template outer tag and attributes will be used to create the view's root element.</li>
<li>The template inner HTML will be used as the view's template.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`&lt;button class=&quot;button&quot;&gt;Click me&lt;/button&gt;\`</span>;</code></pre>
<ul>
<li>Template interpolations that are functions will be evaluated during the render process, receiving the view instance as an argument and being bound to it. If the function returns <code>null</code>, <code>undefined</code>, <code>false</code>, or an empty string, the interpolation won't render any content.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;button class=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.className\}</span>&quot;&gt;
          <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>
      &lt;/button&gt;
  \`</span>;</code></pre>
<ul>
<li><p>Attach DOM event handlers per element using camel-cased attributes.
Event handlers are automatically bound to the component instance (<code>this</code>).
Internally, Rasti uses event delegation to the component's root element for performance.</p>
<p><strong>Attribute Quoting:</strong></p></li>
<li><p><strong>Quoted attributes</strong> (<code>onClick="\$\{handler\}"</code>) evaluate the expression first, useful for dynamic values</p></li>
<li><p><strong>Unquoted attributes</strong> (<code>onClick=\$\{handler\}</code>) pass the function reference directly</p>
<p><strong>Listener Signature:</strong> <code>(event, component, matched)</code></p></li>
<li><p><code>event</code>: The native DOM event object</p></li>
<li><p><code>component</code>: The component instance (same as <code>this</code>)</p></li>
<li><p><code>matched</code>: The element that matched the event (useful for delegation)</p></li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;button 
          onClick=<span class="hljs-subst">\$\{<span class="hljs-keyword">function</span>(event, component, matched) \{
              // <span class="hljs-variable language_">this</span> === component
              <span class="hljs-variable language_">console</span>.log(<span class="hljs-string">&#x27;Button clicked:&#x27;</span>, matched);
          \}\}</span>
          onMouseOver=&quot;<span class="hljs-subst">\$\{(\{ model \}) =&gt; () =&gt; model.isHovered = <span class="hljs-literal">true</span>\}</span>&quot;
          onMouseOut=&quot;<span class="hljs-subst">\$\{(\{ model \}) =&gt; () =&gt; model.isHovered = <span class="hljs-literal">false</span>\}</span>&quot;
      &gt;
          Click me
      &lt;/button&gt;
  \`</span>;</code></pre>
<p>If you need custom delegation (e.g., <code>\{'click .selector': 'handler'\}</code>), 
  you may override the <code>events</code> property as described in <a href="#module_view__delegateevents">View.delegateEvents</a>.</p>
<ul>
<li>Boolean attributes should be passed in the format <code>attribute="\$\{() =&gt; true\}"</code>. <code>false</code> attributes won't be rendered. <code>true</code> attributes will be rendered without a value.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-title class_">Input</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;input type=&quot;text&quot; disabled=<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.disabled\}</span> /&gt;
  \`</span>;</code></pre>
<ul>
<li>If the interpolated function returns a component instance, it will be added as a child component.</li>
<li>If the interpolated function returns an array, each item will be evaluated as above.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Create a button component.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;button class=&quot;button&quot;&gt;
          <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>
      &lt;/button&gt;
  \`</span>;
  <span class="hljs-comment">// Create a navigation component. Add buttons as children. Iterate over items.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Navigation</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;nav&gt;
          <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.items.map(
              item =&gt; Button.mount(\{ renderChildren : () =&gt; item.label \})
          )\}</span>
      &lt;/nav&gt;
  \`</span>;
  <span class="hljs-comment">// Create a header component. Add navigation as a child.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Header</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;header&gt;
          <span class="hljs-subst">\$\{(\{ props \}) =&gt; Navigation.mount(\{ items : props.items\})\}</span>
      &lt;/header&gt;
  \`</span>;</code></pre>
<ul>
<li>Child components can be added using a component tag.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Create a button component.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;button class=&quot;button&quot;&gt;
           <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>
      &lt;/button&gt;
  \`</span>;
  <span class="hljs-comment">// Create a navigation component. Add buttons as children. Iterate over items.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Navigation</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;nav&gt;
          <span class="hljs-subst">\$\{(\{ props, partial \}) =&gt; props.items.map(
              item =&gt; partial<span class="hljs-string">\`&lt;<span class="hljs-subst">\$\{Button\}</span>&gt;<span class="hljs-subst">\$\{item.label\}</span>&lt;/<span class="hljs-subst">\$\{Button\}</span>&gt;\`</span>
          )\}</span>
      &lt;/nav&gt;
  \`</span>;
  <span class="hljs-comment">// Create a header component. Add navigation as a child.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Header</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;header&gt;
          &lt;<span class="hljs-subst">\$\{Navigation\}</span> items=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.items\}</span>&quot; /&gt;
      &lt;/header&gt;
  \`</span>;</code></pre>
<ul>
<li>If the tagged template contains only one expression that mounts a component, or the tags are references to a component, the component will be considered a <b>container</b>. It will render a single component as a child. <code>this.el</code> will be a reference to that child component's element.</li>
</ul>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Create a button component.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">Button</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;button class=&quot;<span class="hljs-subst">\$\{(\{ props \}) =&gt; props.className\}</span>&quot;&gt;
          <span class="hljs-subst">\$\{(\{ props \}) =&gt; props.renderChildren()\}</span>
      &lt;/button&gt;
  \`</span>;
  <span class="hljs-comment">// Create a container that renders a Button component.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">ButtonOk</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
      &lt;<span class="hljs-subst">\$\{Button\}</span> className=&quot;ok&quot;&gt;Ok&lt;/<span class="hljs-subst">\$\{Button\}</span>&gt;
  \`</span>;
  <span class="hljs-comment">// Create a container that renders a Button component, using a function.</span>
  <span class="hljs-keyword">const</span> <span class="hljs-title class_">ButtonCancel</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-title function_">create</span>(<span class="hljs-function">() =&gt;</span> <span class="hljs-title class_">Button</span>.<span class="hljs-title function_">mount</span>(\{
      className : <span class="hljs-string">&#x27;cancel&#x27;</span>,
      renderChildren : <span class="hljs-function">() =&gt;</span> <span class="hljs-string">&#x27;Cancel&#x27;</span>
  \}));</code></pre>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Component</code> - The newly created component class.  </p>
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
<td>strings</td>
<td><code>string</code> | <code>function</code></td>
<td>HTML template for the component or a function that mounts a sub component.</td>
</tr>
<tr>
<td>…expressions</td>
<td><code>\*</code></td>
<td>The expressions to be interpolated within the template.</td>
</tr>
</tbody>
</table>
<p><a name="module_emitter" id="module_emitter" class="anchor"></a></p>
<h2 id="emitter">Emitter</h2>
<p><code>Emitter</code> is a class that provides an easy way to implement the observer pattern 
in your applications.<br />
It can be extended to create new classes that have the ability to emit and bind custom named events.<br />
Emitter is used by <code>Model</code> and <code>View</code> classes, which inherit from it to implement 
event-driven functionality.</p>
<h2 id="inverseofcontrolpattern">Inverse of Control Pattern</h2>
<p>The Emitter class includes "inverse of control" methods (<code>listenTo</code>, <code>listenToOnce</code>, <code>stopListening</code>) 
that allow an object to manage its own listening relationships. Instead of:</p>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Traditional approach - harder to clean up</span>
otherObject.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">myHandler</span>);
otherObject.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;destroy&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">cleanup</span>);
<span class="hljs-comment">// Later you need to remember to clean up each listener</span>
otherObject.<span class="hljs-title function_">off</span>(<span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">myHandler</span>);
otherObject.<span class="hljs-title function_">off</span>(<span class="hljs-string">&#x27;destroy&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">cleanup</span>);</code></pre>
<p>You can use:</p>
<pre><code class="javascript language-javascript"><span class="hljs-comment">// Inverse of control - easier cleanup</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">listenTo</span>(otherObject, <span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">myHandler</span>);
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">listenTo</span>(otherObject, <span class="hljs-string">&#x27;destroy&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">cleanup</span>);
<span class="hljs-comment">// Later, clean up ALL listeners at once</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stopListening</span>(); <span class="hljs-comment">// Removes all listening relationships</span></code></pre>
<p>This pattern is particularly useful for preventing memory leaks and simplifying cleanup
in component lifecycle management.</p>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Emitter</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;
<span class="hljs-comment">// Custom cart</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">ShoppingCart</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Emitter</span> \{
    <span class="hljs-title function_">constructor</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-variable language_">super</span>();
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">items</span> = [];
    \}

    <span class="hljs-title function_">addItem</span>(<span class="hljs-params">item</span>) \{
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">items</span>.<span class="hljs-title function_">push</span>(item);
        <span class="hljs-comment">// Emit a custom event called \`itemAdded\`.</span>
        <span class="hljs-comment">// Pass the added item as an argument to the event listener.</span>
        <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit</span>(<span class="hljs-string">&#x27;itemAdded&#x27;</span>, item);
    \}
\}
<span class="hljs-comment">// Create an instance of ShoppingCart and Logger</span>
<span class="hljs-keyword">const</span> cart = <span class="hljs-keyword">new</span> <span class="hljs-title class_">ShoppingCart</span>();
<span class="hljs-comment">// Listen to the \`itemAdded\` event and log the added item using the logger.</span>
cart.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;itemAdded&#x27;</span>, <span class="hljs-function">(<span class="hljs-params">item</span>) =&gt;</span> \{
    <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">\`Item added to cart: <span class="hljs-subst">\$\{item.name\}</span> - Price: \$<span class="hljs-subst">\$\{item.price\}</span>\`</span>);
\});
<span class="hljs-comment">// Simulate adding items to the cart</span>
<span class="hljs-keyword">const</span> item1 = \{ name : <span class="hljs-string">&#x27;Smartphone&#x27;</span>, price : <span class="hljs-number">1000</span> \};
<span class="hljs-keyword">const</span> item2 = \{ name : <span class="hljs-string">&#x27;Headphones&#x27;</span>, price : <span class="hljs-number">150</span> \};

cart.<span class="hljs-title function_">addItem</span>(item1); <span class="hljs-comment">// Output: &quot;Item added to cart: Smartphone - Price: \$1000&quot;</span>
cart.<span class="hljs-title function_">addItem</span>(item2); <span class="hljs-comment">// Output: &quot;Item added to cart: Headphones - Price: \$150&quot;</span></code></pre>
<ul>
<li><a href="#module_emitter">Emitter</a><ul>
<li><a href="#module_emitter__on">.on(type, listener)</a> ⇒ <code>function</code></li>
<li><a href="#module_emitter__once">.once(type, listener)</a> ⇒ <code>function</code></li>
<li><a href="#module_emitter__off">.off([type], [listener])</a></li>
<li><a href="#module_emitter__emit">.emit(type, […args])</a></li>
<li><a href="#module_emitter__listento">.listenTo(emitter, type, listener)</a> ⇒ <code>function</code></li>
<li><a href="#module_emitter__listentoonce">.listenToOnce(emitter, type, listener)</a> ⇒ <code>function</code></li>
<li><a href="#module_emitter__stoplistening">.stopListening([emitter], [type], [listener])</a></li></ul></li>
</ul>
<p><a name="module_emitter__on" id="module_emitter__on" class="anchor"></a></p>
<h3 id="emitterontypelistenerc100c">emitter.on(type, listener) ⇒ <code>function</code></h3>
<p>Adds event listener.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a><br />
<strong>Returns</strong>: <code>function</code> - A function to remove the listener.  </p>
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
<pre><code class="js language-js"><span class="hljs-comment">// Re render when model changes.</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">render</span>.<span class="hljs-title function_">bind</span>(<span class="hljs-variable language_">this</span>));</code></pre>
<p><a name="module_emitter__once" id="module_emitter__once" class="anchor"></a></p>
<h3 id="emitteroncetypelistenerc105c">emitter.once(type, listener) ⇒ <code>function</code></h3>
<p>Adds event listener that executes once.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a><br />
<strong>Returns</strong>: <code>function</code> - A function to remove the listener.  </p>
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
<pre><code class="js language-js"><span class="hljs-comment">// Log a message once when model changes.</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">once</span>(<span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-function">() =&gt;</span> <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&#x27;This will happen once&#x27;</span>));</code></pre>
<p><a name="module_emitter__off" id="module_emitter__off" class="anchor"></a></p>
<h3 id="emitterofftypelistener">emitter.off([type], [listener])</h3>
<p>Removes event listeners with flexible parameter combinations.</p>
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
<td>Type of the event (e.g. <code>change</code>). If not provided, removes ALL listeners from this emitter.</td>
</tr>
<tr>
<td>[listener]</td>
<td><code>function</code></td>
<td>Specific callback function to remove. If not provided, removes all listeners for the specified type. <strong>Behavior based on parameters:</strong> - <code>off()</code> - Removes ALL listeners from this emitter - <code>off(type)</code> - Removes all listeners for the specified event type - <code>off(type, listener)</code> - Removes the specific listener for the specified event type</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Remove all listeners from this emitter</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">off</span>();</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Remove all &#x27;change&#x27; event listeners</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">off</span>(<span class="hljs-string">&#x27;change&#x27;</span>);</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Remove specific listener for &#x27;change&#x27; events</span>
<span class="hljs-keyword">const</span> <span class="hljs-title function_">myListener</span> = (<span class="hljs-params"></span>) =&gt; <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&#x27;changed&#x27;</span>);
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change&#x27;</span>, myListener);
<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">off</span>(<span class="hljs-string">&#x27;change&#x27;</span>, myListener);</code></pre>
<p><a name="module_emitter__emit" id="module_emitter__emit" class="anchor"></a></p>
<h3 id="emitteremittypeargs">emitter.emit(type, […args])</h3>
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
<td>Optional arguments to be passed to listeners.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Emit validation error event with no arguments</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit</span>(<span class="hljs-string">&#x27;invalid&#x27;</span>);</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Emit change event with data</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit</span>(<span class="hljs-string">&#x27;change&#x27;</span>, \{ field : <span class="hljs-string">&#x27;name&#x27;</span>, value : <span class="hljs-string">&#x27;John&#x27;</span> \});</code></pre>
<p><a name="module_emitter__listento" id="module_emitter__listento" class="anchor"></a></p>
<h3 id="emitterlistentoemittertypelistenerc116c">emitter.listenTo(emitter, type, listener) ⇒ <code>function</code></h3>
<p>Listen to an event of another emitter (Inverse of Control pattern).</p>
<p>This method allows this object to manage its own listening relationships,
making cleanup easier and preventing memory leaks. Instead of calling
<code>otherEmitter.on()</code>, you call <code>this.listenTo(otherEmitter, ...)</code> which
allows this object to track and clean up all its listeners at once.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a><br />
<strong>Returns</strong>: <code>function</code> - A function to stop listening to the event.  </p>
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
<td>emitter</td>
<td><code>Emitter</code></td>
<td>The emitter to listen to.</td>
</tr>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>The type of the event to listen to.</td>
</tr>
<tr>
<td>listener</td>
<td><code>function</code></td>
<td>The listener to call when the event is emitted.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Instead of: otherModel.on(&#x27;change&#x27;, this.render.bind(this));</span>
<span class="hljs-comment">// Use: this.listenTo(otherModel, &#x27;change&#x27;, this.render.bind(this));</span>
<span class="hljs-comment">// This way you can later call this.stopListening() to clean up all listeners</span></code></pre>
<p><a name="module_emitter__listentoonce" id="module_emitter__listentoonce" class="anchor"></a></p>
<h3 id="emitterlistentoonceemittertypelistenerc122c">emitter.listenToOnce(emitter, type, listener) ⇒ <code>function</code></h3>
<p>Listen to an event of another emitter and remove the listener after it is called (Inverse of Control pattern).</p>
<p>Similar to <code>listenTo()</code> but automatically removes the listener after the first execution,
like <code>once()</code> but with the inverse of control benefits for cleanup management.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_emitter"><code>Emitter</code></a><br />
<strong>Returns</strong>: <code>function</code> - A function to stop listening to the event.  </p>
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
<td>emitter</td>
<td><code>Emitter</code></td>
<td>The emitter to listen to.</td>
</tr>
<tr>
<td>type</td>
<td><code>string</code></td>
<td>The type of the event to listen to.</td>
</tr>
<tr>
<td>listener</td>
<td><code>function</code></td>
<td>The listener to call when the event is emitted.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Listen once to another emitter&#x27;s initialization event</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">listenToOnce</span>(otherModel, <span class="hljs-string">&#x27;initialized&#x27;</span>, <span class="hljs-function">() =&gt;</span> \{
    <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&#x27;Other model initialized&#x27;</span>);
\});</code></pre>
<p><a name="module_emitter__stoplistening" id="module_emitter__stoplistening" class="anchor"></a></p>
<h3 id="emitterstoplisteningemittertypelistener">emitter.stopListening([emitter], [type], [listener])</h3>
<p>Stop listening to events from other emitters (Inverse of Control pattern).</p>
<p>This method provides flexible cleanup of listening relationships established with <code>listenTo()</code>.
All parameters are optional, allowing different levels of cleanup granularity.</p>
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
<td>[emitter]</td>
<td><code>Emitter</code></td>
<td>The emitter to stop listening to. If not provided, stops listening to ALL emitters.</td>
</tr>
<tr>
<td>[type]</td>
<td><code>string</code></td>
<td>The type of event to stop listening to. If not provided, stops listening to all event types from the specified emitter.</td>
</tr>
<tr>
<td>[listener]</td>
<td><code>function</code></td>
<td>The specific listener to remove. If not provided, removes all listeners for the specified event type from the specified emitter. <strong>Behavior based on parameters:</strong> - <code>stopListening()</code> - Stops listening to ALL events from ALL emitters - <code>stopListening(emitter)</code> - Stops listening to all events from the specified emitter - <code>stopListening(emitter, type)</code> - Stops listening to the specified event type from the specified emitter - <code>stopListening(emitter, type, listener)</code> - Stops listening to the specific listener for the specific event from the specific emitter</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Stop listening to all events from all emitters (complete cleanup)</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stopListening</span>();</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Stop listening to all events from a specific emitter</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stopListening</span>(otherModel);</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Stop listening to &#x27;change&#x27; events from a specific emitter</span>
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stopListening</span>(otherModel, <span class="hljs-string">&#x27;change&#x27;</span>);</code></pre>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Stop listening to a specific listener</span>
<span class="hljs-keyword">const</span> <span class="hljs-title function_">myListener</span> = (<span class="hljs-params"></span>) =&gt; <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&#x27;changed&#x27;</span>);
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">listenTo</span>(otherModel, <span class="hljs-string">&#x27;change&#x27;</span>, myListener);
<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stopListening</span>(otherModel, <span class="hljs-string">&#x27;change&#x27;</span>, myListener);</code></pre>
<p><a name="module_model" id="module_model" class="anchor"></a></p>
<h2 id="modelc132c">Model ⇐ <code>Emitter</code></h2>
<ul>
<li>Orchestrates data and business logic.</li>
<li>Emits events when data changes.</li>
</ul>
<p>A <code>Model</code> manages an internal table of data attributes and triggers change events when any of its data is modified.<br />
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.<br />
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.</p>
<h2 id="constructionflow">Construction Flow</h2>
<ol>
<li><code>preinitialize()</code> is called with all constructor arguments</li>
<li><code>this.defaults</code> are resolved (if function, it's called and bound to the model)</li>
<li><code>parse()</code> is called with all constructor arguments to process the data</li>
<li><code>this.attributes</code> is built by merging defaults and parsed data</li>
<li>Getters/setters are generated for each attribute to emit change events</li>
</ol>
<p><strong>Extends</strong>: <code>Emitter</code>  </p>
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
<td>[attributes]</td>
<td><code>object</code></td>
<td><code>\{\}</code></td>
<td>Primary data object containing model attributes</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>\*</code></td>
<td></td>
<td>Additional arguments passed to <code>preinitialize</code> and <code>parse</code> methods</td>
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
<td>defaults</td>
<td><code>object</code> | <code>function</code></td>
<td>Default attributes for the model. If a function, it's called bound to the model instance to get defaults.</td>
</tr>
<tr>
<td>previous</td>
<td><code>object</code></td>
<td>Object containing previous attributes when a change occurs.</td>
</tr>
<tr>
<td>attributePrefix</td>
<td><code>string</code></td>
<td>Static property that defines a prefix for generated getters/setters. Defaults to empty string.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">Model</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;

<span class="hljs-comment">// User model</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">User</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">preinitialize</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">defaults</span> = \{ name : <span class="hljs-string">&#x27;&#x27;</span>, email : <span class="hljs-string">&#x27;&#x27;</span>, role : <span class="hljs-string">&#x27;user&#x27;</span> \};
    \}
\}
<span class="hljs-comment">// Order model with nested User and custom methods</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">Order</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">preinitialize</span>(<span class="hljs-params">attributes, options = \{\}</span>) \{
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">defaults</span> = \{
            id : <span class="hljs-literal">null</span>,
            total : <span class="hljs-number">0</span>,
            status : <span class="hljs-string">&#x27;pending&#x27;</span>,
            user : <span class="hljs-literal">null</span>
        \};

        <span class="hljs-variable language_">this</span>.<span class="hljs-property">apiUrl</span> = options.<span class="hljs-property">apiUrl</span> || <span class="hljs-string">&#x27;/api/orders&#x27;</span>;
    \}

    <span class="hljs-title function_">parse</span>(<span class="hljs-params">data, options = \{\}</span>) \{
        <span class="hljs-keyword">const</span> parsed = \{ ...data \};

        <span class="hljs-comment">// Convert user object to User model instance</span>
        <span class="hljs-keyword">if</span> (data.<span class="hljs-property">user</span> &amp;&amp; !(data.<span class="hljs-property">user</span> <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">User</span>)) \{
            parsed.<span class="hljs-property">user</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">User</span>(data.<span class="hljs-property">user</span>);
        \}

        <span class="hljs-keyword">return</span> parsed;
    \}

    <span class="hljs-title function_">toJSON</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">const</span> result = \{\};
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">const</span> [key, value] <span class="hljs-keyword">of</span> <span class="hljs-title class_">Object</span>.<span class="hljs-title function_">entries</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">attributes</span>)) \{
            <span class="hljs-keyword">if</span> (value <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">Model</span>) \{
                result[key] = value.<span class="hljs-title function_">toJSON</span>();
            \} <span class="hljs-keyword">else</span> \{
                result[key] = value;
            \}
        \}
        <span class="hljs-keyword">return</span> result;
    \}

    <span class="hljs-keyword">async</span> <span class="hljs-title function_">fetch</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">try</span> \{
            <span class="hljs-keyword">const</span> response = <span class="hljs-keyword">await</span> <span class="hljs-title function_">fetch</span>(<span class="hljs-string">\`<span class="hljs-subst">\$\{<span class="hljs-variable language_">this</span>.apiUrl\}</span>/<span class="hljs-subst">\$\{<span class="hljs-variable language_">this</span>.id\}</span>\`</span>);
            <span class="hljs-keyword">const</span> data = <span class="hljs-keyword">await</span> response.<span class="hljs-title function_">json</span>();

            <span class="hljs-comment">// Parse the fetched data and update model</span>
            <span class="hljs-keyword">const</span> parsed = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">parse</span>(data);
            <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">set</span>(parsed, \{ source : <span class="hljs-string">&#x27;fetch&#x27;</span> \});

            <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
        \} <span class="hljs-keyword">catch</span> (error) \{
            <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">error</span>(<span class="hljs-string">&#x27;Failed to fetch order:&#x27;</span>, error);
            <span class="hljs-keyword">throw</span> error;
        \}
    \}
\}

<span class="hljs-comment">// Create order with nested user data</span>
<span class="hljs-keyword">const</span> order = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Order</span>(\{
    id : <span class="hljs-number">123</span>,
    total : <span class="hljs-number">99.99</span>,
    user : \{ name : <span class="hljs-string">&#x27;Alice&#x27;</span>, email : <span class="hljs-string">&#x27;alice@example.com&#x27;</span> \}
\});

<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(order.<span class="hljs-property">user</span> <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">User</span>); <span class="hljs-comment">// true</span>
<span class="hljs-comment">// Serialize with nested models</span>
<span class="hljs-keyword">const</span> json = order.<span class="hljs-title function_">toJSON</span>();
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(json); <span class="hljs-comment">// \{ id: 123, total: 99.99, status: &#x27;pending&#x27;, user: \{ name: &#x27;Alice&#x27;, email: &#x27;alice@example.com&#x27;, role: &#x27;user&#x27; \} \}</span>

<span class="hljs-comment">// Listen to fetch updates</span>
order.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change&#x27;</span>, <span class="hljs-function">(<span class="hljs-params">model, changed, options</span>) =&gt;</span> \{
    <span class="hljs-keyword">if</span> (options?.<span class="hljs-property">source</span> === <span class="hljs-string">&#x27;fetch&#x27;</span>) \{
        <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&#x27;Order updated from server:&#x27;</span>, changed);
    \}
\});

<span class="hljs-comment">// Fetch latest data from server</span>
<span class="hljs-keyword">await</span> order.<span class="hljs-title function_">fetch</span>();</code></pre>
<ul>
<li><a href="#module_model">Model</a> ⇐ <code>Emitter</code><ul>
<li><a href="#module_model__preinitialize">.preinitialize([attributes], […args])</a></li>
<li><a href="#module_model__defineattribute">.defineAttribute(key)</a></li>
<li><a href="#module_model__get">.get(key)</a> ⇒ <code>any</code></li>
<li><a href="#module_model__set">.set(key, [value], […args])</a> ⇒ <code>Model</code></li>
<li><a href="#module_model__parse">.parse([data], […args])</a> ⇒ <code>object</code></li>
<li><a href="#module_model__tojson">.toJSON()</a> ⇒ <code>object</code></li></ul></li>
</ul>
<p><a name="module_model__preinitialize" id="module_model__preinitialize" class="anchor"></a></p>
<h3 id="modelpreinitializeattributesargs">model.preinitialize([attributes], […args])</h3>
<p>Called before any instantiation logic runs for the Model.
Receives all constructor arguments, allowing for flexible initialization patterns.
Use this to set up <code>defaults</code>, configure the model, or handle custom constructor arguments.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a>  </p>
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
<td>[attributes]</td>
<td><code>object</code></td>
<td><code>\{\}</code></td>
<td>Primary data object containing model attributes</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>\*</code></td>
<td></td>
<td>Additional arguments passed from the constructor</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">class</span> <span class="hljs-title class_">User</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">preinitialize</span>(<span class="hljs-params">attributes, options = \{\}</span>) \{
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">defaults</span> = \{ name : <span class="hljs-string">&#x27;&#x27;</span>, role : options.<span class="hljs-property">defaultRole</span> || <span class="hljs-string">&#x27;user&#x27;</span> \};
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">apiEndpoint</span> = options.<span class="hljs-property">apiEndpoint</span> || <span class="hljs-string">&#x27;/users&#x27;</span>;
    \}
\}
<span class="hljs-keyword">const</span> user = <span class="hljs-keyword">new</span> <span class="hljs-title class_">User</span>(\{ name : <span class="hljs-string">&#x27;Alice&#x27;</span> \}, \{ defaultRole : <span class="hljs-string">&#x27;admin&#x27;</span>, apiEndpoint : <span class="hljs-string">&#x27;/api/users&#x27;</span> \});</code></pre>
<p><a name="module_model__defineattribute" id="module_model__defineattribute" class="anchor"></a></p>
<h3 id="modeldefineattributekey">model.defineAttribute(key)</h3>
<p>Generate getter/setter for the given attribute key to emit <code>change</code> events.
The property name uses <code>attributePrefix</code> + key (e.g., with prefix 'attr<em>', key 'name' becomes 'attr</em>name').
Called internally by the constructor for each key in <code>this.attributes</code>.
Override with an empty method if you don't want automatic getters/setters.</p>
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
<td>Attribute key from <code>this.attributes</code></td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Custom prefix for all attributes</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">PrefixedModel</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-keyword">static</span> attributePrefix = <span class="hljs-string">&#x27;attr_&#x27;</span>;
\}
<span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">PrefixedModel</span>(\{ <span class="hljs-attr">name</span>: <span class="hljs-string">&#x27;Alice&#x27;</span> \});
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(model.<span class="hljs-property">attr_name</span>); <span class="hljs-comment">// &#x27;Alice&#x27;</span>

<span class="hljs-comment">// Disable automatic getters/setters</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">ManualModel</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">defineAttribute</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-comment">// Empty - no getters/setters generated</span>
    \}

    <span class="hljs-title function_">getName</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">get</span>(<span class="hljs-string">&#x27;name&#x27;</span>); <span class="hljs-comment">// Manual getter</span>
    \}
\}</code></pre>
<p><a name="module_model__get" id="module_model__get" class="anchor"></a></p>
<h3 id="modelgetkeyc152c">model.get(key) ⇒ <code>any</code></h3>
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
<p><a name="module_model__set" id="module_model__set" class="anchor"></a></p>
<h3 id="modelsetkeyvalueargsc156c">model.set(key, [value], […args]) ⇒ <code>Model</code></h3>
<p>Set one or more attributes into <code>this.attributes</code> and emit change events.
Supports two call signatures: <code>set(key, value, ...args)</code> or <code>set(object, ...args)</code>.
Additional arguments are passed to change event listeners, enabling custom behavior.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>Model</code> - This model instance for chaining<br />
<strong>Emits</strong>: <code>change Emitted when any attribute changes. Listeners receive \`(model, changedAttributes, ...event:args)\`</code>, <code>change:attribute Emitted for each changed attribute. Listeners receive \`(model, newValue, ...event:args)\`</code>  </p>
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
<td><code>string</code> | <code>object</code></td>
<td>Attribute key (string) or object containing key-value pairs</td>
</tr>
<tr>
<td>[value]</td>
<td><code>\*</code></td>
<td>Attribute value (when key is string)</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>\*</code></td>
<td>Additional arguments passed to event listeners</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Basic usage</span>
model.<span class="hljs-title function_">set</span>(<span class="hljs-string">&#x27;name&#x27;</span>, <span class="hljs-string">&#x27;Alice&#x27;</span>);
model.<span class="hljs-title function_">set</span>(\{ name : <span class="hljs-string">&#x27;Alice&#x27;</span>, age : <span class="hljs-number">30</span> \});

<span class="hljs-comment">// With options for listeners</span>
model.<span class="hljs-title function_">set</span>(<span class="hljs-string">&#x27;name&#x27;</span>, <span class="hljs-string">&#x27;Bob&#x27;</span>, \{ silent : <span class="hljs-literal">false</span>, validate : <span class="hljs-literal">true</span> \});
model.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change:name&#x27;</span>, <span class="hljs-function">(<span class="hljs-params">model, value, options</span>) =&gt;</span> \{
    <span class="hljs-keyword">if</span> (options?.<span class="hljs-property">validate</span>) \{
        <span class="hljs-comment">// Custom validation logic</span>
    \}
\});</code></pre>
<p><a name="module_model__parse" id="module_model__parse" class="anchor"></a></p>
<h3 id="modelparsedataargsc165c">model.parse([data], […args]) ⇒ <code>object</code></h3>
<p>Transforms and validates data before it becomes model attributes.
Called during construction with all constructor arguments, allowing flexible data processing.
Override this method to transform incoming data, create nested models, or handle different data formats.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>object</code> - Processed data that will become the model's attributes  </p>
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
<td>[data]</td>
<td><code>object</code></td>
<td><code>\{\}</code></td>
<td>Primary data object to be parsed into attributes</td>
</tr>
<tr>
<td>[…args]</td>
<td><code>\*</code></td>
<td></td>
<td>Additional arguments from constructor, useful for parsing options</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Transform nested objects into models</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">User</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{\}
<span class="hljs-keyword">class</span> <span class="hljs-title class_">Order</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">parse</span>(<span class="hljs-params">data, options = \{\}</span>) \{
        <span class="hljs-comment">// Skip parsing if requested</span>
        <span class="hljs-keyword">if</span> (options.<span class="hljs-property">raw</span>) <span class="hljs-keyword">return</span> data;
        <span class="hljs-comment">// Transform user data into User model</span>
        <span class="hljs-keyword">const</span> parsed = \{ ...data \};
        <span class="hljs-keyword">if</span> (data.<span class="hljs-property">user</span> &amp;&amp; !(data.<span class="hljs-property">user</span> <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">User</span>)) \{
            parsed.<span class="hljs-property">user</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">User</span>(data.<span class="hljs-property">user</span>);
        \}
        <span class="hljs-keyword">return</span> parsed;
    \}
\}

<span class="hljs-comment">// Usage with parsing options</span>
<span class="hljs-keyword">const</span> order1 = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Order</span>(\{ id : <span class="hljs-number">1</span>, user : \{ name : <span class="hljs-string">&#x27;Alice&#x27;</span> \} \}); <span class="hljs-comment">// user becomes User model</span>
<span class="hljs-keyword">const</span> order2 = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Order</span>(\{ id : <span class="hljs-number">2</span>, user : \{ name : <span class="hljs-string">&#x27;Bob&#x27;</span> \} \}, \{ raw : <span class="hljs-literal">true</span> \}); <span class="hljs-comment">// user stays plain object</span></code></pre>
<p><a name="module_model__tojson" id="module_model__tojson" class="anchor"></a></p>
<h3 id="modeltojsonc171c">model.toJSON() ⇒ <code>object</code></h3>
<p>Return object representation of the model to be used for JSON serialization.
By default returns a copy of <code>this.attributes</code>.
You can override this method to customize serialization behavior, such as calling <code>toJSON</code> recursively on nested Model instances.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>object</code> - Object representation of the model to be used for JSON serialization.<br />
<strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-comment">// Basic usage - returns a copy of model attributes:</span>
<span class="hljs-keyword">const</span> user = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ name : <span class="hljs-string">&#x27;Alice&#x27;</span>, age : <span class="hljs-number">30</span> \});
<span class="hljs-keyword">const</span> json = user.<span class="hljs-title function_">toJSON</span>();
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(json); <span class="hljs-comment">// \{ name : &#x27;Alice&#x27;, age : 30 \}</span>

<span class="hljs-comment">// Override toJSON for recursive serialization of nested models:</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">User</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{\}
<span class="hljs-keyword">class</span> <span class="hljs-title class_">Order</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Model</span> \{
    <span class="hljs-title function_">parse</span>(<span class="hljs-params">data</span>) \{
        <span class="hljs-comment">// Ensure user is always a User model</span>
        <span class="hljs-keyword">return</span> \{ ...data, user : data.<span class="hljs-property">user</span> <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">User</span> ? data.<span class="hljs-property">user</span> : <span class="hljs-keyword">new</span> <span class="hljs-title class_">User</span>(data.<span class="hljs-property">user</span>) \};
    \}

    <span class="hljs-title function_">toJSON</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">const</span> result = \{\};
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">const</span> [key, value] <span class="hljs-keyword">of</span> <span class="hljs-title class_">Object</span>.<span class="hljs-title function_">entries</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">attributes</span>)) \{
            <span class="hljs-keyword">if</span> (value <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">Model</span>) \{
                result[key] = value.<span class="hljs-title function_">toJSON</span>();
            \} <span class="hljs-keyword">else</span> \{
                result[key] = value;
            \}
        \}
        <span class="hljs-keyword">return</span> result;
    \}
\}
<span class="hljs-keyword">const</span> order = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Order</span>(\{ id : <span class="hljs-number">1</span>, user : \{ name : <span class="hljs-string">&#x27;Alice&#x27;</span> \} \});
<span class="hljs-keyword">const</span> json = order.<span class="hljs-title function_">toJSON</span>();
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(json); <span class="hljs-comment">// \{ id : 1, user : \{ name : &#x27;Alice&#x27; \} \}</span></code></pre>
<p><a name="module_view" id="module_view" class="anchor"></a></p>
<h2 id="viewc174c">View ⇐ <code>Emitter</code></h2>
<ul>
<li>Listens for changes and renders the UI.</li>
<li>Handles user input and interactivity.</li>
<li>Sends captured input to the model.</li>
</ul>
<p>A <code>View</code> is an atomic unit of the user interface that can render data from a specific model or multiple models.
However, views can also be independent and have no associated data.<br />
Models must be unaware of views. Views, on the other hand, may render model data and listen to the change events 
emitted by the models to re-render themselves based on changes.<br />
Each <code>View</code> has a root element, <code>this.el</code>, which is used for event delegation.<br />
All element lookups are scoped to this element, and any rendering or DOM manipulations should be done inside it. 
If <code>this.el</code> is not present, an element will be created using <code>this.tag</code> (defaulting to <code>div</code>) and <code>this.attributes</code>.</p>
<p><strong>Extends</strong>: <code>Emitter</code>  </p>
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
<td>Object containing options. The following keys will be merged into the view instance: <code>el</code>, <code>tag</code>, <code>attributes</code>, <code>events</code>, <code>model</code>, <code>template</code>, <code>onDestroy</code>.</td>
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
<td><code>node</code> | <code>function</code></td>
<td>Every view has a root DOM element stored at <code>this.el</code>. If not present, it will be created. If <code>this.el</code> is a function, it will be called to get the element at <code>this.ensureElement</code>, bound to the view instance. See <a href="module_view__ensureelement">View.ensureElement</a>.</td>
</tr>
<tr>
<td>tag</td>
<td><code>string</code> | <code>function</code></td>
<td>If <code>this.el</code> is not present, an element will be created using <code>this.tag</code> and <code>this.attributes</code>. Default is <code>div</code>. If it is a function, it will be called to get the tag, bound to the view instance. See <a href="module_view__ensureelement">View.ensureElement</a>.</td>
</tr>
<tr>
<td>attributes</td>
<td><code>object</code> | <code>function</code></td>
<td>If <code>this.el</code> is not present, an element will be created using <code>this.tag</code> and <code>this.attributes</code>. If it is a function, it will be called to get the attributes object, bound to the view instance. See <a href="module_view__ensureelement">View.ensureElement</a>.</td>
</tr>
<tr>
<td>events</td>
<td><code>object</code> | <code>function</code></td>
<td>Object in the format <code>\{'event selector' : 'listener'\}</code>. It will be used to bind delegated event listeners to the root element. If it is a function, it will be called to get the events object, bound to the view instance. See <a href="module_view_delegateevents">View.delegateEvents</a>.</td>
</tr>
<tr>
<td>model</td>
<td><code>object</code></td>
<td>A model or any object containing data and business logic.</td>
</tr>
<tr>
<td>template</td>
<td><code>function</code></td>
<td>A function that returns a string with the view's inner HTML. See <a href="module_view__render">View.render</a>.</td>
</tr>
<tr>
<td>uid</td>
<td><code>number</code></td>
<td>Unique identifier for the view instance. This can be used to generate unique IDs for elements within the view. It is automatically generated and should not be set manually.</td>
</tr>
</tbody>
</table>
<p><strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">import</span> \{ <span class="hljs-title class_">View</span>, <span class="hljs-title class_">Model</span> \} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;rasti&#x27;</span>;

<span class="hljs-keyword">class</span> <span class="hljs-title class_">Timer</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">View</span> \{
    <span class="hljs-title function_">constructor</span>(<span class="hljs-params">options</span>) \{
        <span class="hljs-variable language_">super</span>(options);
        <span class="hljs-comment">// Create model to store internal state. Set \`seconds\` attribute to 0.</span>
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ seconds : <span class="hljs-number">0</span> \});
        <span class="hljs-comment">// Listen to changes in model \`seconds\` attribute and re-render.</span>
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-title function_">on</span>(<span class="hljs-string">&#x27;change:seconds&#x27;</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">render</span>.<span class="hljs-title function_">bind</span>(<span class="hljs-variable language_">this</span>));
        <span class="hljs-comment">// Increment model \`seconds\` attribute every 1000 milliseconds.</span>
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">interval</span> = <span class="hljs-built_in">setInterval</span>(<span class="hljs-function">() =&gt;</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>.<span class="hljs-property">seconds</span>++, <span class="hljs-number">1000</span>);
    \}

    <span class="hljs-title function_">template</span>(<span class="hljs-params">model</span>) \{
        <span class="hljs-keyword">return</span> <span class="hljs-string">\`Seconds: &lt;span&gt;<span class="hljs-subst">\$\{View.sanitize(model.seconds)\}</span>&lt;/span&gt;\`</span>;
    \}

    <span class="hljs-title function_">render</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">template</span>) \{
            <span class="hljs-variable language_">this</span>.<span class="hljs-property">el</span>.<span class="hljs-property">innerHTML</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">template</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>);
        \}
        <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
    \}
\}
<span class="hljs-comment">// Render view and append view&#x27;s element into the body.</span>
<span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>.<span class="hljs-title function_">appendChild</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">Timer</span>().<span class="hljs-title function_">render</span>().<span class="hljs-property">el</span>);</code></pre>
<ul>
<li><a href="#module_view">View</a> ⇐ <code>Emitter</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_view__preinitialize">.preinitialize(options)</a></li>
<li><a href="#module_view__\$">.\$(selector)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__\$\$">.\$\$(selector)</a> ⇒ <code>Array.&lt;node&gt;</code></li>
<li><a href="#module_view__destroy">.destroy(options)</a> ⇒ <code>View</code></li>
<li><a href="#module_view__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_view__addchild">.addChild(child)</a> ⇒ <code>View</code></li>
<li><a href="#module_view__destroychildren">.destroyChildren()</a></li>
<li><a href="#module_view__ensureuid">.ensureUid()</a></li>
<li><a href="#module_view__ensureelement">.ensureElement()</a></li>
<li><a href="#module_view__createelement">.createElement(tag, attributes)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__removeelement">.removeElement()</a> ⇒ <code>View</code></li>
<li><a href="#module_view__delegateevents">.delegateEvents([events])</a> ⇒ <code>View</code></li>
<li><a href="#module_view__undelegateevents">.undelegateEvents()</a> ⇒ <code>View</code></li>
<li><a href="#module_view__render">.render()</a> ⇒ <code>View</code></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_view_sanitize">.sanitize(value)</a> ⇒ <code>string</code></li>
<li><a href="#module_view_resetuid">.resetUid()</a></li></ul></li></ul></li>
</ul>
<p><a name="module_view__preinitialize" id="module_view__preinitialize" class="anchor"></a></p>
<h3 id="viewpreinitializeoptions">view.preinitialize(options)</h3>
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
<td>options</td>
<td><code>object</code></td>
<td>The view options.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__\$" id="module_view__\$" class="anchor"></a></p>
<h3 id="viewdselectorc201c">view.\$(selector) ⇒ <code>node</code></h3>
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
<p><a name="module_view__\$\$" id="module_view__\$\$" class="anchor"></a></p>
<h3 id="viewddselectorc205c">view.\$\$(selector) ⇒ <code>Array.&lt;node&gt;</code></h3>
<p>Returns a list of elements that match the selector, 
scoped to DOM elements within the current view's root element (<code>this.el</code>).</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Array.&lt;node&gt;</code> - List of elements matching selector within the view's root element (<code>this.el</code>).  </p>
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
<p><a name="module_view__destroy" id="module_view__destroy" class="anchor"></a></p>
<h3 id="viewdestroyoptionsc209c">view.destroy(options) ⇒ <code>View</code></h3>
<p>Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call <code>onDestroy</code> lifecycle method.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>View</code> - Return <code>this</code> for chaining.  </p>
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
<td>Options object or any arguments passed to <code>destroy</code> method will be passed to <code>onDestroy</code> method.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__ondestroy" id="module_view__ondestroy" class="anchor"></a></p>
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
<p><a name="module_view__addchild" id="module_view__addchild" class="anchor"></a></p>
<h3 id="viewaddchildchildc215c">view.addChild(child) ⇒ <code>View</code></h3>
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
<td><code>View</code></td>
</tr>
</tbody>
</table>
<p><a name="module_view__destroychildren" id="module_view__destroychildren" class="anchor"></a></p>
<h3 id="viewdestroychildren">view.destroyChildren()</h3>
<p>Call destroy method on children views.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__ensureuid" id="module_view__ensureuid" class="anchor"></a></p>
<h3 id="viewensureuid">view.ensureUid()</h3>
<p>Ensure that the view has a unique id at <code>this.uid</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__ensureelement" id="module_view__ensureelement" class="anchor"></a></p>
<h3 id="viewensureelement">view.ensureElement()</h3>
<p>Ensure that the view has a root element at <code>this.el</code>.
You shouldn't call this method directly. It's called from the constructor.
You may override it if you want to use a different logic or to 
postpone element creation.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__createelement" id="module_view__createelement" class="anchor"></a></p>
<h3 id="viewcreateelementtagattributesc221c">view.createElement(tag, attributes) ⇒ <code>node</code></h3>
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
<td><code>"div"</code></td>
<td>Tag for the element. Default to <code>div</code></td>
</tr>
<tr>
<td>attributes</td>
<td><code>object</code></td>
<td></td>
<td>Attributes for the element.</td>
</tr>
</tbody>
</table>
<p><a name="module_view__removeelement" id="module_view__removeelement" class="anchor"></a></p>
<h3 id="viewremoveelementc227c">view.removeElement() ⇒ <code>View</code></h3>
<p>Remove <code>this.el</code> from the DOM.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__delegateevents" id="module_view__delegateevents" class="anchor"></a></p>
<h3 id="viewdelegateeventseventsc230c">view.delegateEvents([events]) ⇒ <code>View</code></h3>
<p>Provide declarative listeners for DOM events within a view. If an events object is not provided, 
it defaults to using <code>this.events</code>. If <code>this.events</code> is a function, it will be called to get the events object.</p>
<p>The events object should follow the format <code>\{'event selector': 'listener'\}</code>:</p>
<ul>
<li><code>event</code>: The type of event (e.g., 'click').</li>
<li><code>selector</code>: A CSS selector to match the event target. If omitted, the event is bound to the root element.</li>
<li><code>listener</code>: A function or a string representing a method name on the view. The method will be called with <code>this</code> bound to the view instance.</li>
</ul>
<p>By default, <code>delegateEvents</code> is called within the View's constructor. If you have a simple events object, 
all of your DOM events will be connected automatically, and you will not need to call this function manually.</p>
<p>All attached listeners are bound to the view, ensuring that <code>this</code> refers to the view object when the listeners are invoked.
When <code>delegateEvents</code> is called again, possibly with a different events object, all previous listeners are removed and delegated afresh.</p>
<p><strong>Listener signature:</strong> <code>(event, view, matched)</code></p>
<ul>
<li><code>event</code>:   The native DOM event object.</li>
<li><code>view</code>:    The current view instance (<code>this</code>).</li>
<li><code>matched</code>: The element that satisfies the selector. If no selector is provided, it will be the view's root element (<code>this.el</code>).</li>
</ul>
<p>If more than one ancestor between <code>event.target</code> and the view's root element matches the selector, the listener will be
invoked <strong>once for each matched element</strong> (from inner to outer).</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>View</code> - Returns <code>this</code> for chaining.  </p>
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
<pre><code class="js language-js"><span class="hljs-comment">// Using prototype (recommended for static events)</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">Modal</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">View</span> \{
    <span class="hljs-title function_">onClickOk</span>(<span class="hljs-params">event, view, matched</span>) \{
        <span class="hljs-comment">// matched === the button.ok element that was clicked</span>
        <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">close</span>();
    \}

    <span class="hljs-title function_">onClickCancel</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">destroy</span>();
    \}
\}
<span class="hljs-title class_">Modal</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">events</span> = \{
    <span class="hljs-string">&#x27;click button.ok&#x27;</span>: <span class="hljs-string">&#x27;onClickOk&#x27;</span>,
    <span class="hljs-string">&#x27;click button.cancel&#x27;</span>: <span class="hljs-string">&#x27;onClickCancel&#x27;</span>,
    <span class="hljs-string">&#x27;submit form&#x27;</span>: <span class="hljs-string">&#x27;onSubmit&#x27;</span>
\};

<span class="hljs-comment">// Using a function for dynamic events</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">DynamicView</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">View</span> \{
    <span class="hljs-title function_">events</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">return</span> \{
            [<span class="hljs-string">\`click .<span class="hljs-subst">\$\{<span class="hljs-variable language_">this</span>.model.buttonClass\}</span>\`</span>]: <span class="hljs-string">&#x27;onButtonClick&#x27;</span>,
            <span class="hljs-string">&#x27;click&#x27;</span>: <span class="hljs-string">&#x27;onRootClick&#x27;</span>
        \};
    \}
\}</code></pre>
<p><a name="module_view__undelegateevents" id="module_view__undelegateevents" class="anchor"></a></p>
<h3 id="viewundelegateeventsc234c">view.undelegateEvents() ⇒ <code>View</code></h3>
<p>Removes all of the view's delegated events. 
Useful if you want to disable or remove a view from the DOM temporarily. 
Called automatically when the view is destroyed and when <code>delegateEvents</code> is called again.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__render" id="module_view__render" class="anchor"></a></p>
<h3 id="viewrenderc237c">view.render() ⇒ <code>View</code></h3>
<p><code>render</code> is the core function that your view should override, in order to populate its element (<code>this.el</code>), with the appropriate HTML. The convention is for <code>render</code> to always return <code>this</code>.<br />
Views are low-level building blocks for creating user interfaces. For most use cases, we recommend using <a href="#module_component">Component</a> instead, which provides a more declarative template syntax, automatic DOM updates, and a more efficient render pipeline.<br />
If you add any child views, you should call <code>this.destroyChildren</code> before re-rendering.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>View</code> - Returns <code>this</code> for chaining.<br />
<strong>Example</strong>  </p>
<pre><code class="js language-js"><span class="hljs-keyword">class</span> <span class="hljs-title class_">UserView</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">View</span> \{
    <span class="hljs-title function_">render</span>(<span class="hljs-params"></span>) \{
        <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">template</span>) \{
            <span class="hljs-keyword">const</span> model = <span class="hljs-variable language_">this</span>.<span class="hljs-property">model</span>;
            <span class="hljs-comment">// Sanitize model attributes to prevent XSS attacks.</span>
            <span class="hljs-keyword">const</span> safeData = \{
                name : <span class="hljs-title class_">View</span>.<span class="hljs-title function_">sanitize</span>(model.<span class="hljs-property">name</span>),
                email : <span class="hljs-title class_">View</span>.<span class="hljs-title function_">sanitize</span>(model.<span class="hljs-property">email</span>),
                bio : <span class="hljs-title class_">View</span>.<span class="hljs-title function_">sanitize</span>(model.<span class="hljs-property">bio</span>)
            \};
            <span class="hljs-variable language_">this</span>.<span class="hljs-property">el</span>.<span class="hljs-property">innerHTML</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">template</span>(safeData);
        \}
        <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
    \}
\}</code></pre>
<p><a name="module_view_sanitize" id="module_view_sanitize" class="anchor"></a></p>
<h3 id="viewsanitizevaluec240c">View.sanitize(value) ⇒ <code>string</code></h3>
<p>Escape HTML entities in a string.
Use this method to sanitize user-generated content before inserting it into the DOM.
Override this method to provide a custom escape function.
This method is inherited by <a href="#module_component">Component</a> and used to escape template interpolations.</p>
<p><strong>Kind</strong>: static method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>string</code> - Escaped string.  </p>
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
<td>value</td>
<td><code>string</code></td>
<td>String to escape.</td>
</tr>
</tbody>
</table>
<p><a name="module_view_resetuid" id="module_view_resetuid" class="anchor"></a></p>
<h3 id="viewresetuid">View.resetUid()</h3>
<p>Reset the unique ID counter to 0.
This is useful for server-side rendering scenarios where you want to ensure that
the generated unique IDs match those on the client, enabling seamless hydration of components.
This method is inherited by <a href="#module_component">Component</a>.</p>
<p><strong>Kind</strong>: static method of <a href="#module_view"><code>View</code></a>  </p></section>
        `}),{AppBar:Qe,AppBarMenuContent:et}=(()=>{const{logoAlt:e,playgroundUrl:t,githubUrl:s,npmUrl:a}={logoAlt:"Rasti.js",playgroundUrl:"https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010",githubUrl:"https://github.com/8tentaculos/rasti",npmUrl:"https://www.npmjs.com/package/rasti"},n=z.create`
        <div class="${Te.menuContent}">
            <nav><ul>
                ${({props:e,partial:n})=>n`
                    <li>
                        <${X}
                            href="/api/"
                            onClick=${()=>e.handleOpen(!1)}
                            attributes=${{"data-router":!0}}
                            label="API"
                            variant="plain"
                            size="lg"
                            color="${({props:e})=>!e.location.params.notFound&&e.location.test("/api/")?"primary":"neutral"}"
                        />
                    </li>
                    <li>
                        <${X}
                            href="${t}"
                            onClick=${()=>e.handleOpen(!1)}
                            target="_blank"
                            label="Playground"
                            variant="plain"
                            size="lg"
                        />
                    </li>
                    <li>
                        <${X}
                            href="${s}"
                            onClick=${()=>e.handleOpen(!1)}
                            target="_blank"
                            label="GitHub"
                            variant="plain"
                            size="lg"
                            renderLeftIcon=${()=>Ce.mount({className:Te.icon})}
                        />
                    </li>
                    <li>
                        <${X}
                            href="${a}"
                            onClick=${()=>e.handleOpen(!1)}
                            target="_blank"
                            label="npm"
                            variant="plain"
                            size="lg"
                            renderLeftIcon=${()=>Ee.mount({className:Te.icon})}
                        />
                    </li>
                `}
            </ul></nav>
        </div>
    `;return{AppBar:z.create`
        <${je} className="${Te.root}">
            <${je.Left}>
                <div class="${Te.leftContent}">
                    <${X}
                        href="/"
                        attributes=${{"data-router":!0}}
                        variant="plain"
                    >
                        <span class="${({props:e})=>e.location.params.notFound||!e.location.test("/")?Te.logoInactive:""}">
                            <img height="24" class="${Te.hiddenIfLight}" alt="${e}" src="/logo-dark.svg">
                            <img height="24" class="${Te.hiddenIfDark}" alt="${e}" src="/logo.svg">
                        </span>
                    </${X}>
                </div>
            </${je.Left}>
            <${je.Center}>
            </${je.Center}>
            <${je.Right}>
                <div class="${Te.rightContent}">
                    <nav class="${Te.navLinks}">
                        <ul>
                            <li>
                                <${X}
                                    href="/api/"
                                    attributes=${{"data-router":!0}}
                                    label="API"
                                    variant="plain"
                                    color="${({props:e})=>!e.location.params.notFound&&e.location.test("/api/")?"primary":"neutral"}"
                                />
                            </li>
                            <li>
                                <${X}
                                    href="${t}"
                                    target="_blank"
                                    label="Playground"
                                    variant="plain"
                                />
                            </li>
                            <li>
                                <${X}
                                    href="${s}"
                                    target="_blank"
                                    variant="plain"
                                    renderChildren=${()=>Ce.mount({className:Te.icon})}
                                />
                            </li>
                            <li>
                                <${X}
                                    href="${a}"
                                    target="_blank"
                                    variant="plain"
                                    renderChildren=${()=>Ee.mount({className:Te.icon})}
                                />
                            </li>
                        </ul>
                    </nav>
                    <${ke} />
                    <div class="${Te.menuButton}">
                        <${X}
                            color="primary"
                            variant="plain"
                            size="lg"
                            onClick="${({props:e})=>e.onMenuClick}"
                        >
                            <${_e} className=${Te.icon} />
                        </${X}>
                    </div>
                </div>
            </${je.Right}>
        </${je}>
    `,AppBarMenuContent:n}})(),tt=(e=>{const{title:t,AppBar:s,AppBarMenuContent:a,Cover:n,Description:r,Features:l,Readme:i,Api:c,Footer:p}=e;return z.create`
        <div class="${me.root}">
            <${s} 
                location="${({state:e})=>e.location}"
                onMenuClick="${({state:e})=>()=>{e.menuOpen=!0}}"
            />

            ${({state:e,partial:t})=>e.menuOpen&&a?t`<${oe}
                    className="${me.appBarMenuDialog}"
                    handleClose=${()=>{e.menuOpen=!1}}
                    shadow="lg"
                >
                    <${oe.Header}
                        handleClose=${()=>{e.menuOpen=!1}}
                        closeButton=${!0}
                    />
                    <${oe.Content}
                        renderChildren=${()=>a.mount({handleOpen:t=>{e.menuOpen=t},location:e.location})}
                    />
                </${oe}>`:null}

            ${({state:e,partial:t})=>e.location.params.notFound?t`<${ue} />`:e.location.test("/api/")?t`<${c} />`:t`
                        <${n} />
                        ${r?t`<${r} />`:null}
                        <${l} />
                        <${i} />
                    `}

            <${p} />
        </div>
    `.extend({onCreate(e={}){this.state=new o({location:null,menuOpen:!1});const t=[{path:"/api/",action:e=>this.updateRoute(e)},{path:"/",action:e=>this.updateRoute(e)},{path:"*notFound",action:e=>this.updateRoute(e)}];this.router=function(e,t={}){const{baseUrl:s=""}=t,a=e=>{const[t,a]=e.replace(s,"").split("?");return{pathname:t,query:a}},n=(e,t)=>(0,re.YW)(t,{decode:decodeURIComponent})(e),o=(t,s={})=>{const{addToHistory:o=!0,replaceHistory:l=!1}=s,i=(t=>{const{pathname:s,query:o}=a(t);for(const t of e){const e=n(s,t.path);if(e){const s={path:t.path,params:r(e.params),query:Object.fromEntries(new URLSearchParams(o).entries()),test:e=>!!n(a(e).pathname,t.path)};return()=>t.action(s)}}return null})(t);i?(o&&"undefined"!=typeof window&&window.history[l?"replaceState":"pushState"]({},"",t),i()):console.error("No route matched:",t)},r=e=>{const t={};for(const[s,a]of Object.entries(e))t[s]=String(a).replace(/[<>]/g,"");return t};return{navigate:o,createUrl:(e,t={},a={})=>{const n=(0,re.wE)(e,{encode:encodeURIComponent})(t),o=new URLSearchParams(a).toString();return`${s}${o?`${n}?${o}`:n}`},delegateNavigation:e=>{const t=e=>{if(e.defaultPrevented||0!==e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const t=e.target.closest("a[data-router]");if(t&&t.href){e.preventDefault();const s=new URL(t.href);window.scrollTo({top:0}),o(s.pathname+s.search)}};return e.addEventListener("click",t),()=>{e.removeEventListener("click",t)}},bindHistory:()=>{const e=()=>{o(window.location.pathname+window.location.search,{addToHistory:!1})};return window.addEventListener("popstate",e),()=>{window.removeEventListener("popstate",e)}}}}(t),"undefined"!=typeof window?(this.router.delegateNavigation(document.body),this.router.bindHistory(),this.router.navigate(e.url||window.location.pathname+window.location.search,{addToHistory:!1,replaceHistory:!0})):this.router.navigate(e.url,{addToHistory:!1})},updateRoute(e){this.state.location=e,"undefined"!=typeof document&&(document.title=this.getTitle())},getTitle(){const e=this.state.location.params.notFound?" - Not Found":this.state.location.test("/api/")?" - API Documentation":this.state.location.test("/")?" - Home":"";return`${t}${e}`}})})({title:"Rasti.js",AppBar:Qe,AppBarMenuContent:et,Cover:Me,Description:Re,Features:He,Readme:ze,Api:Ge,Footer:(()=>{const{licenseUrl:e,startYear:t}={licenseUrl:"https://github.com/8tentaculos/rasti/blob/master/LICENSE",startYear:2018};return z.create`
        <footer class="${Le.root}">
            <${pe} level="titleMd" className="${Le.text}">
                Released under the <a href="${e}" target="_blank">MIT License</a>
            </${pe}>
            <${pe} level="titleSm" className="${Le.text}">
                Copyright © ${()=>{const e=(new Date).getFullYear();return e===t?e:`${t}-${e}`}} by <a href="https://github.com/8tentaculos/" target="_blank">8tentaculos</a>
            </${pe}>
        </footer>
    `})()});tt.mount({url:window.location.pathname+window.location.search},document.getElementById("root"),!0)})();