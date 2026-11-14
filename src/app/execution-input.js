export function installExecutionInput({world,keys,commands,isActive,focus},target=window){
const handler=e=>{if(e.code!=='KeyR'||e.repeat||e.target?.matches?.('input,select,textarea,button')||!isActive())return;e.preventDefault();if(commands.length||world.current.execution)return;if(world.execute()){keys.clear();commands.length=0;focus();}};
target.addEventListener('keydown',handler);return()=>target.removeEventListener('keydown',handler);
}
