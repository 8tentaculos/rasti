(()=>{var e={416:e=>{function t(e){return e instanceof Map?e.clear=e.delete=e.set=function(){throw new Error("map is read-only")}:e instanceof Set&&(e.add=e.clear=e.delete=function(){throw new Error("set is read-only")}),Object.freeze(e),Object.getOwnPropertyNames(e).forEach((n=>{const o=e[n],i=typeof o;"object"!==i&&"function"!==i||Object.isFrozen(o)||t(o)})),e}class n{constructor(e){void 0===e.data&&(e.data={}),this.data=e.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}}function o(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function i(e,...t){const n=Object.create(null);for(const t in e)n[t]=e[t];return t.forEach((function(e){for(const t in e)n[t]=e[t]})),n}const r=e=>!!e.scope;class a{constructor(e,t){this.buffer="",this.classPrefix=t.classPrefix,e.walk(this)}addText(e){this.buffer+=o(e)}openNode(e){if(!r(e))return;const t=((e,{prefix:t})=>{if(e.startsWith("language:"))return e.replace("language:","language-");if(e.includes(".")){const n=e.split(".");return[`${t}${n.shift()}`,...n.map(((e,t)=>`${e}${"_".repeat(t+1)}`))].join(" ")}return`${t}${e}`})(e.scope,{prefix:this.classPrefix});this.span(t)}closeNode(e){r(e)&&(this.buffer+="</span>")}value(){return this.buffer}span(e){this.buffer+=`<span class="${e}">`}}const s=(e={})=>{const t={children:[]};return Object.assign(t,e),t};class d{constructor(){this.rootNode=s(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(e){this.top.children.push(e)}openNode(e){const t=s({scope:e});this.add(t),this.stack.push(t)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(e){return this.constructor._walk(e,this.rootNode)}static _walk(e,t){return"string"==typeof t?e.addText(t):t.children&&(e.openNode(t),t.children.forEach((t=>this._walk(e,t))),e.closeNode(t)),e}static _collapse(e){"string"!=typeof e&&e.children&&(e.children.every((e=>"string"==typeof e))?e.children=[e.children.join("")]:e.children.forEach((e=>{d._collapse(e)})))}}class l extends d{constructor(e){super(),this.options=e}addText(e){""!==e&&this.add(e)}startScope(e){this.openNode(e)}endScope(){this.closeNode()}__addSublanguage(e,t){const n=e.root;t&&(n.scope=`language:${t}`),this.add(n)}toHTML(){return new a(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}}function c(e){return e?"string"==typeof e?e:e.source:null}function h(e){return g("(?=",e,")")}function u(e){return g("(?:",e,")*")}function p(e){return g("(?:",e,")?")}function g(...e){return e.map((e=>c(e))).join("")}function m(...e){const t=function(e){const t=e[e.length-1];return"object"==typeof t&&t.constructor===Object?(e.splice(e.length-1,1),t):{}}(e);return"("+(t.capture?"":"?:")+e.map((e=>c(e))).join("|")+")"}function f(e){return new RegExp(e.toString()+"|").exec("").length-1}const b=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function v(e,{joinWith:t}){let n=0;return e.map((e=>{n+=1;const t=n;let o=c(e),i="";for(;o.length>0;){const e=b.exec(o);if(!e){i+=o;break}i+=o.substring(0,e.index),o=o.substring(e.index+e[0].length),"\\"===e[0][0]&&e[1]?i+="\\"+String(Number(e[1])+t):(i+=e[0],"("===e[0]&&n++)}return i})).map((e=>`(${e})`)).join(t)}const y="[a-zA-Z]\\w*",w="[a-zA-Z_]\\w*",_="\\b\\d+(\\.\\d+)?",x="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",$="\\b(0b[01]+)",E={begin:"\\\\[\\s\\S]",relevance:0},C={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[E]},k={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[E]},S=function(e,t,n={}){const o=i({scope:"comment",begin:e,end:t,contains:[]},n);o.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});const r=m("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return o.contains.push({begin:g(/[ ]+/,"(",r,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),o},R=S("//","$"),L=S("/\\*","\\*/"),j=S("#","$"),T={scope:"number",begin:_,relevance:0},M={scope:"number",begin:x,relevance:0},A={scope:"number",begin:$,relevance:0},N={scope:"regexp",begin:/\/(?=[^/\n]*\/)/,end:/\/[gimuy]*/,contains:[E,{begin:/\[/,end:/\]/,relevance:0,contains:[E]}]},O={scope:"title",begin:y,relevance:0},I={scope:"title",begin:w,relevance:0},D={begin:"\\.\\s*"+w,relevance:0};var z=Object.freeze({__proto__:null,APOS_STRING_MODE:C,BACKSLASH_ESCAPE:E,BINARY_NUMBER_MODE:A,BINARY_NUMBER_RE:$,COMMENT:S,C_BLOCK_COMMENT_MODE:L,C_LINE_COMMENT_MODE:R,C_NUMBER_MODE:M,C_NUMBER_RE:x,END_SAME_AS_BEGIN:function(e){return Object.assign(e,{"on:begin":(e,t)=>{t.data._beginMatch=e[1]},"on:end":(e,t)=>{t.data._beginMatch!==e[1]&&t.ignoreMatch()}})},HASH_COMMENT_MODE:j,IDENT_RE:y,MATCH_NOTHING_RE:/\b\B/,METHOD_GUARD:D,NUMBER_MODE:T,NUMBER_RE:_,PHRASAL_WORDS_MODE:{begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},QUOTE_STRING_MODE:k,REGEXP_MODE:N,RE_STARTERS_RE:"!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",SHEBANG:(e={})=>{const t=/^#![ ]*\//;return e.binary&&(e.begin=g(t,/.*\b/,e.binary,/\b.*/)),i({scope:"meta",begin:t,end:/$/,relevance:0,"on:begin":(e,t)=>{0!==e.index&&t.ignoreMatch()}},e)},TITLE_MODE:O,UNDERSCORE_IDENT_RE:w,UNDERSCORE_TITLE_MODE:I});function H(e,t){"."===e.input[e.index-1]&&t.ignoreMatch()}function B(e,t){void 0!==e.className&&(e.scope=e.className,delete e.className)}function P(e,t){t&&e.beginKeywords&&(e.begin="\\b("+e.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",e.__beforeBegin=H,e.keywords=e.keywords||e.beginKeywords,delete e.beginKeywords,void 0===e.relevance&&(e.relevance=0))}function W(e,t){Array.isArray(e.illegal)&&(e.illegal=m(...e.illegal))}function F(e,t){if(e.match){if(e.begin||e.end)throw new Error("begin & end are not supported with match");e.begin=e.match,delete e.match}}function V(e,t){void 0===e.relevance&&(e.relevance=1)}const U=(e,t)=>{if(!e.beforeMatch)return;if(e.starts)throw new Error("beforeMatch cannot be used with starts");const n=Object.assign({},e);Object.keys(e).forEach((t=>{delete e[t]})),e.keywords=n.keywords,e.begin=g(n.beforeMatch,h(n.begin)),e.starts={relevance:0,contains:[Object.assign(n,{endsParent:!0})]},e.relevance=0,delete n.beforeMatch},K=["of","and","for","in","not","or","if","then","parent","list","value"];function Z(e,t,n="keyword"){const o=Object.create(null);return"string"==typeof e?i(n,e.split(" ")):Array.isArray(e)?i(n,e):Object.keys(e).forEach((function(n){Object.assign(o,Z(e[n],t,n))})),o;function i(e,n){t&&(n=n.map((e=>e.toLowerCase()))),n.forEach((function(t){const n=t.split("|");o[n[0]]=[e,G(n[0],n[1])]}))}}function G(e,t){return t?Number(t):function(e){return K.includes(e.toLowerCase())}(e)?0:1}const X={},Y=e=>{console.error(e)},q=(e,...t)=>{console.log(`WARN: ${e}`,...t)},J=(e,t)=>{X[`${e}/${t}`]||(console.log(`Deprecated as of ${e}. ${t}`),X[`${e}/${t}`]=!0)},Q=new Error;function ee(e,t,{key:n}){let o=0;const i=e[n],r={},a={};for(let e=1;e<=t.length;e++)a[e+o]=i[e],r[e+o]=!0,o+=f(t[e-1]);e[n]=a,e[n]._emit=r,e[n]._multi=!0}function te(e){!function(e){e.scope&&"object"==typeof e.scope&&null!==e.scope&&(e.beginScope=e.scope,delete e.scope)}(e),"string"==typeof e.beginScope&&(e.beginScope={_wrap:e.beginScope}),"string"==typeof e.endScope&&(e.endScope={_wrap:e.endScope}),function(e){if(Array.isArray(e.begin)){if(e.skip||e.excludeBegin||e.returnBegin)throw Y("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),Q;if("object"!=typeof e.beginScope||null===e.beginScope)throw Y("beginScope must be object"),Q;ee(e,e.begin,{key:"beginScope"}),e.begin=v(e.begin,{joinWith:""})}}(e),function(e){if(Array.isArray(e.end)){if(e.skip||e.excludeEnd||e.returnEnd)throw Y("skip, excludeEnd, returnEnd not compatible with endScope: {}"),Q;if("object"!=typeof e.endScope||null===e.endScope)throw Y("endScope must be object"),Q;ee(e,e.end,{key:"endScope"}),e.end=v(e.end,{joinWith:""})}}(e)}function ne(e){function t(t,n){return new RegExp(c(t),"m"+(e.case_insensitive?"i":"")+(e.unicodeRegex?"u":"")+(n?"g":""))}class n{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(e,t){t.position=this.position++,this.matchIndexes[this.matchAt]=t,this.regexes.push([t,e]),this.matchAt+=f(e)+1}compile(){0===this.regexes.length&&(this.exec=()=>null);const e=this.regexes.map((e=>e[1]));this.matcherRe=t(v(e,{joinWith:"|"}),!0),this.lastIndex=0}exec(e){this.matcherRe.lastIndex=this.lastIndex;const t=this.matcherRe.exec(e);if(!t)return null;const n=t.findIndex(((e,t)=>t>0&&void 0!==e)),o=this.matchIndexes[n];return t.splice(0,n),Object.assign(t,o)}}class o{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(e){if(this.multiRegexes[e])return this.multiRegexes[e];const t=new n;return this.rules.slice(e).forEach((([e,n])=>t.addRule(e,n))),t.compile(),this.multiRegexes[e]=t,t}resumingScanAtSamePosition(){return 0!==this.regexIndex}considerAll(){this.regexIndex=0}addRule(e,t){this.rules.push([e,t]),"begin"===t.type&&this.count++}exec(e){const t=this.getMatcher(this.regexIndex);t.lastIndex=this.lastIndex;let n=t.exec(e);if(this.resumingScanAtSamePosition())if(n&&n.index===this.lastIndex);else{const t=this.getMatcher(0);t.lastIndex=this.lastIndex+1,n=t.exec(e)}return n&&(this.regexIndex+=n.position+1,this.regexIndex===this.count&&this.considerAll()),n}}if(e.compilerExtensions||(e.compilerExtensions=[]),e.contains&&e.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return e.classNameAliases=i(e.classNameAliases||{}),function n(r,a){const s=r;if(r.isCompiled)return s;[B,F,te,U].forEach((e=>e(r,a))),e.compilerExtensions.forEach((e=>e(r,a))),r.__beforeBegin=null,[P,W,V].forEach((e=>e(r,a))),r.isCompiled=!0;let d=null;return"object"==typeof r.keywords&&r.keywords.$pattern&&(r.keywords=Object.assign({},r.keywords),d=r.keywords.$pattern,delete r.keywords.$pattern),d=d||/\w+/,r.keywords&&(r.keywords=Z(r.keywords,e.case_insensitive)),s.keywordPatternRe=t(d,!0),a&&(r.begin||(r.begin=/\B|\b/),s.beginRe=t(s.begin),r.end||r.endsWithParent||(r.end=/\B|\b/),r.end&&(s.endRe=t(s.end)),s.terminatorEnd=c(s.end)||"",r.endsWithParent&&a.terminatorEnd&&(s.terminatorEnd+=(r.end?"|":"")+a.terminatorEnd)),r.illegal&&(s.illegalRe=t(r.illegal)),r.contains||(r.contains=[]),r.contains=[].concat(...r.contains.map((function(e){return function(e){return e.variants&&!e.cachedVariants&&(e.cachedVariants=e.variants.map((function(t){return i(e,{variants:null},t)}))),e.cachedVariants?e.cachedVariants:oe(e)?i(e,{starts:e.starts?i(e.starts):null}):Object.isFrozen(e)?i(e):e}("self"===e?r:e)}))),r.contains.forEach((function(e){n(e,s)})),r.starts&&n(r.starts,a),s.matcher=function(e){const t=new o;return e.contains.forEach((e=>t.addRule(e.begin,{rule:e,type:"begin"}))),e.terminatorEnd&&t.addRule(e.terminatorEnd,{type:"end"}),e.illegal&&t.addRule(e.illegal,{type:"illegal"}),t}(s),s}(e)}function oe(e){return!!e&&(e.endsWithParent||oe(e.starts))}class ie extends Error{constructor(e,t){super(e),this.name="HTMLInjectionError",this.html=t}}const re=o,ae=i,se=Symbol("nomatch"),de=function(e){const o=Object.create(null),i=Object.create(null),r=[];let a=!0;const s="Could not find the language '{}', did you forget to load/include a language module?",d={disableAutodetect:!0,name:"Plain text",contains:[]};let c={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:l};function f(e){return c.noHighlightRe.test(e)}function b(e,t,n){let o="",i="";"object"==typeof t?(o=e,n=t.ignoreIllegals,i=t.language):(J("10.7.0","highlight(lang, code, ...args) has been deprecated."),J("10.7.0","Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277"),i=e,o=t),void 0===n&&(n=!0);const r={code:o,language:i};k("before:highlight",r);const a=r.result?r.result:v(r.language,r.code,n);return a.code=r.code,k("after:highlight",a),a}function v(e,t,i,r){const d=Object.create(null);function l(){if(!k.keywords)return void R.addText(L);let e=0;k.keywordPatternRe.lastIndex=0;let t=k.keywordPatternRe.exec(L),n="";for(;t;){n+=L.substring(e,t.index);const i=x.case_insensitive?t[0].toLowerCase():t[0],r=(o=i,k.keywords[o]);if(r){const[e,o]=r;if(R.addText(n),n="",d[i]=(d[i]||0)+1,d[i]<=7&&(j+=o),e.startsWith("_"))n+=t[0];else{const n=x.classNameAliases[e]||e;u(t[0],n)}}else n+=t[0];e=k.keywordPatternRe.lastIndex,t=k.keywordPatternRe.exec(L)}var o;n+=L.substring(e),R.addText(n)}function h(){null!=k.subLanguage?function(){if(""===L)return;let e=null;if("string"==typeof k.subLanguage){if(!o[k.subLanguage])return void R.addText(L);e=v(k.subLanguage,L,!0,S[k.subLanguage]),S[k.subLanguage]=e._top}else e=y(L,k.subLanguage.length?k.subLanguage:null);k.relevance>0&&(j+=e.relevance),R.__addSublanguage(e._emitter,e.language)}():l(),L=""}function u(e,t){""!==e&&(R.startScope(t),R.addText(e),R.endScope())}function p(e,t){let n=1;const o=t.length-1;for(;n<=o;){if(!e._emit[n]){n++;continue}const o=x.classNameAliases[e[n]]||e[n],i=t[n];o?u(i,o):(L=i,l(),L=""),n++}}function g(e,t){return e.scope&&"string"==typeof e.scope&&R.openNode(x.classNameAliases[e.scope]||e.scope),e.beginScope&&(e.beginScope._wrap?(u(L,x.classNameAliases[e.beginScope._wrap]||e.beginScope._wrap),L=""):e.beginScope._multi&&(p(e.beginScope,t),L="")),k=Object.create(e,{parent:{value:k}}),k}function m(e,t,o){let i=function(e,t){const n=e&&e.exec(t);return n&&0===n.index}(e.endRe,o);if(i){if(e["on:end"]){const o=new n(e);e["on:end"](t,o),o.isMatchIgnored&&(i=!1)}if(i){for(;e.endsParent&&e.parent;)e=e.parent;return e}}if(e.endsWithParent)return m(e.parent,t,o)}function f(e){return 0===k.matcher.regexIndex?(L+=e[0],1):(A=!0,0)}function b(e){const n=e[0],o=t.substring(e.index),i=m(k,e,o);if(!i)return se;const r=k;k.endScope&&k.endScope._wrap?(h(),u(n,k.endScope._wrap)):k.endScope&&k.endScope._multi?(h(),p(k.endScope,e)):r.skip?L+=n:(r.returnEnd||r.excludeEnd||(L+=n),h(),r.excludeEnd&&(L=n));do{k.scope&&R.closeNode(),k.skip||k.subLanguage||(j+=k.relevance),k=k.parent}while(k!==i.parent);return i.starts&&g(i.starts,e),r.returnEnd?0:n.length}let w={};function _(o,r){const s=r&&r[0];if(L+=o,null==s)return h(),0;if("begin"===w.type&&"end"===r.type&&w.index===r.index&&""===s){if(L+=t.slice(r.index,r.index+1),!a){const t=new Error(`0 width match regex (${e})`);throw t.languageName=e,t.badRule=w.rule,t}return 1}if(w=r,"begin"===r.type)return function(e){const t=e[0],o=e.rule,i=new n(o),r=[o.__beforeBegin,o["on:begin"]];for(const n of r)if(n&&(n(e,i),i.isMatchIgnored))return f(t);return o.skip?L+=t:(o.excludeBegin&&(L+=t),h(),o.returnBegin||o.excludeBegin||(L=t)),g(o,e),o.returnBegin?0:t.length}(r);if("illegal"===r.type&&!i){const e=new Error('Illegal lexeme "'+s+'" for mode "'+(k.scope||"<unnamed>")+'"');throw e.mode=k,e}if("end"===r.type){const e=b(r);if(e!==se)return e}if("illegal"===r.type&&""===s)return L+="\n",1;if(M>1e5&&M>3*r.index)throw new Error("potential infinite loop, way more iterations than matches");return L+=s,s.length}const x=$(e);if(!x)throw Y(s.replace("{}",e)),new Error('Unknown language: "'+e+'"');const E=ne(x);let C="",k=r||E;const S={},R=new c.__emitter(c);!function(){const e=[];for(let t=k;t!==x;t=t.parent)t.scope&&e.unshift(t.scope);e.forEach((e=>R.openNode(e)))}();let L="",j=0,T=0,M=0,A=!1;try{if(x.__emitTokens)x.__emitTokens(t,R);else{for(k.matcher.considerAll();;){M++,A?A=!1:k.matcher.considerAll(),k.matcher.lastIndex=T;const e=k.matcher.exec(t);if(!e)break;const n=_(t.substring(T,e.index),e);T=e.index+n}_(t.substring(T))}return R.finalize(),C=R.toHTML(),{language:e,value:C,relevance:j,illegal:!1,_emitter:R,_top:k}}catch(n){if(n.message&&n.message.includes("Illegal"))return{language:e,value:re(t),illegal:!0,relevance:0,_illegalBy:{message:n.message,index:T,context:t.slice(T-100,T+100),mode:n.mode,resultSoFar:C},_emitter:R};if(a)return{language:e,value:re(t),illegal:!1,relevance:0,errorRaised:n,_emitter:R,_top:k};throw n}}function y(e,t){t=t||c.languages||Object.keys(o);const n=function(e){const t={value:re(e),illegal:!1,relevance:0,_top:d,_emitter:new c.__emitter(c)};return t._emitter.addText(e),t}(e),i=t.filter($).filter(C).map((t=>v(t,e,!1)));i.unshift(n);const r=i.sort(((e,t)=>{if(e.relevance!==t.relevance)return t.relevance-e.relevance;if(e.language&&t.language){if($(e.language).supersetOf===t.language)return 1;if($(t.language).supersetOf===e.language)return-1}return 0})),[a,s]=r,l=a;return l.secondBest=s,l}function w(e){let t=null;const n=function(e){let t=e.className+" ";t+=e.parentNode?e.parentNode.className:"";const n=c.languageDetectRe.exec(t);if(n){const t=$(n[1]);return t||(q(s.replace("{}",n[1])),q("Falling back to no-highlight mode for this block.",e)),t?n[1]:"no-highlight"}return t.split(/\s+/).find((e=>f(e)||$(e)))}(e);if(f(n))return;if(k("before:highlightElement",{el:e,language:n}),e.dataset.highlighted)return void console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.",e);if(e.children.length>0&&(c.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(e)),c.throwUnescapedHTML))throw new ie("One of your code blocks includes unescaped HTML.",e.innerHTML);t=e;const o=t.textContent,r=n?b(o,{language:n,ignoreIllegals:!0}):y(o);e.innerHTML=r.value,e.dataset.highlighted="yes",function(e,t,n){const o=t&&i[t]||n;e.classList.add("hljs"),e.classList.add(`language-${o}`)}(e,n,r.language),e.result={language:r.language,re:r.relevance,relevance:r.relevance},r.secondBest&&(e.secondBest={language:r.secondBest.language,relevance:r.secondBest.relevance}),k("after:highlightElement",{el:e,result:r,text:o})}let _=!1;function x(){if("loading"===document.readyState)return _||window.addEventListener("DOMContentLoaded",(function(){x()}),!1),void(_=!0);document.querySelectorAll(c.cssSelector).forEach(w)}function $(e){return e=(e||"").toLowerCase(),o[e]||o[i[e]]}function E(e,{languageName:t}){"string"==typeof e&&(e=[e]),e.forEach((e=>{i[e.toLowerCase()]=t}))}function C(e){const t=$(e);return t&&!t.disableAutodetect}function k(e,t){const n=e;r.forEach((function(e){e[n]&&e[n](t)}))}Object.assign(e,{highlight:b,highlightAuto:y,highlightAll:x,highlightElement:w,highlightBlock:function(e){return J("10.7.0","highlightBlock will be removed entirely in v12.0"),J("10.7.0","Please use highlightElement now."),w(e)},configure:function(e){c=ae(c,e)},initHighlighting:()=>{x(),J("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")},initHighlightingOnLoad:function(){x(),J("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")},registerLanguage:function(t,n){let i=null;try{i=n(e)}catch(e){if(Y("Language definition for '{}' could not be registered.".replace("{}",t)),!a)throw e;Y(e),i=d}i.name||(i.name=t),o[t]=i,i.rawDefinition=n.bind(null,e),i.aliases&&E(i.aliases,{languageName:t})},unregisterLanguage:function(e){delete o[e];for(const t of Object.keys(i))i[t]===e&&delete i[t]},listLanguages:function(){return Object.keys(o)},getLanguage:$,registerAliases:E,autoDetection:C,inherit:ae,addPlugin:function(e){!function(e){e["before:highlightBlock"]&&!e["before:highlightElement"]&&(e["before:highlightElement"]=t=>{e["before:highlightBlock"](Object.assign({block:t.el},t))}),e["after:highlightBlock"]&&!e["after:highlightElement"]&&(e["after:highlightElement"]=t=>{e["after:highlightBlock"](Object.assign({block:t.el},t))})}(e),r.push(e)},removePlugin:function(e){const t=r.indexOf(e);-1!==t&&r.splice(t,1)}}),e.debugMode=function(){a=!1},e.safeMode=function(){a=!0},e.versionString="11.11.1",e.regex={concat:g,lookahead:h,either:m,optional:p,anyNumberOfTimes:u};for(const e in z)"object"==typeof z[e]&&t(z[e]);return Object.assign(e,z),e},le=de({});le.newInstance=()=>de({}),e.exports=le,le.HighlightJS=le,le.default=le}},t={};function n(o){var i=t[o];if(void 0!==i)return i.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}(()=>{"use strict";const e=n(416),t="[A-Za-z$_][0-9A-Za-z$_]*",o=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends","using"],i=["true","false","null","undefined","NaN","Infinity"],r=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],a=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],s=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],d=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],l=[].concat(s,r,a);e.registerLanguage("javascript",(function(e){const n=e.regex,c=t,h={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(e,t)=>{const n=e[0].length+e.index,o=e.input[n];if("<"===o||","===o)return void t.ignoreMatch();let i;">"===o&&(((e,{after:t})=>{const n="</"+e[0].slice(1);return-1!==e.input.indexOf(n,t)})(e,{after:n})||t.ignoreMatch());const r=e.input.substring(n);((i=r.match(/^\s*=/))||(i=r.match(/^\s+extends\s+/))&&0===i.index)&&t.ignoreMatch()}},u={$pattern:t,keyword:o,literal:i,built_in:l,"variable.language":d},p="[0-9](_?[0-9])*",g=`\\.(${p})`,m="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",f={className:"number",variants:[{begin:`(\\b(${m})((${g})|\\.)?|(${g}))[eE][+-]?(${p})\\b`},{begin:`\\b(${m})\\b((${g})\\b|\\.)?|(${g})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},b={className:"subst",begin:"\\$\\{",end:"\\}",keywords:u,contains:[]},v={begin:".?html`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"xml"}},y={begin:".?css`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"css"}},w={begin:".?gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,b],subLanguage:"graphql"}},_={className:"string",begin:"`",end:"`",contains:[e.BACKSLASH_ESCAPE,b]},x={className:"comment",variants:[e.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:c+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),e.C_BLOCK_COMMENT_MODE,e.C_LINE_COMMENT_MODE]},$=[e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,v,y,w,_,{match:/\$\d+/},f];b.contains=$.concat({begin:/\{/,end:/\}/,keywords:u,contains:["self"].concat($)});const E=[].concat(x,b.contains),C=E.concat([{begin:/(\s*)\(/,end:/\)/,keywords:u,contains:["self"].concat(E)}]),k={className:"params",begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:u,contains:C},S={variants:[{match:[/class/,/\s+/,c,/\s+/,/extends/,/\s+/,n.concat(c,"(",n.concat(/\./,c),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,c],scope:{1:"keyword",3:"title.class"}}]},R={relevance:0,match:n.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...r,...a]}},L={variants:[{match:[/function/,/\s+/,c,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[k],illegal:/%/},j={match:n.concat(/\b/,(T=[...s,"super","import"].map((e=>`${e}\\s*\\(`)),n.concat("(?!",T.join("|"),")")),c,n.lookahead(/\s*\(/)),className:"title.function",relevance:0};var T;const M={begin:n.concat(/\./,n.lookahead(n.concat(c,/(?![0-9A-Za-z$_(])/))),end:c,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},A={match:[/get|set/,/\s+/,c,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},k]},N="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+e.UNDERSCORE_IDENT_RE+")\\s*=>",O={match:[/const|var|let/,/\s+/,c,/\s*/,/=\s*/,/(async\s*)?/,n.lookahead(N)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[k]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:u,exports:{PARAMS_CONTAINS:C,CLASS_REFERENCE:R},illegal:/#(?![$_A-z])/,contains:[e.SHEBANG({label:"shebang",binary:"node",relevance:5}),{label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,v,y,w,_,x,{match:/\$\d+/},f,R,{scope:"attr",match:c+n.lookahead(":"),relevance:0},O,{begin:"("+e.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[x,e.REGEXP_MODE,{className:"function",begin:N,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:e.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:u,contains:C}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:"<>",end:"</>"},{match:/<[A-Za-z0-9\\._:-]+\s*\/>/},{begin:h.begin,"on:begin":h.isTrulyOpeningTag,end:h.end}],subLanguage:"xml",contains:[{begin:h.begin,end:h.end,skip:!0,contains:["self"]}]}]},L,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+e.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[k,e.inherit(e.TITLE_MODE,{begin:c,className:"title.function"})]},{match:/\.\.\./,relevance:0},M,{match:"\\$"+c,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[k]},j,{relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"},S,A,{match:/\$[(.]/}]}})),e.registerLanguage("xml",(function(e){const t=e.regex,n=t.concat(/[\p{L}_]/u,t.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),o={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},i={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},r=e.inherit(i,{begin:/\(/,end:/\)/}),a=e.inherit(e.APOS_STRING_MODE,{className:"string"}),s=e.inherit(e.QUOTE_STRING_MODE,{className:"string"}),d={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:/[\p{L}0-9._:-]+/u,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[o]},{begin:/'/,end:/'/,contains:[o]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[i,s,a,r,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[i,r,s,a]}]}]},e.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},o,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[s]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[d],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[d],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:t.concat(/</,t.lookahead(t.concat(n,t.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:n,relevance:0,starts:d}]},{className:"tag",begin:t.concat(/<\//,t.lookahead(t.concat(n,/>/))),contains:[{className:"name",begin:n,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}})),e.registerLanguage("bash",(function(e){const t=e.regex,n={},o={begin:/\$\{/,end:/\}/,contains:["self",{begin:/:-/,contains:[n]}]};Object.assign(n,{className:"variable",variants:[{begin:t.concat(/\$[\w\d#@][\w\d_]*/,"(?![\\w\\d])(?![$])")},o]});const i={className:"subst",begin:/\$\(/,end:/\)/,contains:[e.BACKSLASH_ESCAPE]},r=e.inherit(e.COMMENT(),{match:[/(^|\s)/,/#.*$/],scope:{2:"comment"}}),a={begin:/<<-?\s*(?=\w+)/,starts:{contains:[e.END_SAME_AS_BEGIN({begin:/(\w+)/,end:/(\w+)/,className:"string"})]}},s={className:"string",begin:/"/,end:/"/,contains:[e.BACKSLASH_ESCAPE,n,i]};i.contains.push(s);const d={begin:/\$?\(\(/,end:/\)\)/,contains:[{begin:/\d+#[0-9a-f]+/,className:"number"},e.NUMBER_MODE,n]},l=e.SHEBANG({binary:`(${["fish","bash","zsh","sh","csh","ksh","tcsh","dash","scsh"].join("|")})`,relevance:10}),c={className:"function",begin:/\w[\w\d_]*\s*\(\s*\)\s*\{/,returnBegin:!0,contains:[e.inherit(e.TITLE_MODE,{begin:/\w[\w\d_]*/})],relevance:0};return{name:"Bash",aliases:["sh","zsh"],keywords:{$pattern:/\b[a-z][a-z0-9._-]+\b/,keyword:["if","then","else","elif","fi","time","for","while","until","in","do","done","case","esac","coproc","function","select"],literal:["true","false"],built_in:["break","cd","continue","eval","exec","exit","export","getopts","hash","pwd","readonly","return","shift","test","times","trap","umask","unset","alias","bind","builtin","caller","command","declare","echo","enable","help","let","local","logout","mapfile","printf","read","readarray","source","sudo","type","typeset","ulimit","unalias","set","shopt","autoload","bg","bindkey","bye","cap","chdir","clone","comparguments","compcall","compctl","compdescribe","compfiles","compgroups","compquote","comptags","comptry","compvalues","dirs","disable","disown","echotc","echoti","emulate","fc","fg","float","functions","getcap","getln","history","integer","jobs","kill","limit","log","noglob","popd","print","pushd","pushln","rehash","sched","setcap","setopt","stat","suspend","ttyctl","unfunction","unhash","unlimit","unsetopt","vared","wait","whence","where","which","zcompile","zformat","zftp","zle","zmodload","zparseopts","zprof","zpty","zregexparse","zsocket","zstyle","ztcp","chcon","chgrp","chown","chmod","cp","dd","df","dir","dircolors","ln","ls","mkdir","mkfifo","mknod","mktemp","mv","realpath","rm","rmdir","shred","sync","touch","truncate","vdir","b2sum","base32","base64","cat","cksum","comm","csplit","cut","expand","fmt","fold","head","join","md5sum","nl","numfmt","od","paste","ptx","pr","sha1sum","sha224sum","sha256sum","sha384sum","sha512sum","shuf","sort","split","sum","tac","tail","tr","tsort","unexpand","uniq","wc","arch","basename","chroot","date","dirname","du","echo","env","expr","factor","groups","hostid","id","link","logname","nice","nohup","nproc","pathchk","pinky","printenv","printf","pwd","readlink","runcon","seq","sleep","stat","stdbuf","stty","tee","test","timeout","tty","uname","unlink","uptime","users","who","whoami","yes"]},contains:[l,e.SHEBANG(),c,d,r,a,{match:/(\/[a-z._-]+)+/},s,{match:/\\"/},{className:"string",begin:/'/,end:/'/},{match:/\\'/},n]}}));class c{on(e,t){if("function"!=typeof t)throw new TypeError("Listener must be a function");return this.listeners||(this.listeners={}),this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t),()=>this.off(e,t)}once(e,t){if("function"==typeof t){const n=this,o=t;t=function(...i){o(...i),n.off(e,t)}}return this.on(e,t)}off(e,t){this.listeners&&(e?this.listeners[e]&&(t?(this.listeners[e]=this.listeners[e].filter((e=>e!==t)),this.listeners[e].length||delete this.listeners[e]):delete this.listeners[e],Object.keys(this.listeners).length||delete this.listeners):delete this.listeners)}emit(e,...t){this.listeners&&this.listeners[e]&&this.listeners[e].slice().forEach((function(e){e(...t)}))}}var h=(e,t,...n)=>"function"!=typeof e?e:e.apply(t,n);class u extends c{constructor(e={}){super(),this.preinitialize.apply(this,arguments);const t=h(this.defaults,this)||{};this.attributes=Object.assign({},t,e),this.previous={},Object.keys(this.attributes).forEach(this.defineAttribute.bind(this))}preinitialize(){}defineAttribute(e){Object.defineProperty(this,e,{get:()=>this.get(e),set:t=>{this.set(e,t)}})}get(e){return this.attributes[e]}set(e,t,...n){let o,i;"object"==typeof e?(o=e,i=[t,...n]):(o={[e]:t},i=n);const r=this._changing;this._changing=!0;const a={};r||(this.previous=Object.assign({},this.attributes)),Object.keys(o).forEach((e=>{o[e]!==this.attributes[e]&&(a[e]=o[e],this.attributes[e]=o[e])}));const s=Object.keys(a);if(s.length&&(this._pending=["change",this,a,...i]),s.forEach((e=>{this.emit(`change:${e}`,this,o[e],...i)})),r)return this;for(;this._pending;){const e=this._pending;this._pending=null,this.emit.apply(this,e)}return this._pending=null,this._changing=!1,this}toJSON(){return Object.assign({},this.attributes)}}const p={el:!0,tag:!0,attributes:!0,events:!0,model:!0,template:!0,onDestroy:!0};class g extends c{constructor(e={}){super(),this.preinitialize.apply(this,arguments),this.uid="uid"+ ++g.uid,this.delegatedEventListeners=[],this.children=[],this.destroyQueue=[],Object.keys(e).forEach((t=>{p[t]&&(this[t]=e[t])})),this.ensureElement()}preinitialize(){}$(e){return this.el.querySelector(e)}$$(e){return this.el.querySelectorAll(e)}destroy(){return this.destroyChildren(),this.undelegateEvents(),this.off(),this.destroyQueue.forEach((e=>e())),this.destroyQueue=[],this.onDestroy.apply(this,arguments),this}onDestroy(){}addChild(e){return this.children.push(e),e}destroyChildren(){this.children.forEach((e=>e.destroy())),this.children=[]}ensureElement(){if(this.el)this.el=h(this.el,this);else{const e=h(this.tag,this),t=h(this.attributes,this);this.el=this.createElement(e,t)}this.delegateEvents()}createElement(e="div",t={}){let n=document.createElement(e);return Object.keys(t).forEach((e=>n.setAttribute(e,t[e]))),n}removeElement(){return this.el.parentNode.removeChild(this.el),this}delegateEvents(e){if(e||(e=h(this.events,this)),!e)return this;this.delegatedEventListeners.length&&this.undelegateEvents();let t={};return Object.keys(e).forEach((n=>{const o=n.split(" "),i=o.shift(),r=o.join(" ");let a=e[n];a=("string"==typeof a?this[a]:a).bind(this),t[i]||(t[i]=[]),t[i].push({selector:r,listener:a})})),Object.keys(t).forEach((e=>{const n=n=>{t[e].forEach((({selector:e,listener:t})=>{e&&!n.target.closest(e)||t(n,this)}))};this.delegatedEventListeners.push({type:e,listener:n}),this.el.addEventListener(e,n)})),this}undelegateEvents(){return this.delegatedEventListeners.forEach((({type:e,listener:t})=>{this.el.removeEventListener(e,t)})),this.delegatedEventListeners=[],this}render(){return this.template&&(this.el.innerHTML=this.template(this.model)),this}static sanitize(e){return`${e}`.replace(/[&<>"']/g,(e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[e])))}}g.uid=0;const m=e=>e.reduce(((e,t)=>(Array.isArray(t)?e.push(...m(t)):e.push(t),e)),[]);class f{constructor(e){this.value=e}toString(){return this.value}}const b=(e,t)=>h(e,t,t),v=(e,t)=>e.reduce(((e,n,o)=>(e.push(n),void 0!==t[o]&&e.push(C.PLACEHOLDER_EXPRESSION(o)),e)),[]).join(""),y=(e,t)=>{const n=C.PLACEHOLDER_EXPRESSION("(\\d+)"),o=new RegExp(`${n}`,"g"),i=[];let r,a=0;for(;null!==(r=o.exec(e));){const n=e.slice(a,r.index);i.push(C.markAsSafeHTML(n),t[r[1]]),a=r.index+r[0].length}return i.push(C.markAsSafeHTML(e.slice(a))),i},w=(e,t)=>{const n=e.reduce(((e,n)=>{const o=t(n[0]);if(1===n.length)"object"==typeof o?e.all=Object.assign(e.all,o):"string"==typeof o&&(e.all[o]=!0);else{const i=t(n[1]);e.all[o]=i}return e}),{all:{},events:{},attributes:{}});return Object.keys(n.all).forEach((e=>{const t=e.match(/on(([A-Z]{1}[a-z]+)+)/);t&&t[1]?n.events[t[1].toLowerCase()]=n.all[e]:n.attributes[e]=n.all[e]})),n},_=(e,t)=>{const n=C.PLACEHOLDER_EXPRESSION("(\\d+)");return e.replace(new RegExp(`<(${n})([^>]*)>([\\s\\S]*?)</(${n})>|<(${n})([^>]*)/>`,"g"),(function(){const{tag:e,attributes:n,inner:o,close:i,raw:r}=x(arguments,t);if(!(e.prototype instanceof C))return r;let a;if(i){if(e!==i)return r;const n=y(_(o,t),t);a=function(){return m(n.map((e=>b(e,this))))}}return t.push((function(){const t=w(n,(e=>b(e,this))).all;return a&&(t.renderChildren=a.bind(this)),e.mount(t)})),C.PLACEHOLDER_EXPRESSION(t.length-1)}))},x=(e,t)=>{const n=C.PLACEHOLDER_EXPRESSION("(\\d+)"),[o,i,r,a,s,d,l,c,h,u]=e,p={raw:o,attributes:[]};let g;i?(p.tag=void 0!==r?t[r]:i,p.inner=s,p.close=void 0!==l?t[l]:d,g=a):(p.tag=void 0!==h?t[h]:c,g=u);const m=new RegExp(`(${n}|[\\w-]+)(?:=(["']?)(?:${n}|((?:.?(?!["']?\\s+(?:\\S+)=|\\s*/?[>"']))+.))\\3)?`,"g");let f;for(;null!==(f=m.exec(g));){const[,e,n,,o,i]=f,r=void 0!==n?t[n]:e,a=void 0!==o?t[o]:i;void 0!==a?p.attributes.push([r,a]):p.attributes.push([r])}return p},$={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,link:!0,meta:!0,source:!0,track:!0,wbr:!0},E={key:!0,state:!0,onCreate:!0,onChange:!0,onRender:!0};class C extends g{constructor(e={}){super(...arguments),Object.keys(e).forEach((t=>{E[t]&&(this[t]=e[t])})),this.options=e,this.onCreate.apply(this,arguments)}subscribe(e){if(!e.on)return;const t=this.onChange.bind(this),n=e.on("change",t);return this.destroyQueue.push("function"==typeof n?n:()=>e.off("change",t)),this}isContainer(){return!(this.tag||!this.template)}ensureElement(){this.el&&(this.el=h(this.el,this),this.delegateEvents())}findElement(e){return(e||document).querySelector(`[${C.DATA_ATTRIBUTE_UID}="${this.uid}"]`)}getAttributes(){const e={},t={},n=[],o={[C.DATA_ATTRIBUTE_UID]:this.uid};this.attributes&&Object.assign(o,h(this.attributes,this));const i=this.previousAttributes||{};return this.previousAttributes=o,Object.keys(o).forEach((i=>{let r=o[i];!1===r?t[i]=!0:!0===r?(e[i]="",n.push(i)):(null==r&&(r=""),e[i]=r,n.push(`${C.sanitize(i)}="${C.sanitize(r)}"`))})),Object.keys(i).forEach((e=>{e in o||(t[e]=!0)})),{add:e,remove:t,html:n.join(" ")}}hydrate(e){return this.model&&this.subscribe(this.model),this.state&&this.subscribe(this.state),this.isContainer()?(this.children[0].hydrate(e),this.el=this.children[0].el):(this.el=this.findElement(e),this.delegateEvents(),this.children.forEach((e=>e.hydrate(this.el)))),this.onRender.call(this,C.RENDER_TYPE_HYDRATE),this}recycle(e){return this.isContainer()?this.children[0].recycle(e):(this.findElement(e).replaceWith(this.el),this.onRender.call(this,C.RENDER_TYPE_RECYCLE),this)}destroy(){return super.destroy.apply(this,arguments),this.destroyed=!0,this}onCreate(){}onChange(){this.render()}onRender(){}onDestroy(){}partial(e,...t){return m(y(_(v(e,t),t),t).map((e=>b(e,this))))}getRecyclePlaceholder(){if(this.isContainer())return this.children[0].getRecyclePlaceholder();const e=h(this.tag,this)||"div",t=`${C.DATA_ATTRIBUTE_UID}="${this.uid}"`;return this.template||!$[e]?`<${e} ${t}></${e}>`:`<${e} ${t} />`}toString(){if(this.destroyChildren(),this.isContainer())return this.template.call(this,this.addChild.bind(this));const e=h(this.tag,this)||"div",t=this.getAttributes().html,n=this.template?this.template.call(this,this.addChild.bind(this)):"";return this.template||!$[e]?`<${e} ${t}>${n}</${e}>`:`<${e} ${t} />`}render(){if(this.destroyed)return this;if(!this.isContainer()){if(!this.el){const e=this.createElement("template");return e.innerHTML=this,this.hydrate(e.content),this}const e=this.getAttributes();Object.keys(e.remove).forEach((e=>{this.el.removeAttribute(e)})),Object.keys(e.add).forEach((t=>{this.el.setAttribute(t,e.add[t])}))}if(this.template){const e=document.activeElement,t=[],n=[],o=this.children;this.children=[];const i=this.template.call(this,(e=>{let i=e;const r=e.key&&o.find((t=>t.key===e.key));return r?(i=r.getRecyclePlaceholder(),n.push(r),e.destroy()):t.push(e),i}));if(this.isContainer())if(t[0]){const e=this.createElement("template");e.innerHTML=i,this.addChild(t[0]).hydrate(e.content);const n=e.content.children[0];this.el&&this.el.replaceWith(n),this.el=n}else{if(!n[0])throw new Error("Container component must have a child component");this.addChild(n[0])}else this.el.innerHTML=i,t.forEach((e=>{this.addChild(e).hydrate(this.el)})),n.forEach((e=>{this.addChild(e).recycle(this.el)}));o.forEach((e=>{n.indexOf(e)>-1||e.destroy()})),this.el.contains(e)&&e.focus()}return this.onRender.call(this,C.RENDER_TYPE_RENDER),this}static markAsSafeHTML(e){return new f(e)}static extend(e){const t=this;class n extends t{}return Object.assign(n.prototype,"function"==typeof e?e(t.prototype):e),n}static mount(e,t,n){const o=new this(e);return t&&(n?(o.toString(),o.hydrate(t)):t.appendChild(o.render().el)),o}static create(e,...t){const n=C.PLACEHOLDER_EXPRESSION("(\\d+)");let o,i,r,a;"function"==typeof e&&(t=[e],e=["",""]);const s=_(v(e,t),t);let d=s.match(new RegExp(`^\\s*<([a-z]+[1-6]?|${n})([^>]*)>([\\s\\S]*?)</(\\1|${n})>\\s*$|^\\s*<([a-z]+[1-6]?|${n})([^>]*)/>\\s*$`));if(d){const{tag:e,attributes:n,inner:s,close:l}=x(d,t);if(o=function(){return C.sanitize(b(e,this))},i=function(){return w(n,(e=>b(e,this))).attributes},r=function(){const e=w(n,(e=>b(e,this))).events;return Object.keys(e).reduce(((t,n)=>{const o=b(e[n],this);return Object.keys(o).forEach((e=>{t[`${n}${"&"===e?"":` ${e}`}`]=o[e]})),t}),{})},l){const e=s?y(s,t):[];a=function(t){return m(e.map((e=>b(e,this)))).map((e=>null!=e&&!1!==e&&!0!==e?e instanceof f?e:e instanceof C?t(e):C.sanitize(`${e}`):"")).join("")}}}else{if(d=s.match(new RegExp(`^\\s*${n}\\s*$`)),!d)throw new SyntaxError("Invalid component");a=function(e){return e(b(t[d[1]],this)).toString()}}return this.extend({tag:o,attributes:i,events:r,template:a})}}C.PLACEHOLDER_EXPRESSION=e=>`__RASTI_{${e}}__`,C.DATA_ATTRIBUTE_UID="data-rasti-uid",C.RENDER_TYPE_HYDRATE="hydrate",C.RENDER_TYPE_RECYCLE="recycle",C.RENDER_TYPE_RENDER="render";class k{constructor(e,t={}){this.styles=e,this.classes={},this.uid=0,["idPrefix","generateId","generateClassName","attributes","renderers"].forEach((e=>{e in t&&(this[e]=t[e])})),this.id||(this.id=this.attributes&&this.attributes.id||this.generateId()),Object.keys(e).forEach((e=>{e.match(k.classRegex)&&(this.classes[e]=this.generateClassName(e))}))}generateId(){return`${this.idPrefix||k.prefix}-${++k.uid}`}generateClassName(e){return`${this.id}-${e}-${++this.uid}`}isBrowser(){return"undefined"!=typeof document}render(){return((...e)=>e.reduce(((e,t)=>(...n)=>e(t(...n)))))(...(this.renderers||["renderStyles","parseStyles"]).map((e=>("string"==typeof e?this[e]:e).bind(this))))(this.styles)}renderStyles(e,t=1){return Object.keys(e).reduce(((n,o)=>{const i=e[o];let r="",a="",s="";if(k.debug&&(r=k.indent.repeat(t),a="\n",s=" "),i.constructor===Object){if(Object.keys(i).length>0){const e=this.renderStyles(i,t+1);n.push(`${r}${o}${s}{${a}${e}${r}}${a}`)}}else n.push(`${r}${o}:${s}${i};${a}`);return n}),[]).join("")}parseStyles(e,t,n,o){const i=e=>e in this.classes?`.${this.classes[e]}`:e,r=e=>o&&n?`${n} ${e}`:e.match(k.globalPrefixRegex)?`${n?`${n} `:""}${e.replace(k.globalPrefixRegex,"")}`:i(e).replace(k.referenceRegex,((e,t)=>i(t))).replace(k.nestedRegex,n);return Object.keys(e).reduce(((o,i)=>{const a=e[i];if(a.constructor===Object)if(i.match(k.globalRegex))Object.assign(t||o,this.parseStyles(a,o,n,!0));else if((i.match(k.nestedRegex)||i.match(k.globalPrefixRegex))&&t){const e=r(i);t[e]={},Object.assign(t[e],this.parseStyles(a,t,e))}else{const e=r(i);o[e]={},Object.assign(o[e],this.parseStyles(a,o,e))}else o[i.includes("-")?i:(s=i,s.replace(/([A-Z])/g,(e=>`-${e[0].toLowerCase()}`)))]=a;var s;return o}),{})}toString(){const e=Object.assign({},this.attributes,{id:this.id}),t=Object.keys(e).map((t=>` ${t}="${e[t]}"`)),n=k.debug?"\n":"";return`<style${t.join("")}>${n}${this.render()}</style>${n}`}attach(){if(-1==k.registry.indexOf(this)&&k.registry.push(this),this.isBrowser()&&!document.getElementById(this.id)){const e=document.createElement("template");e.innerHTML=this.toString(),this.el=e.content.firstElementChild,document.head.appendChild(this.el)}return this}destroy(){const e=k.registry.indexOf(this);return e>-1&&k.registry.splice(e,1),this.isBrowser()&&this.el&&(this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null),this}static toString(){return k.registry.join("")}static attach(){k.registry.forEach((e=>e.attach()))}static destroy(){k.registry.forEach((e=>e.destroy()))}}k.classRegex=/^\w+$/,k.globalRegex=/^@global$/,k.globalPrefixRegex=/^@global\s+/,k.referenceRegex=/\$(\w+)/g,k.nestedRegex=/&/g,k.prefix="fun",k.indent="    ",k.registry=[],k.uid=0,k.debug=!1;var S=["#f8f9fa","#f1f3f5","#e9ecef","#dee2e6","#ced4da","#adb5bd","#868e96","#495057","#343a40","#212529"],R=["#e7f5ff","#d0ebff","#a5d8ff","#74c0fc","#4dabf7","#339af0","#228be6","#1c7ed6","#1971c2","#1864ab"],L=["#f3f0ff","#e5dbff","#d0bfff","#b197fc","#9775fa","#845ef7","#7950f2","#7048e8","#6741d9","#5f3dc4"],j=["#fff5f5","#ffe3e3","#ffc9c9","#ffa8a8","#ff8787","#ff6b6b","#fa5252","#f03e3e","#e03131","#c92a2a"],T=["#fff9db","#fff3bf","#ffec99","#ffe066","#ffd43b","#fcc419","#fab005","#f59f00","#f08c00","#e67700"],M=["#ebfbee","#d3f9d8","#b2f2bb","#8ce99a","#69db7c","#51cf66","#40c057","#37b24d","#2f9e44","#2b8a3e"],A="#000000",N="#ffffff";const O=(e,t="xs",n="xl")=>{const o=["xs","sm","md","lg","xl","xxl","xxxl","xxxxl"];return o.slice(o.indexOf(t),o.indexOf(n)+1).reduce(((t,n,o)=>(Object.assign(t,e(n,o)),t)),{})},I=(e,t,n)=>O(((t,n)=>({[t]:e(t,n)})),t,n),D=e=>`@media (min-width: ${{sm:640,md:768,lg:1024,xl:1280,xxl:1536}[e]}px)`,z=e=>{const t=e.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]:null},H=e=>{const t=z(e),[n,o,i]=t;return(.299*n+.587*o+.114*i)/255<=.5},B=e=>["primary","secondary","neutral","error","warning","success"].reduce(((t,n)=>(Object.assign(t,e(n)),t)),{}),P=(e,t,n,o)=>{const i=(t,i)=>({main:t(n[o]),light:t(n[o+-1]),dark:t(n[o+1]),contrastMain:t(H(n[o])?N:A),contrastLight:t(H(n[o+-1])?N:A),contrastDark:t(H(n[o+1])?N:A),foregroundMain:t("light"===e?n[8]:n[2]),foregroundLight:t("light"===e?n[7]:n[1]),foregroundDark:t("light"===e?n[9]:n[3]),backgroundMain:t("light"===e?n[1]:n[8]),backgroundLight:t("light"===e?n[0]:n[7]),backgroundDark:t("light"===e?n[2]:n[9]),level1:"light"===e?`var(--rui-palette-${i}-light)`:`var(--rui-palette-${i}-dark)`,level2:`var(--rui-palette-${i}-main)`,level3:"light"===e?`var(--rui-palette-${i}-dark)`:`var(--rui-palette-${i}-light)`,contrastLevel1:"light"===e?`var(--rui-palette-${i}-contrastLight)`:`var(--rui-palette-${i}-contrastDark)`,contrastLevel2:`var(--rui-palette-${i}-contrastMain)`,contrastLevel3:"light"===e?`var(--rui-palette-${i}-contrastDark)`:`var(--rui-palette-${i}-contrastLight)`,foregroundLevel1:"light"===e?`var(--rui-palette-${i}-foregroundDark)`:`var(--rui-palette-${i}-foregroundLight)`,foregroundLevel2:`var(--rui-palette-${i}-foregroundMain)`,foregroundLevel3:"light"===e?`var(--rui-palette-${i}-foregroundLight)`:`var(--rui-palette-${i}-foregroundDark)`,backgroundLevel1:"light"===e?`var(--rui-palette-${i}-backgroundLight)`:`var(--rui-palette-${i}-backgroundDark)`,backgroundLevel2:`var(--rui-palette-${i}-backgroundMain)`,backgroundLevel3:"light"===e?`var(--rui-palette-${i}-backgroundDark)`:`var(--rui-palette-${i}-backgroundLight)`});return{...i((e=>e),t),rgb:i((e=>z(e).join(" ")),`${t}-rgb`)}},W=e=>"light"===e?{black:A,white:N,primary:P("light","primary",R,7),secondary:P("light","secondary",L,7),neutral:P("light","neutral",S,7),error:P("light","error",j,7),warning:P("light","warning",T,6),success:P("light","success",M,8)}:{black:A,white:N,primary:P("dark","primary",R,4),secondary:P("dark","secondary",L,3),neutral:P("dark","neutral",S,4),error:P("dark","error",j,4),warning:P("dark","warning",T,4),success:P("dark","success",M,4)},F=e=>{const t="0 0 #000",n="light"===e?"21 21 21":"0 0 0",o="light"===e?"0.2":"0.4";return{xs:`${t}, 0px 1px 2px 0px rgb(${n} / ${o})`,sm:`${t}, 0px 1px 2px 0px rgb(${n} / ${o}), 0px 2px 4px 0px rgb(${n} / ${o})`,md:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 6px 12px -2px rgb(${n} / ${o})`,lg:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 12px 16px -4px rgb(${n} / ${o})`,xl:`${t}, 0px 2px 8px -2px rgb(${n} / ${o}), 0px 20px 24px -4px rgb(${n} / ${o})`}},V=(I(((e,t)=>`${["0.75","0.875","1","1.125","1.25","1.5","1.875","2.25"][t]}rem`),"xs","xxxxl"),I(((e,t)=>200+100*(t+1))),I(((e,t)=>["1.33334","1.42858","1.5","1.55556","1.66667"][t])),I(((e,t)=>2*(t+1)+1+"px")),I(((e,t)=>4*(t+1)+"px"),"xs","xxxxl"),W("light"),F("light"),W("dark"),F("dark"),(e,t)=>((...e)=>new k(...e).attach())(e,{idPrefix:"rui",...t}));V({"@keyframes rui-animations-pulse":{"0%, 100%":{opacity:1},"50%":{opacity:.5}}});const U=V({root:{display:"inline-flex",alignItems:"center",justifyContent:"space-evenly",borderRadius:"var(--rui-borderRadius-xs)",padding:"var(--rui-spacing-sm)",maxHeight:"100%",fontFamily:"var(--rui-typography-button-fontFamily)",fontWeight:"var(--rui-typography-button-fontWeight)",fontSize:"var(--rui-typography-button-fontSize)",lineHeight:"var(--rui-typography-button-lineHeight)",textTransform:"var(--rui-typography-button-textTransform)",textDecoration:"var(--rui-typography-button-textDecoration)",transition:"background-color 0.1s, color 0.1s, border-color 0.1s","&>svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"&>svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"&>svg:only-child":{padding:"0"}},...B((e=>({[e]:{}}))),disabled:{},solid:{...B((e=>({[`&$${e}`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-main)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastDark) / 0.95)`,backgroundColor:`var(--rui-palette-${e}-dark)`,border:`1px solid var(--rui-palette-${e}-dark)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-contrastMain) / 0.6)`,backgroundColor:`var(--rui-palette-${e}-light)`,border:`1px solid var(--rui-palette-${e}-light)`}}}})))},outlined:{...B((e=>({[`&$${e}`]:{border:`1px solid var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-foregroundMain)`,backgroundColor:"transparent","&:hover":{backgroundColor:`rgb(var(--rui-palette-${e}-rgb-light) / 0.2)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,border:`1px solid rgb(var(--rui-palette-${e}-rgb-light) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLevel3) / 0.6)`,backgroundColor:"transparent"}}}})))},plain:{...B((e=>({[`&$${e}`]:{border:"none",background:"transparent",color:`var(--rui-palette-${e}-foregroundMain)`,"&:hover":{color:`var(--rui-palette-${e}-foregroundDark)`},"&$disabled":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`,"&:hover":{color:`rgb(var(--rui-palette-${e}-rgb-foregroundLight) / 0.6)`}}}})))},group:{"&:not(:first-child)":{marginLeft:"-1px",...B((e=>({[`&$solid$${e}`]:{borderLeftColor:`var(--rui-palette-${e}-dark)`}})))},"&:not(:first-child):not(:last-child)":{borderRadius:"0"},"&:first-child":{borderTopRightRadius:"0",borderBottomRightRadius:"0"},"&:last-child":{borderTopLeftRadius:"0",borderBottomLeftRadius:"0"}},lg:{fontSize:"var(--rui-fontSize-xl)"},sm:{fontSize:"var(--rui-fontSize-xs)"}}),K=C.create`
    <${({options:e})=>e.href?"a":e.type?"input":"button"}
        class="${({options:e})=>(e=>{const t=e.classes?{...U.classes,...e.classes}:U.classes;return[e.className||null,t.root,t[e.size||"md"],t[e.variant||"solid"],t[e.color||"neutral"],e.disabled?t.disabled:null,e.group?t.group:null].join(" ")})(e)}"
        onClick="${{"&":(e,t)=>t.options.onClick&&t.options.onClick(e,t)}}"
        href="${({options:e})=>e.href||!1}"
        type="${({options:e})=>e.type||!1}"
        value="${({options:e})=>e.type&&e.label||!1}"
        disabled="${({options:e})=>e.disabled||!1}"
        target="${({options:e})=>e.target||!1}"
        title="${({options:e})=>e.title||!1}"
    >
        ${e=>e.renderChildren()}
    </${({options:e})=>e.href?"a":e.type?"input":"button"}>
`.extend({renderChildren:function(){return this.options.type?null:this.options.renderChildren?this.options.renderChildren():this.partial`
            ${this.options.renderLeftIcon}
            <span>${this.options.label}</span>
            ${this.options.renderRightIcon}
        `}}),Z=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),G=V({root:{color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-md) 0"},h1:Z("h1"),h2:Z("h2"),h3:Z("h3"),h4:Z("h4"),titleLg:Z("titleLg"),titleMd:Z("titleMd"),titleSm:Z("titleSm"),bodyLg:Z("bodyLg"),bodyMd:Z("bodyMd"),bodySm:Z("bodySm"),caption:Z("caption")}),X=e=>{switch(e.level){case"h1":return"h1";case"h2":case"titleLg":case"titleMd":case"titleSm":return"h2";case"h3":return"h3";case"h4":return"h4";default:return"p"}},Y=C.create`
    <${({options:e})=>X(e)} class="${({options:e})=>(e=>{const t=e.classes?{...G.classes,...e.classes}:G.classes;return[e.className||null,t.root,t[e.level||"bodyMd"]].join(" ")})(e)}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()||e.text}
    </${({options:e})=>X(e)}>
`,q=C.create`
    <svg class="${({options:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
    </svg>
`,J=C.create`
    <svg class="${({options:e})=>e.className}" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 32 32">
        <path d="M 0 10 L 0 21 L 9 21 L 9 23 L 16 23 L 16 21 L 32 21 L 32 10 L 0 10 z M 1.7773438 11.777344 L 8.8886719 11.777344 L 8.890625 11.777344 L 8.890625 19.445312 L 7.1113281 19.445312 L 7.1113281 13.556641 L 5.3339844 13.556641 L 5.3339844 19.445312 L 1.7773438 19.445312 L 1.7773438 11.777344 z M 10.667969 11.777344 L 17.777344 11.777344 L 17.779297 11.777344 L 17.779297 19.443359 L 14.222656 19.443359 L 14.222656 21.222656 L 10.667969 21.222656 L 10.667969 11.777344 z M 19.556641 11.777344 L 30.222656 11.777344 L 30.224609 11.777344 L 30.224609 19.445312 L 28.445312 19.445312 L 28.445312 13.556641 L 26.667969 13.556641 L 26.667969 19.445312 L 24.890625 19.445312 L 24.890625 13.556641 L 23.111328 13.556641 L 23.111328 19.445312 L 19.556641 19.445312 L 19.556641 11.777344 z M 14.222656 13.556641 L 14.222656 17.667969 L 16 17.667969 L 16 13.556641 L 14.222656 13.556641 z"></path>
    </svg>
`,{classes:Q}=V({root:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",flexDirection:"column",backgroundColor:"var(--rui-palette-neutral-backgroundLevel3)",boxShadow:"var(--rui-shadow-xs)",padding:"0 var(--rui-spacing-xl)",overflow:"hidden","@global":{h1:{textAlign:"center",margin:"var(--rui-app-appBarHeight) 0 0 0"},h2:{color:"var(--rui-palette-neutral-foregroundLevel2)",marginTop:0,marginBottom:"var(--rui-spacing-sm)"},h4:{color:"var(--rui-palette-neutral-foregroundLevel3)",marginBottom:"var(--rui-spacing-md)"},"h1 img":{width:"90%"},pre:{maxWidth:"100%"},code:{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"}}},buttons:{"& a":{margin:"var(--rui-spacing-md) var(--rui-spacing-xs)"},display:"flex",justifyContent:"center"},[D("sm")]:{"$root h1":{margin:"var(--rui-app-appBarHeight) 0 0 0"},"$root h2":{marginBottom:"var(--rui-spacing-xl)"},"$root h4":{marginBottom:"var(--rui-spacing-xxl)"},"$root h1 img":{width:"75%"},"$buttons a":{margin:"var(--rui-spacing-xxxl) var(--rui-spacing-lg)"}},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-secondary-main)"},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),ee=C.create`
    <section class="${Q.root}">
        <h1>
            <img class="${Q.hiddenIfLight}" alt="Rasti.js" src="/logo-dark.svg">
            <img class="${Q.hiddenIfDark}" alt="Rasti.js" src="/logo.svg">
        </h1>
        ${()=>Y.mount({level:"h2",text:"Modern MVC for building user interfaces"})}
        ${()=>C.markAsSafeHTML('<pre><code class="javascript language-javascript">\nconst model = new Model({ count : 0 });\n\nconst Counter = Component.create`\n    &lt;div\n        onClick=${{\n            \'.up\' : () => model.count++,\n            \'.down\' : () => model.count--,\n        }}\n    &gt;\n        &lt;div&gt;Counter: ${() => model.count}&lt;/div&gt;\n        &lt;button class="up"&gt;Increment&lt;/button&gt;\n        &lt;button class="down"&gt;Decrement&lt;/button&gt;\n    &lt;/div&gt;\n`;\n\nCounter.mount({ model }, document.body);\n</code></pre>')}
        <div class="${Q.buttons}">
            ${()=>K.mount({label:"Getting Started",color:"primary",variant:"outlined",href:"#gettingstarted"})}
            ${()=>K.mount({label:"GitHub",color:"secondary",variant:"outlined",href:"https://github.com/8tentaculos/rasti",target:"_blank",renderLeftIcon:()=>q.mount({className:Q.icon})})}
        </div>
    </section>
`,{classes:te}=V({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)"}}),ne=C.create`
    <div class="${te.root}">
        ${e=>Y.mount({level:"h4",renderChildren:()=>e.partial`<strong>Rasti</strong> is a lightweight MVC library for building fast, reactive user interfaces.<br> Inspired by <strong>Backbone.js</strong>, it retains a familiar API while removing non-essential features and introducing modern, declarative, and composable components to simplify complex UI development.`})}
    </div>
`,oe=e=>e.charAt(0).toUpperCase()+e.slice(1),ie=V({root:{borderRadius:"var(--rui-borderRadius-xs)",padding:"var(--rui-spacing-md)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",fontFamily:"var(--rui-fontFamily-body)",fontSize:"var(--rui-fontSize-bodyMd)"},...B((e=>({[e]:{color:`var(--rui-palette-${e}-foregroundMain)`}}))),outlined:{...B((e=>({[`&$${e}`]:{border:`1px solid rgb(var(--rui-palette-${e}-rgb-level1) / 0.4)`}})))},solid:{...B((e=>({[`&$${e}`]:{backgroundColor:`var(--rui-palette-${e}-main)`,color:`var(--rui-palette-${e}-contrastMain)`}})))},...O((e=>({[`shadow${oe(e)}`]:{boxShadow:`var(--rui-shadow-${e})`}})))}),re=C.create`
    <div class="${({options:e})=>(e=>{const t=e.classes?{...ie.classes,...e.classes}:ie.classes;return[e.className||null,t.root,t[e.variant||"outlined"],t[e.color||"neutral"],e.shadow?t[`shadow${oe(e.shadow)}`]:null].join(" ")})(e)}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </div>
`;var ae=C.create`
    <svg class="${({options:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
    </svg>
`;const se=V({root:{position:"fixed",top:0,right:0,bottom:0,left:0,display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"rgb(var(--rui-palette-neutral-rgb-level3) / 0.2)",backdropFilter:"blur(5px)",zIndex:1e3,padding:"var(--rui-spacing-md)"},modal:{position:"relative",padding:"var(--rui-spacing-sm)"},left:{justifyContent:"flex-start"},right:{justifyContent:"flex-end"},top:{alignItems:"flex-start"},bottom:{alignItems:"flex-end"},header:{display:"flex",justifyContent:"flex-end",marginBottom:"var(--rui-spacing-lg)","& button":{margin:0,padding:0,borderRadius:"50%"}},content:{padding:"var(--rui-spacing-md)",marginBottom:"var(--rui-spacing-lg)"},footer:{display:"flex",justifyContent:"space-evenly"}}),de=C.create`
    <div class="${({options:e})=>he(e).header}">
        <${K}
            onClick=${({options:e})=>e.handleClose&&e.handleClose}
            color="neutral"
            variant="outlined"
            size="sm"
        >
            ${()=>ae.mount()}
        </${K}>
    </div>
`,le=C.create`
    <div class="${({options:e})=>he(e).content}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </div>
`,ce=C.create`
    <div class="${({options:e})=>he(e).footer}">
        ${({options:e})=>e.renderChildren&&e.renderChildren()}
    </div>
`,he=e=>e.classes?{...se.classes,...e.classes}:se.classes,ue=({variant:e,color:t,shadow:n})=>({variant:e,color:t,shadow:n}),pe=C.create`
    <div
        class="${({options:e})=>(e=>{const t=he(e);return[e.className||null,t.root,e.top?t.top:null,e.bottom?t.bottom:null,e.left?t.left:null,e.right?t.right:null].join(" ")})(e)}"
        onClick=${{"&":function(e){this.options.handleClose&&e.target===this.el&&this.options.handleClose()}}}
    >
        <${re} ${({options:e})=>({...ue(e),className:he(e).modal,tag:"div"})}>
            ${e=>e.renderContent()}
        </${re}>
    </div>
`.extend({renderContent(){return this.options.renderChildren?this.options.renderChildren():this.partial`
            ${this.options.handleClose?this.partial`<${de} ${{...this.options}} />`:null}

            <${le} ${{...this.options}} />
                ${this.options.renderContent}
            </${le}>

            ${this.options.renderButtons?this.partial`
                        <${ce} ${{...this.options}}>
                            ${this.options.renderButtons}
                        </${ce}>
                    `:null}
        `}});pe.Header=de,pe.Content=le,pe.Footer=ce;var ge=C.create`
    <svg class="${({options:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>
    </svg>
`,me=C.create`
    <svg class="${({options:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"/>
    </svg>
`,fe=C.create`
    <svg class="${({options:e})=>e.className}" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
        <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd"/>
    </svg>
`;const{classes:be}=V({root:{display:"flex",justifyContent:"right",alignItems:"center",height:"60px","& ul":{padding:0}},icon:{width:"24px",height:"24px",cursor:"pointer",fill:"var(--rui-palette-neutral-main)","&:hover":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"}}),ve=C.create`
    <div class="${be.root}">
        <ul>
            <li class="${be.hiddenIfDark}">
                ${()=>K.mount({variant:"plain",renderChildren:()=>me.mount({className:be.icon}),onClick:()=>document.documentElement.setAttribute("data-color-scheme","dark")})}
            </li>
            <li class="${be.hiddenIfLight}">
                ${()=>K.mount({variant:"plain",renderChildren:()=>fe.mount({className:be.icon}),onClick:()=>document.documentElement.setAttribute("data-color-scheme","light")})}
            </li>
        </ul>
    </div>
`,{classes:ye}=V({root:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"var(--rui-app-appBarHeight)",position:"fixed",top:0,left:0,right:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)",boxShadow:"var(--rui-shadow-sm)","& nav":{maxWidth:"100%",display:"flex",justifyContent:"flex-end",alignItems:"center","& ul":{display:"flex",justifyContent:"center",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"0 var(--rui-spacing-xs)"}}},"& nav$left":{flexGrow:1,justifyContent:"flex-start","& ul":{justifyContent:"flex-start"}},"& nav$lg":{display:"none"}},[D("sm")]:{"$root nav$lg":{display:"flex"},"$root li$sm":{display:"none"}},left:{},sm:{},lg:{},icon:{width:"24px",height:"24px",fill:"var(--rui-palette-neutral-main)","a:hover &":{fill:"var(--rui-palette-neutral-dark)"}},hiddenIfLight:{display:"var(--rui-app-hiddenIfLight)"},hiddenIfDark:{display:"var(--rui-app-hiddenIfDark)"},menuContent:{"& nav":{maxWidth:"100%",display:"flex",justifyContent:"flex-end",alignItems:"center","& ul":{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",listStyle:"none",padding:0,"& li":{margin:"var(--rui-spacing-md)"}}}}}),we=C.create`
    <div class="${ye.menuContent}">
        ${({options:e,partial:t})=>t`
            <nav><ul>
                <li>
                    <${K} ${{href:"/api/",onClick:t=>{t.preventDefault(),e.handleNavigate("/api/"),e.handleOpen(!1)},label:"API",variant:"plain",size:"lg"}} />
                </li>
                <li>
                    <${K} ${{href:"https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"Playground",variant:"plain",size:"lg"}} />
                </li>
                <li>
                    <${K} ${{href:"https://github.com/8tentaculos/rasti",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"GitHub",variant:"plain",size:"lg",renderLeftIcon:()=>q.mount({className:ye.icon})}} />
                </li>
                <li>
                    <${K} ${{href:"https://www.npmjs.com/package/rasti",onClick:t=>{e.handleOpen(!1)},target:"_blank",label:"npm",variant:"plain",size:"lg",renderLeftIcon:()=>J.mount({className:ye.icon})}} />
                </li>
            </ul></nav>
        `}
    </div>
`,_e=C.create`
    <div class="">
        ${({options:e})=>K.mount({renderChildren:()=>ge.mount({className:ye.icon}),color:"primary",variant:"plain",size:"lg",onClick:()=>e.handleOpen(!0)})}
        ${({options:e})=>e.open?pe.mount({handleClose:()=>e.handleOpen(!1),renderContent:e.renderContent,shadow:"lg"}):null}
    </div>
`,xe=C.create`
    <div class="${ye.root}">
        <nav class="${ye.left}">
            <ul>
                <li>
                    ${e=>K.mount({href:"/",onClick:t=>{t.preventDefault(),e.options.handleNavigate("/")},variant:"plain",renderChildren:()=>e.partial`
                            <span>
                                <img height="24" class="${ye.hiddenIfLight}" alt="Rasti.js" src="/logo-dark.svg">
                                <img height="24" class="${ye.hiddenIfDark}" alt="Rasti.js" src="/logo.svg">
                            </span>
                        `})}
                </li>
            </ul>
        </nav>
        <nav class="${ye.lg}">
            <ul>
                <li>
                    ${({options:e})=>K.mount({href:"/api/",onClick:t=>{t.preventDefault(),e.handleNavigate("/api/")},label:"API",variant:"plain"})}
                </li>
                <li>
                    ${()=>K.mount({href:"https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010",target:"_blank",label:"Playground",variant:"plain"})}
                </li>
                <li>
                    ${()=>K.mount({href:"https://github.com/8tentaculos/rasti",target:"_blank",variant:"plain",renderChildren:()=>q.mount({className:ye.icon})})}
                </li>
                <li>
                    ${()=>K.mount({href:"https://www.npmjs.com/package/rasti",target:"_blank",variant:"plain",renderChildren:()=>J.mount({className:ye.icon})})}
                </li>
            </ul>
        </nav>
        <nav>
            <ul>
                <li>
                    ${()=>ve.mount()}
                </li>
                <li class="${ye.sm}">
                    ${e=>_e.mount({open:e.state.open,handleOpen:t=>{e.state.open=t},renderContent:()=>we.mount({handleNavigate:e.options.handleNavigate,handleOpen:t=>{e.state.open=t}})})}
                </li>
            </ul>
        </nav>
    </div>
`.extend({preinitialize(){this.state=new u({open:!1})}}),$e=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Ee}=V({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...$e("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...$e("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"center","& section":{"& h5":{margin:"var(--rui-spacing-xs) 0",padding:"0"},margin:"var(--rui-spacing-md)",width:"400px"}},[D("md")]:{$root:{justifyContent:"space-between"}}}),Ce=C.create`
            <section class="${({options:e})=>(e=>[e.className||null,Ee.root].join(" "))(e)}">${e=>[re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="declarativecomponents">Declarative Components 🌟</h5>
<p>Build dynamic UI components using intuitive template literals.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="eventdelegation">Event Delegation 🎯</h5>
<p>Simplify event handling with built-in delegation.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="modelviewbinding">Model-View Binding 🔗</h5>
<p>Keep your UI and data in sync with ease.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="serversiderendering">Server-Side Rendering 🌐</h5>
<p>Render as plain text for server-side use or static builds.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="lightweightandfast">Lightweight and Fast ⚡</h5>
<p>Minimal overhead with efficient rendering.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="legacycompatibility">Legacy Compatibility 🕰️</h5>
<p>Seamlessly integrates into existing <strong>Backbone.js</strong> projects.  </p>`}),re.mount({tag:"section",shadow:"sm",renderChildren:()=>e.partial`<h5 id="standardsbased">Standards-Based 📐</h5>
<p>Built on modern web standards, no tooling required.  </p>`})]}</section>
        `,ke=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:Se}=V({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...ke("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...ke("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}}}}),Re=C.create`
            <section class="${({options:e})=>(e=>[e.className||null,Se.root].join(" "))(e)}"><h2 id="gettingstarted">Getting Started</h2>
<h3 id="installingvianpm">Installing via npm</h3>
<pre><code class="bash language-bash">\$ npm install rasti
</code></pre>
<pre><code class="javascript language-javascript">import \{ Model, Component \} from 'rasti';
</code></pre>
<h3 id="usingesmodules">Using ES modules</h3>
<pre><code class="javascript language-javascript">import \{ Model, Component \} from 'https://esm.run/rasti';
</code></pre>
<h3 id="usingascripttag">Using a <code>&lt;script&gt;</code> tag</h3>
<pre><code class="html language-html">&lt;script src="https://cdn.jsdelivr.net/npm/rasti/dist/rasti.min.js"&gt;&lt;/script&gt;
</code></pre>
<pre><code class="javascript language-javascript">const \{ Model, Component \} = Rasti;
</code></pre>
<h3 id="createacomponent">Create a <code>Component</code></h3>
<pre><code class="javascript language-javascript">// Define a Timer component that displays the number of seconds from the model.
const Timer = Component.create\`
    &lt;div&gt;
        Seconds: &lt;span&gt;\$\{(\{ model \}) =&gt; model.seconds\}&lt;/span&gt;
    &lt;/div&gt;
\`;

// Create a model to store the seconds.
const model = new Model(\{ seconds: 0 \});

// Mount the Timer component to the body and pass the model as an option.
Timer.mount(\{ model \}, document.body);

// Increment the \`seconds\` property of the model every second.
setInterval(() =&gt; model.seconds++, 1000);
</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/gOQxaOE?editors=0010">Try it on CodePen</a></p>
<h3 id="addingsubcomponents">Adding sub components</h3>
<pre><code class="javascript language-javascript">// Define the routes for the navigation menu.
const routes = [
    \{ label: 'Home', href: '#' \},
    \{ label: 'Faq', href: '#faq' \},
    \{ label: 'Contact', href: '#contact' \},
];

// Create a Link component for navigation items.
const Link = Component.create\`
    &lt;a href="\$\{(\{ options \}) =&gt; options.href\}"&gt;
        \$\{(\{ options \}) =&gt; options.renderChildren()\}
    &lt;/a&gt;
\`;

// Create a Navigation component that renders Link components for each route.
const Navigation = Component.create\`
    &lt;nav&gt;
        \$\{(\{ options, partial \}) =&gt; options.routes.map(
            (\{ label, href \}) =&gt; partial\`&lt;\$\{Link\} href="\$\{href\}"&gt;\$\{label\}&lt;/\$\{Link\}&gt;\`
        )\}
    &lt;/nav&gt;
\`;

// Create a Main component that includes the Navigation and displays the current route's label as the title.
const Main = Component.create\`
    &lt;main&gt;
        &lt;\$\{Navigation\} routes=\$\{(\{ options \}) =&gt; options.routes\} /&gt;
        &lt;section&gt;
            &lt;h1&gt;
                \$\{(\{ model, options \}) =&gt; options.routes.find(
                    (\{ href \}) =&gt; href === (model.location || '#')
                ).label\}
            &lt;/h1&gt;
        &lt;/section&gt;
    &lt;/main&gt;
\`;

// Initialize a model to store the current location.
const model = new Model(\{ location: document.location.hash \});

// Update the model's location state when the browser's history changes.
window.addEventListener('popstate', () =&gt; model.location = document.location.hash);

// Mount the Main component to the body, passing the routes and model as options.
Main.mount(\{ routes, model \}, document.body);
</code></pre>
<p><a target="_blank" href="https://codepen.io/8tentaculos/pen/dyBMNbq?editors=0010">Try it on CodePen</a></p>
<h2 id="whychooserasti">Why Choose <strong>Rasti</strong>?</h2>
<p><strong>Rasti</strong> is built for developers who want a simple yet powerful way to create UI components without the complexity of heavy frameworks. Whether you're prototyping, building a high-performance dashboard, or modernizing a <strong>Backbone.js</strong> app, <strong>Rasti</strong> lets you:  </p>
<ul>
<li><strong>Skip the Setup</strong><br />
No installations, no build tools—just load it and start coding.  </li>
<li><strong>Lightweight and Efficient</strong><br />
Minimal footprint with optimized performance, ensuring smooth updates.  </li>
<li><strong>Upgrade Legacy Code Without a Rewrite</strong><br />
Incrementally enhance <strong>Backbone.js</strong> views while keeping existing functionality.  </li>
</ul>
<h2 id="example">Example</h2>
<p>You can find a sample <strong>TODO application</strong> in the <a target="_blank" href="https://github.com/8tentaculos/rasti/tree/master/example/todo">example folder</a> of the <strong>Rasti</strong> <a target="_blank" href="https://github.com/8tentaculos/rasti">GitHub repository</a>. This example serves as a great starting point for your own projects. Try it live <a target="_blank" href="https://rasti.js.org/example/todo/index.html">here</a>.</p>
<h2 id="apidocumentation">API Documentation</h2>
<p>For detailed information on how to use <strong>Rasti</strong>, refer to the <a href="/api/">API documentation</a>.</p>
<h2 id="poweredbyrasti">Powered by <strong>Rasti</strong></h2>
<h3 id="cryptobabylonhttpscryptobabylonnet"><a target="_blank" href="https://cryptobabylon.net">Crypto Babylon</a></h3>
<p>A market analytics platform efficiently rendering over 300 dynamic rows, updated in real-time with thousands of messages per second via multiple WebSocket connections.  </p>
<h3 id="jspacmanhttpspacmanjsorg"><a target="_blank" href="https://pacman.js.org">jsPacman</a></h3>
<p>A DOM-based remake of the classic Ms. Pac-Man game. <strong>Rasti</strong> powers its custom game engine.  </p></section>
        `,Le=e=>({fontFamily:`var(--rui-typography-${e}-fontFamily)`,fontWeight:`var(--rui-typography-${e}-fontWeight)`,fontSize:`var(--rui-typography-${e}-fontSize)`,lineHeight:`var(--rui-typography-${e}-lineHeight)`}),{classes:je}=V({root:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",padding:"var(--rui-spacing-lg)",margin:"0 auto",maxWidth:"var(--rui-app-maxWidth)",color:"var(--rui-palette-neutral-foregroundLevel2)","@global":{h1:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0"},h2:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xl)",fontSize:"var(--rui-fontSize-xxl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel1)",margin:"var(--rui-spacing-lg) 0",padding:"var(--rui-spacing-sm) 0",borderBottom:"1px solid rgba(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)"},h3:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-xs)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0",overflowY:"hidden",overflowX:"auto"},h4:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-lg)",fontSize:"var(--rui-fontSize-lg)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},h5:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-md)",fontSize:"var(--rui-fontSize-xl)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel3)",margin:"var(--rui-spacing-lg) 0"},p:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},li:{fontFamily:"var(--rui-fontFamily-body)",fontWeight:"var(--rui-fontWeight-xs)",fontSize:"var(--rui-fontSize-md)",lineHeight:"var(--rui-lineHeight-md)",color:"var(--rui-palette-neutral-foregroundLevel2)",margin:"var(--rui-spacing-lg) 0"},"li::marker":{color:"var(--rui-palette-neutral-foregroundLevel3)"},"pre > code":{borderRadius:"var(--rui-borderRadius-sm)",boxShadow:"var(--rui-shadow-sm)",display:"block",background:"#282c34",color:"#abb2bf",overflowX:"auto",padding:"1em"},a:{color:"var(--rui-palette-primary-foregroundMain)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-primary-foregroundMain)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-primary-foregroundDark)"}},table:{color:"var(--rui-palette-neutral-foregroundLevel1)",display:"block",overflowX:"auto",borderCollapse:"collapse","& th":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Le("titleMd"),"& div":{display:"flex",alignItems:"center",justifyContent:"space-evenly"},"& svg:first-child":{padding:"0 var(--rui-spacing-xs) 0 0"},"& svg:last-child":{padding:"0 0 0 var(--rui-spacing-xs)"},"& svg:only-child":{padding:"0"}},"& td":{borderColor:"rgb(var(--rui-palette-neutral-rgb-foregroundLevel3) / 0.2)",borderStyle:"none",padding:"var(--rui-spacing-sm) var(--rui-spacing-md)",...Le("bodyMd")},"& thead th, & thead td":{borderBottomStyle:"solid",borderBottomWidth:"2px"},"& tfoot th, & tfoot td":{borderTopStyle:"solid",borderTopWidth:"2px"},"& tr:not(:last-child) td":{borderBottomStyle:"solid",borderBottomWidth:"1px"},"& td:not(:last-child), & th:not(:last-child)":{borderRightStyle:"solid",borderRightWidth:"1px"}}},marginTop:"var(--rui-app-appBarHeight)"}}),Te=C.create`
            <section class="${({options:e})=>(e=>[e.className||null,je.root].join(" "))(e)}"><h2 id="modules">Modules</h2>
<ul>
<li><a href="#module_component">Component</a> ⇐ <code>Rasti.View</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_component__subscribe">.subscribe(model)</a> ⇒ <code>Rasti.Component</code></li>
<li><a href="#module_component__oncreate">.onCreate(options)</a></li>
<li><a href="#module_component__onchange">.onChange(model, changed)</a></li>
<li><a href="#module_component__onrender">.onRender(type)</a></li>
<li><a href="#module_component__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_component__partial">.partial(strings, …expressions)</a> ⇒ <code>Array</code></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_component_markassafehtml">.markAsSafeHTML(value)</a> ⇒ <code>Rasti.SafeHTML</code></li>
<li><a href="#module_component_extend">.extend(object)</a></li>
<li><a href="#module_component_mount">.mount(options, el, hydrate)</a> ⇒ <code>Rasti.Component</code></li>
<li><a href="#module_component_create">.create(strings, …expressions)</a> ⇒ <code>Rasti.Component</code></li></ul></li></ul></li>
<li><a href="#module_emitter">Emitter</a><ul>
<li><a href="#module_emitter__on">.on(type, listener)</a></li>
<li><a href="#module_emitter__once">.once(type, listener)</a></li>
<li><a href="#module_emitter__off">.off([type], [listener])</a></li>
<li><a href="#module_emitter__emit">.emit(type)</a></li></ul></li>
<li><a href="#module_model">Model</a> ⇐ <code>Rasti.Emitter</code><ul>
<li><a href="#module_model__preinitialize">.preinitialize(attributes)</a></li>
<li><a href="#module_model__defineattribute">.defineAttribute(key)</a></li>
<li><a href="#module_model__get">.get(key)</a> ⇒ <code>any</code></li>
<li><a href="#module_model__set">.set(key, [value])</a> ⇒ <code>this</code></li>
<li><a href="#module_model__tojson">.toJSON()</a> ⇒ <code>object</code></li></ul></li>
<li><a href="#module_view">View</a> ⇐ <code>Emitter</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_view__preinitialize">.preinitialize(attrs)</a></li>
<li><a href="#module_view__\$">.\$(selector)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__\$\$">.\$\$(selector)</a> ⇒ <code>Array.&lt;node&gt;</code></li>
<li><a href="#module_view__destroy">.destroy(options)</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_view__addchild">.addChild(child)</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__destroychildren">.destroyChildren()</a></li>
<li><a href="#module_view__ensureelement">.ensureElement()</a></li>
<li><a href="#module_view__createelement">.createElement(tag, attributes)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__removeelement">.removeElement()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__delegateevents">.delegateEvents([events])</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__undelegateevents">.undelegateEvents()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__render">.render()</a> ⇒ <code>Rasti.View</code></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_view_sanitize">.sanitize(str)</a> ⇒ <code>string</code></li></ul></li></ul></li>
</ul>
<p><a name="module_component" id="module_component" class="anchor"></a></p>
<h2 id="componentc21c">Component ⇐ <code>Rasti.View</code></h2>
<p>Components are a special kind of <code>View</code> that is designed to be easily composable, 
making it simple to add child views and build complex user interfaces.<br />
Unlike views, which are render-agnostic, components have a specific set of rendering 
guidelines that allow for a more declarative development style.<br />
Components are defined with the <a href="#module_component_create">Component.create</a> static method, which takes a tagged template string or a function that returns another component.</p>
<p><strong>Extends</strong>: <code>Rasti.View</code><br />
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
<td>A <code>Rasti.Model</code> or any emitter object containing data and business logic. The component will listen to <code>change</code> events and call <code>onChange</code> lifecycle method.</td>
</tr>
<tr>
<td>state</td>
<td><code>object</code></td>
<td>A <code>Rasti.Model</code> or any emitter object containing data and business logic, to be used as internal state. The component will listen to <code>change</code> events and call <code>onChange</code> lifecycle method.</td>
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
<li><a href="#module_component__subscribe">.subscribe(model)</a> ⇒ <code>Rasti.Component</code></li>
<li><a href="#module_component__oncreate">.onCreate(options)</a></li>
<li><a href="#module_component__onchange">.onChange(model, changed)</a></li>
<li><a href="#module_component__onrender">.onRender(type)</a></li>
<li><a href="#module_component__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_component__partial">.partial(strings, …expressions)</a> ⇒ <code>Array</code></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_component_markassafehtml">.markAsSafeHTML(value)</a> ⇒ <code>Rasti.SafeHTML</code></li>
<li><a href="#module_component_extend">.extend(object)</a></li>
<li><a href="#module_component_mount">.mount(options, el, hydrate)</a> ⇒ <code>Rasti.Component</code></li>
<li><a href="#module_component_create">.create(strings, …expressions)</a> ⇒ <code>Rasti.Component</code></li></ul></li></ul></li>
</ul>
<p><a name="module_component__subscribe" id="module_component__subscribe" class="anchor"></a></p>
<h3 id="componentsubscribemodelc33c">component.subscribe(model) ⇒ <code>Rasti.Component</code></h3>
<p>Listen to <code>change</code> event on a model or emitter object and call <code>onChange</code> lifecycle method.
The listener will be removed when the component is destroyed.
By default the component will be subscribed to <code>this.model</code> and <code>this.state</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Rasti.Component</code> - The component instance.  </p>
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
<td>A model or emitter object to listen to changes.</td>
</tr>
</tbody>
</table>
<p><a name="module_component__oncreate" id="module_component__oncreate" class="anchor"></a></p>
<h3 id="componentoncreateoptions">component.onCreate(options)</h3>
<p>Lifecycle method. Called when the view is created, at the end of the <code>constructor</code>.</p>
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
<p><a name="module_component__onrender" id="module_component__onrender" class="anchor"></a></p>
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
<p><a name="module_component__ondestroy" id="module_component__ondestroy" class="anchor"></a></p>
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
<p><a name="module_component__partial" id="module_component__partial" class="anchor"></a></p>
<h3 id="componentpartialstringsexpressionsc47c">component.partial(strings, …expressions) ⇒ <code>Array</code></h3>
<p>Tagged template helper method.
Used to create a partial template.<br />
It will return a one-dimensional array with strings and expressions.<br />
Components will be added as children by the parent component. Template strings literals 
will be marked as safe HTML to be rendered.
This method is bound to the component instance by default.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Array</code> - Array containing strings and expressions.  </p>
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
<pre><code class="js language-js">import \{ Component \} from 'rasti';
// Create a Title component.
const Title = Component.create\`
    &lt;h1&gt;\$\{self =&gt; self.renderChildren()\}&lt;/h1&gt;
\`;
// Create Main component.
const Main = Component.create\`
    &lt;main&gt;
        \$\{self =&gt; self.renderHeader()\}
    &lt;/main&gt;
\`.extend(\{
    // Render header method.
    // Use \`partial\` to render an HTML template adding children components.
    renderHeader() \{
        return this.partial\`
            &lt;header&gt;
                &lt;\$\{Title\}&gt;\$\{(\{ model \}) =&gt; model.title\}&lt;/\$\{Title\}&gt;
            &lt;/header&gt;
        \`;
    \}
\});
</code></pre>
<p><a name="module_component_markassafehtml" id="module_component_markassafehtml" class="anchor"></a></p>
<h3 id="componentmarkassafehtmlvaluec52c">Component.markAsSafeHTML(value) ⇒ <code>Rasti.SafeHTML</code></h3>
<p>Mark a string as safe HTML to be rendered.<br />
Normally you don't need to use this method, as Rasti will automatically mark string literals 
as safe HTML when the component is <a href="#module_component_create">created</a> and when 
using the <a href="#module_component__partial">Component.partial</a> method.<br />
Be sure that the string is safe to be rendered, as it will be inserted into the DOM without any sanitization.</p>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Rasti.SafeHTML</code> - A safe HTML object.  </p>
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
<td><code>object</code></td>
<td>Object containing methods to be added to the new <code>Component</code> subclass. Also can be a function that receives the parent prototype and returns an object.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_mount" id="module_component_mount" class="anchor"></a></p>
<h3 id="componentmountoptionselhydratec58c">Component.mount(options, el, hydrate) ⇒ <code>Rasti.Component</code></h3>
<p>Mount the component into the dom.
It instantiate the Component view using options, 
appends its element into the DOM (if <code>el</code> is provided).
And returns the view instance.</p>
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
<td>If true, the view will hydrate existing DOM.</td>
</tr>
</tbody>
</table>
<p><a name="module_component_create" id="module_component_create" class="anchor"></a></p>
<h3 id="componentcreatestringsexpressionsc63c">Component.create(strings, …expressions) ⇒ <code>Rasti.Component</code></h3>
<p>Takes a tagged template string or a function that returns another component, and returns a new <code>Component</code> class.</p>
<ul>
<li>The template outer tag and attributes will be used to create the view's root element.</li>
<li>The template inner HTML will be used as the view's template.</li>
</ul>
<pre><code class="javascript language-javascript">  const Button = Component.create\`&lt;button class="button"&gt;Click me&lt;/button&gt;\`;
</code></pre>
<ul>
<li>Template interpolations that are functions will be evaluated during the render process, receiving the view instance as an argument and being bound to it. If the function returns <code>null</code>, <code>undefined</code>, <code>false</code>, or an empty string, the interpolation won't render any content.</li>
</ul>
<pre><code class="javascript language-javascript">  const Button = Component.create\`
      &lt;button class="\$\{(\{ options \}) =&gt; options.className\}"&gt;
          \$\{(\{ options \}) =&gt; options.renderChildren()\}
      &lt;/button&gt;
  \`;
</code></pre>
<ul>
<li>Event handlers should be passed, at the root element as camelized attributes, in the format <code>onEventName=\$\{\{'selector' : listener \}\}</code>. They will be transformed to an event object and delegated to the root element. See <a href="#module_view__delegateevents">View.delegateEvents</a>. </li>
<li>Boolean attributes should be passed in the format <code>attribute="\$\{() =&gt; true\}"</code>. <code>false</code> attributes won't be rendered. <code>true</code> attributes will be rendered without a value.</li>
</ul>
<pre><code class="javascript language-javascript">  const Input = Component.create\`
      &lt;input type="text" disabled=\$\{(\{ options \}) =&gt; options.disabled\} /&gt;
  \`;
</code></pre>
<ul>
<li>If the interpolated function returns a component instance, it will be added as a child component.</li>
<li>If the interpolated function returns an array, each item will be evaluated as above.</li>
</ul>
<pre><code class="javascript language-javascript">  // Create a button component.
  const Button = Component.create\`
      &lt;button class="button"&gt;
          \$\{(\{ options \}) =&gt; options.renderChildren()\}
      &lt;/button&gt;
  \`;
  // Create a navigation component. Add buttons as children. Iterate over items.
  const Navigation = Component.create\`
      &lt;nav&gt;
          \$\{(\{ options \}) =&gt; options.items.map(
              item =&gt; Button.mount(\{ renderChildren: () =&gt; item.label \})
          )\}
      &lt;/nav&gt;
  \`;
  // Create a header component. Add navigation as a child.
  const Header = Component.create\`
      &lt;header&gt;
          \$\{(\{ options \}) =&gt; Navigation.mount(\{ items : options.items\})\}
      &lt;/header&gt;
  \`;
</code></pre>
<ul>
<li>Child components can be added using a component tag.</li>
</ul>
<pre><code class="javascript language-javascript">  // Create a button component.
  const Button = Component.create\`
      &lt;button class="button"&gt;
           \$\{(\{ options \}) =&gt; options.renderChildren()\}
      &lt;/button&gt;
  \`;
  // Create a navigation component. Add buttons as children. Iterate over items.
  const Navigation = Component.create\`
      &lt;nav&gt;
          \$\{(\{ options, partial \}) =&gt; options.items.map(
              item =&gt; partial\`&lt;\$\{Button\}&gt;\$\{item.label\}&lt;/\$\{Button\}&gt;\`
          )\}
      &lt;/nav&gt;
  \`;
  // Create a header component. Add navigation as a child.
  const Header = Component.create\`
      &lt;header&gt;
          &lt;\$\{Navigation\} items="\$\{(\{ options \}) =&gt; options.items\}" /&gt;
      &lt;/header&gt;
  \`;
</code></pre>
<ul>
<li>If the tagged template contains only one expression that mounts a component, or the tags are references to a component, the component will be considered a <b>container</b>. It will render a single component as a child. <code>this.el</code> will be a reference to that child component's element.</li>
</ul>
<pre><code class="javascript language-javascript">  // Create a button component.
  const Button = Component.create\`
      &lt;button class="\$\{(\{ options \}) =&gt; options.className\}"&gt;
          \$\{self =&gt; self.renderChildren()\}
      &lt;/button&gt;
  \`;
  // Create a container that renders a Button component.
  const ButtonOk = Component.create\`
      &lt;\$\{Button\} className="ok"&gt;Ok&lt;/\$\{Button\}&gt;
  \`;
  // Create a container that renders a Button component, using a function.
  const ButtonCancel = Component.create(() =&gt; Button.mount(\{
      className: 'cancel',
      renderChildren: () =&gt; 'Cancel'
  \}));
</code></pre>
<p><strong>Kind</strong>: static method of <a href="#module_component"><code>Component</code></a><br />
<strong>Returns</strong>: <code>Rasti.Component</code> - The newly created component class.  </p>
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
<p><a name="module_emitter__on" id="module_emitter__on" class="anchor"></a></p>
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
<pre><code class="js language-js">// Re render when model changes.
this.model.on('change', this.render.bind(this));
</code></pre>
<p><a name="module_emitter__once" id="module_emitter__once" class="anchor"></a></p>
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
<pre><code class="js language-js">// Log a message once when model changes.
this.model.once('change', () =&gt; console.log('This will happen once'));
</code></pre>
<p><a name="module_emitter__off" id="module_emitter__off" class="anchor"></a></p>
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
<pre><code class="js language-js">// Stop listening to changes.
this.model.off('change');
</code></pre>
<p><a name="module_emitter__emit" id="module_emitter__emit" class="anchor"></a></p>
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
<pre><code class="js language-js">// Emit validation error event.
this.emit('invalid');
</code></pre>
<p><a name="module_model" id="module_model" class="anchor"></a></p>
<h2 id="modelc81c">Model ⇐ <code>Rasti.Emitter</code></h2>
<ul>
<li>Orchestrates data and business logic.</li>
<li>Emits events when data changes.</li>
</ul>
<p>A <code>Model</code> manages an internal table of data attributes and triggers change events when any of its data is modified.<br />
Models may handle syncing data with a persistence layer. To design your models, create atomic, reusable objects 
that contain all the necessary functions for manipulating their specific data.<br />
Models should be easily passed throughout your app and used anywhere the corresponding data is needed.<br />
Rasti models store their attributes in <code>this.attributes</code>, which is extended from <code>this.defaults</code> and the 
constructor <code>attributes</code> parameter. For every attribute, a getter is generated to retrieve the model property 
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
<td>attributes</td>
<td><code>object</code></td>
<td>Object containing model attributes to extend <code>this.attributes</code>. Getters and setters are generated for <code>this.attributes</code>, in order to emit <code>change</code> events.</td>
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
<td>Object containing default attributes for the model. It will extend <code>this.attributes</code>. If a function is passed, it will be called to get the defaults. It will be bound to the model instance.</td>
</tr>
<tr>
<td>previous</td>
<td><code>object</code></td>
<td>Object containing previous attributes when a change occurs.</td>
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
<li><a href="#module_model__preinitialize">.preinitialize(attributes)</a></li>
<li><a href="#module_model__defineattribute">.defineAttribute(key)</a></li>
<li><a href="#module_model__get">.get(key)</a> ⇒ <code>any</code></li>
<li><a href="#module_model__set">.set(key, [value])</a> ⇒ <code>this</code></li>
<li><a href="#module_model__tojson">.toJSON()</a> ⇒ <code>object</code></li></ul></li>
</ul>
<p><a name="module_model__preinitialize" id="module_model__preinitialize" class="anchor"></a></p>
<h3 id="modelpreinitializeattributes">model.preinitialize(attributes)</h3>
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
<td>attributes</td>
<td><code>object</code></td>
<td>Object containing model attributes to extend <code>this.attributes</code>.</td>
</tr>
</tbody>
</table>
<p><a name="module_model__defineattribute" id="module_model__defineattribute" class="anchor"></a></p>
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
<p><a name="module_model__get" id="module_model__get" class="anchor"></a></p>
<h3 id="modelgetkeyc95c">model.get(key) ⇒ <code>any</code></h3>
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
<h3 id="modelsetkeyvaluec99c">model.set(key, [value]) ⇒ <code>this</code></h3>
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
<p><a name="module_model__tojson" id="module_model__tojson" class="anchor"></a></p>
<h3 id="modeltojsonc105c">model.toJSON() ⇒ <code>object</code></h3>
<p>Return object representation of the model to be used for JSON serialization.
By default returns a copy of <code>this.attributes</code>.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_model"><code>Model</code></a><br />
<strong>Returns</strong>: <code>object</code> - Object representation of the model to be used for JSON serialization.<br />
<a name="module_view" id="module_view" class="anchor"></a></p>
<h2 id="viewc108c">View ⇐ <code>Emitter</code></h2>
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
<li><a href="#module_view">View</a> ⇐ <code>Emitter</code><ul>
<li><em>instance</em><ul>
<li><a href="#module_view__preinitialize">.preinitialize(attrs)</a></li>
<li><a href="#module_view__\$">.\$(selector)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__\$\$">.\$\$(selector)</a> ⇒ <code>Array.&lt;node&gt;</code></li>
<li><a href="#module_view__destroy">.destroy(options)</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__ondestroy">.onDestroy(options)</a></li>
<li><a href="#module_view__addchild">.addChild(child)</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__destroychildren">.destroyChildren()</a></li>
<li><a href="#module_view__ensureelement">.ensureElement()</a></li>
<li><a href="#module_view__createelement">.createElement(tag, attributes)</a> ⇒ <code>node</code></li>
<li><a href="#module_view__removeelement">.removeElement()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__delegateevents">.delegateEvents([events])</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__undelegateevents">.undelegateEvents()</a> ⇒ <code>Rasti.View</code></li>
<li><a href="#module_view__render">.render()</a> ⇒ <code>Rasti.View</code></li></ul></li>
<li><em>static</em><ul>
<li><a href="#module_view_sanitize">.sanitize(str)</a> ⇒ <code>string</code></li></ul></li></ul></li>
</ul>
<p><a name="module_view__preinitialize" id="module_view__preinitialize" class="anchor"></a></p>
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
<p><a name="module_view__\$" id="module_view__\$" class="anchor"></a></p>
<h3 id="viewdselectorc134c">view.\$(selector) ⇒ <code>node</code></h3>
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
<h3 id="viewddselectorc138c">view.\$\$(selector) ⇒ <code>Array.&lt;node&gt;</code></h3>
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
<h3 id="viewdestroyoptionsc142c">view.destroy(options) ⇒ <code>Rasti.View</code></h3>
<p>Destroy the view.
Destroy children views if any, undelegate events, stop listening to events, call <code>onDestroy</code> lifecycle method.</p>
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
<h3 id="viewaddchildchildc148c">view.addChild(child) ⇒ <code>Rasti.View</code></h3>
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
<p><a name="module_view__destroychildren" id="module_view__destroychildren" class="anchor"></a></p>
<h3 id="viewdestroychildren">view.destroyChildren()</h3>
<p>Call destroy method on children views.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__ensureelement" id="module_view__ensureelement" class="anchor"></a></p>
<h3 id="viewensureelement">view.ensureElement()</h3>
<p>Ensure that the view has a root element at <code>this.el</code>.
You shouldn't call this method directly. It's called from the constructor.
You may override it if you want to use a different logic or to 
postpone element creation.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<a name="module_view__createelement" id="module_view__createelement" class="anchor"></a></p>
<h3 id="viewcreateelementtagattributesc153c">view.createElement(tag, attributes) ⇒ <code>node</code></h3>
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
<h3 id="viewremoveelementc159c">view.removeElement() ⇒ <code>Rasti.View</code></h3>
<p>Remove <code>this.el</code> from the DOM.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__delegateevents" id="module_view__delegateevents" class="anchor"></a></p>
<h3 id="viewdelegateeventseventsc162c">view.delegateEvents([events]) ⇒ <code>Rasti.View</code></h3>
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
<p>The listeners will be invoked with the event and the view as arguments.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Returns <code>this</code> for chaining.  </p>
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
<pre><code class="js language-js">// Using a function.
class Modal extends View \{
    events() \{
        return \{
            'click button.ok': 'onClickOkButton',
            'click button.cancel': function() \{\}
        \};
    \}
\}

// Using an object.
Modal.prototype.events = \{
    'click button.ok' : 'onClickOkButton',
    'click button.cancel' : function() \{\}
\};
</code></pre>
<p><a name="module_view__undelegateevents" id="module_view__undelegateevents" class="anchor"></a></p>
<h3 id="viewundelegateeventsc166c">view.undelegateEvents() ⇒ <code>Rasti.View</code></h3>
<p>Removes all of the view's delegated events. 
Useful if you want to disable or remove a view from the DOM temporarily. 
Called automatically when the view is destroyed and when <code>delegateEvents</code> is called again.</p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Return <code>this</code> for chaining.<br />
<a name="module_view__render" id="module_view__render" class="anchor"></a></p>
<h3 id="viewrenderc169c">view.render() ⇒ <code>Rasti.View</code></h3>
<p>Renders the view.<br />
This method should be overridden with custom logic.
The only convention is to manipulate the DOM within the scope of <code>this.el</code>,
and to return <code>this</code> for chaining.<br />
If you add any child views, you should call <code>this.destroyChildren</code> before re-rendering.<br />
The default implementation updates <code>this.el</code>'s innerHTML with the result
of calling <code>this.template</code>, passing <code>this.model</code> as the argument.
<br><br> ⚠ <strong>Security Notice:</strong> The default implementation utilizes <code>innerHTML</code>, which may introduce Cross-Site Scripting (XSS) risks.<br />
Ensure that any user-generated content is properly sanitized before inserting it into the DOM. 
You can use the <a href="#module_view_sanitize">View.sanitize</a> static method to escape HTML entities in a string.<br />
For best practices on secure data handling, refer to the 
<a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html">OWASP's XSS Prevention Cheat Sheet</a>.<br><br></p>
<p><strong>Kind</strong>: instance method of <a href="#module_view"><code>View</code></a><br />
<strong>Returns</strong>: <code>Rasti.View</code> - Returns <code>this</code> for chaining.<br />
<a name="module_view_sanitize" id="module_view_sanitize" class="anchor"></a></p>
<h3 id="viewsanitizestrc172c">View.sanitize(str) ⇒ <code>string</code></h3>
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
<td>str</td>
<td><code>string</code></td>
<td>String to escape.</td>
</tr>
</tbody>
</table></section>
        `,{classes:Me}=V({root:{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"var(--rui-spacing-xl) 0 var(--rui-spacing-xxxxl) 0",borderTop:"1px solid rgb(var(--rui-palette-neutral-rgb-foregroundLevel1) / 0.2)",backgroundColor:"var(--rui-palette-neutral-backgroundLevel2)","@global":{a:{color:"var(--rui-palette-neutral-main)",textDecoration:"none","&:visited, &:active":{color:"var(--rui-palette-neutral-main)"},"&:hover":{textDecoration:"underline",color:"var(--rui-palette-neutral-dark)"}}}},text:{color:"var(--rui-palette-neutral-foregroundLevel3)"}}),Ae=C.create`
    <footer class="${Me.root}">
        ${e=>Y.mount({level:"titleMd",className:Me.text,renderChildren:()=>e.partial`Released under the <a href="https://github.com/8tentaculos/rasti/blob/master/LICENSE" target="_blank">MIT License</a>`})}
        ${e=>Y.mount({level:"titleSm",className:Me.text,renderChildren:()=>e.partial`Copyright © ${(()=>{const e=(new Date).getFullYear();return 2018===e?e:`2018-${e}`})()} <a href="https://github.com/8tentaculos" target="_blank">8tentaculos</a>`})}
    </footer>
`,{classes:Ne}=V({"@global":{body:{margin:0,backgroundColor:"var(--rui-palette-neutral-backgroundLevel1)"},"a.anchor, h2":{scrollMarginTop:"var(--rui-app-appBarHeight)"}},root:{}}),Oe=(e="")=>{const t=e.match(/\/([^/]+)\//),n=t?t[1]:e;return["api"].includes(n)?n:""};C.create`
    <div class="${Ne.root}">
        ${e=>xe.mount({handleNavigate:e.navigate.bind(e)})}

        ${({state:e})=>"api"===e.route?Te.mount():[ee.mount(),ne.mount(),Ce.mount(),Re.mount()]}

        ${()=>Ae.mount()}
    </div>
`.extend({preinitialize(e={}){this.state=new u({route:Oe(e.route)}),"undefined"!=typeof window&&(window.history.replaceState({route:this.state.route},""),window.addEventListener("popstate",(e=>{e.state&&(this.state.route=Oe(e.state.route))})))},navigate(e){this.state.route=Oe(e),window.history.pushState({route:this.state.route},"",this.state.route?`/${this.state.route}/`:"/"),document.title=this.getTitle(),window.scrollTo(0,0)},getTitle(){return"Rasti.js"+("api"===this.state.route?" - API Documentation":"")}}).mount({route:window.location.pathname,onRender:t=>{e.highlightAll()}},document.getElementById("root"),!0)})()})();