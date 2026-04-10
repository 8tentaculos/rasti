(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const Ve=!1;function ae(e){if(typeof e!="function"){const t="Event listener must be a function";throw new TypeError(t)}}class He{on(t,s){return ae(s),this.listeners||(this.listeners={}),this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push(s),()=>this.off(t,s)}once(t,s){ae(s);const n=(...a)=>{s(...a),this.off(t,n)};return this.on(t,n)}off(t,s){if(this.listeners){if(!t){delete this.listeners;return}this.listeners[t]&&(s?(this.listeners[t]=this.listeners[t].filter(n=>n!==s),this.listeners[t].length||delete this.listeners[t]):delete this.listeners[t],Object.keys(this.listeners).length||delete this.listeners)}}emit(t,...s){!this.listeners||!this.listeners[t]||this.listeners[t].slice().forEach(n=>n(...s))}listenTo(t,s,n){return t.on(s,n),this.listeningTo||(this.listeningTo=[]),this.listeningTo.push({emitter:t,type:s,listener:n}),()=>this.stopListening(t,s,n)}listenToOnce(t,s,n){ae(n);const a=(...o)=>{n(...o),this.stopListening(t,s,a)};return this.listenTo(t,s,a)}stopListening(t,s,n){this.listeningTo&&(this.listeningTo=this.listeningTo.filter(a=>!t||t===a.emitter&&!s||t===a.emitter&&s===a.type&&!n||t===a.emitter&&s===a.type&&n===a.listener?(a.emitter.off(a.type,a.listener),!1):!0),this.listeningTo.length||delete this.listeningTo)}}const J=(e,t,...s)=>typeof e!="function"?e:e.apply(t,s);class le extends He{constructor(){super(),this.preinitialize.apply(this,arguments),this.attributes=Object.assign({},J(this.defaults,this),this.parse.apply(this,arguments)),this.previous={},Object.keys(this.attributes).forEach(this.defineAttribute.bind(this))}preinitialize(){}defineAttribute(t){Object.defineProperty(this,`${this.constructor.attributePrefix}${t}`,{get:()=>this.get(t),set:s=>{this.set(t,s)}})}get(t){return this.attributes[t]}set(t,s,...n){let a,o;typeof t=="object"?(a=t,o=[s,...n]):(a={[t]:s},o=n);const r=this._changing;this._changing=!0;const l={};r||(this.previous=Object.assign({},this.attributes)),Object.keys(a).forEach(p=>{a[p]!==this.attributes[p]&&(l[p]=a[p],this.attributes[p]=a[p])});const d=Object.keys(l);if(d.length&&(this._pending=["change",this,l,...o]),d.forEach(p=>{this.emit(`change:${p}`,this,a[p],...o)}),r)return this;for(;this._pending;){const p=this._pending;this._pending=null,this.emit.apply(this,p)}return this._pending=null,this._changing=!1,this}parse(t){return t}toJSON(){return Object.assign({},this.attributes)}}le.attributePrefix="";const qe=["el","tag","attributes","events","model","template","onDestroy"];class ne extends He{constructor(t={}){super(),this.preinitialize.apply(this,arguments),this.delegatedEventListeners=[],this.children=[],this.destroyQueue=[],this.viewOptions=[],qe.forEach(s=>{s in t&&(this[s]=t[s],this.viewOptions.push(s))}),this.ensureUid(),this.ensureElement()}preinitialize(){}$(t){return this.el.querySelector(t)}$$(t){return this.el.querySelectorAll(t)}destroy(){return this.destroyChildren(),this.undelegateEvents(),this.stopListening(),this.off(),this.destroyQueue.forEach(t=>t()),this.destroyQueue=[],this.onDestroy.apply(this,arguments),this.destroyed=!0,this}onDestroy(){}addChild(t){return this.children.push(t),t}destroyChildren(){this.children.forEach(t=>t.destroy()),this.children=[]}ensureUid(){this.uid||(this.uid=`r${++ne.uid}`)}ensureElement(){if(this.el)this.el=J(this.el,this);else{const t=J(this.tag,this),s=J(this.attributes,this);this.el=this.createElement(t,s)}this.delegateEvents()}createElement(t="div",s={}){let n=document.createElement(t);return Object.keys(s).forEach(a=>n.setAttribute(a,s[a])),n}removeElement(){return this.el.parentNode.removeChild(this.el),this}delegateEvents(t){if(t||(t=J(this.events,this)),!t)return this;this.delegatedEventListeners.length&&this.undelegateEvents();const s={};return Object.keys(t).forEach(n=>{const a=n.match(/^(\w+)(?:\s+(.+))*$/);if(!a){const d=`Invalid event format: ${n}`;throw new Error(d)}const[,o,r]=a;let l=t[n];typeof l=="string"&&(l=this[l]),ae(l),s[o]||(s[o]=[]),s[o].push([r,l])}),Object.keys(s).forEach(n=>{const a=o=>{let r=o.target;for(;r;)r.matches&&s[n].forEach(([l,d])=>{(r===this.el&&!l||r!==this.el&&r.matches(l))&&d.call(this,o,this,r)}),r=r===this.el||o.cancelBubble?null:r.parentElement};this.delegatedEventListeners.push([n,a]),this.el.addEventListener(n,a)}),this}undelegateEvents(){return this.delegatedEventListeners.forEach(([t,s])=>{this.el.removeEventListener(t,s)}),this.delegatedEventListeners=[],this}render(){return this}static sanitize(t){return`${t}`.replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[s])}static resetUid(){ne.uid=0}}ne.uid=0;class je{constructor(t){this.value=t}toString(){return this.value}}class ue{constructor(t){this.items=t}}class Ke{constructor(){this.listeners=[],this.types=new Set,this.previousSize=0}addListener(t,s){return this.types.add(s),this.listeners.push(t),this.listeners.length-1}reset(){this.listeners=[],this.previousSize=this.types.size}hasPendingTypes(){return this.types.size>this.previousSize}}function Ye(e,t={}){const s={},n=[];return Object.keys(e).forEach(a=>{let o=e[a];o!==t[a]&&(o===!0?s[a]="":o!==!1&&((o===null||typeof o>"u")&&(o=""),s[a]=o))}),Object.keys(t).forEach(a=>{(!(a in e)||t[a]!==e[a]&&e[a]===!1)&&n.push(a)}),{add:s,remove:n}}const we=["value","checked","selected"];let Je=class{constructor(t){this.getSelector=t.getSelector,this.getAttributes=t.getAttributes,this.previousAttributes={}}hydrate(t){this.ref=t.querySelector(this.getSelector())}update(){const t=this.getAttributes(),{remove:s,add:n}=Ye(t,this.previousAttributes);this.previousAttributes=t,s.forEach(a=>{this.ref.removeAttribute(a),we.indexOf(a)!==-1&&a in this.ref&&(this.ref[a]=a==="value"?"":!1)}),Object.keys(n).forEach(a=>{const o=n[a];this.ref.setAttribute(a,o),we.indexOf(a)!==-1&&a in this.ref&&(this.ref[a]=a==="value"?o:o!==!1&&o!=="false")})}};class Xe{constructor(){}reset(){this.paused=0,this.previous=this.tracked||new Map,this.tracked=new Map,this.positionStack=[0]}push(){this.positionStack.push(0)}pop(){this.positionStack.pop()}increment(){this.positionStack[this.positionStack.length-1]++}pause(){this.paused++}resume(){this.paused--}getPath(){return this.positionStack.join("-")}track(t){return this.paused===0&&this.tracked.set(this.getPath(),t),t}hasSingleComponent(){if(this.tracked.size!==1||this.previous.size!==1)return!1;const[t,s]=this.tracked.entries().next().value,[n,a]=this.previous.entries().next().value;return t!=="0"||n!=="0"?!1:s===a}findRecyclable(t){const s=this.previous.get(this.getPath());return s&&!s.key&&s.constructor===t.constructor?s:null}}const _e=["value","checked","selected"],Ze=(e,t)=>{const s=e.childNodes,n=t.childNodes,a=s.length;if(a!==n.length)return!1;for(let o=0;o<a;o++)if(!s[o].isEqualNode(n[o]))return!1;return!0},Ge=(e,t)=>{const s=t.attributes,n=e.attributes,a=new Set;for(let o=0,r=s.length;o<r;o++){const{name:l,value:d}=s[o];a.add(l),e.getAttribute(l)!==d&&e.setAttribute(l,d)}for(let o=n.length-1;o>=0;o--){const{name:r}=n[o];a.has(r)||e.removeAttribute(r)}for(let o=0,r=_e.length;o<r;o++){const l=_e[o];l in e&&e[l]!==t[l]&&(e[l]=t[l])}},Qe=(e,t)=>{const s=Array.from(t.childNodes);e.replaceChildren(...s)};function et(e,t){if(e.nodeType!==t.nodeType){e.replaceWith(t);return}if(e.nodeType===Node.TEXT_NODE){e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);return}if(e.tagName!==t.tagName){e.replaceWith(t);return}Ge(e,t),Ze(e,t)||Qe(e,t)}function me(e,t,s=()=>!1,n){let a=n||e.firstChild;for(;a;){if(a.nodeType===Node.COMMENT_NODE&&a.data.trim()===t)return a;if(a.nodeType===Node.ELEMENT_NODE&&!s(a)&&a.firstChild){a=a.firstChild;continue}for(;a&&!a.nextSibling;)if(a=a.parentNode,!a||a===e)return null;a&&(a=a.nextSibling)}return null}class xe{constructor(t){this.getStart=t.getStart,this.getEnd=t.getEnd,this.expression=t.expression,this.shouldSkipFind=t.shouldSkipFind,this.shouldSkipSync=t.shouldSkipSync,this.tracker=new Xe}hydrate(t){const s=me(t,this.getStart(),this.shouldSkipFind),n=me(t,this.getEnd(),this.shouldSkipFind,s);this.ref=[s,n]}update(t,s){let n;const[a,o]=this.ref,r=a.nextSibling,l=r===o,d=!l&&r.nextSibling===o;if(l?o.parentNode.insertBefore(t,o):d&&t.children.length===1&&!this.shouldSkipSync(r)&&!this.shouldSkipSync(t.firstChild)?et(r,t.firstChild):(n=document.createComment(""),o.parentNode.insertBefore(n,o),o.parentNode.insertBefore(t,o)),s(),n)if(this.ref[0].nextSibling===n)n.parentNode.removeChild(n);else{const $=document.createRange();$.setStartAfter(this.ref[0]),$.setEndAfter(n),$.deleteContents()}}updateElement(t,s,n){const a=document.createComment("");t.parentNode.insertBefore(a,t.nextSibling),a.parentNode.insertBefore(s.firstChild,a.nextSibling),n(),t.nextSibling===a&&t.parentNode.removeChild(t),a.parentNode.removeChild(a)}}const Ie=e=>e.reduce((t,s)=>(Array.isArray(s)?t.push(...Ie(s)):t.push(s),t),[]);function ie(e){const t=document.createElement("template");return t.innerHTML=`${e}`.trim(),t.content}function ze(e){const t=[];return Object.keys(e).forEach(s=>{let n=e[s];n===!0?t.push(s):n!==!1&&((n===null||typeof n>"u")&&(n=""),t.push(`${s}="${n}"`))}),t.join(" ")}let ce,re,Be,Pe;typeof document<"u"&&(ce=!!navigator.userAgent.match(/Chrome/),re=!!Element.prototype.moveBefore,Be=!re||ce,Pe=re&&ce);function tt(e,t){const s=Be&&document.activeElement&&t.contains(document.activeElement)?document.activeElement:null;s&&Pe&&s.blur(),e.parentNode[re?"moveBefore":"insertBefore"](t,e),e.parentNode.removeChild(e),s&&s!==document.activeElement&&t.contains(s)&&s.focus()}const Z=(e,t,s)=>{try{return typeof e!="function"?e:(Ve&&e.prototype instanceof f,e.call(t,t))}catch(n){if(s&&!n._rasti){let a;a=`Error in ${t.constructor.name}#${t.uid} expression`;const o=new Error(a,{cause:n});throw o._rasti=!0,o}throw n}},$e=e=>!!(e&&e.dataset&&e.dataset[f.DATASET_ELEMENT]&&e.dataset[f.DATASET_ELEMENT].endsWith("-1")),st=e=>!!(e&&(e.dataset&&e.dataset[f.DATASET_ELEMENT]||e.querySelector&&e.querySelector(`[${f.ATTRIBUTE_ELEMENT}]`))),ke=(e,t)=>e.reduce((s,n,a)=>(s.push(n),typeof t[a]<"u"&&s.push(f.PLACEHOLDER(a)),s),[]).join(""),ge=(e,t)=>{const s=f.PLACEHOLDER("(\\d+)"),n=e.match(new RegExp(`^${s}$`));if(n)return[t[parseInt(n[1],10)]];const a=new RegExp(`${s}`,"g"),o=[];let r=0,l;for(;(l=a.exec(e))!==null;){const d=e.slice(r,l.index);o.push(f.markAsSafeHTML(d),t[parseInt(l[1],10)]),r=l.index+l[0].length}return o.push(f.markAsSafeHTML(e.slice(r))),o},be=(e,t)=>e.reduce((s,n)=>{const a=t(n[0]);if(n.length===1)typeof a=="object"?s=Object.assign(s,a):typeof a=="string"&&(s[a]=!0);else{const o=n[2]?t(n[1]):n[1];s[a]=o}return s},{}),Ne=(e,t,s)=>{const n={};return Object.keys(e).forEach(a=>{const o=a.match(/on(([A-Z]{1}[a-z]+)+)/);if(o&&o[1]){const r=o[1].toLowerCase(),l=e[a];if(l){const d=t.addListener(l,r);n[s(r)]=d}}else n[a]=e[a]}),n},fe=(e,t,s=!1)=>{const n=f.PLACEHOLDER("(\\d+)"),a=new Map;return s||(e=e.replace(new RegExp(n,"g"),(o,r)=>{const l=t[r];if(l&&l.prototype instanceof f){if(a.has(l))return a.get(l);a.set(l,o)}return o})),e.replace(new RegExp(`<(${n})([^>]*)/>|<(${n})([^>]*)>([\\s\\S]*?)</\\4>`,"g"),(o,r,l,d,p,$,i,u)=>{let h,w,L;if(p?(h=t[$],w=i):(h=typeof l<"u"?t[l]:r,w=d),!(h.prototype instanceof f))return o;if(p){const q=fe(u,t,!0),H=Fe(q,t);L=ge(H,t)}const V=ye(w,t),z=function(){const q=be(V,H=>Z(H,this,"children options"));return L&&(q.renderChildren=()=>new ue(L.map(H=>Z(H,this,"children")))),h.mount(q)};return t.push(z),f.PLACEHOLDER(t.length-1)})},Ue=(e,t)=>{const s=f.PLACEHOLDER("(?:\\d+)");return e.replace(new RegExp(`<(${s}|[a-z]+[1-6]?)(?:\\s*)((?:"[^"]*"|'[^']*'|[^>])*)(/?>)`,"gi"),t)},at=(e,t,s)=>{const n=f.PLACEHOLDER("(?:\\d+)");if(e.match(new RegExp(`^\\s*${n}\\s*$`)))return e;const o=e.match(new RegExp(`^\\s*<([a-z]+[1-6]?|${n})([^>]*)>([\\s\\S]*?)</(\\1|${n})>\\s*$|^\\s*<([a-z]+[1-6]?|${n})([^>]*)/>\\s*$`));if(!o){const l="Invalid component template";throw new Error(l)}let r=0;return Ue(o[0],(l,d,p,$)=>{const i=r===0,u=++r;if(!i&&!p.match(new RegExp(n)))return l;const h=ye(p,t),w=H=>`${H}-${u}`,L=function(){const H=Ne(be(h,K=>Z(K,this,"element attribute")),this.eventsManager,K=>f.ATTRIBUTE_EVENT(K,this.uid));return i&&this.attributes&&Object.assign(H,J(this.attributes,this)),H[f.ATTRIBUTE_ELEMENT]=w(this.uid),H},V=function(){return`[${f.ATTRIBUTE_ELEMENT}="${w(this.uid)}"]`},z=s.length;s.push({getSelector:V,getAttributes:L}),t.push(function(){const H=this.template.elements[z],K=H.getAttributes.call(this);return H.previousAttributes=K,f.markAsSafeHTML(ze(K))});const q=f.PLACEHOLDER(t.length-1);return`<${d} ${q}${$}`})},Fe=(e,t)=>{const s=f.PLACEHOLDER("(?:\\d+)");return Ue(e,(n,a,o,r)=>{if(!o.match(new RegExp(s)))return n;const l=ye(o,t),d=function(){return Ne(be(l,i=>Z(i,this,"partial element attribute")),this.eventsManager,i=>f.ATTRIBUTE_EVENT(i,this.uid))};t.push(function(){const $=d.call(this);return f.markAsSafeHTML(ze($))});const p=f.PLACEHOLDER(t.length-1);return`<${a} ${p}${r}`})},nt=(e,t,s)=>{const n=f.PLACEHOLDER("(\\d+)");let a=0;return e.replace(new RegExp(n,"g"),function(o,r,l){const d=e.substring(0,l),p=d.lastIndexOf("<"),$=d.lastIndexOf(">");if(p>$)return o;const i=++a;function u(){return f.MARKER_START(`${this.uid}-${i}`)}function h(){return f.MARKER_END(`${this.uid}-${i}`)}const w=s.length;return s.push({getStart:u,getEnd:h,expression:t[r]}),t.push(function(){return this.template.interpolations[w]}),f.PLACEHOLDER(t.length-1)})},ye=(e,t)=>{const s=f.PLACEHOLDER("(\\d+)"),n=[],a=new RegExp(`(?:${s}|([\\w-]+))(?:=(["']?)(?:${s}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/>|\\s*[>"']))+.))?\\3)?`,"g");let o;for(;(o=a.exec(e))!==null;){const[,r,l,d,p,$]=o,i=!!d;let u=typeof r<"u"?t[parseInt(r,10)]:l,h=typeof p<"u"?t[parseInt(p,10)]:$;i&&typeof h>"u"&&(h=""),typeof h<"u"?n.push([u,h,i]):n.push([u])}return n},ot=["key","state","onCreate","onChange","onHydrate","onBeforeRecycle","onRecycle","onBeforeUpdate","onUpdate"];class f extends ne{constructor(t={}){super(...arguments),this.componentOptions=[],ot.forEach(n=>{n in t&&(this[n]=t[n],this.componentOptions.push(n))});const s={};Object.keys(t).forEach(n=>{this.viewOptions.indexOf(n)===-1&&this.componentOptions.indexOf(n)===-1&&(s[n]=t[n])}),this.props=new le(s),this.options=t,this.partial=this.partial.bind(this),this.onChange=this.onChange.bind(this),this.onCreate.apply(this,arguments)}events(){const t={};return this.eventsManager.types.forEach(s=>{const n=f.ATTRIBUTE_EVENT(s,this.uid),a=function(o,r,l){const d=l.getAttribute(n);if(d){let p=this.eventsManager.listeners[parseInt(d,10)];typeof p=="string"&&(p=this[p]),ae(p),p.call(this,o,r,l)}};t[`${s} [${n}]`]=a,t[s]=a}),t}ensureElement(){if(this.eventsManager=new Ke,this.template=J(this.template,this),this.el){if(this.el=J(this.el,this),!this.el.parentNode){const t=`Hydration failed in ${this.constructor.name}#${this.uid}`;throw new Error(t)}this.toString(),this.hydrate(this.el.parentNode)}}isContainer(){return this.template.elements.length===0&&this.template.interpolations.length===1}subscribe(t,s="change",n=this.onChange){return t.on&&this.listenTo(t,s,n),this}hydrate(t){return["model","state","props"].forEach(s=>{this[s]&&this.subscribe(this[s])}),this.isContainer()?(this.children[0].hydrate(t),this.el=this.children[0].el):(this.template.elements.forEach((s,n)=>{n===0?(s.hydrate(t),this.el=s.ref):s.hydrate(this.el)}),this.template.interpolations.forEach(s=>s.hydrate(this.el)),this.children.forEach(s=>s.hydrate(this.el))),this.delegateEvents(),this.onHydrate.call(this),this}recycle(t){if(this.onBeforeRecycle.call(this),t){const s=me(t,f.MARKER_RECYCLED(this.uid),$e);tt(s,this.el)}return this}updateProps(t){return this.props.set(t),this.onRecycle.call(this),this}getRecycledMarker(){return`<!--${f.MARKER_RECYCLED(this.uid)}-->`}partial(t,...s){const n=ge(Fe(fe(ke(t,s).trim(),s),s),s).map(a=>Z(a,this,"partial"));return new ue(n)}renderTemplatePart(t,s,n){const a=Z(t,this,"template part");if(typeof a>"u"||a===null||a===!1||a===!0)return"";if(a instanceof je)return`${a}`;if(a instanceof f)return`${s(a,n)}`;if(a instanceof ue){if(a.items.length===1)return this.renderTemplatePart(a.items[0],s,n);n.push();const o=a.items.map(r=>(n.increment(),this.renderTemplatePart(r,s,n))).join("");return n.pop(),o}if(Array.isArray(a)){n.pause();const o=Ie(a).map(r=>this.renderTemplatePart(r,s,n)).join("");return n.resume(),o}if(a instanceof xe){const o=a.tracker;o.reset();const r=this.isContainer()?"":`<!--${a.getStart()}-->`,l=this.isContainer()?"":`<!--${a.getEnd()}-->`;return`${r}${this.renderTemplatePart(a.expression,s,o)}${l}`}return`${f.sanitize(a)}`}toString(){this.destroyChildren(),this.eventsManager.reset();const t=(s,n)=>(n.track(s),this.addChild(s));return this.template.parts.map(s=>this.renderTemplatePart(s,t)).join("")}render(){if(this.destroyed)return this;if(!this.el){const n=ie(this);return this.hydrate(n),this}this.onBeforeUpdate.call(this),this.eventsManager.reset();const t=this.children;this.children=[];const s=[];return this.template.interpolations.forEach(n=>{const a=n.tracker;a.reset();const o=[],r=[],l=u=>{let h=u,w=null;return u.key?w=t.find(L=>L.key===u.key):w=a.findRecyclable(u),w?(h=w.getRecycledMarker(),r.push([w,u]),a.track(w)):(o.push(u),a.track(u)),h},d=this.renderTemplatePart(n.expression,l,a),p=([u,h],w)=>{s.push([u,h.props.toJSON()]),this.addChild(u).recycle(w),h.destroy()};if(a.hasSingleComponent()){p(r[0],null);return}const $=ie(d),i=u=>()=>{r.forEach(h=>p(h,u)),o.forEach(h=>this.addChild(h).hydrate(u))};this.isContainer()?n.updateElement(this.el,$,i(this.el.parentNode)):n.update($,i(this.el))}),t.forEach(n=>{this.children.indexOf(n)<0&&n.destroy()}),s.forEach(([n,a])=>{n.updateProps(a)}),this.isContainer()?this.el=this.children[0].el:this.template.elements.forEach(n=>n.update()),this.eventsManager.hasPendingTypes()&&this.delegateEvents(),this.onUpdate.call(this),this}onCreate(){}onChange(){this.render()}onHydrate(){}onBeforeRecycle(){}onRecycle(){}onBeforeUpdate(){}onUpdate(){}onDestroy(){}static markAsSafeHTML(t){return new je(t)}static extend(t){const s=this;class n extends s{}return Object.assign(n.prototype,typeof t=="function"?t(s.prototype):t),n}static mount(t,s,n){const a=new this(t);return s&&(n?a.toString():s.append(ie(a)),a.hydrate(s)),a}static create(t,...s){typeof t=="function"&&(s=[t],t=["",""]);const n=null,a=[],o=[],r=ge(nt(at(fe(ke(t,s).trim(),s),s,a),s,o),s);return this.extend({source:n,template(){return{elements:a.map(l=>new Je({getSelector:l.getSelector.bind(this),getAttributes:l.getAttributes.bind(this)})),interpolations:o.map(l=>new xe({getStart:l.getStart.bind(this),getEnd:l.getEnd.bind(this),expression:l.expression,shouldSkipFind:$e,shouldSkipSync:st})),parts:r}}})}}f.ATTRIBUTE_ELEMENT="data-rst-el";f.ATTRIBUTE_EVENT=(e,t)=>`data-rst-on-${e}-${t}`;f.DATASET_ELEMENT="rstEl";f.PLACEHOLDER=e=>`__RASTI_PLACEHOLDER_${e}__`;f.MARKER_RECYCLED=e=>`rst-r-${e}`;f.MARKER_START=e=>`rst-s-${e}`;f.MARKER_END=e=>`rst-e-${e}`;var y=f.create`<div></div>`;const Ce=e=>e!==null&&typeof e=="object"&&!Array.isArray(e),rt=!1,lt=e=>e.replace(/([A-Z])/g,t=>`-${t[0].toLowerCase()}`),it=e=>e.reduce((t,s)=>(...n)=>t(s(...n))),ct=["prefix","generateUid","generateClassName","shouldAttachToDOM","attributes","renderers"];class E{constructor(t,s={}){this.styles=t,this.classes={},ct.forEach(a=>{a in s&&(this[a]=s[a])}),this.renderers||(this.renderers=[this.renderStyles,this.parseStyles]),this.prefix||(this.prefix=E.prefix),this.uid=this.generateUid();let n=0;Object.keys(t).forEach(a=>{a.match(E.classRegex)&&(this.classes[a]=this.generateClassName(a,++n))})}generateUid(){const t=JSON.stringify(this.styles);let s=2166136261;for(let n=0;n<t.length;n++)s^=t.charCodeAt(n),s=s*16777619>>>0;return s.toString(36)}generateClassName(t,s){return`${this.prefix[0]}-${this.uid}-${s}`}render(){const t=this.renderers.map(s=>(typeof s=="string"?this[s]:s).bind(this));return it(t)(this.styles)}renderStyles(t,s=1){return Object.keys(t).reduce((n,a)=>{const o=t[a];let r="",l="",d="";if(Ce(o)){if(Object.keys(o).length>0){const p=this.renderStyles(o,s+1);n.push(`${r}${a}${d}{${l}${p}${r}}${l}`)}}else typeof o<"u"&&o!==null&&n.push(`${r}${a}:${d}${o};${l}`);return n},[]).join("")}parseStyles(t,s,n,a){const o=d=>d in this.classes?`.${this.classes[d]}`:d,r=d=>a&&n?`${n} ${d}`:d.match(E.globalPrefixRegex)?`${n?`${n} `:""}${d.replace(E.globalPrefixRegex,"")}`:o(d).replace(E.referenceRegex,(p,$)=>o($)).replace(E.nestedRegex,n);return Object.keys(t).reduce((d,p)=>{const $=t[p];if(Ce($))if(p.match(E.globalRegex))Object.assign(s||d,this.parseStyles($,d,n,!0));else if((p.match(E.nestedRegex)||p.match(E.globalPrefixRegex))&&s){const i=r(p);s[i]={},Object.assign(s[i],this.parseStyles($,s,i))}else{const i=r(p);d[i]={};const u=i.match(/@/)?[]:[d,i];Object.assign(d[i],this.parseStyles($,...u))}else typeof $<"u"&&$!==null&&(d[p.match(/-/)?p:lt(p)]=$);return d},{})}getAttributes(){const t=Object.assign({},this.attributes);return t[`data-${this.prefix}-uid`]=this.uid,t}toString(){const t=this.getAttributes(),s=Object.keys(t).map(a=>` ${a}="${t[a]}"`).join(""),n="";return`<style${s}>${n}${this.render()}</style>${n}`}shouldAttachToDOM(){return typeof document<"u"&&!document.querySelector(`style[data-${this.prefix}-uid="${this.uid}"]`)}attach(){if(E.registry.some(({uid:t})=>t===this.uid)||E.registry.push(this),this.shouldAttachToDOM()){this.el=document.createElement("style");const t=this.getAttributes();Object.keys(t).forEach(s=>{this.el.setAttribute(s,t[s])}),this.el.textContent=this.render(),document.head.appendChild(this.el)}return this}destroy(){const t=E.registry.indexOf(this);return t>-1&&E.registry.splice(t,1),this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null),this}static toString(){return E.registry.join("")}static toCSS(){return E.registry.map(t=>t.render()).join("")}static destroy(){E.registry.slice().forEach(t=>t.destroy())}}E.classRegex=/^\w+$/;E.globalRegex=/^@global$/;E.globalPrefixRegex=/^@global\s+/;E.referenceRegex=/\$(\w+)/g;E.nestedRegex=/&/g;E.prefix="fun";E.indent="    ";E.registry=[];E.debug=rt;const dt=(e,t)=>new E(e,t).attach();function D(e){return arguments.length>1?D(Array.from(arguments)):e?Array.isArray(e)?e.map(t=>D(t)).filter(Boolean).flat().join(" "):typeof e=="object"?D(Object.keys(e).filter(t=>!!e[t])):typeof e=="string"?e:"":""}const pt=(e,t)=>e.reduce((s,n,a)=>(Object.assign(s,t(n,a)),s),{}),oe=e=>`@media (min-width: ${{sm:640,md:768,lg:1024,xl:1280,xxl:1536}[e]}px)`,R=e=>pt(["primary","secondary","neutral","error","warning","success"],e),A=dt,{classes:ht}=A({root:{display:"inline-flex",alignItems:"center",justifyContent:"space-evenly",boxSizing:"border-box",cursor:"pointer",borderRadius:"var(--rui-borderRadius-sm)",padding:"var(--rui-spacing-sm)",maxHeight:"100%",fontFamily:"var(--rui-typography-button-fontFamily)",fontWeight:"var(--rui-typography-button-fontWeight)",fontSize:"var(--rui-typography-button-fontSize)",lineHeight:"var(--rui-typography-button-lineHeight)",textTransform:"var(--rui-typography-button-textTransform)",textDecoration:"var(--rui-typography-button-textDecoration)",transition:["background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)","color 0.15s cubic-bezier(0.4, 0, 0.2, 1)","border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)","box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)","transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)"].join(", "),"&:where([data-disabled])":{cursor:"not-allowed"},"&>svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"&>svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"&>svg:only-child":{padding:"0"},'&:where([data-size="sm"])':{fontSize:"var(--rui-fontSize-xs)"},'&:where([data-size="lg"])':{fontSize:"var(--rui-fontSize-xl)"},'&:where([data-shape="pill"])':{borderRadius:"var(--rui-borderRadius-full)"},'&:where([data-shape="circle"])':{borderRadius:"50%",aspectRatio:"1 / 1",maxHeight:"none",padding:"var(--rui-spacing-xs)",minWidth:"var(--rui-spacing-xxxxl)",minHeight:"var(--rui-spacing-xxxxl)",justifyContent:"center"},'&:where([data-shape="circle"]):where([data-size="sm"])':{padding:"var(--rui-spacing-xxs)",minWidth:"var(--rui-spacing-xxl)",minHeight:"var(--rui-spacing-xxl)"},'&:where([data-shape="circle"]):where([data-size="lg"])':{padding:"var(--rui-spacing-sm)",minWidth:"calc(var(--rui-spacing-xxxxl) + var(--rui-spacing-sm))",minHeight:"calc(var(--rui-spacing-xxxxl) + var(--rui-spacing-sm))"},...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-main)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-dark)`,borderColor:`var(--rui-palette-${e}-dark)`},"&:where(:not([data-disabled])):active":{backgroundColor:`var(--rui-palette-${e}-dark)`,borderColor:`var(--rui-palette-${e}-dark)`,color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,boxShadow:"inset 0 1px 2px rgb(0 0 0 / 0.1)",transform:"translateY(0.5px)"},"&:where([data-disabled])":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,borderColor:`var(--rui-palette-${e}-light)`,boxShadow:"none",transform:"none","&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,borderColor:`var(--rui-palette-${e}-light)`},"&:active":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,borderColor:`var(--rui-palette-${e}-light)`,boxShadow:"none",transform:"none"}}}})),...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"])`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-foregroundMain)`,backgroundColor:"transparent","&:hover":{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-light) / 0.14)`},"&:where(:not([data-disabled])):active":{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.12)`,transform:"translateY(0.5px)"},"&:where([data-disabled])":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,borderColor:`rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`,transform:"none","&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,backgroundColor:"transparent"},"&:active":{transform:"none",backgroundColor:"transparent"}}}})),...R(e=>({[`&:where([data-variant="plain"][data-color="${e}"])`]:{border:"none",background:"transparent",color:`var(--rui-palette-${e}-foregroundMain)`,"&:hover":{color:`var(--rui-palette-${e}-foregroundDark)`,backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.05)`},"&:where(:not([data-disabled])):active":{color:`var(--rui-palette-${e}-foregroundDark)`,backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.07)`,transform:"translateY(0.5px)"},"&:where([data-disabled])":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`,transform:"none","&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`,backgroundColor:"transparent"},"&:active":{backgroundColor:"transparent",transform:"none"}}}})),...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"]):where(:not([data-disabled])):focus-visible`]:{outline:`2px solid rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95)`,outlineOffset:"2px"},[`&:where([data-variant="outlined"][data-color="${e}"]):where(:not([data-disabled])):focus-visible`]:{outline:`2px solid var(--rui-palette-${e}-main)`,outlineOffset:"2px"},[`&:where([data-variant="plain"][data-color="${e}"]):where(:not([data-disabled])):focus-visible`]:{outline:`2px solid var(--rui-palette-${e}-main)`,outlineOffset:"2px"}})),'&:where([data-group]):where(:not([data-shape="circle"])):where(:not([data-shape="pill"])):not(:first-child)':{marginLeft:"-1px",...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{borderLeftColor:`var(--rui-palette-${e}-dark)`}}))},'&:where([data-group]):where(:not([data-shape="circle"])):where(:not([data-shape="pill"])):not(:first-child):not(:last-child)':{borderRadius:"0"},'&:where([data-group]):where(:not([data-shape="circle"])):where(:not([data-shape="pill"])):first-child':{borderTopRightRadius:"0",borderBottomRightRadius:"0"},'&:where([data-group]):where(:not([data-shape="circle"])):where(:not([data-shape="pill"])):last-child':{borderTopLeftRadius:"0",borderBottomLeftRadius:"0"},"&:where([data-current])":{fontWeight:"var(--rui-fontWeight-xl)"},...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"][data-current])`]:{border:`1px solid var(--rui-palette-${e}-main)`,backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.05)`,color:`var(--rui-palette-${e}-foregroundDark)`},[`&:where([data-variant="outlined"][data-color="${e}"][data-current]):hover`]:{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.08)`,border:`1px solid var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-foregroundDark)`},[`&:where([data-variant="plain"][data-color="${e}"][data-current])`]:{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.03)`,color:`var(--rui-palette-${e}-foregroundDark)`},[`&:where([data-variant="plain"][data-color="${e}"][data-current]):hover`]:{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-main) / 0.05)`,color:`var(--rui-palette-${e}-foregroundDark)`},[`&:where([data-variant="solid"][data-color="${e}"][data-current])`]:{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.98)`,backgroundColor:`var(--rui-palette-${e}-dark)`,border:`1px solid var(--rui-palette-${e}-dark)`,boxShadow:"none"},[`&:where([data-variant="solid"][data-color="${e}"][data-current]):hover`]:{color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-dark)`,borderColor:`var(--rui-palette-${e}-dark)`}}))}}),S=y.create`
    <${({props:e})=>e.href?"a":e.type?"input":"button"}
        class="${({props:e})=>D([ht.root,e.className])}"
        data-variant="${({props:e})=>e.variant||"solid"}"
        data-color="${({props:e})=>e.color||"neutral"}"
        data-size="${({props:e})=>e.size||"md"}"
        data-disabled="${({props:e})=>e.disabled||!1}"
        data-group="${({props:e})=>e.group||!1}"
        data-shape="${({props:e})=>e.shape==="circle"||e.shape==="pill"?e.shape:!1}"
        data-current="${({props:e})=>e.current||!1}"
        onClick="${({props:e})=>e.onClick||!1}"
        href="${({props:e})=>e.href||!1}"
        type="${({props:e})=>e.type||!1}"
        value="${({props:e})=>e.type&&e.label||!1}"
        disabled="${({props:e})=>e.disabled||!1}"
        aria-disabled="${({props:e})=>e.disabled||!1}"
        aria-current="${({props:e})=>e.href&&e.current?"page":!1}"
        target="${({props:e})=>e.target||!1}"
        title="${({props:e})=>e.title||!1}"
    >
        ${e=>e.renderChildren()}
    </${({props:e})=>e.href?"a":e.type?"input":"button"}>
`.extend({renderChildren:function(){return this.props.type?null:this.props.renderChildren?this.props.renderChildren():this.partial`
            ${this.props.renderLeftIcon&&this.props.renderLeftIcon()}
            <span data-slot="label">${this.props.label}</span>
            ${this.props.renderRightIcon&&this.props.renderRightIcon()}
        `}});var ut=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
    </svg>
`;const mt=["a[href]","button:not([disabled])",'input:not([disabled]):not([type="hidden"])',"select:not([disabled])","textarea:not([disabled])",'[tabindex]:not([tabindex="-1"])'].join(", "),Ee=e=>e?Array.from(e.querySelectorAll(mt)).filter(t=>{if(!e.contains(t))return!1;const s=window.getComputedStyle(t);return!(s.display==="none"||s.visibility==="hidden")}):[],{classes:G}=A({root:{position:"fixed",top:0,right:0,bottom:0,left:0,display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"rgb(var(--rui-palette-neutral-rgb-level3) / 0.2)",backdropFilter:"blur(5px)",zIndex:"var(--rui-zIndex-dialogBackdrop, 1500)",padding:"var(--rui-spacing-md)","&:where([data-top])":{alignItems:"flex-start"},"&:where([data-bottom])":{alignItems:"flex-end"},"&:where([data-left])":{justifyContent:"flex-start"},"&:where([data-right])":{justifyContent:"flex-end"}},dialog:{position:"relative",display:"flex",flexDirection:"column",maxHeight:"calc(var(--rui-viewport-height) * 0.9)",maxWidth:"calc(var(--rui-viewport-width) * 0.9)",width:"auto",minWidth:"250px",padding:"var(--rui-spacing-sm)",borderRadius:"var(--rui-borderRadius-md)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",fontFamily:"var(--rui-fontFamily-body)",...R(e=>({[`&:where([data-color="${e}"])`]:{color:`var(--rui-palette-${e}-foregroundMain)`}})),...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"])`]:{border:`1px solid rgb(var(--rui-palette-${e}-rgb-level1) / 0.4)`}})),...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{backgroundColor:`var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-contrastMain)`}})),'&:where([data-shadow="xs"])':{boxShadow:"var(--rui-shadow-xs)"},'&:where([data-shadow="sm"])':{boxShadow:"var(--rui-shadow-sm)"},'&:where([data-shadow="md"])':{boxShadow:"var(--rui-shadow-md)"},'&:where([data-shadow="lg"])':{boxShadow:"var(--rui-shadow-lg)"},'&:where([data-shadow="xl"])':{boxShadow:"var(--rui-shadow-xl)"},"&:focus-visible":{outline:"2px solid rgb(var(--rui-palette-neutral-rgb-level2) / 0.75)",outlineOffset:"2px"}},header:{position:"relative",display:"flex",justifyContent:"center",alignItems:"center",minHeight:"var(--rui-spacing-xxxl)","& :where(button)":{position:"absolute",top:0,right:0,margin:0,padding:0,borderRadius:"50%"}},title:{fontSize:"var(--rui-fontSize-md)",fontWeight:"var(--rui-fontWeight-md)",color:"var(--rui-palette-neutral-foregroundMain)",textAlign:"center",padding:0,margin:"var(--rui-spacing-xs)"},content:{flex:1,overflowY:"auto",overflowX:"hidden",padding:"var(--rui-spacing-md)",minHeight:0},footer:{display:"flex",justifyContent:"space-evenly",paddingTop:"var(--rui-spacing-md)",flexShrink:0}}),gt=y.create`
    <div class="${({props:e})=>D([G.header,e.className])}" data-slot="header">
        ${e=>e.renderHeaderContent()}
    </div>
`.extend({renderHeaderContent(){return this.props.renderChildren?this.props.renderChildren():this.partial`
            ${this.props.title?this.partial`<h2 class="${G.title}" data-slot="title" id="${this.props.titleId||null}">${this.props.title}</h2>`:null}
            ${this.props.handleClose&&this.props.closeButton?this.partial`<${S}
                    onClick=${this.props.handleClose}
                    color="neutral"
                    variant="outlined"
                    size="sm"
                >
                    <${ut} />
                </${S}>`:null}
        `}}),ft=y.create`
    <div class="${({props:e})=>D([G.content,e.className])}" data-slot="content">
        ${({props:e})=>e.renderChildren()}
    </div>
`,vt=y.create`
    <div class="${({props:e})=>D([G.footer,e.className])}" data-slot="footer">
        ${({props:e})=>e.renderChildren()}
    </div>
`,F=y.create`
    <div
        class="${({props:e})=>D([G.root,e.className])}"
        data-top="${({props:e})=>e.top||!1}"
        data-bottom="${({props:e})=>e.bottom||!1}"
        data-left="${({props:e})=>e.left||!1}"
        data-right="${({props:e})=>e.right||!1}"
        onClick=${function(e){this.props.handleClose&&e.target===this.el&&this.props.handleClose()}}
    >
        <div
            class="${()=>G.dialog}"
            data-variant="${({props:e})=>e.variant||"outlined"}"
            data-color="${({props:e})=>e.color||"neutral"}"
            data-shadow="${({props:e})=>e.shadow||!1}"
            role="dialog"
            aria-modal="true"
            aria-labelledby="${({props:e})=>e.labelledBy||null}"
            onClick=${function(e){e.stopPropagation()}}
        >
            ${({props:e})=>e.renderChildren()}
        </div>
    </div>
`.extend({onCreate(){this.handleDocumentKeydown=e=>{if(e.key==="Escape"&&this.props.handleClose){this.props.handleClose();return}if(e.key!=="Tab"||!this.dialogEl||!this.dialogEl.contains(document.activeElement))return;const t=Ee(this.dialogEl);if(t.length===0){e.preventDefault();return}if(t.length===1){document.activeElement===t[0]&&e.preventDefault();return}const s=t[0],n=t[t.length-1];e.shiftKey?document.activeElement===s&&(e.preventDefault(),n.focus()):document.activeElement===n&&(e.preventDefault(),s.focus())},this.handleClickOutside=e=>{this.props.handleClose&&!this.el.contains(e.target)&&this.props.handleClose()}},onHydrate(){this.dialogEl=this.$('[role="dialog"]'),this._previousActiveElement=document.activeElement,this._panelTabindexSet=!1;const e=document.body.style.overflow;if(document.body.style.overflow="hidden",this._originalOverflow=e,document.addEventListener("keydown",this.handleDocumentKeydown),this.dialogEl){const t=Ee(this.dialogEl);t.length>0?t[0].focus():(this.dialogEl.setAttribute("tabindex","-1"),this._panelTabindexSet=!0,this.dialogEl.focus())}setTimeout(()=>{document.addEventListener("click",this.handleClickOutside)},0)},onDestroy(){if(this._panelTabindexSet&&this.dialogEl&&this.dialogEl.removeAttribute("tabindex"),this._originalOverflow!==void 0&&(document.body.style.overflow=this._originalOverflow),document.removeEventListener("keydown",this.handleDocumentKeydown),document.removeEventListener("click",this.handleClickOutside),this._previousActiveElement&&typeof this._previousActiveElement.focus=="function")try{this._previousActiveElement.focus()}catch{}}});F.Header=gt;F.Content=ft;F.Footer=vt;var U={},Te;function bt(){if(Te)return U;Te=1,Object.defineProperty(U,"__esModule",{value:!0}),U.PathError=U.TokenData=void 0,U.parse=p,U.compile=$,U.match=h,U.pathToRegexp=w,U.stringify=H;const e="/",t=c=>c,s=/^[$_\p{ID_Start}]$/u,n=/^[$\u200c\u200d\p{ID_Continue}]$/u,a=/^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;function o(c){return c.replace(/[{}()\[\]+?!:*\\]/g,"\\$&")}function r(c){return c.replace(/[.+*?^${}()[\]|/\\]/g,"\\$&")}class l{constructor(m,b){this.tokens=m,this.originalPath=b}}U.TokenData=l;class d extends TypeError{constructor(m,b){let v=m;b&&(v+=`: ${b}`),v+="; visit https://git.new/pathToRegexpError for info",super(v),this.originalPath=b}}U.PathError=d;function p(c,m={}){const{encodePath:b=t}=m,v=[...c];let g=0;function C(j){const k=[];let x="";function M(){x&&(k.push({type:"text",value:b(x)}),x="")}for(;g<v.length;){const T=v[g++];if(T===j)return M(),k;if(T==="\\"){if(g===v.length)throw new d(`Unexpected end after \\ at index ${g}`,c);x+=v[g++];continue}if(T===":"||T==="*"){const N=T===":"?"param":"wildcard";let _="";if(s.test(v[g]))do _+=v[g++];while(n.test(v[g]));else if(v[g]==='"'){let B=g;for(;g<v.length;){if(v[++g]==='"'){g++,B=0;break}v[g]==="\\"&&g++,_+=v[g]}if(B)throw new d(`Unterminated quote at index ${B}`,c)}if(!_)throw new d(`Missing parameter name at index ${g}`,c);M(),k.push({type:N,name:_});continue}if(T==="{"){M(),k.push({type:"group",tokens:C("}")});continue}if(T==="}"||T==="("||T===")"||T==="["||T==="]"||T==="+"||T==="?"||T==="!")throw new d(`Unexpected ${T} at index ${g-1}`,c);x+=T}if(j)throw new d(`Unexpected end at index ${g}, expected ${j}`,c);return M(),k}return new l(C(""),c)}function $(c,m={}){const{encode:b=encodeURIComponent,delimiter:v=e}=m,g=typeof c=="object"?c:p(c,m),C=i(g.tokens,v,b);return function(k={}){const x=[],M=C(k,x);if(x.length)throw new TypeError(`Missing parameters: ${x.join(", ")}`);return M}}function i(c,m,b){const v=c.map(g=>u(g,m,b));return(g,C)=>{let j="";for(const k of v)j+=k(g,C);return j}}function u(c,m,b){if(c.type==="text")return()=>c.value;if(c.type==="group"){const g=i(c.tokens,m,b);return(C,j)=>{const k=j.length,x=g(C,j);return j.length===k?x:(j.length=k,"")}}const v=b||t;return c.type==="wildcard"&&b!==!1?(g,C)=>{const j=g[c.name];if(j==null)return C.push(c.name),"";if(!Array.isArray(j)||j.length===0)throw new TypeError(`Expected "${c.name}" to be a non-empty array`);let k="";for(let x=0;x<j.length;x++){if(typeof j[x]!="string")throw new TypeError(`Expected "${c.name}/${x}" to be a string`);x>0&&(k+=m),k+=v(j[x])}return k}:(g,C)=>{const j=g[c.name];if(j==null)return C.push(c.name),"";if(typeof j!="string")throw new TypeError(`Expected "${c.name}" to be a string`);return v(j)}}function h(c,m={}){const{decode:b=decodeURIComponent,delimiter:v=e}=m,{regexp:g,keys:C}=w(c,m),j=C.map(k=>b===!1?t:k.type==="param"?b:x=>x.split(v).map(b));return function(x){const M=g.exec(x);if(!M)return!1;const T=M[0],N=Object.create(null);for(let _=1;_<M.length;_++){if(M[_]===void 0)continue;const B=C[_-1],Y=j[_-1];N[B.name]=Y(M[_])}return{path:T,params:N}}}function w(c,m={}){const{delimiter:b=e,end:v=!0,sensitive:g=!1,trailing:C=!0}=m,j=[];let k="",x=0;function M(N){if(Array.isArray(N)){for(const B of N)M(B);return}const _=typeof N=="object"?N:p(N,m);L(_.tokens,0,[],B=>{if(x>=256)throw new d("Too many path combinations",_.originalPath);x>0&&(k+="|"),k+=V(B,b,j,_.originalPath),x++})}M(c);let T=`^(?:${k})`;return C&&(T+="(?:"+r(b)+"$)?"),T+=v?"$":"(?="+r(b)+"|$)",{regexp:new RegExp(T,g?"":"i"),keys:j}}function L(c,m,b,v){for(;m<c.length;){const g=c[m++];if(g.type==="group"){const C=b.length;L(g.tokens,0,b,j=>L(c,m,j,v)),b.length=C;continue}b.push(g)}v(b)}function V(c,m,b,v){let g="",C="",j="",k=0,x=0,M=0;function T(_,B){for(;_<c.length;){const Y=c[_++];if(Y.type===B)return!0;if(Y.type==="text"&&Y.value.includes(m))break}return!1}function N(_){let B="";for(;_<c.length;){const Y=c[_++];if(Y.type!=="text")break;B+=Y.value}return B}for(;M<c.length;){const _=c[M++];if(_.type==="text"){g+=r(_.value),C+=_.value,k===2&&(j+=_.value),_.value.includes(m)&&(x=0);continue}if(_.type==="param"||_.type==="wildcard"){if(k&&!C)throw new d(`Missing text before "${_.name}" ${_.type}`,v);_.type==="param"?(g+=x&2?`(${z(m,C)}+)`:T(M,"wildcard")?`(${z(m,N(M))}+)`:x&1?`(${z(m,C)}+|${r(C)})`:`(${z(m,"")}+)`,x|=k=1):(g+=x&2?`(${z(C,"")}+)`:j?`(${z(j,"")}+|${z(m,"")}+)`:"([^]+)",j="",x|=k=2),b.push(_),C="";continue}throw new TypeError(`Unknown token type: ${_.type}`)}return g}function z(c,m){return m.length>c.length?z(m,c):(c===m&&(m=""),m.length>1?`(?:(?!${r(c)}|${r(m)})[^])`:c.length>1?`(?:(?!${r(c)})[^${r(m)}])`:`[^${r(c+m)}]`)}function q(c,m){let b="";for(;m<c.length;){const v=c[m++];if(v.type==="text"){b+=o(v.value);continue}if(v.type==="group"){b+="{"+q(v.tokens,0)+"}";continue}if(v.type==="param"){b+=":"+K(v.name,c[m]);continue}if(v.type==="wildcard"){b+="*"+K(v.name,c[m]);continue}throw new TypeError(`Unknown token type: ${v.type}`)}return b}function H(c){return q(c.tokens,0)}function K(c,m){return!a.test(c)||m?.type==="text"&&n.test(m.value[0])?JSON.stringify(c):c}return U}var Le=bt();function yt(e,t={}){const{baseUrl:s=""}=t,n=i=>{const[u,h]=i.replace(s,"").split("?");return{pathname:u,query:h}},a=(i,u)=>Le.match(u,{decode:decodeURIComponent})(i),o=i=>{const{pathname:u,query:h}=n(i);for(const w of e){const L=a(u,w.path);if(L){const V={path:w.path,params:$(L.params),query:Object.fromEntries(new URLSearchParams(h).entries()),test:z=>!!a(n(z).pathname,w.path)};return()=>w.action(V)}}return null},r=(i,u={})=>{const{addToHistory:h=!0,replaceHistory:w=!1}=u,L=o(i);L?(h&&typeof window<"u"&&window.history[w?"replaceState":"pushState"]({},"",i),L()):console.error("No route matched:",i)},l=(i,u={},h={})=>{const L=Le.compile(i,{encode:encodeURIComponent})(u),V=new URLSearchParams(h).toString();return`${s}${V?`${L}?${V}`:L}`},d=i=>{const u=h=>{if(h.defaultPrevented||h.button!==0||h.metaKey||h.ctrlKey||h.shiftKey||h.altKey)return;const w=h.target.closest("a[data-router]");if(w&&w.href){h.preventDefault();const L=new URL(w.href);window.scrollTo({top:0,behavior:"instant"}),r(L.pathname+L.search)}};return i.addEventListener("click",u),()=>{i.removeEventListener("click",u)}},p=()=>{const i=()=>{r(window.location.pathname+window.location.search,{addToHistory:!1})};return window.addEventListener("popstate",i),()=>{window.removeEventListener("popstate",i)}},$=i=>{const u={};for(const[h,w]of Object.entries(i))u[h]=String(w).replace(/[<>]/g,"");return u};return{navigate:r,createUrl:l,delegateNavigation:d,bindHistory:p}}const jt=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),wt=["h1","h2","h3","h4","titleLg","titleMd","titleSm","bodyLg","bodyMd","bodySm","caption"],{classes:_t}=A({root:{color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-md) 0",...Object.fromEntries(wt.map(e=>[`&:where([data-level="${e}"])`,jt(e)]))}}),Se=({props:e})=>{switch(e.level){case"h1":return"h1";case"h2":return"h2";case"h3":return"h3";case"h4":return"h4";case"titleLg":return"h2";case"titleMd":return"h2";case"titleSm":return"h2";case"caption":return"caption";default:return"p"}},O=y.create`
    <${Se}
        class="${({props:e})=>D([_t.root,e.className])}"
        data-level="${({props:e})=>e.level||"bodyMd"}"
    >
        ${({props:e})=>e.renderChildren&&e.renderChildren()}
    </${Se}>
`;var xt=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"/>
    </svg>
`;const{classes:de}=A({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",minHeight:"var(--rui-viewport-height)"},iconContainer:{display:"flex",justifyContent:"center",alignItems:"center",width:"140px",height:"140px",borderRadius:"50%",backgroundColor:"var(--rui-palette-neutral-main)",marginBottom:"var(--rui-spacing-md)"},icon:{width:"120px",height:"120px",fill:"var(--rui-palette-warning-main)"}}),$t=y.create`
    <div class="${de.root}">
        <div class="${de.iconContainer}">
            <${xt} className=${de.icon} />
        </div>
        <${O} level="h1">
            404
        </${O}>
        <${O} level="h3">
            Page Not Found
        </${O}>
        <${O} level="bodyMd">
            The page you are looking for does not exist.
        </${O}>
    </div>
`,{classes:Me}=A({"@global":{html:{scrollBehavior:"smooth"},body:{margin:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel1)",fontFamily:"var(--rui-fontFamily-body)"},"a.anchor, h2":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-xs))"}},root:{},appBarMenuDialog:{},[oe("sm")]:{$appBarMenuDialog:{display:"none"}}}),kt=e=>{const{title:t,AppBar:s,AppBarMenuContent:n,Cover:a,Description:o,Features:r,Readme:l,Api:d,Footer:p}=e;return y.create`
        <div class="${Me.root}">
            <${s} 
                location="${({state:i})=>i.location}"
                onMenuClick="${({state:i})=>()=>{i.menuOpen=!0}}"
            />

            ${({state:i,partial:u})=>i.menuOpen&&n?u`<${F}
                    className="${Me.appBarMenuDialog}"
                    handleClose=${()=>{i.menuOpen=!1}}
                    shadow="lg"
                >
                    <${F.Header}
                        handleClose=${()=>{i.menuOpen=!1}}
                        closeButton=${!0}
                    />
                    <${F.Content}
                        renderChildren=${()=>n.mount({handleOpen:h=>{i.menuOpen=h},location:i.location})}
                    />
                </${F}>`:null}

            ${({state:i,partial:u})=>i.location.params.notFound?u`<${$t} />`:i.location.test("/api/")?u`<${d} />`:u`
                        <${a} />
                        ${o?u`<${o} />`:null}
                        <${r} />
                        <${l} />
                    `}

            <${p} />
        </div>
    `.extend({onCreate(i={}){this.state=new le({location:null,menuOpen:!1});const u=[{path:"/api/",action:h=>this.updateRoute(h)},{path:"/",action:h=>this.updateRoute(h)},{path:"*notFound",action:h=>this.updateRoute(h)}];this.router=yt(u),typeof window<"u"?(this.router.delegateNavigation(document.body),this.router.bindHistory(),this.router.navigate(i.url||window.location.pathname+window.location.search,{addToHistory:!1,replaceHistory:!0})):this.router.navigate(i.url,{addToHistory:!1})},updateRoute(i){this.state.location=i,typeof document<"u"&&(document.title=this.getTitle())},getTitle(){const i=this.state.location.params.notFound?" - Not Found":this.state.location.test("/api/")?" - API Documentation":this.state.location.test("/")?" - Home":"";return`${t}${i}`}})},{classes:Q}=A({section:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-sm)"},left:{flex:"0 0 auto",justifyContent:"flex-start"},center:{flex:"1 1 auto",justifyContent:"center"},right:{flex:"0 0 auto",justifyContent:"flex-end"}}),Ct=y.create`
    <div class="${({props:e})=>D([Q.section,Q.left,e.className])}" data-slot="left">
        ${({props:e})=>e.renderChildren()}
    </div>
`,Et=y.create`
    <div class="${({props:e})=>D([Q.section,Q.center,e.className])}" data-slot="center">
        ${({props:e})=>e.renderChildren()}
    </div>
`,Tt=y.create`
    <div class="${({props:e})=>D([Q.section,Q.right,e.className])}" data-slot="right">
        ${({props:e})=>e.renderChildren()}
    </div>
`,{classes:Lt}=A({root:{position:"sticky",top:0,zIndex:"var(--rui-zIndex-appBar, 1000)",display:"flex",alignItems:"center",minHeight:"56px",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",gap:"var(--rui-spacing-md)",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundSoftLevel3) / 0.5)",transition:"background-color 0.2s ease, border-color 0.2s ease",backgroundColor:"var(--rui-palette-neutral-backgroundLevel1)",...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"])`]:{borderBottomColor:`var(--rui-palette-${e}-foregroundSoftLevel3)`}})),...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{backgroundColor:`var(--rui-palette-${e}-main)`,borderBottomColor:`var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-contrastMain)`},[`&:where([data-variant="solid"][data-color="${e}"]) *`]:{color:`var(--rui-palette-${e}-contrastMain)`}}))}}),W=y.create`
    <header
        class="${({props:e})=>D([Lt.root,e.className])}"
        data-variant="${({props:e})=>e.variant||"outlined"}"
        data-color="${({props:e})=>e.color||"neutral"}"
        aria-label="${({props:e})=>e.ariaLabel||null}"
    >
        ${({props:e})=>e.renderChildren()}
    </header>
`;W.Left=Ct;W.Center=Et;W.Right=Tt;var St=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
    </svg>
`,Mt=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
    </svg>
`,At=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
    </svg>
`;const{classes:ee}=A({root:{display:"flex",justifyContent:"right",alignItems:"center",height:"60px","& ul":{padding:0}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),Rt=y.create`
    <div class="${ee.root}">
        <ul>
            <li class="${ee.hiddenIfDark}">
                <${S}
                    variant="plain"
                    shape="circle"
                    onClick=${()=>document.documentElement.setAttribute("data-color-scheme","dark")}
                >
                    <${At} className=${ee.icon} />
                </${S}>
            </li>
            <li class="${ee.hiddenIfLight}">
                <${S}
                    variant="plain"
                    shape="circle"
                    onClick=${()=>document.documentElement.setAttribute("data-color-scheme","light")}
                >
                    <${Mt} className=${ee.icon} />
                </${S}>
            </li>
        </ul>
    </div>
`,ve=y.create`
    <svg class="${({props:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
    </svg>
`,Ae=y.create`
    <svg class="${({props:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 32 32">
        <path d="M 0 10 L 0 21 L 9 21 L 9 23 L 16 23 L 16 21 L 32 21 L 32 10 L 0 10 z M 1.7773438 11.777344 L 8.8886719 11.777344 L 8.890625 11.777344 L 8.890625 19.445312 L 7.1113281 19.445312 L 7.1113281 13.556641 L 5.3339844 13.556641 L 5.3339844 19.445312 L 1.7773438 19.445312 L 1.7773438 11.777344 z M 10.667969 11.777344 L 17.777344 11.777344 L 17.779297 11.777344 L 17.779297 19.443359 L 14.222656 19.443359 L 14.222656 21.222656 L 10.667969 21.222656 L 10.667969 11.777344 z M 19.556641 11.777344 L 30.222656 11.777344 L 30.224609 11.777344 L 30.224609 19.445312 L 28.445312 19.445312 L 28.445312 13.556641 L 26.667969 13.556641 L 26.667969 19.445312 L 24.890625 19.445312 L 24.890625 13.556641 L 23.111328 13.556641 L 23.111328 19.445312 L 19.556641 19.445312 L 19.556641 11.777344 z M 14.222656 13.556641 L 14.222656 17.667969 L 16 17.667969 L 16 13.556641 L 14.222656 13.556641 z"></path>
    </svg>
`,{classes:P}=A({root:{boxSizing:"border-box",height:"var(--rui-app-appBarHeight)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",position:"fixed",top:0,left:0,right:0,zIndex:1e3},leftContent:{display:"flex",alignItems:"center"},rightContent:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-sm)"},navLinks:{display:"none","& ul":{display:"flex",justifyContent:"center",alignItems:"center",listStyle:"none",padding:0,margin:0,gap:"var(--rui-spacing-sm)","& li":{margin:0}}},menuButton:{display:"block"},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-neutral-main)","a:hover &":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"},logoInactive:{opacity:.5},menuContent:{"& nav":{maxWidth:"100%",display:"flex",justifyContent:"center",alignItems:"center","& ul":{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"var(--rui-spacing-md)"}}}},[oe("sm")]:{$navLinks:{display:"block"},$menuButton:{display:"none"}}}),Ot=e=>{const{logoAlt:t,playgroundUrl:s,githubUrl:n,npmUrl:a}=e,o=y.create`
        <div class="${P.menuContent}">
            <nav><ul>
                ${({props:l,partial:d})=>d`
                    <li>
                        <${S}
                            href="/api/"
                            onClick=${()=>l.handleOpen(!1)}
                            attributes=${{"data-router":!0}}
                            label="API"
                            variant="plain"
                            size="lg"
                            current="${({props:p})=>!p.location.params.notFound&&p.location.test("/api/")}"
                        />
                    </li>
                    <li>
                        <${S}
                            href="${s}"
                            onClick=${()=>l.handleOpen(!1)}
                            target="_blank"
                            label="Playground"
                            variant="plain"
                            size="lg"
                        />
                    </li>
                    <li>
                        <${S}
                            href="${n}"
                            onClick=${()=>l.handleOpen(!1)}
                            target="_blank"
                            label="GitHub"
                            variant="plain"
                            size="lg"
                            renderLeftIcon=${()=>ve.mount({className:P.icon})}
                        />
                    </li>
                    <li>
                        <${S}
                            href="${a}"
                            onClick=${()=>l.handleOpen(!1)}
                            target="_blank"
                            label="npm"
                            variant="plain"
                            size="lg"
                            renderLeftIcon=${()=>Ae.mount({className:P.icon})}
                        />
                    </li>
                `}
            </ul></nav>
        </div>
    `;return{AppBar:y.create`
        <${W} className="${P.root}">
            <${W.Left}>
                <div class="${P.leftContent}">
                    <a href="/" class="${({props:l})=>l.location.params.notFound||!l.location.test("/")?P.logoInactive:""}" aria-current="${({props:l})=>l.location.test("/")?"page":null}" data-router>
                        <img height="24" class="${P.hiddenIfLight}" alt="${t}" src="/logo-dark.svg">
                        <img height="24" class="${P.hiddenIfDark}" alt="${t}" src="/logo.svg">
                    </a>
                </div>
            </${W.Left}>
            <${W.Center}>
            </${W.Center}>
            <${W.Right}>
                <div class="${P.rightContent}">
                    <nav class="${P.navLinks}">
                        <ul>
                            <li>
                                <${S}
                                    href="/api/"
                                    attributes=${{"data-router":!0}}
                                    label="API"
                                    variant="plain"
                                    current="${({props:l})=>!l.location.params.notFound&&l.location.test("/api/")}"
                                />
                            </li>
                            <li>
                                <${S}
                                    href="${s}"
                                    target="_blank"
                                    label="Playground"
                                    variant="plain"
                                />
                            </li>
                            <li>
                                <${S}
                                    href="${n}"
                                    target="_blank"
                                    variant="plain"
                                    shape="circle"
                                    renderChildren=${()=>ve.mount({className:P.icon})}
                                />
                            </li>
                            <li>
                                <${S}
                                    href="${a}"
                                    target="_blank"
                                    variant="plain"
                                    shape="circle"
                                    renderChildren=${()=>Ae.mount({className:P.icon})}
                                />
                            </li>
                        </ul>
                    </nav>
                    <${Rt} />
                    <div class="${P.menuButton}">
                        <${S}
                            variant="plain"
                            size="lg"
                            onClick="${({props:l})=>l.onMenuClick}"
                        >
                            <${St} className=${P.icon} />
                        </${S}>
                    </div>
                </div>
            </${W.Right}>
        </${W}>
    `,AppBarMenuContent:o}},{classes:pe}=A({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-xl) 0 var(--rui-spacing-xxxxl) 0",borderTop:"1px solid rgb(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)","@global":{a:{color:"var(--rui-palette-neutral-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-neutral-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-neutral-dark)"}}}},text:{color:"var(--rui-palette-neutral-foregroundLevel3)"}}),Dt=e=>{const{licenseUrl:t,startYear:s}=e,n=()=>{const o=new Date().getFullYear();return o===s?o:`${s}-${o}`};return y.create`
        <footer class="${pe.root}">
            <${O} level="titleMd" className="${pe.text}">
                Released under the <a href="${t}" target="_blank">MIT License</a>
            </${O}>
            <${O} level="titleSm" className="${pe.text}">
                Copyright © ${n} by <a href="https://github.com/8tentaculos/" target="_blank">8tentaculos</a>
            </${O}>
        </footer>
    `},{classes:te}=A({root:{display:"flex",justifyContent:"center",alignItems:"center",height:"var(--rui-viewport-height)",flexDirection:"column",backgroundColor:"var(--rui-palette-neutral-backgroundLevel3)",boxShadow:"var(--rui-shadow-xs)",padding:"0 var(--rui-spacing-xl)",overflow:"hidden","@global":{h1:{textAlign:"center",margin:"var(--rui-app-appBarHeight) 0 0 0"},h2:{color:"var(--rui-palette-neutral-foregroundLevel2)",marginTop:0,marginBottom:"var(--rui-spacing-sm)"},h4:{color:"var(--rui-palette-neutral-foregroundLevel3)",marginBottom:"var(--rui-spacing-md)"},"h1 img":{width:"90%"},pre:{maxWidth:"100%"},code:{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-xs)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"}}},buttons:{"& a":{margin:"var(--rui-spacing-md) var(--rui-spacing-xs)"},display:"flex",justifyContent:"center"},[oe("sm")]:{"$root h1":{margin:"var(--rui-app-appBarHeight) 0 0 0"},"$root h2":{marginBottom:"var(--rui-spacing-xl)"},"$root h4":{marginBottom:"var(--rui-spacing-xxl)"},"$root h1 img":{width:"75%"},"$buttons a":{margin:"var(--rui-spacing-xxxl) var(--rui-spacing-lg)"}},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-secondary-main)"},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),Ht=e=>{const{logoAlt:t,tagline:s,renderSubtitle:n,CoverCodeExample:a,githubUrl:o}=e;return y.create`
        <section class="${te.root}">
            <h1>
                <img class="${te.hiddenIfLight}" alt="${t}" src="/logo-dark.svg">
                <img class="${te.hiddenIfDark}" alt="${t}" src="/logo.svg">
            </h1>

            <${O} level="h2">${s}</${O}>

            ${({partial:l})=>n?l`<${O} level="h4">${n}</${O}>`:null}

            <${a} />

            <div class="${te.buttons}">
                <${S} 
                    label="Get Started"
                    color="primary"
                    variant="outlined"
                    href="#gettingstarted"
                />
                <${S} 
                    label="GitHub"
                    color="secondary"
                    variant="outlined"
                    href="${o}"
                    target="_blank"
                    renderLeftIcon=${()=>ve.mount({className:te.icon})}
                />
            </div>
        </section>
    `},It=y.create`
    <pre><code class="javascript language-javascript"><span class="hljs-keyword">const</span> model = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Model</span>(\{ count : <span class="hljs-number">0</span> \});

<span class="hljs-keyword">const</span> <span class="hljs-title class_">Counter</span> = <span class="hljs-title class_">Component</span>.<span class="hljs-property">create</span><span class="hljs-string">\`
    &lt;div&gt;
        &lt;div&gt;Counter: <span class="hljs-subst">\$\{() =&gt; model.count\}</span>&lt;/div&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{() =&gt; model.count++\}</span>&gt;Increment&lt;/button&gt;
        &lt;button onClick=<span class="hljs-subst">\$\{() =&gt; model.count--\}</span>&gt;Decrement&lt;/button&gt;
    &lt;/div&gt;
\`</span>;

<span class="hljs-title class_">Counter</span>.<span class="hljs-title function_">mount</span>(\{ model \}, <span class="hljs-variable language_">document</span>.<span class="hljs-property">body</span>);</code></pre>
`,zt=Ht({logoAlt:"Rasti.js",tagline:"Modern MVC for building user interfaces",CoverCodeExample:It,githubUrl:"https://github.com/8tentaculos/rasti"}),{classes:Bt}=A({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)"}}),Pt=y.create`
    <div class="${Bt.root}">
        <${O} level="h3">
            <strong>Rasti</strong> is a lightweight MVC library for building fast, reactive user interfaces.
        </${O}>
        <${O} level="h4">
            It provides declarative, composable <strong>components</strong> for building state-driven UIs.<br>
            Its low-level MVC core, inspired by <strong>Backbone.js</strong>’s architecture, provides <strong>models</strong>, <strong>views</strong> and <strong>event emitters</strong> as the fundamental building blocks.
        </${O}>
    </div>
`,{classes:Nt}=A({root:{borderRadius:"var(--rui-borderRadius-md)",padding:"var(--rui-spacing-md)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",fontFamily:"var(--rui-fontFamily-body)",fontSize:"var(--rui-fontSize-bodyMd)",...R(e=>({[`&:where([data-color="${e}"])`]:{color:`var(--rui-palette-${e}-foregroundMain)`}})),...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"])`]:{border:`1px solid rgb(var(--rui-palette-${e}-rgb-level1) / 0.4)`}})),...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{backgroundColor:`var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-contrastMain)`}})),'&:where([data-shadow="xs"])':{boxShadow:"var(--rui-shadow-xs)"},'&:where([data-shadow="sm"])':{boxShadow:"var(--rui-shadow-sm)"},'&:where([data-shadow="md"])':{boxShadow:"var(--rui-shadow-md)"},'&:where([data-shadow="lg"])':{boxShadow:"var(--rui-shadow-lg)"},'&:where([data-shadow="xl"])':{boxShadow:"var(--rui-shadow-xl)"},...R(e=>({[`&:where([data-interactive="true"][data-variant="solid"][data-color="${e}"]):focus-visible`]:{outline:`2px solid rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95)`,outlineOffset:"2px"},[`&:where([data-interactive="true"][data-variant="outlined"][data-color="${e}"]):focus-visible`]:{outline:`2px solid var(--rui-palette-${e}-main)`,outlineOffset:"2px"},[`&:where([data-interactive="true"][data-variant="plain"][data-color="${e}"]):focus-visible`]:{outline:`2px solid var(--rui-palette-${e}-main)`,outlineOffset:"2px"}}))}}),I=y.create`
    <${({props:e})=>e.tag||"div"}
        class="${({props:e})=>D([Nt.root,e.className])}"
        data-variant="${({props:e})=>e.variant||"outlined"}"
        data-color="${({props:e})=>e.color||"neutral"}"
        data-shadow="${({props:e})=>e.shadow||!1}"
        data-interactive="${({props:e})=>e.interactive||!1}"
        tabindex="${({props:e})=>{if(!e.interactive)return null;const t=String(e.tag||"div").toLowerCase();return["button","a","input","select","textarea"].includes(t)?null:"0"}}"
        onClick="${({props:e})=>e.onClick}"
    >
        ${({props:e})=>e.renderChildren&&e.renderChildren()}
    </${({props:e})=>e.tag||"div"}>
`,Re=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Ut}=A({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-xs)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Re("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Re("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},display:"grid",gridTemplateColumns:"auto",gap:"var(--rui-spacing-xl)","& section":{"& h5":{margin:"var(--rui-spacing-xs) 0",padding:"0"}}},[oe("sm")]:{$root:{gridTemplateColumns:"repeat(2, 1fr)"}}}),Ft=e=>[e.className||null,Ut.root].join(" "),Wt=y.create`
            <section class="${({props:e})=>Ft(e)}"><${I} tag="section" shadow="xs"><h5 id="declarativecomponents">Declarative Components 🌟</h5>
<p>Build dynamic UI components using intuitive template literals.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="eventdelegation">Event Delegation 🎯</h5>
<p>Simplify event handling with built-in delegation.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="modelviewbinding">Model-View Binding 🔗</h5>
<p>Keep your UI and data in sync with ease.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="serversiderendering">Server-Side Rendering 🌐</h5>
<p>Render as plain text for server-side use or static builds.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="lightweightandfast">Lightweight and Fast ⚡</h5>
<p>Minimal overhead with efficient rendering.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="legacycompatibility">Legacy Compatibility 🕰️</h5>
<p>Seamlessly integrates into existing <strong>Backbone.js</strong> legacy projects.  </p></${I}><${I} tag="section" shadow="xs"><h5 id="standardsbased">Standards-Based 📐</h5>
<p>Built on modern web standards, no tooling required.  </p></${I}></section>
        `,Oe=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Vt}=A({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-xs)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Oe("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Oe("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}}}}),qt=e=>[e.className||null,Vt.root].join(" "),Kt=y.create`
            <section class="${({props:e})=>qt(e)}"><h2 id="gettingstarted">Getting Started</h2>
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
        `;var Yt=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
    </svg>
`;const{classes:he}=A({header:{display:"flex",alignItems:"center",gap:"var(--rui-spacing-xs)",marginBottom:"var(--rui-spacing-sm)",flexShrink:0,...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{"& button":{opacity:1,color:`var(--rui-palette-${e}-contrastMain) !important`}}}))},collapseButton:{width:"32px",height:"32px",padding:0,opacity:.4,transition:"transform 0.2s ease, opacity 0.2s ease"},collapseButtonRotated:{transform:"rotate(180deg)"}}),Jt=y.create`
    <div
        class="${()=>he.header}"
        data-slot="header"
        data-variant="${({props:e})=>e.variant||"outlined"}"
        data-color="${({props:e})=>e.color||"neutral"}"
    >
        <${S}
            variant="outlined"
            color="${({props:e})=>e.color||"neutral"}"
            size="sm"
            title="${({props:e})=>e.collapseButtonTitle||"Toggle sidebar"}"
            className="${({props:e})=>D([he.collapseButton,e.collapsed&&he.collapseButtonRotated])}"
            onClick="${({props:e})=>e.handleToggle}"
        >
            <${Yt} />
        </${S}>
    </div>
`,{classes:We}=A({root:{position:"sticky",top:0,alignSelf:"flex-start",height:"100%",maxHeight:"var(--rui-viewport-height)",display:"flex",flexDirection:"column",maxWidth:"280px",borderRight:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundSoftLevel3) / 0.5)",transition:"max-width 0.2s ease, padding 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",padding:"var(--rui-spacing-lg)","&:where([data-collapsed])":{maxWidth:"32px",overflow:"hidden"},...R(e=>({[`&:where([data-variant="outlined"][data-color="${e}"])`]:{borderRightColor:`var(--rui-palette-${e}-foregroundSoftLevel3)`}})),...R(e=>({[`&:where([data-variant="solid"][data-color="${e}"])`]:{backgroundColor:`var(--rui-palette-${e}-main)`,borderRightColor:`var(--rui-palette-${e}-main)`},[`&:where([data-variant="solid"][data-color="${e}"]) > [data-slot="content"]`]:{color:`var(--rui-palette-${e}-contrastMain)`},[`&:where([data-variant="solid"][data-color="${e}"]) > [data-slot="content"] button`]:{color:`var(--rui-palette-${e}-contrastMain)`},[`&:where([data-variant="solid"][data-color="${e}"]) > [data-slot="content"] h3`]:{color:`var(--rui-palette-${e}-contrastMain)`}}))},content:{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",opacity:1,transition:"opacity 0.2s ease, color 0.2s ease","&:where([data-collapsed])":{opacity:0,visibility:"hidden"}}}),Xt=y.create`
    <div
        class="${({props:e})=>D([We.content,e.className])}"
        data-slot="content"
        data-collapsed="${({props:e})=>e.collapsed||!1}"
    >
        ${({props:e})=>e.renderChildren()}
    </div>
`,X=y.create`
    <aside
        class="${({props:e})=>D([We.root,e.className])}"
        data-variant="${({props:e})=>e.variant||"outlined"}"
        data-color="${({props:e})=>e.color||"neutral"}"
        data-collapsed="${({props:e})=>e.collapsed||!1}"
        aria-expanded="${({props:e})=>!e.collapsed}"
        aria-label="${({props:e})=>e.ariaLabel||null}"
    >
        ${({props:e})=>e.renderChildren()}
    </aside>
`;X.Header=Jt;X.Content=Xt;var Zt=y.create`
    <svg class="${({props:e})=>e.className||""}" width="${({props:e})=>e.width||"24"}" height="${({props:e})=>e.height||"24"}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
    </svg>
`;const{classes:se}=A({root:{display:"flex",flexDirection:"column",marginTop:"var(--rui-app-appBarHeight)",minHeight:"calc(var(--rui-viewport-height) - var(--rui-app-appBarHeight))","@global a.anchor":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) * 2 + var(--rui-spacing-xs) * 6)"},"@global h2":{scrollMarginTop:"calc(var(--rui-app-appBarHeight) * 2 + var(--rui-spacing-xs) * 6)"}},aside:{display:"none",top:"var(--rui-app-appBarHeight)",maxHeight:"calc(var(--rui-viewport-height) - var(--rui-app-appBarHeight))","@global > *:last-child":{paddingBottom:"var(--rui-spacing-md)"}},content:{flex:1,minWidth:0,width:"100%",paddingTop:"var(--rui-app-appBarHeight)"},secondaryHeader:{position:"fixed",top:"calc(var(--rui-app-appBarHeight) + var(--rui-spacing-lg))",left:"var(--rui-spacing-md)",right:"var(--rui-spacing-md)",display:"flex",alignItems:"center",justifyContent:"flex-start",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)"},apiIndexDialog:{},[oe("sm")]:{$root:{flexDirection:"row","@global a.anchor":{scrollMarginTop:"var(--rui-app-appBarHeight)"},"@global h2":{scrollMarginTop:"var(--rui-app-appBarHeight)"}},$aside:{display:"flex"},$content:{flex:1,minWidth:0,paddingTop:0,paddingLeft:"var(--rui-spacing-xl)",paddingRight:"var(--rui-spacing-xl)"},$secondaryHeader:{display:"none"},$apiIndexDialog:{display:"none"}}}),Gt=e=>{const{ApiIndex:t,Api:s}=e;return y.create`
        <div class="${se.root}">
            <${X} 
                className="${se.aside}"
                collapsed="${({state:a})=>a.collapsed}"
            >
                <${X.Header}
                    collapsed="${({state:a})=>a.collapsed}"
                    handleToggle="${({state:a})=>()=>{a.collapsed=!a.collapsed}}"
                />
                <${X.Content} collapsed="${({state:a})=>a.collapsed}">
                    <${t} />
                </${X.Content}>
            </${X}>
            <${I}
                className="${se.secondaryHeader}"
                color="neutral"
            >
                <${S}
                    label="API Index"
                    variant="plain"
                    color="neutral"
                    renderLeftIcon=${()=>Zt.mount()}
                    onClick="${({state:a})=>()=>{a.dialogOpen=!0}}"
                />
            </${I}>
            ${({state:a,partial:o})=>a.dialogOpen?o`<${F}
                    className="${se.apiIndexDialog}"
                    handleClose="${({state:r})=>()=>{r.dialogOpen=!1}}"
                    shadow="lg"
                >
                    <${F.Header}
                        title="API Index"
                        handleClose="${({state:r})=>()=>{r.dialogOpen=!1}}"
                        closeButton=${!0}
                    />
                    <${F.Content}>
                        <${t} events="${({state:r})=>({"click a":()=>{r.dialogOpen=!1}})}" />
                    </${F.Content}>
                </${F}>`:null}
            <div class="${se.content}">
                <${s} />
            </div>
        </div>
    `.extend({onCreate(){this.state=new le({collapsed:!1,dialogOpen:!1})}})},{classes:Qt}=A({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-sm)",lineHeight:"var(--rui-lineHeight-sm)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-sm) 0",padding:"0",borderBottom:"none"},ul:{listStyle:"none",padding:"0",margin:"0"},li:{margin:"var(--rui-spacing-xs) 0",padding:"0"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},code:{fontSize:"var(--rui-fontSize-sm)"}},"& > ul > li":{fontSize:"var(--rui-fontSize-md)",fontWeight:"var(--rui-fontWeight-md)"},"& ul ul":{paddingLeft:"var(--rui-spacing-lg)",marginTop:"var(--rui-spacing-xs)",fontSize:"var(--rui-fontSize-sm)",fontWeight:"var(--rui-fontWeight-sm)"}}}),es=e=>[e.className||null,Qt.root].join(" "),ts=y.create`
            <nav class="${({props:e})=>es(e)}"><h2 id="modules">Modules</h2>
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
        `,De=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:ss}=A({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-xs)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...De("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...De("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},margin:0,width:"100%",boxSizing:"border-box"}}),as=e=>[e.className||null,ss.root].join(" "),ns=y.create`
            <section class="${({props:e})=>as(e)}"><p><a name="module_component" id="module_component" class="anchor"></a></p>
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
        `,os=Gt({ApiIndex:ts,Api:ns}),{AppBar:rs,AppBarMenuContent:ls}=Ot({logoAlt:"Rasti.js",playgroundUrl:"https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010",githubUrl:"https://github.com/8tentaculos/rasti",npmUrl:"https://www.npmjs.com/package/rasti"}),is=kt({title:"Rasti.js",AppBar:rs,AppBarMenuContent:ls,Cover:zt,Description:Pt,Features:Wt,Readme:Kt,Api:os,Footer:Dt({licenseUrl:"https://github.com/8tentaculos/rasti/blob/master/LICENSE",startYear:2018})});is.mount(window.__APP_OPTIONS__,document.getElementById("root"),!0);
