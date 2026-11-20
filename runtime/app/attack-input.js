export function keyboardAttackKind(event) {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return null;
  if (event.target?.isContentEditable || event.target?.closest?.('input,select,textarea,button,[contenteditable]')) return null;
  if (event.code === 'Digit1' || event.code === 'Numpad1') return 'light';
  if (event.code === 'Digit2' || event.code === 'Numpad2') return 'heavy';
  return null;
}

export function installAttackInput({active,commands,aim,target=window}) {
  const onKeyDown = event => {
    const kind = keyboardAttackKind(event);
    if (!kind || !active()) return;
    event.preventDefault();
    if (commands.length >= 8) return;
    const point = aim();
    commands.push({kind,aim:point ? {...point} : null});
  };
  target.addEventListener('keydown',onKeyDown);
  return () => target.removeEventListener('keydown',onKeyDown);
}
