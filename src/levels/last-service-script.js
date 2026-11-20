const lessons = [
  { id: 'light', room: 'vestibule', title: 'Первый огонь', line: 'Фитили ещё целы. Хватит искры.', instruction: 'Искрами зажги небольшой источник огня.', event: 'small-light-ignited' },
  { id: 'door', room: 'vestibule', title: 'Порог', line: 'Служба не окончена.', instruction: 'Открой дверь в караульную.', event: 'door-opened' },
  { id: 'attack', room: 'guardroom', title: 'Первый удар', line: 'Он поднимет оружие. Не стой перед ним.', instruction: 'Нанеси лёгкий удар по противнику.', event: 'light-hit' },
  { id: 'combo', room: 'guardroom', title: 'Продолжение', line: 'Не останавливай клинок после первого удара.', instruction: 'Отдельные нажатия продолжают серию.', event: 'combo-hit' },
  { id: 'heavy', room: 'guardroom', title: 'Тяжесть железа', line: 'Дай клинку закончить движение.', instruction: 'Попробуй тяжёлый удар. Не стой в окружении.', event: 'heavy-hit' },
  { id: 'dodge', room: 'gallery', title: 'Пепельный рывок', line: 'Не встречай удар неподвижно.', instruction: 'Выбери направление и выполни рывок.', event: 'dodge-started' },
  { id: 'archer', room: 'gallery', title: 'Линия выстрела', line: 'Свет на наконечнике. Сейчас выстрелит.', instruction: 'Укрытие перекрывает линию огня. С неё также можно уйти.', event: 'archer-defeated' },
  { id: 'cancel', room: 'gallery', title: 'Прерванный удар', line: 'Не каждый замах нужно доводить до конца.', instruction: 'При готовом рывке можно прервать свою серию.', event: 'attack-cancelled-by-dodge' },
  { id: 'execution', room: 'sacristy', title: 'Последний уголь', line: 'Он ещё держится.', instruction: 'Добивание доступно только при подходящем состоянии цели. Обычный удар тоже завершит бой.', event: 'execution-started' },
  { id: 'ritual', room: 'sacristy', title: 'Поддержать огонь', line: 'Здесь ещё можно поддержать огонь.', instruction: 'Ритуал восстанавливает ресурс лампы. При полной лампе он не требуется.', event: 'ritual-completed' },
  { id: 'boss', room: 'lower-chapel', title: 'Нижняя часовня', line: 'За этим порогом служба ещё идёт.', instruction: 'После входа проход закроется до победы. Подготовься перед входом.', event: 'golem-defeated' }
];
export const LAST_SERVICE_LESSONS = Object.freeze(lessons.map(Object.freeze));
export const LAST_SERVICE_SCENES = Object.freeze([
  Object.freeze({ id: 'arrival', room: 'porch', cue: 'inspect-order-seal', implementation: 'pending' }),
  Object.freeze({ id: 'first-spark', room: 'vestibule', cue: 'present-lamp-to-wicks', implementation: 'pending' }),
  Object.freeze({ id: 'ledger', room: 'sacristy', cue: 'lean-over-book-with-sword-support', implementation: 'pending' }),
  Object.freeze({ id: 'awakening', room: 'lower-chapel', cue: 'golem-rise-and-hero-recoil', implementation: 'pending' }),
  Object.freeze({ id: 'final-register', room: 'keepers-room', cue: 'lower-lamp-and-close-book', implementation: 'pending' })
]);
export const LAST_SERVICE_RECORDS = Object.freeze([
  'До прибытия посланника огонь не гасить. Покойников из службы не исключать.',
  'Последняя служба проведена в полном составе.',
  'Служба прекращена. Причина молчания не установлена.'
]);
