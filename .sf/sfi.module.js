import{decorator as oe,withContext as A,defineService as Te}from"@snek-at/function";import*as Ie from"dotenv";import{PrismaClient as je}from"@prisma/client";import{findManyCursorConnection as Ae}from"@devoxa/prisma-relay-cursor-connection";import ae from"twig";import{minify as $e}from"html-minifier";import xe from"isolated-vm";import{requireAdminForResource as $,requireAnyAuth as x,AuthenticationRequiredError as Se}from"@snek-functions/jwt";const k=new je;class S{constructor(e,t){this.instance=e,this.model=t}get=async e=>{const t=await this.instance.findFirst(e);if(!t)throw new Error("Object not found");return new this.model(t)};filter=async e=>(await this.instance.findMany(e)).map(r=>new this.model(r));paginate=async(e,t)=>Ae(async r=>(await this.instance.findMany({...t,...r})).map(n=>new this.model(n)),()=>this.count(t),e);create=async e=>{const t=await this.instance.create(e);return new this.model(t)};update=async e=>{const t=await this.instance.update(e);return new this.model(t)};delete=async e=>{const t=await this.instance.delete(e);return new this.model(t)};upsert=async e=>{const t=await this.instance.upsert(e);return new this.model(t)};count=async e=>await this.instance.count(e)}class N{$save(){}$fetch(){}constructor(){}$boostrap(e,t,r){for(const[i,n]of Object.entries(t)){const o=r.includes(i)?"$"+i:i;e[o]=n}}}class Z extends N{static objects=new S(k.emailTemplate,Z);constructor(e){super();const t=["authorizationUserId","envelopeId","parentId"];this.$boostrap(this,e,t)}id;description;content;verifyReplyTo;transformer;authorizationUser=async()=>this.$authorizationUserId?v.AuthorizationUser.objects.get({where:{id:this.$authorizationUserId}}):null;$authorizationUserId;envelope=async()=>this.$envelopeId?v.EmailEnvelope.objects.get({where:{id:this.$envelopeId}}):null;$envelopeId;parent=async()=>this.$parentId?v.EmailTemplate.objects.get({where:{id:this.$parentId}}):null;$parentId;linked=async()=>v.EmailTemplate.objects.filter({where:{parentId:this.id}});variables=async()=>v.VariableDefinition.objects.filter({where:{emailTemplateId:this.id}});createdBy;resourceId;createdAt;updatedAt}class H extends N{static objects=new S(k.variableDefinition,H);constructor(e){super();const t=["emailTemplateId"];this.$boostrap(this,e,t)}id;name;description;defaultValue;isRequired;isConstant;EmailTemplate=async()=>this.$emailTemplateId?v.EmailTemplate.objects.get({where:{id:this.$emailTemplateId}}):null;$emailTemplateId}class ee extends N{static objects=new S(k.authorizationUser,ee);constructor(e){super();const t=[];this.$boostrap(this,e,t)}id;userId;authorization;EmailTemplate=async()=>v.EmailTemplate.objects.filter({where:{authorizationUserId:this.id}})}class te extends N{static objects=new S(k.emailEnvelope,te);constructor(e){super();const t=["fromId","replyToId"];this.$boostrap(this,e,t)}id;subject;EmailTemplate=async()=>v.EmailTemplate.objects.filter({where:{envelopeId:this.id}});from=async()=>this.$fromId?v.EmailAddress.objects.get({where:{id:this.$fromId}}):null;$fromId;replyTo=async()=>this.$replyToId?v.EmailAddress.objects.get({where:{id:this.$replyToId}}):null;$replyToId;to=async()=>v.EmailAddress.objects.filter({where:{ToEnvelopes:{some:{id:this.id}}}})}class se extends N{static objects=new S(k.emailAddress,se);constructor(e){super();const t=[];this.$boostrap(this,e,t)}id;value;type;ToEnvelopes=async()=>v.EmailEnvelope.objects.filter({where:{to:{some:{id:this.id}}}});FromEnvelopes=async()=>v.EmailEnvelope.objects.filter({where:{fromId:this.id}});ReplyToEnvelopes=async()=>v.EmailEnvelope.objects.filter({where:{replyToId:this.id}})}var Oe=Object.freeze({__proto__:null,AuthorizationUser:ee,EmailAddress:se,EmailEnvelope:te,EmailTemplate:Z,ObjectManager:S,VariableDefinition:H}),v={...Oe};function Ce(s){return typeof s=="object"&&s!==null}function ke(s,e){if(!!!s)throw new Error(e??"Unexpected invariant triggered.")}const Ne=/\r\n|[\n\r]/g;function J(s,e){let t=0,r=1;for(const i of s.body.matchAll(Ne)){if(typeof i.index=="number"||ke(!1),i.index>=e)break;t=i.index+i[0].length,r+=1}return{line:r,column:e+1-t}}function Re(s){return le(s.source,J(s.source,s.start))}function le(s,e){const t=s.locationOffset.column-1,r="".padStart(t)+s.body,i=e.line-1,n=s.locationOffset.line-1,o=e.line+n,a=e.line===1?t:0,l=e.column+a,d=`${s.name}:${o}:${l}
`,c=r.split(/\r\n|[\n\r]/g),u=c[i];if(u.length>120){const m=Math.floor(l/80),h=l%80,p=[];for(let f=0;f<u.length;f+=80)p.push(u.slice(f,f+80));return d+ce([[`${o} |`,p[0]],...p.slice(1,m+1).map(f=>["|",f]),["|","^".padStart(h)],["|",p[m+1]]])}return d+ce([[`${o-1} |`,c[i-1]],[`${o} |`,u],["|","^".padStart(l)],[`${o+1} |`,c[i+1]]])}function ce(s){const e=s.filter(([r,i])=>i!==void 0),t=Math.max(...e.map(([r])=>r.length));return e.map(([r,i])=>r.padStart(t)+(i?" "+i:"")).join(`
`)}function Ue(s){const e=s[0];return e==null||"kind"in e||"length"in e?{nodes:e,source:s[1],positions:s[2],path:s[3],originalError:s[4],extensions:s[5]}:e}class b extends Error{constructor(e,...t){var r,i,n;const{nodes:o,source:a,positions:l,path:d,originalError:c,extensions:u}=Ue(t);super(e),this.name="GraphQLError",this.path=d??void 0,this.originalError=c??void 0,this.nodes=ue(Array.isArray(o)?o:o?[o]:void 0);const m=ue((r=this.nodes)===null||r===void 0?void 0:r.map(p=>p.loc).filter(p=>p!=null));this.source=a??(m==null||(i=m[0])===null||i===void 0?void 0:i.source),this.positions=l??m?.map(p=>p.start),this.locations=l&&a?l.map(p=>J(a,p)):m?.map(p=>J(p.source,p.start));const h=Ce(c?.extensions)?c?.extensions:void 0;this.extensions=(n=u??h)!==null&&n!==void 0?n:Object.create(null),Object.defineProperties(this,{message:{writable:!0,enumerable:!0},name:{enumerable:!1},nodes:{enumerable:!1},source:{enumerable:!1},positions:{enumerable:!1},originalError:{enumerable:!1}}),c!=null&&c.stack?Object.defineProperty(this,"stack",{value:c.stack,writable:!0,configurable:!0}):Error.captureStackTrace?Error.captureStackTrace(this,b):Object.defineProperty(this,"stack",{value:Error().stack,writable:!0,configurable:!0})}get[Symbol.toStringTag](){return"GraphQLError"}toString(){let e=this.message;if(this.nodes)for(const t of this.nodes)t.loc&&(e+=`

`+Re(t.loc));else if(this.source&&this.locations)for(const t of this.locations)e+=`

`+le(this.source,t);return e}toJSON(){const e={message:this.message};return this.locations!=null&&(e.locations=this.locations),this.path!=null&&(e.path=this.path),this.extensions!=null&&Object.keys(this.extensions).length>0&&(e.extensions=this.extensions),e}}function ue(s){return s===void 0||s.length===0?void 0:s}class ze extends b{extensions;constructor(e){const t=`No template found with id ${e}`;super(t),this.extensions={statusCode:404,code:"TEMPLATE_NOT_FOUND",description:"No template was found with the given id"}}}class Pe extends b{extensions;constructor(e){const t=`No envelop found for template ${e}`;super(t),this.extensions={statusCode:404,code:"ENVELOP_NOT_FOUND",description:"No envelop was found for the given template"}}}class de extends b{extensions;constructor(e){const t=`Value for variable "${e}" is required but was not provided`;super(t),this.extensions={statusCode:400,code:"VARIABLE_VALUE_NOT_PROVIDED",description:`A value for the required variable '${e}' was not provided`}}}class Me extends b{extensions;constructor(e){const t=`Variable "${e}" is constant and cannot be provided`;super(t),this.extensions={statusCode:400,code:"VARIABLE_IS_CONSTANT",description:`The variable '${e}' is constant and cannot be provided`}}}ae.extendFilter("format_currency",(s,e)=>new Intl.NumberFormat("de-AT",{style:"currency",currency:e?e[0]:"EUR"}).format(s));class L{static minifyRenderedTemplate(e){return $e(e,{collapseWhitespace:!0,removeComments:!0,removeEmptyAttributes:!0,removeEmptyElements:!0,removeRedundantAttributes:!0,removeScriptTypeAttributes:!0,removeStyleLinkTypeAttributes:!0,useShortDoctype:!0})}static getContext(e,t){const r={};for(const i in e)if(e.hasOwnProperty(i)){const n=e[i];if(n.isConstant&&i in t)throw new Me(i);if(!n.isConstant&&!(i in t)&&n.isRequired)throw new de(i);r[i]=t[i]||n.defaultValue||null}return r}static renderTemplate(e,t={}){const r=ae.twig({data:e.content}),i=L.getContext(e.variables,t),n=r.render(i);return L.minifyRenderedTemplate(n)}templateId;emailTemplate;static render(e,t={}){try{return L.renderTemplate(e,t)}catch(r){throw r instanceof ze||r instanceof Pe||r instanceof de?r:new Error(`Failed to render template: ${r}`)}}}function D(){return D=Object.assign?Object.assign.bind():function(s){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(s[r]=t[r])}return s},D.apply(this,arguments)}var Le=0;function O(s){return"__private_"+Le+++"_"+s}function w(s,e){if(!Object.prototype.hasOwnProperty.call(s,e))throw new TypeError("attempted to use private field on non-instance");return s}function Q(s){const e={},t=new Proxy(s,{get(r,i,n){const o=Reflect.get(r,i,n);return!r.$isTracked||typeof i=="string"&&i.startsWith("$")?o:(typeof i!="string"||i in e||!s.hasOwnProperty(i)&&typeof o!="function"||(e[i]={name:i,args:[]}),typeof o=="function"?function(){const a=arguments[0]||[],l=Object.entries(a).map(([c,u])=>({name:c,value:u})),d=o.apply(this,arguments);if(typeof i=="string"){e[i].isFnAndCalled=!0;for(const c of l)e[i].args.find(u=>u.name===c.name)||e[i].args.push(c)}return d}:o)}});return Object.assign(t,{$trackedProps:e,$isTracked:!0})}function E(s){let e=null,t=Q({});return new Proxy({},{get:(r,i,n)=>(e||(e=new s,t=Q(e),e=t),Reflect.get(e,i,n)),getOwnPropertyDescriptor:(r,i)=>Object.getOwnPropertyDescriptor(e,i),ownKeys:()=>Reflect.ownKeys(e)})}function _(s){let e;return new Proxy([],{get(t,r,i){if(e||(e=Q(new s)),!e||!e.$isTracked||typeof r=="symbol"||r==="length")return Reflect.get(t,r,i);const n=Number(r);return isNaN(n)?Array.prototype.hasOwnProperty(r)?(...o)=>{const a=r;switch(a){case"concat":case"copyWithin":case"fill":case"pop":case"push":case"reverse":case"shift":case"sort":case"splice":case"unshift":case"filter":return Array.prototype[a].call([e],...o),[e];case"entries":case"flatMap":case"forEach":case"keys":case"map":case"slice":case"values":case"every":case"find":case"findIndex":case"includes":case"indexOf":case"lastIndexOf":case"some":case"flat":case"reduce":case"reduceRight":return Array.prototype[a].call([e],...o);case"toLocaleString":case"toString":return Array.prototype[a].call([e]);default:throw new Error(`Unsupported array prototype method: ${a.toString()}`)}}:Reflect.get(t,r,i):e}})}const g=s=>{const e=E(s),t=()=>e;return t.isProxied=!0,t},pe=s=>{const e=_(s),t=()=>e;return t.isProxied=!0,t},me=async s=>{let e={headers:{}};for(const t of s){const r=await t({context:e});r&&(e=r)}return e},he=s=>!(!s||!(typeof s=="function"&&s.isProxied||Array.isArray(s)&&s.length&&s[0].$isTracked||s.$isTracked));class De{constructor(e){this.type=void 0,this.name=void 0,this.fields=void 0,this.type=e.type,this.name=e.name,this.fields=[]}addField(e,t=""){if(e.args=e.args.filter(r=>{const i=typeof r.value;return(i==="string"||i==="number"||i==="boolean"||i==="object"||i==="function"&&r.value.preventStringSerialization)&&r.value!=null}),t){const r=t.split(".");let i=this.fields;for(const n of r){const o=i.find(a=>a.name===n);o&&(o.fields=o.fields||[],i=o.fields)}i.push(e)}else this.fields.push(e)}toString(){const e=t=>t.map(r=>{const i=r.args.map(o=>{if(typeof o.value=="string")return`${o.name}: "${o.value}"`;if(typeof o.value=="function"&&o.value.preventStringSerialization){const a=o.value();if(typeof a=="string")return`${o.name}: ${a}`;if(typeof a=="object")return`${o.name}: ${R(a,!1)}`}else if(typeof o.value=="object")return`${o.name}: ${R(o.value)}`;return`${o.name}: ${o.value}`}).join(", "),n=r.fields?` {__typename ${e(r.fields)}}`:"";return i?`${r.name}(${i})${n}`:`${r.name}${n}`}).join(" ");return`${this.type} ${this.name} {__typename ${e(this.fields)}}`}}function qe(s){const e=()=>s;return e.preventStringSerialization=!0,e}const fe=(s,e)=>{if(s===null)return e;if(s[e]===void 0)throw new Error(`Enum key does not exist in enum: ${e.toString()}`);return qe(e)};function R(s,e=!0){return typeof s=="function"&&s.preventStringSerialization?R(s(),!1):typeof s!="object"?JSON.stringify(s):Array.isArray(s)?e?JSON.stringify(s):`[${s.map(t=>R(t,!1)).join(", ")}]`:`{${Object.keys(s).map(t=>`${t}: ${R(s[t],e)}`).join(", ")}}`}class Fe{constructor(e,t={}){this.url=void 0,this.headers=void 0,this.url=e,this.headers=t}async execute(e){const t=(i=>{const n=[];(({node:a,onPath:l})=>{const d=(c,u=[])=>{const m=Object.entries(c.$trackedProps||{});if(m.length===0){const h=Object.entries(c);for(const[p,f]of h){let y=f;Array.isArray(y)&&(y=y[0]),typeof y=="function"||he(y)||p.startsWith("$")||l(p,u.join("."),[])}}else for(const[h,p]of m){let f=c[h];if((typeof f!="function"||p.isFnAndCalled)&&(p.isFnAndCalled&&(f=c[h]()),Array.isArray(f)&&(f=f[0]),l(h,u.join("."),p.args),he(f))){const y=[...u,h];d(f,y)}}};d(a)})({node:i.node,onPath:(a,l,d)=>{n.push({name:a,path:l,args:d})}});const o=new De({type:i.type,name:i.name});for(const{name:a,path:l,args:d}of n)o.addField({name:a,args:d},l);return o})({type:e.type,name:e.name,node:e.node}).toString();return await(await fetch(this.url,{method:"POST",headers:D({"Content-Type":"application/json"},this.headers),body:JSON.stringify({query:t}),credentials:"include"})).json()}}var U=O("type"),I=O("node"),T=O("context"),z=O("apiURL"),P=O("attempt");class ye{constructor(e){Object.defineProperty(this,U,{writable:!0,value:void 0}),this.name=void 0,Object.defineProperty(this,I,{writable:!0,value:void 0}),Object.defineProperty(this,T,{writable:!0,value:void 0}),Object.defineProperty(this,z,{writable:!0,value:void 0}),Object.defineProperty(this,P,{writable:!0,value:0}),w(this,U)[U]=e.type,this.name=e.name,w(this,I)[I]=e.node,w(this,T)[T]=e.context,w(this,z)[z]=e.apiURL}getContext(){return w(this,T)[T]}setContext(e){w(this,T)[T]=e}getAttempt(){return w(this,P)[P]}async execute(){w(this,P)[P]++;const e=new Fe(w(this,z)[z],w(this,T)[T].headers),{data:t,errors:r}=await e.execute({type:w(this,U)[U],name:this.name,node:w(this,I)[I]});return{data:t?(n=>{const{node:o,data:a}=n,l=(d,c)=>{const u={};if(!c)return null;for(const[m,h]of Object.entries(c)){const p=d[m];if(p===void 0)continue;const f=typeof p=="function";let y=p;f&&(y=p()),Array.isArray(y)&&h?y=h.map((ie,ne)=>y[ne]?l(y[ne],ie):ie):y!==null&&typeof y=="object"?y=l(y,h):y=h,u[m]=f?()=>y:y}return u};return l(o,a)})({node:w(this,I)[I],data:t}):null,errors:r}}}const G=async(s,e)=>{var t;let r,i={data:null,errors:[]};try{i=await s.execute()}catch(o){r=o}if(e&&((t=i)!=null&&t.errors||r)){var n;const o=e?.({forward:a=>G(a),operation:s,graphQLErrors:((n=i)==null?void 0:n.errors)||[],networkError:r});if(o){const a=await o;if(a)return i=a,i}}if(r)throw r;return i},ve=(s,e)=>{const t=async(i,n,o={})=>{const a=s[i];if(!a)throw new Error(`No ${i} operation defined.`);const l=E(a),d=await me(e.middlewares||[]);return d.headers=D({},d.headers,o.headers),n(l),new Promise(async(u,m)=>{try{const h=new ye({apiURL:e.apiURL,type:i==="Query"?"query":"mutation",name:o.name||"SnekQueryOperation",node:l,context:d}),p=await G(h,e.onError);u([n(p.data||l),p.errors])}catch(h){m(h)}})},r=(i,n="Unnamed")=>{const o=s[i];if(!o)throw new Error(`No ${i} operation defined.`);const a=E(o);return[async()=>{const l=await me(e.middlewares||[]),d=new ye({apiURL:e.apiURL,type:i==="Query"?"query":"mutation",name:n,node:a,context:l}),c=await G(d,e.onError);return{data:c.data||a,errors:c.errors}},a]};return{query:async(i,n={})=>t("Query",i,n),mutate:async(i,n={})=>t("Mutation",i,n),lazyQuery:()=>r("Query"),lazyMutation:()=>r("Mutation")}};var j=O("makeKey");class B{constructor(e){Object.defineProperty(this,j,{value:Ve}),this.get=void 0,this.set=void 0,this.remove=void 0,this.get=t=>e.get(w(this,j)[j](t)),this.set=(t,r)=>e.set(w(this,j)[j](t),r),this.remove=t=>e.remove(w(this,j)[j](t))}}function Ve(s){return`${B.KEY}:${s}`}B.KEY="@snek-query:storage",new B({get:s=>Promise.resolve(localStorage.getItem(s)),set:(s,e)=>Promise.resolve(localStorage.setItem(s,e)),remove:s=>Promise.resolve(localStorage.removeItem(s))});var K=(s=>(s.USER_ID="USER_ID",s.EMAIL_ID="EMAIL_ID",s))(K||{});let Je=class{__typename;user;allUser;emailLookup;resource;allResource;userTokenVerify;version;constructor(){this.__typename="",this.user=g(C),this.allUser=pe(C),this.emailLookup=g(Xe),this.resource=g(V),this.allResource=_(V),this.userTokenVerify=g(Ze),this.version=""}};class C{__typename;isActive;id;username;resourceId;accountId;isAdmin;passwordHash;createdAt;email;emails;account;resource;tokens;details;externalCredential;externalCredentials;constructor(){this.__typename="",this.isActive=!1,this.id="",this.username="",this.resourceId="",this.accountId="",this.isAdmin=!1,this.passwordHash="",this.createdAt="",this.email=g(q),this.emails=_(q),this.account=E(Ke),this.resource=E(V),this.tokens=_(We),this.details=E(Ye),this.externalCredential=g(F),this.externalCredentials=_(F)}}class q{__typename;id;emailAddress;resourceId;isPrimary;userId;config;constructor(){this.__typename="",this.id="",this.emailAddress="",this.resourceId="",this.isPrimary=!1,this.userId=null,this.config=E(Qe)}}class Qe{__typename;id;isEnabled;externalCredential;constructor(){this.__typename="",this.id="",this.isEnabled=!1,this.externalCredential=E(F)}}class F{__typename;id;smtp;oauth;constructor(){this.__typename="",this.id="",this.smtp=E(Ge),this.oauth=E(Be)}}class Ge{__typename;host;port;username;password;secure;constructor(){this.__typename="",this.host="",this.port=null,this.username="",this.password="",this.secure=!1}}class Be{__typename;provider;accessToken;refreshToken;constructor(){this.__typename="",this.provider=null,this.accessToken="",this.refreshToken=""}}class Ke{__typename;id;users;constructor(){this.__typename="",this.id="",this.users=_(C)}}class V{__typename;id;name;users;config;secrets;secret;constructor(){this.__typename="",this.id="",this.name="",this.users=_(C),this.config=E(we),this.secrets=_(W),this.secret=g(W)}}class we{__typename;id;value;tag;expiresAt;constructor(){this.__typename="",this.id="",this.value=null,this.tag=null,this.expiresAt=null}}class W{__typename;name;value;expiresAt;constructor(){this.__typename="",this.name="",this.value=null,this.expiresAt=null}}class We{__typename;id;name;expiresAt;constructor(){this.__typename="",this.id="",this.name="",this.expiresAt=null}}class Ye{__typename;firstName;lastName;constructor(){this.__typename="",this.firstName=null,this.lastName=null}}class Xe{__typename;id;emailAddress;isPrimary;userId;constructor(){this.__typename="",this.id="",this.emailAddress="",this.isPrimary=!1,this.userId=null}}class Ze{__typename;type;sub;resourceId;scope;iat;exp;jti;constructor(){this.__typename="",this.type=null,this.sub="",this.resourceId="",this.scope=null,this.iat=null,this.exp=null,this.jti=""}}let He=class{__typename;resourceCreate;userCreate;userUpdate;userDelete;userTokenCreate;userTokenDelete;userEmailCreate;userEmailDelete;userEmailUpdate;userExternalCredentialCreate;secretCreate;genericObjectCreate;deployAuthentication;constructor(){this.__typename="",this.resourceCreate=g(V),this.userCreate=g(et),this.userUpdate=g(C),this.userDelete=()=>!1,this.userTokenCreate=()=>"",this.userTokenDelete=()=>!1,this.userEmailCreate=g(q),this.userEmailDelete=()=>!1,this.userEmailUpdate=g(q),this.userExternalCredentialCreate=g(F),this.secretCreate=g(W),this.genericObjectCreate=g(we),this.deployAuthentication=pe(tt)}};class et{__typename;user;accessToken;constructor(){this.__typename="",this.user=E(C),this.accessToken=""}}class tt{__typename;login;resourceId;userId;constructor(){this.__typename="",this.login="",this.resourceId="",this.userId=""}}const st=process.env.NODE_ENV==="production"?"http://iam:3000/graphql":"https://services.snek.at/iam/graphql",Y=ve({Query:Je,Mutation:He},{apiURL:st});async function ge(s,e){const{value:t,type:r}=s,[i,n]=await Y.query(o=>{const a=o.user({id:e.userId});let l;switch(r){case"EMAIL_ADDRESS":l=a.email({filter:{emailAddress:t}});break;case"EMAIL_ID":l=a.email({filter:{emailId:t}});break;case"USER_ID":l=a.email();break;default:throw new b(`Invalid email type: ${r}`)}return{firstName:a.details?.firstName,lastName:a.details?.lastName,emailAddress:l.emailAddress,config:{id:l.config?.id,isEnabled:l.config?.isEnabled,externalCredential:{id:l.config?.externalCredential?.id,smtp:l.config?.externalCredential?.smtp,oauth:l.config?.externalCredential?.oauth}}}},{headers:{authorization:e.authorization}});if(n)throw console.error(n),new b(n[0].message);return i}async function be(s,e){const{value:t,type:r}=s;if(r==="EMAIL_ADDRESS")return s.value;const[i,n]=await Y.query(o=>{if(r==="USER_ID")return o.emailLookup({id:t,type:fe(K,"USER_ID")})?.emailAddress;if(r==="EMAIL_ID")return o.emailLookup({id:t,type:fe(K,"EMAIL_ID")})?.emailAddress},{headers:{authorization:e.authorization}});if(n)throw console.error(n),new b(n[0].message);if(!i)throw new b("Email not found");return i}async function rt(s,e){const[t,r]=await Y.query(i=>{const n=i.user({id:e.userId});if(s.type==="USER_ID")return n.email().emailAddress;if(s.type==="EMAIL_ID")return n.email({filter:{emailId:s.value}}).emailAddress;if(s.type==="EMAIL_ADDRESS")return n.email({filter:{emailAddress:s.value}}).emailAddress;throw new b("Invalid replyTo type")},{headers:{authorization:e.authorization}});if(r)throw console.error(r),new b(r[0].message)}class it{__typename;version;constructor(){this.__typename="",this.version=""}}class nt{__typename;sendMailSMTP;sendMailAzure;sendMailGoogle;constructor(){this.__typename="",this.sendMailSMTP=g(ot),this.sendMailAzure=()=>null,this.sendMailGoogle=()=>null}}class ot{__typename;accepted;rejected;rejectedErrors;response;envelopeTime;messageTime;messageSize;constructor(){this.__typename="",this.accepted=[],this.rejected=[],this.rejectedErrors=_(at),this.response="",this.envelopeTime=null,this.messageTime=null,this.messageSize=null}}class at{__typename;code;response;responseCode;command;errno;path;syscall;name;message;stack;constructor(){this.__typename="",this.code=null,this.response=null,this.responseCode=null,this.command=null,this.errno=null,this.path=null,this.syscall=null,this.name="",this.message="",this.stack=null}}const lt=process.env.NODE_ENV==="production"?"http://mailer:3000/graphql":"https://services.snek.at/mailer/graphql",X=ve({Query:it,Mutation:nt},{apiURL:lt}),ct=async s=>{const e=s.template.transformer;if(!e)throw new Error("No transformer code");const t=async c=>{const u=await c.envelope();if(u){const m=await u.to(),h=await u.from(),p=await u.replyTo();return{subject:u.subject||void 0,to:m.map(f=>({value:f.value,type:f.type})),from:h?{value:h?.value||void 0,type:h?.type||void 0}:void 0,replyTo:p?{value:p?.value||void 0,type:p?.type||void 0}:void 0}}},r=await t(s.template),i=s.parentTemplate?await t(s.parentTemplate):void 0,n=new xe.Isolate({memoryLimit:128}),o=n.createContextSync(),a=o.global;return a.setSync("global",a.derefInto()),await(await n.compileScript(`
    const template = ${JSON.stringify(s.template)};
    const parentTemplate = ${JSON.stringify(s.parentTemplate)};
  
    const templateEnvelope = ${JSON.stringify(r)};
    const parentTemplateEnvelope = ${JSON.stringify(i)};
    const input = ${JSON.stringify(s.input)};
  
    let result = {
      verifyReplyTo: undefined,
      envelope: {},
    };
    ${e}
    result;
  `)).run(o,{copy:!0})};class ut{async sendMail({envelope:e,body:t,bodyHTML:r,authorizationUser:i}){if(!e.to||e.to.length===0)throw new Error("No to address provided");let n;e.from?n=await ge(e.from,i):n=await ge({type:"USER_ID",value:i.userId},i);const o=await Promise.all(e.to.map(async d=>await be(d,i))),a=e.replyTo?await be(e.replyTo,i):void 0,l=n.config;if(l?.id){if(!l.isEnabled)throw new b("This email address is not enabled for sending emails")}else throw new b("No config found for from address");l.externalCredential.smtp?X.mutate(d=>{d.sendMailSMTP({mailOptions:JSON.parse(JSON.stringify({from:`"${n.firstName} ${n.lastName}" <${n.emailAddress}>`,to:o,replyTo:a,subject:e.subject||"No subject",html:r,text:t})),smtpOptions:{host:l.externalCredential.smtp?.host,port:l.externalCredential.smtp?.port,secure:l.externalCredential.smtp?.secure,user:l.externalCredential.smtp?.username,password:l.externalCredential.smtp?.password}})}):l.externalCredential.oauth&&(l.externalCredential.oauth.provider==="azure"?X.mutate(d=>{d.sendMailAzure({mailOptions:JSON.parse(JSON.stringify({from:`"${n.firstName} ${n.lastName}" <${n.emailAddress}>`,to:o,replyTo:a,subject:e.subject||"No subject",html:r,text:t})),oauthOptions:{accessToken:l.externalCredential.oauth?.accessToken}})}):l.externalCredential.oauth.provider==="google"&&X.mutate(d=>{d.sendMailGoogle({mailOptions:JSON.parse(JSON.stringify({from:`"${n.firstName} ${n.lastName}" <${n.emailAddress}>`,to:o,replyTo:a,subject:e.subject||"No subject",html:r,text:t})),oauthOptions:{accessToken:l.externalCredential.oauth?.accessToken}})}))}}class re{template;authorizationUser;constructor(e){this.template=e.template,this.authorizationUser=e.authorizationUser}async scheduleMail({envelope:e,body:t="",bodyHTML:r,values:i}){if(this.template){const a=await this.template.envelope();if(a){a.subject&&(e.subject=a.subject);const c=await a.from();c&&(e.from=c);const u=await a.to();u.length>0&&(e.to=u);const m=await a.replyTo();m&&(e.replyTo=m)}if(this.template.transformer){const c=await this.template.parent(),u=await ct({input:{envelope:e,values:i||{},body:t,bodyHTML:r},template:this.template,parentTemplate:c});u&&(u.verifyReplyTo!==void 0&&(this.template.verifyReplyTo=u.verifyReplyTo),u.envelope&&(e={...e,...u.envelope}))}const l=await this.template.variables();if(console.log("variables",Object.values(l).reduce((c,u)=>({...c,[u.name]:u}),{}),i),r=L.render({content:this.template.content,variables:Object.values(l).reduce((c,u)=>({...c,[u.name]:u}),{})},i),t="",this.template.verifyReplyTo)if(e.replyTo&&this.authorizationUser)await rt(e.replyTo,this.authorizationUser);else throw new b("Verification of reply to email address failed");const d=await this.template.authorizationUser();d&&(this.authorizationUser=d)}if(!this.authorizationUser)throw new b("No authorization user provided");await new ut().sendMail({envelope:e,body:t,bodyHTML:r,authorizationUser:this.authorizationUser});const o=await this.template?.linked();if(o)for(const a of o)await new re({template:a,authorizationUser:this.authorizationUser}).scheduleMail({envelope:e,body:t,bodyHTML:r,values:i});return"Email scheduled and will be sent shortly"}}const Ee=process.env.MAILPRESS_RESOURCE_ID||"8e111dc0-f6d2-4c95-8b46-abc336b76a14";console.log(`MAILPRESS_RESOURCE_ID: ${Ee}`),oe(async(s,e)=>await $(s,[Ee]));const dt=oe(async(s,e)=>{let t=s;try{t=await x(s,e)}catch(r){if(!(r instanceof Se))throw r}return t});class pt{mailSchedule=A(e=>async(t,r,i,n)=>{const o=e.multiAuth?.[0].userId,a=n?.id?await v.EmailTemplate.objects.get({where:{id:n.id}}):void 0;return await new re({template:a,authorizationUser:o?{userId:o,authorization:e.req.headers.authorization}:void 0}).scheduleMail({envelope:t,body:r,bodyHTML:i,values:n?.values})},{decorators:[dt]})}const mt=new pt;class ht{all=A(e=>async()=>{const{resourceId:t}=e.multiAuth[0];return await $(e,[t]),v.EmailTemplate.objects.filter({where:{resourceId:t}})},{decorators:[x]});get=A(e=>async t=>{const{resourceId:r}=e.multiAuth[0];return await $(e,[r]),v.EmailTemplate.objects.get({where:{id:t,resourceId:r}})},{decorators:[x]});create=A(e=>async t=>{const{userId:r,resourceId:i}=e.multiAuth[0];return await $(e,[i]),v.EmailTemplate.objects.create({data:{createdBy:r,resourceId:i,content:t.content,description:t.description,authorizationUser:t.authorizationUser?{create:{userId:t.authorizationUser.userId,authorization:t.authorizationUser.authorization}}:void 0,variables:t.variables?{createMany:{data:t.variables}}:void 0,envelope:t.envelope?{create:{subject:t.envelope.subject,from:t.envelope.from?{create:{value:t.envelope.from.value,type:t.envelope.from.type}}:void 0,to:{create:t.envelope.to?.map(n=>({value:n.value,type:n.type}))},replyTo:t.envelope.replyTo?{create:{value:t.envelope.replyTo.value,type:t.envelope.replyTo.type}}:void 0}}:void 0}})},{decorators:[x]});update=A(e=>async(t,r)=>{const{resourceId:i}=e.multiAuth[0];return await $(e,[i]),v.EmailTemplate.objects.update({where:{id:t,resourceId:i},data:{content:r.content,description:r.description,transformer:r.transformer,authorizationUser:r.authorizationUser?{upsert:{create:{userId:r.authorizationUser.userId,authorization:r.authorizationUser.authorization},update:{userId:r.authorizationUser.userId,authorization:r.authorizationUser.authorization}}}:void 0,envelope:r.envelope?{create:{subject:r.envelope.subject,from:r.envelope.from?{create:{value:r.envelope.from.value,type:r.envelope.from.type}}:void 0,to:{create:r.envelope.to?.map(n=>({value:n.value,type:n.type}))},replyTo:r.envelope.replyTo?{create:{value:r.envelope.replyTo.value,type:r.envelope.replyTo.type}}:void 0}}:void 0,parent:r.parentId?{connect:{id:r.parentId}}:void 0,linked:{connect:r.linkedIds?.map(n=>({id:n}))},variables:r.variables?{upsert:r.variables.map(n=>({where:{id:n.id||"00000000-0000-0000-0000-000000000000"},create:{name:n.name,isRequired:n.isRequired,isConstant:n.isConstant,description:n.description,defaultValue:n.defaultValue},update:{name:n.name,isRequired:n.isRequired,isConstant:n.isConstant,description:n.description,defaultValue:n.defaultValue}}))}:void 0}})},{decorators:[x]});delete=A(e=>async t=>{const{resourceId:r}=e.multiAuth[0];return await $(e,[r]),v.EmailTemplate.objects.delete({where:{id:t,resourceId:r}})},{decorators:[x]})}const M=new ht;Ie.config();var ft=Te({Query:{template:M.get,allTemplate:M.all},Mutation:{templateCreate:M.create,templateUpdate:M.update,templateDelete:M.delete,mailSchedule:mt.mailSchedule}});export{ft as default};
export const typeDefs = "input undefined {\n\t_ : String\n}\ninput DataInput {\n\tcontent: String!\n\tdescription: String!\n\tauthorizationUser: AuthorizationUserInput\n\tvariables: [VariablesInput!]\n\tenvelope: EnvelopeInput_1\n}\ninput AuthorizationUserInput {\n\tuserId: String!\n\tauthorization: String!\n}\ninput VariablesInput {\n\tname: String!\n\tisRequired: Boolean\n\tisConstant: Boolean\n\tdescription: String\n\tdefaultValue: String\n}\ninput EnvelopeInput_1 {\n\tsubject: String\n\tto: [ToInput!]\n\tfrom: FromInput\n\treplyTo: ReplyToInput\n}\ninput ToInput {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput FromInput {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput ReplyToInput {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput DataInput_1 {\n\tcontent: String\n\tdescription: String\n\ttransformer: String\n\tauthorizationUser: AuthorizationUserInput_1\n\tenvelope: EnvelopeInput_1_2\n\tparentId: String\n\tlinkedIds: [String!]\n\tvariables: [VariablesInput_1!]\n}\ninput AuthorizationUserInput_1 {\n\tuserId: String!\n\tauthorization: String!\n}\ninput EnvelopeInput_1_2 {\n\tsubject: String\n\tto: [ToInput_1!]\n\tfrom: FromInput_1\n\treplyTo: ReplyToInput_1\n}\ninput ToInput_1 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput FromInput_1 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput ReplyToInput_1 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput VariablesInput_1 {\n\tid: String\n\tname: String!\n\tisRequired: Boolean\n\tisConstant: Boolean\n\tdescription: String\n\tdefaultValue: String\n}\ninput EnvelopeInput {\n\tsubject: String\n\tto: [ToInput_1_2!]\n\tfrom: FromInput_1_2\n\treplyTo: ReplyToInput_1_2\n}\ninput ToInput_1_2 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput FromInput_1_2 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput ReplyToInput_1_2 {\n\tvalue: String!\n\ttype: EmailAddressTypeInput!\n}\ninput TemplateInput {\n\tid: String!\n\tvalues: Object\n}\ntype Query {\ntemplate(id: String!): EmailTemplate!\nallTemplate: [EmailTemplate!]!\nversion: String!\n}\ntype EmailTemplate {\nid: String!\ndescription: String!\ncontent: String!\nverifyReplyTo: Boolean\ntransformer: String\nauthorizationUser: AuthorizationUser\nenvelope: EmailEnvelope\nparent: EmailTemplate\nlinked: [EmailTemplate!]!\nvariables: [VariableDefinition!]!\ncreatedBy: String!\nresourceId: String!\n\"\"\"\nEnables basic storage and retrieval of dates and times.\n\"\"\"\ncreatedAt: Date!\n\"\"\"\nEnables basic storage and retrieval of dates and times.\n\"\"\"\nupdatedAt: Date!\n}\ntype AuthorizationUser {\nid: String!\nuserId: String!\nauthorization: String!\nEmailTemplate: [EmailTemplate!]!\n}\ntype EmailEnvelope {\nid: String!\nsubject: String\nEmailTemplate: [EmailTemplate!]!\nfrom: EmailAddress\nreplyTo: EmailAddress\nto: [EmailAddress!]!\n}\ntype EmailAddress {\nid: String!\nvalue: String!\ntype: EmailAddressType!\nToEnvelopes: [EmailEnvelope!]!\nFromEnvelopes: [EmailEnvelope!]!\nReplyToEnvelopes: [EmailEnvelope!]!\n}\ntype VariableDefinition {\nid: String!\nname: String!\ndescription: String\ndefaultValue: String\nisRequired: Boolean\nisConstant: Boolean\nEmailTemplate: EmailTemplate\n}\ntype Mutation {\ntemplateCreate(data: DataInput!): EmailTemplate!\ntemplateUpdate(id: String!, data: DataInput_1!): EmailTemplate!\ntemplateDelete(id: String!): EmailTemplate!\nmailSchedule(envelope: EnvelopeInput!, body: String, bodyHTML: String, template: TemplateInput): String!\n}\nscalar Number\nscalar Any\nscalar Object\nscalar File\nscalar Date\nscalar JSON\nenum EmailAddressType {\n\tEMAIL_ADDRESS\n\tEMAIL_ID\n\tUSER_ID\n}\nenum EmailAddressTypeInput {\n\tEMAIL_ADDRESS\n\tEMAIL_ID\n\tUSER_ID\n}\n";