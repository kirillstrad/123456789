import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {portableBundle,inlineScript} from '../tools/portable-last-service.mjs';
test('portable bundle resolves relative imports and ignores unused modules',()=>{
 const code=portableBundle([{id:'app/last-service.js',code:"globalThis.answer=require('../game/value.js').n;",dependencies:['../game/value.js']},{id:'game/value.js',code:'exports.n=42;',dependencies:[]},{id:'unused.js',code:'invalid JS !',dependencies:[]}]);const box={};vm.runInNewContext(code,box);assert.equal(box.answer,42);
});
test('missing and external dependencies fail during packaging',()=>{assert.throws(()=>portableBundle([{id:'app/last-service.js',code:'',dependencies:['./missing.js']}]));assert.throws(()=>portableBundle([{id:'app/last-service.js',code:'',dependencies:['node:fs']}]));});
test('invalid generated JS is not written as a successful bundle',()=>{assert.throws(()=>portableBundle([{id:'app/last-service.js',code:'not JS !',dependencies:[]}]));});
test('script closing text cannot truncate portable HTML',()=>{const html=inlineScript('globalThis.text="</script>";');assert.equal((html.match(/<\/script>/gi)??[]).length,1);assert.ok(html.includes('<\\/script>'));});
