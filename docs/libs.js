var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=function(status,toThrow){throw toThrow};Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",abort);Module["quit"]=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=function(status){quit(status)}}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=function(title){document.title=title}}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;if(end<=_emscripten_get_heap_size()){HEAP32[DYNAMICTOP_PTR>>2]=end}else{return 0}return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0,"getNativeTypeSize invalid bits "+bits+", type "+type);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var jsCallStartIndex=1;var functionPointers=new Array(0);var funcWrappers={};function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var tempRet0=0;var setTempRet0=function(value){tempRet0=value};var getTempRet0=function(){return tempRet0};var GLOBAL_BASE=8;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}function ccall(ident,returnType,argTypes,args,opts){var toC={"string":function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret},"array":function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string")return UTF8ToString(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble-+(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var ALLOC_NONE=3;var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(u8Array[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=u8Array[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|u8Array[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:y+" ["+x+"]"})}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STACK_BASE=800,DYNAMIC_BASE=5243680,DYNAMICTOP_PTR=544;var TOTAL_STACK=5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var Math_abs=Math.abs;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}var tempDoublePtr=784;function __ZSt18uncaught_exceptionv(){return!!__ZSt18uncaught_exceptionv.uncaught_exception}function ___cxa_free_exception(ptr){try{return _free(ptr)}catch(e){}}var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:function(adjusted){if(!adjusted||EXCEPTIONS.infos[adjusted])return adjusted;for(var key in EXCEPTIONS.infos){var ptr=+key;var adj=EXCEPTIONS.infos[ptr].adjusted;var len=adj.length;for(var i=0;i<len;i++){if(adj[i]===adjusted){return ptr}}}return adjusted},addRef:function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount++},decRef:function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];assert(info.refcount>0);info.refcount--;if(info.refcount===0&&!info.rethrown){if(info.destructor){Module["dynCall_vi"](info.destructor,ptr)}delete EXCEPTIONS.infos[ptr];___cxa_free_exception(ptr)}},clearRef:function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount=0}};function ___resumeException(ptr){if(!EXCEPTIONS.last){EXCEPTIONS.last=ptr}throw ptr}function ___cxa_find_matching_catch(){var thrown=EXCEPTIONS.last;if(!thrown){return(setTempRet0(0),0)|0}var info=EXCEPTIONS.infos[thrown];var throwntype=info.type;if(!throwntype){return(setTempRet0(0),thrown)|0}var typeArray=Array.prototype.slice.call(arguments);var pointer=Module["___cxa_is_pointer_type"](throwntype);if(!___cxa_find_matching_catch.buffer)___cxa_find_matching_catch.buffer=_malloc(4);HEAP32[___cxa_find_matching_catch.buffer>>2]=thrown;thrown=___cxa_find_matching_catch.buffer;for(var i=0;i<typeArray.length;i++){if(typeArray[i]&&Module["___cxa_can_catch"](typeArray[i],throwntype,thrown)){thrown=HEAP32[thrown>>2];info.adjusted.push(thrown);return(setTempRet0(typeArray[i]),thrown)|0}}thrown=HEAP32[thrown>>2];return(setTempRet0(throwntype),thrown)|0}function ___gxx_personality_v0(){}function _emscripten_get_heap_size(){return TOTAL_MEMORY}function abortOnCannotGrowMemory(requestedSize){abort("OOM")}function _emscripten_resize_heap(requestedSize){abortOnCannotGrowMemory(requestedSize)}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest)}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var ASSERTIONS=false;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}var decodeBase64=typeof atob==="function"?atob:function(input){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output};function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}var asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int32Array":Int32Array,"Float32Array":Float32Array,"Float64Array":Float64Array};var asmLibraryArg={"a":abort,"b":setTempRet0,"c":getTempRet0,"d":__ZSt18uncaught_exceptionv,"e":___cxa_find_matching_catch,"f":___cxa_free_exception,"g":___gxx_personality_v0,"h":___resumeException,"i":___setErrNo,"j":_emscripten_get_heap_size,"k":_emscripten_memcpy_big,"l":_emscripten_resize_heap,"m":abortOnCannotGrowMemory,"n":tempDoublePtr,"o":DYNAMICTOP_PTR};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer),b=new global.Int32Array(buffer),c=new global.Float32Array(buffer),d=new global.Float64Array(buffer),e=env.n|0,f=env.o|0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=global.Math.sin,p=env.a,q=env.b,r=env.c,s=env.d,t=env.e,u=env.f,v=env.g,w=env.h,x=env.i,y=env.j,z=env.k,A=env.l,B=env.m,C=800,D=5243680,E=0.0;
// EMSCRIPTEN_START_FUNCS
function G(a){a=a|0;var b=0;b=C;C=C+a|0;C=C+15&-16;return b|0}function H(){return C|0}function I(a){a=a|0;C=a}function J(a,b){a=a|0;b=b|0;C=a;D=b}function K(a){a=+a;var c=0,e=0;c=P(16)|0;e=c;b[e>>2]=0;b[e+4>>2]=0;a=1.0/a*440.0;d[c+8>>3]=a>=1.0?1.0:a;b[2]=c;return}function L(a,e,f){a=a|0;e=e|0;f=f|0;var g=0,h=0.0,i=0.0,j=0,k=0.0;j=b[2]|0;g=(f|0)>0;if(!j){if(!g)return;g=0;do{c[a+(g<<2)>>2]=0.0;c[e+(g<<2)>>2]=0.0;g=g+1|0}while((g|0)!=(f|0));return}if(!g)return;h=+d[j+8>>3];g=0;i=+d[j>>3];do{k=h+i;k=!(k>=1.0)?k:k+-1.0;i=!(k<=-1.0)?k:k+1.0;k=+o(+(i*6.283185307179586));c[a+(g<<2)>>2]=k;c[e+(g<<2)>>2]=k;g=g+1|0}while((g|0)!=(f|0));d[j>>3]=i;return}function M(){return 12}function N(a){a=a|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;w=C;C=C+16|0;n=w;do if(a>>>0<245){k=a>>>0<11?16:a+11&-8;a=k>>>3;m=b[4]|0;d=m>>>a;if(d&3|0){c=(d&1^1)+a|0;a=56+(c<<1<<2)|0;d=a+8|0;e=b[d>>2]|0;f=e+8|0;g=b[f>>2]|0;if((g|0)==(a|0))b[4]=m&~(1<<c);else{b[g+12>>2]=a;b[d>>2]=g}v=c<<3;b[e+4>>2]=v|3;v=e+v+4|0;b[v>>2]=b[v>>2]|1;v=f;C=w;return v|0}l=b[6]|0;if(k>>>0>l>>>0){if(d|0){c=2<<a;c=d<<a&(c|0-c);c=(c&0-c)+-1|0;i=c>>>12&16;c=c>>>i;d=c>>>5&8;c=c>>>d;g=c>>>2&4;c=c>>>g;a=c>>>1&2;c=c>>>a;e=c>>>1&1;e=(d|i|g|a|e)+(c>>>e)|0;c=56+(e<<1<<2)|0;a=c+8|0;g=b[a>>2]|0;i=g+8|0;d=b[i>>2]|0;if((d|0)==(c|0)){a=m&~(1<<e);b[4]=a}else{b[d+12>>2]=c;b[a>>2]=d;a=m}v=e<<3;h=v-k|0;b[g+4>>2]=k|3;f=g+k|0;b[f+4>>2]=h|1;b[g+v>>2]=h;if(l|0){e=b[9]|0;c=l>>>3;d=56+(c<<1<<2)|0;c=1<<c;if(!(a&c)){b[4]=a|c;c=d;a=d+8|0}else{a=d+8|0;c=b[a>>2]|0}b[a>>2]=e;b[c+12>>2]=e;b[e+8>>2]=c;b[e+12>>2]=d}b[6]=h;b[9]=f;v=i;C=w;return v|0}g=b[5]|0;if(g){d=(g&0-g)+-1|0;f=d>>>12&16;d=d>>>f;e=d>>>5&8;d=d>>>e;h=d>>>2&4;d=d>>>h;i=d>>>1&2;d=d>>>i;j=d>>>1&1;j=b[320+((e|f|h|i|j)+(d>>>j)<<2)>>2]|0;d=j;i=j;j=(b[j+4>>2]&-8)-k|0;while(1){a=b[d+16>>2]|0;if(!a){a=b[d+20>>2]|0;if(!a)break}h=(b[a+4>>2]&-8)-k|0;f=h>>>0<j>>>0;d=a;i=f?a:i;j=f?h:j}h=i+k|0;if(h>>>0>i>>>0){f=b[i+24>>2]|0;c=b[i+12>>2]|0;do if((c|0)==(i|0)){a=i+20|0;c=b[a>>2]|0;if(!c){a=i+16|0;c=b[a>>2]|0;if(!c){d=0;break}}while(1){e=c+20|0;d=b[e>>2]|0;if(!d){e=c+16|0;d=b[e>>2]|0;if(!d)break;else{c=d;a=e}}else{c=d;a=e}}b[a>>2]=0;d=c}else{d=b[i+8>>2]|0;b[d+12>>2]=c;b[c+8>>2]=d;d=c}while(0);do if(f|0){c=b[i+28>>2]|0;a=320+(c<<2)|0;if((i|0)==(b[a>>2]|0)){b[a>>2]=d;if(!d){b[5]=g&~(1<<c);break}}else{v=f+16|0;b[((b[v>>2]|0)==(i|0)?v:f+20|0)>>2]=d;if(!d)break}b[d+24>>2]=f;c=b[i+16>>2]|0;if(c|0){b[d+16>>2]=c;b[c+24>>2]=d}c=b[i+20>>2]|0;if(c|0){b[d+20>>2]=c;b[c+24>>2]=d}}while(0);if(j>>>0<16){v=j+k|0;b[i+4>>2]=v|3;v=i+v+4|0;b[v>>2]=b[v>>2]|1}else{b[i+4>>2]=k|3;b[h+4>>2]=j|1;b[h+j>>2]=j;if(l|0){e=b[9]|0;c=l>>>3;d=56+(c<<1<<2)|0;c=1<<c;if(!(c&m)){b[4]=c|m;c=d;a=d+8|0}else{a=d+8|0;c=b[a>>2]|0}b[a>>2]=e;b[c+12>>2]=e;b[e+8>>2]=c;b[e+12>>2]=d}b[6]=j;b[9]=h}v=i+8|0;C=w;return v|0}else m=k}else m=k}else m=k}else if(a>>>0<=4294967231){a=a+11|0;k=a&-8;e=b[5]|0;if(e){f=0-k|0;a=a>>>8;if(a)if(k>>>0>16777215)j=31;else{m=(a+1048320|0)>>>16&8;q=a<<m;i=(q+520192|0)>>>16&4;q=q<<i;j=(q+245760|0)>>>16&2;j=14-(i|m|j)+(q<<j>>>15)|0;j=k>>>(j+7|0)&1|j<<1}else j=0;d=b[320+(j<<2)>>2]|0;a:do if(!d){d=0;a=0;q=61}else{a=0;i=k<<((j|0)==31?0:25-(j>>>1)|0);g=0;while(1){h=(b[d+4>>2]&-8)-k|0;if(h>>>0<f>>>0)if(!h){a=d;f=0;q=65;break a}else{a=d;f=h}q=b[d+20>>2]|0;d=b[d+16+(i>>>31<<2)>>2]|0;g=(q|0)==0|(q|0)==(d|0)?g:q;if(!d){d=g;q=61;break}else i=i<<1}}while(0);if((q|0)==61){if((d|0)==0&(a|0)==0){a=2<<j;a=(a|0-a)&e;if(!a){m=k;break}m=(a&0-a)+-1|0;h=m>>>12&16;m=m>>>h;g=m>>>5&8;m=m>>>g;i=m>>>2&4;m=m>>>i;j=m>>>1&2;m=m>>>j;d=m>>>1&1;a=0;d=b[320+((g|h|i|j|d)+(m>>>d)<<2)>>2]|0}if(!d){i=a;h=f}else q=65}if((q|0)==65){g=d;while(1){m=(b[g+4>>2]&-8)-k|0;d=m>>>0<f>>>0;f=d?m:f;a=d?g:a;d=b[g+16>>2]|0;if(!d)d=b[g+20>>2]|0;if(!d){i=a;h=f;break}else g=d}}if(((i|0)!=0?h>>>0<((b[6]|0)-k|0)>>>0:0)?(l=i+k|0,l>>>0>i>>>0):0){g=b[i+24>>2]|0;c=b[i+12>>2]|0;do if((c|0)==(i|0)){a=i+20|0;c=b[a>>2]|0;if(!c){a=i+16|0;c=b[a>>2]|0;if(!c){c=0;break}}while(1){f=c+20|0;d=b[f>>2]|0;if(!d){f=c+16|0;d=b[f>>2]|0;if(!d)break;else{c=d;a=f}}else{c=d;a=f}}b[a>>2]=0}else{v=b[i+8>>2]|0;b[v+12>>2]=c;b[c+8>>2]=v}while(0);do if(g){a=b[i+28>>2]|0;d=320+(a<<2)|0;if((i|0)==(b[d>>2]|0)){b[d>>2]=c;if(!c){e=e&~(1<<a);b[5]=e;break}}else{v=g+16|0;b[((b[v>>2]|0)==(i|0)?v:g+20|0)>>2]=c;if(!c)break}b[c+24>>2]=g;a=b[i+16>>2]|0;if(a|0){b[c+16>>2]=a;b[a+24>>2]=c}a=b[i+20>>2]|0;if(a){b[c+20>>2]=a;b[a+24>>2]=c}}while(0);b:do if(h>>>0<16){v=h+k|0;b[i+4>>2]=v|3;v=i+v+4|0;b[v>>2]=b[v>>2]|1}else{b[i+4>>2]=k|3;b[l+4>>2]=h|1;b[l+h>>2]=h;c=h>>>3;if(h>>>0<256){d=56+(c<<1<<2)|0;a=b[4]|0;c=1<<c;if(!(a&c)){b[4]=a|c;c=d;a=d+8|0}else{a=d+8|0;c=b[a>>2]|0}b[a>>2]=l;b[c+12>>2]=l;b[l+8>>2]=c;b[l+12>>2]=d;break}c=h>>>8;if(c)if(h>>>0>16777215)d=31;else{u=(c+1048320|0)>>>16&8;v=c<<u;t=(v+520192|0)>>>16&4;v=v<<t;d=(v+245760|0)>>>16&2;d=14-(t|u|d)+(v<<d>>>15)|0;d=h>>>(d+7|0)&1|d<<1}else d=0;c=320+(d<<2)|0;b[l+28>>2]=d;a=l+16|0;b[a+4>>2]=0;b[a>>2]=0;a=1<<d;if(!(e&a)){b[5]=e|a;b[c>>2]=l;b[l+24>>2]=c;b[l+12>>2]=l;b[l+8>>2]=l;break}c=b[c>>2]|0;c:do if((b[c+4>>2]&-8|0)!=(h|0)){e=h<<((d|0)==31?0:25-(d>>>1)|0);while(1){d=c+16+(e>>>31<<2)|0;a=b[d>>2]|0;if(!a)break;if((b[a+4>>2]&-8|0)==(h|0)){c=a;break c}else{e=e<<1;c=a}}b[d>>2]=l;b[l+24>>2]=c;b[l+12>>2]=l;b[l+8>>2]=l;break b}while(0);u=c+8|0;v=b[u>>2]|0;b[v+12>>2]=l;b[u>>2]=l;b[l+8>>2]=v;b[l+12>>2]=c;b[l+24>>2]=0}while(0);v=i+8|0;C=w;return v|0}else m=k}else m=k}else m=-1;while(0);d=b[6]|0;if(d>>>0>=m>>>0){c=d-m|0;a=b[9]|0;if(c>>>0>15){v=a+m|0;b[9]=v;b[6]=c;b[v+4>>2]=c|1;b[a+d>>2]=c;b[a+4>>2]=m|3}else{b[6]=0;b[9]=0;b[a+4>>2]=d|3;v=a+d+4|0;b[v>>2]=b[v>>2]|1}v=a+8|0;C=w;return v|0}h=b[7]|0;if(h>>>0>m>>>0){t=h-m|0;b[7]=t;v=b[10]|0;u=v+m|0;b[10]=u;b[u+4>>2]=t|1;b[v+4>>2]=m|3;v=v+8|0;C=w;return v|0}if(!(b[122]|0)){b[124]=4096;b[123]=4096;b[125]=-1;b[126]=-1;b[127]=0;b[115]=0;b[122]=n&-16^1431655768;a=4096}else a=b[124]|0;i=m+48|0;j=m+47|0;g=a+j|0;f=0-a|0;k=g&f;if(k>>>0<=m>>>0){v=0;C=w;return v|0}a=b[114]|0;if(a|0?(l=b[112]|0,n=l+k|0,n>>>0<=l>>>0|n>>>0>a>>>0):0){v=0;C=w;return v|0}d:do if(!(b[115]&4)){d=b[10]|0;e:do if(d){e=464;while(1){n=b[e>>2]|0;if(n>>>0<=d>>>0?(n+(b[e+4>>2]|0)|0)>>>0>d>>>0:0)break;a=b[e+8>>2]|0;if(!a){q=128;break e}else e=a}c=g-h&f;if(c>>>0<2147483647){a=T(c|0)|0;if((a|0)==((b[e>>2]|0)+(b[e+4>>2]|0)|0)){if((a|0)!=(-1|0)){h=c;g=a;q=145;break d}}else{e=a;q=136}}else c=0}else q=128;while(0);do if((q|0)==128){d=T(0)|0;if((d|0)!=(-1|0)?(c=d,o=b[123]|0,p=o+-1|0,c=((p&c|0)==0?0:(p+c&0-o)-c|0)+k|0,o=b[112]|0,p=c+o|0,c>>>0>m>>>0&c>>>0<2147483647):0){n=b[114]|0;if(n|0?p>>>0<=o>>>0|p>>>0>n>>>0:0){c=0;break}a=T(c|0)|0;if((a|0)==(d|0)){h=c;g=d;q=145;break d}else{e=a;q=136}}else c=0}while(0);do if((q|0)==136){d=0-c|0;if(!(i>>>0>c>>>0&(c>>>0<2147483647&(e|0)!=(-1|0))))if((e|0)==(-1|0)){c=0;break}else{h=c;g=e;q=145;break d}a=b[124]|0;a=j-c+a&0-a;if(a>>>0>=2147483647){h=c;g=e;q=145;break d}if((T(a|0)|0)==(-1|0)){T(d|0)|0;c=0;break}else{h=a+c|0;g=e;q=145;break d}}while(0);b[115]=b[115]|4;q=143}else{c=0;q=143}while(0);if(((q|0)==143?k>>>0<2147483647:0)?(t=T(k|0)|0,p=T(0)|0,r=p-t|0,s=r>>>0>(m+40|0)>>>0,!((t|0)==(-1|0)|s^1|t>>>0<p>>>0&((t|0)!=(-1|0)&(p|0)!=(-1|0))^1)):0){h=s?r:c;g=t;q=145}if((q|0)==145){c=(b[112]|0)+h|0;b[112]=c;if(c>>>0>(b[113]|0)>>>0)b[113]=c;j=b[10]|0;f:do if(j){c=464;while(1){a=b[c>>2]|0;d=b[c+4>>2]|0;if((g|0)==(a+d|0)){q=154;break}e=b[c+8>>2]|0;if(!e)break;else c=e}if(((q|0)==154?(u=c+4|0,(b[c+12>>2]&8|0)==0):0)?g>>>0>j>>>0&a>>>0<=j>>>0:0){b[u>>2]=d+h;v=(b[7]|0)+h|0;t=j+8|0;t=(t&7|0)==0?0:0-t&7;u=j+t|0;t=v-t|0;b[10]=u;b[7]=t;b[u+4>>2]=t|1;b[j+v+4>>2]=40;b[11]=b[126];break}if(g>>>0<(b[8]|0)>>>0)b[8]=g;d=g+h|0;c=464;while(1){if((b[c>>2]|0)==(d|0)){q=162;break}a=b[c+8>>2]|0;if(!a)break;else c=a}if((q|0)==162?(b[c+12>>2]&8|0)==0:0){b[c>>2]=g;l=c+4|0;b[l>>2]=(b[l>>2]|0)+h;l=g+8|0;l=g+((l&7|0)==0?0:0-l&7)|0;c=d+8|0;c=d+((c&7|0)==0?0:0-c&7)|0;k=l+m|0;i=c-l-m|0;b[l+4>>2]=m|3;g:do if((j|0)==(c|0)){v=(b[7]|0)+i|0;b[7]=v;b[10]=k;b[k+4>>2]=v|1}else{if((b[9]|0)==(c|0)){v=(b[6]|0)+i|0;b[6]=v;b[9]=k;b[k+4>>2]=v|1;b[k+v>>2]=v;break}a=b[c+4>>2]|0;if((a&3|0)==1){h=a&-8;e=a>>>3;h:do if(a>>>0<256){a=b[c+8>>2]|0;d=b[c+12>>2]|0;if((d|0)==(a|0)){b[4]=b[4]&~(1<<e);break}else{b[a+12>>2]=d;b[d+8>>2]=a;break}}else{g=b[c+24>>2]|0;a=b[c+12>>2]|0;do if((a|0)==(c|0)){d=c+16|0;e=d+4|0;a=b[e>>2]|0;if(!a){a=b[d>>2]|0;if(!a){a=0;break}}else d=e;while(1){f=a+20|0;e=b[f>>2]|0;if(!e){f=a+16|0;e=b[f>>2]|0;if(!e)break;else{a=e;d=f}}else{a=e;d=f}}b[d>>2]=0}else{v=b[c+8>>2]|0;b[v+12>>2]=a;b[a+8>>2]=v}while(0);if(!g)break;d=b[c+28>>2]|0;e=320+(d<<2)|0;do if((b[e>>2]|0)!=(c|0)){v=g+16|0;b[((b[v>>2]|0)==(c|0)?v:g+20|0)>>2]=a;if(!a)break h}else{b[e>>2]=a;if(a|0)break;b[5]=b[5]&~(1<<d);break h}while(0);b[a+24>>2]=g;d=c+16|0;e=b[d>>2]|0;if(e|0){b[a+16>>2]=e;b[e+24>>2]=a}d=b[d+4>>2]|0;if(!d)break;b[a+20>>2]=d;b[d+24>>2]=a}while(0);c=c+h|0;f=h+i|0}else f=i;c=c+4|0;b[c>>2]=b[c>>2]&-2;b[k+4>>2]=f|1;b[k+f>>2]=f;c=f>>>3;if(f>>>0<256){d=56+(c<<1<<2)|0;a=b[4]|0;c=1<<c;if(!(a&c)){b[4]=a|c;c=d;a=d+8|0}else{a=d+8|0;c=b[a>>2]|0}b[a>>2]=k;b[c+12>>2]=k;b[k+8>>2]=c;b[k+12>>2]=d;break}c=f>>>8;do if(!c)e=0;else{if(f>>>0>16777215){e=31;break}u=(c+1048320|0)>>>16&8;v=c<<u;t=(v+520192|0)>>>16&4;v=v<<t;e=(v+245760|0)>>>16&2;e=14-(t|u|e)+(v<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);c=320+(e<<2)|0;b[k+28>>2]=e;a=k+16|0;b[a+4>>2]=0;b[a>>2]=0;a=b[5]|0;d=1<<e;if(!(a&d)){b[5]=a|d;b[c>>2]=k;b[k+24>>2]=c;b[k+12>>2]=k;b[k+8>>2]=k;break}c=b[c>>2]|0;i:do if((b[c+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=c+16+(e>>>31<<2)|0;a=b[d>>2]|0;if(!a)break;if((b[a+4>>2]&-8|0)==(f|0)){c=a;break i}else{e=e<<1;c=a}}b[d>>2]=k;b[k+24>>2]=c;b[k+12>>2]=k;b[k+8>>2]=k;break g}while(0);u=c+8|0;v=b[u>>2]|0;b[v+12>>2]=k;b[u>>2]=k;b[k+8>>2]=v;b[k+12>>2]=c;b[k+24>>2]=0}while(0);v=l+8|0;C=w;return v|0}c=464;while(1){a=b[c>>2]|0;if(a>>>0<=j>>>0?(v=a+(b[c+4>>2]|0)|0,v>>>0>j>>>0):0)break;c=b[c+8>>2]|0}f=v+-47|0;a=f+8|0;a=f+((a&7|0)==0?0:0-a&7)|0;f=j+16|0;a=a>>>0<f>>>0?j:a;c=a+8|0;d=h+-40|0;t=g+8|0;t=(t&7|0)==0?0:0-t&7;u=g+t|0;t=d-t|0;b[10]=u;b[7]=t;b[u+4>>2]=t|1;b[g+d+4>>2]=40;b[11]=b[126];d=a+4|0;b[d>>2]=27;b[c>>2]=b[116];b[c+4>>2]=b[117];b[c+8>>2]=b[118];b[c+12>>2]=b[119];b[116]=g;b[117]=h;b[119]=0;b[118]=c;c=a+24|0;do{u=c;c=c+4|0;b[c>>2]=7}while((u+8|0)>>>0<v>>>0);if((a|0)!=(j|0)){g=a-j|0;b[d>>2]=b[d>>2]&-2;b[j+4>>2]=g|1;b[a>>2]=g;c=g>>>3;if(g>>>0<256){d=56+(c<<1<<2)|0;a=b[4]|0;c=1<<c;if(!(a&c)){b[4]=a|c;c=d;a=d+8|0}else{a=d+8|0;c=b[a>>2]|0}b[a>>2]=j;b[c+12>>2]=j;b[j+8>>2]=c;b[j+12>>2]=d;break}c=g>>>8;if(c)if(g>>>0>16777215)e=31;else{u=(c+1048320|0)>>>16&8;v=c<<u;t=(v+520192|0)>>>16&4;v=v<<t;e=(v+245760|0)>>>16&2;e=14-(t|u|e)+(v<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=320+(e<<2)|0;b[j+28>>2]=e;b[j+20>>2]=0;b[f>>2]=0;c=b[5]|0;a=1<<e;if(!(c&a)){b[5]=c|a;b[d>>2]=j;b[j+24>>2]=d;b[j+12>>2]=j;b[j+8>>2]=j;break}c=b[d>>2]|0;j:do if((b[c+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=c+16+(e>>>31<<2)|0;a=b[d>>2]|0;if(!a)break;if((b[a+4>>2]&-8|0)==(g|0)){c=a;break j}else{e=e<<1;c=a}}b[d>>2]=j;b[j+24>>2]=c;b[j+12>>2]=j;b[j+8>>2]=j;break f}while(0);u=c+8|0;v=b[u>>2]|0;b[v+12>>2]=j;b[u>>2]=j;b[j+8>>2]=v;b[j+12>>2]=c;b[j+24>>2]=0}}else{v=b[8]|0;if((v|0)==0|g>>>0<v>>>0)b[8]=g;b[116]=g;b[117]=h;b[119]=0;b[13]=b[122];b[12]=-1;b[17]=56;b[16]=56;b[19]=64;b[18]=64;b[21]=72;b[20]=72;b[23]=80;b[22]=80;b[25]=88;b[24]=88;b[27]=96;b[26]=96;b[29]=104;b[28]=104;b[31]=112;b[30]=112;b[33]=120;b[32]=120;b[35]=128;b[34]=128;b[37]=136;b[36]=136;b[39]=144;b[38]=144;b[41]=152;b[40]=152;b[43]=160;b[42]=160;b[45]=168;b[44]=168;b[47]=176;b[46]=176;b[49]=184;b[48]=184;b[51]=192;b[50]=192;b[53]=200;b[52]=200;b[55]=208;b[54]=208;b[57]=216;b[56]=216;b[59]=224;b[58]=224;b[61]=232;b[60]=232;b[63]=240;b[62]=240;b[65]=248;b[64]=248;b[67]=256;b[66]=256;b[69]=264;b[68]=264;b[71]=272;b[70]=272;b[73]=280;b[72]=280;b[75]=288;b[74]=288;b[77]=296;b[76]=296;b[79]=304;b[78]=304;v=h+-40|0;t=g+8|0;t=(t&7|0)==0?0:0-t&7;u=g+t|0;t=v-t|0;b[10]=u;b[7]=t;b[u+4>>2]=t|1;b[g+v+4>>2]=40;b[11]=b[126]}while(0);c=b[7]|0;if(c>>>0>m>>>0){t=c-m|0;b[7]=t;v=b[10]|0;u=v+m|0;b[10]=u;b[u+4>>2]=t|1;b[v+4>>2]=m|3;v=v+8|0;C=w;return v|0}}b[(M()|0)>>2]=12;v=0;C=w;return v|0}function O(a){a=a|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if(!a)return;d=a+-8|0;f=b[8]|0;a=b[a+-4>>2]|0;c=a&-8;j=d+c|0;do if(!(a&1)){e=b[d>>2]|0;if(!(a&3))return;h=d+(0-e)|0;g=e+c|0;if(h>>>0<f>>>0)return;if((b[9]|0)==(h|0)){a=j+4|0;c=b[a>>2]|0;if((c&3|0)!=3){i=h;c=g;break}b[6]=g;b[a>>2]=c&-2;b[h+4>>2]=g|1;b[h+g>>2]=g;return}d=e>>>3;if(e>>>0<256){a=b[h+8>>2]|0;c=b[h+12>>2]|0;if((c|0)==(a|0)){b[4]=b[4]&~(1<<d);i=h;c=g;break}else{b[a+12>>2]=c;b[c+8>>2]=a;i=h;c=g;break}}f=b[h+24>>2]|0;a=b[h+12>>2]|0;do if((a|0)==(h|0)){c=h+16|0;d=c+4|0;a=b[d>>2]|0;if(!a){a=b[c>>2]|0;if(!a){a=0;break}}else c=d;while(1){e=a+20|0;d=b[e>>2]|0;if(!d){e=a+16|0;d=b[e>>2]|0;if(!d)break;else{a=d;c=e}}else{a=d;c=e}}b[c>>2]=0}else{i=b[h+8>>2]|0;b[i+12>>2]=a;b[a+8>>2]=i}while(0);if(f){c=b[h+28>>2]|0;d=320+(c<<2)|0;if((b[d>>2]|0)==(h|0)){b[d>>2]=a;if(!a){b[5]=b[5]&~(1<<c);i=h;c=g;break}}else{i=f+16|0;b[((b[i>>2]|0)==(h|0)?i:f+20|0)>>2]=a;if(!a){i=h;c=g;break}}b[a+24>>2]=f;c=h+16|0;d=b[c>>2]|0;if(d|0){b[a+16>>2]=d;b[d+24>>2]=a}c=b[c+4>>2]|0;if(c){b[a+20>>2]=c;b[c+24>>2]=a;i=h;c=g}else{i=h;c=g}}else{i=h;c=g}}else{i=d;h=d}while(0);if(h>>>0>=j>>>0)return;a=j+4|0;e=b[a>>2]|0;if(!(e&1))return;if(!(e&2)){if((b[10]|0)==(j|0)){j=(b[7]|0)+c|0;b[7]=j;b[10]=i;b[i+4>>2]=j|1;if((i|0)!=(b[9]|0))return;b[9]=0;b[6]=0;return}if((b[9]|0)==(j|0)){j=(b[6]|0)+c|0;b[6]=j;b[9]=h;b[i+4>>2]=j|1;b[h+j>>2]=j;return}f=(e&-8)+c|0;d=e>>>3;do if(e>>>0<256){c=b[j+8>>2]|0;a=b[j+12>>2]|0;if((a|0)==(c|0)){b[4]=b[4]&~(1<<d);break}else{b[c+12>>2]=a;b[a+8>>2]=c;break}}else{g=b[j+24>>2]|0;a=b[j+12>>2]|0;do if((a|0)==(j|0)){c=j+16|0;d=c+4|0;a=b[d>>2]|0;if(!a){a=b[c>>2]|0;if(!a){d=0;break}}else c=d;while(1){e=a+20|0;d=b[e>>2]|0;if(!d){e=a+16|0;d=b[e>>2]|0;if(!d)break;else{a=d;c=e}}else{a=d;c=e}}b[c>>2]=0;d=a}else{d=b[j+8>>2]|0;b[d+12>>2]=a;b[a+8>>2]=d;d=a}while(0);if(g|0){a=b[j+28>>2]|0;c=320+(a<<2)|0;if((b[c>>2]|0)==(j|0)){b[c>>2]=d;if(!d){b[5]=b[5]&~(1<<a);break}}else{e=g+16|0;b[((b[e>>2]|0)==(j|0)?e:g+20|0)>>2]=d;if(!d)break}b[d+24>>2]=g;a=j+16|0;c=b[a>>2]|0;if(c|0){b[d+16>>2]=c;b[c+24>>2]=d}a=b[a+4>>2]|0;if(a|0){b[d+20>>2]=a;b[a+24>>2]=d}}}while(0);b[i+4>>2]=f|1;b[h+f>>2]=f;if((i|0)==(b[9]|0)){b[6]=f;return}}else{b[a>>2]=e&-2;b[i+4>>2]=c|1;b[h+c>>2]=c;f=c}a=f>>>3;if(f>>>0<256){d=56+(a<<1<<2)|0;c=b[4]|0;a=1<<a;if(!(c&a)){b[4]=c|a;a=d;c=d+8|0}else{c=d+8|0;a=b[c>>2]|0}b[c>>2]=i;b[a+12>>2]=i;b[i+8>>2]=a;b[i+12>>2]=d;return}a=f>>>8;if(a)if(f>>>0>16777215)e=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;e=(j+245760|0)>>>16&2;e=14-(g|h|e)+(j<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}else e=0;a=320+(e<<2)|0;b[i+28>>2]=e;b[i+20>>2]=0;b[i+16>>2]=0;c=b[5]|0;d=1<<e;a:do if(!(c&d)){b[5]=c|d;b[a>>2]=i;b[i+24>>2]=a;b[i+12>>2]=i;b[i+8>>2]=i}else{a=b[a>>2]|0;b:do if((b[a+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){d=a+16+(e>>>31<<2)|0;c=b[d>>2]|0;if(!c)break;if((b[c+4>>2]&-8|0)==(f|0)){a=c;break b}else{e=e<<1;a=c}}b[d>>2]=i;b[i+24>>2]=a;b[i+12>>2]=i;b[i+8>>2]=i;break a}while(0);h=a+8|0;j=b[h>>2]|0;b[j+12>>2]=i;b[h>>2]=i;b[i+8>>2]=j;b[i+12>>2]=a;b[i+24>>2]=0}while(0);j=(b[12]|0)+-1|0;b[12]=j;if(j|0)return;a=472;while(1){a=b[a>>2]|0;if(!a)break;else a=a+8|0}b[12]=-1;return}function P(a){a=a|0;var b=0;b=(a|0)==0?1:a;while(1){a=N(b)|0;if(a|0)break;a=Q()|0;if(!a){a=0;break}F[a&0]()}return a|0}function Q(){var a=0;a=b[128]|0;b[128]=a+0;return a|0}function R(c,d,e){c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)>=8192){z(c|0,d|0,e|0)|0;return c|0}h=c|0;g=c+e|0;if((c&3)==(d&3)){while(c&3){if(!e)return h|0;a[c>>0]=a[d>>0]|0;c=c+1|0;d=d+1|0;e=e-1|0}e=g&-4|0;f=e-64|0;while((c|0)<=(f|0)){b[c>>2]=b[d>>2];b[c+4>>2]=b[d+4>>2];b[c+8>>2]=b[d+8>>2];b[c+12>>2]=b[d+12>>2];b[c+16>>2]=b[d+16>>2];b[c+20>>2]=b[d+20>>2];b[c+24>>2]=b[d+24>>2];b[c+28>>2]=b[d+28>>2];b[c+32>>2]=b[d+32>>2];b[c+36>>2]=b[d+36>>2];b[c+40>>2]=b[d+40>>2];b[c+44>>2]=b[d+44>>2];b[c+48>>2]=b[d+48>>2];b[c+52>>2]=b[d+52>>2];b[c+56>>2]=b[d+56>>2];b[c+60>>2]=b[d+60>>2];c=c+64|0;d=d+64|0}while((c|0)<(e|0)){b[c>>2]=b[d>>2];c=c+4|0;d=d+4|0}}else{e=g-4|0;while((c|0)<(e|0)){a[c>>0]=a[d>>0]|0;a[c+1>>0]=a[d+1>>0]|0;a[c+2>>0]=a[d+2>>0]|0;a[c+3>>0]=a[d+3>>0]|0;c=c+4|0;d=d+4|0}}while((c|0)<(g|0)){a[c>>0]=a[d>>0]|0;c=c+1|0;d=d+1|0}return h|0}function S(c,d,e){c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=c+e|0;d=d&255;if((e|0)>=67){while(c&3){a[c>>0]=d;c=c+1|0}f=h&-4|0;i=d|d<<8|d<<16|d<<24;g=f-64|0;while((c|0)<=(g|0)){b[c>>2]=i;b[c+4>>2]=i;b[c+8>>2]=i;b[c+12>>2]=i;b[c+16>>2]=i;b[c+20>>2]=i;b[c+24>>2]=i;b[c+28>>2]=i;b[c+32>>2]=i;b[c+36>>2]=i;b[c+40>>2]=i;b[c+44>>2]=i;b[c+48>>2]=i;b[c+52>>2]=i;b[c+56>>2]=i;b[c+60>>2]=i;c=c+64|0}while((c|0)<(f|0)){b[c>>2]=i;c=c+4|0}}while((c|0)<(h|0)){a[c>>0]=d;c=c+1|0}return h-e|0}function T(a){a=a|0;var c=0,d=0;d=b[f>>2]|0;c=d+a|0;if((a|0)>0&(c|0)<(d|0)|(c|0)<0){B(c|0)|0;x(12);return -1}if((c|0)>(y()|0)?(A(c|0)|0)==0:0){x(12);return -1}b[f>>2]=c;return d|0}function U(a){a=a|0;F[a&0]()}function V(){p(0)}

// EMSCRIPTEN_END_FUNCS
var F=[V];return{___errno_location:M,_free:O,_malloc:N,_memcpy:R,_memset:S,_next:L,_sbrk:T,_setup:K,dynCall_v:U,establishStackSpace:J,stackAlloc:G,stackRestore:I,stackSave:H}})


// EMSCRIPTEN_END_ASM
(asmGlobalArg,asmLibraryArg,buffer);var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _free=Module["_free"]=asm["_free"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memset=Module["_memset"]=asm["_memset"];var _next=Module["_next"]=asm["_next"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var _setup=Module["_setup"]=asm["_setup"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];Module["asm"]=asm;Module["cwrap"]=cwrap;if(memoryInitializer){if(!isDataURI(memoryInitializer)){memoryInitializer=locateFile(memoryInitializer)}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")};var doBrowserLoad=function(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,function(){throw"could not load memory initializer "+memoryInitializer})};var memoryInitializerBytes=tryParseAsDataURI(memoryInitializer);if(memoryInitializerBytes){applyMemoryInitializer(memoryInitializerBytes.buffer)}else if(Module["memoryInitializerRequest"]){var useRequest=function(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){var data=tryParseAsDataURI(Module["memoryInitializerRequestURL"]);if(data){response=data.buffer}else{console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}}applyMemoryInitializer(response)};if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run();

