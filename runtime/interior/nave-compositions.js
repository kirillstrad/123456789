const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export const NAVE_COMPOSITIONS=freeze([
 {
  "id": "last-refuge",
  "name": "THE LAST REFUGE",
  "size": "small",
  "x": 3.5,
  "y": 10.6,
  "items": [
   {
    "instanceId": "nave.interior.last-refuge.01",
    "modelId": "interior.furniture.narrow-cot.a",
    "dx": -0.3,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.last-refuge.02",
    "modelId": "interior.textile.abandoned-cloak.b",
    "dx": 0.85,
    "dy": 0.45,
    "yaw": 20
   },
   {
    "instanceId": "nave.interior.last-refuge.03",
    "modelId": "interior.household.clay-bowl.a",
    "dx": 0.8,
    "dy": -0.7,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.last-refuge.04",
    "modelId": "interior.ritual.candle-stub.b",
    "dx": -0.9,
    "dy": -0.7,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.last-refuge.05",
    "modelId": "interior.remains.desiccated-body.b",
    "dx": -0.25,
    "dy": 0.2,
    "yaw": 0,
    "z": 0.46
   }
  ]
 },
 {
  "id": "interrupted-prayer",
  "name": "INTERRUPTED PRAYER",
  "size": "small",
  "x": 8,
  "y": 4.3,
  "items": [
   {
    "instanceId": "nave.interior.interrupted-prayer.01",
    "modelId": "interior.textile.prayer-mat.a",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-prayer.02",
    "modelId": "interior.ritual.open-prayer-book.a",
    "dx": 0,
    "dy": -0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-prayer.03",
    "modelId": "interior.ritual.fallen-candle.b",
    "dx": 0.75,
    "dy": -0.4,
    "yaw": 35
   },
   {
    "instanceId": "nave.interior.interrupted-prayer.04",
    "modelId": "interior.blood.small-pool.a",
    "dx": -0.8,
    "dy": 0.4,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-prayer.05",
    "modelId": "interior.ritual.wax-drips.a",
    "dx": 0.6,
    "dy": -0.8,
    "yaw": 0
   }
  ]
 },
 {
  "id": "infirmary",
  "name": "THE ABANDONED INFIRMARY",
  "size": "large",
  "x": 5.4,
  "y": 20.7,
  "items": [
   {
    "instanceId": "nave.interior.infirmary.01",
    "modelId": "interior.furniture.narrow-cot.a",
    "dx": -1.6,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.02",
    "modelId": "interior.furniture.broken-bed.b",
    "dx": 1.5,
    "dy": -0.2,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.03",
    "modelId": "interior.remains.shrouded-body.a",
    "dx": -1.6,
    "dy": 0,
    "yaw": 0,
    "z": 0.46
   },
   {
    "instanceId": "nave.interior.infirmary.04",
    "modelId": "interior.textile.empty-shroud.b",
    "dx": 1.5,
    "dy": -0.2,
    "yaw": 0,
    "z": 0.46
   },
   {
    "instanceId": "nave.interior.infirmary.05",
    "modelId": "interior.household.wash-basin.a",
    "dx": 0,
    "dy": -0.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.06",
    "modelId": "interior.household.bandage-bundle.a",
    "dx": -0.4,
    "dy": -1.2,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.07",
    "modelId": "interior.household.dirty-bucket.a",
    "dx": 0.6,
    "dy": 0.7,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.08",
    "modelId": "interior.textile.bandage-strips.b",
    "dx": 0,
    "dy": 1.1,
    "yaw": 20
   },
   {
    "instanceId": "nave.interior.infirmary.09",
    "modelId": "interior.blood.washed-blood.a",
    "dx": 0.3,
    "dy": 1.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.10",
    "modelId": "interior.writing.loose-pages.a",
    "dx": -0.3,
    "dy": 2,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.infirmary.11",
    "modelId": "interior.household.cleaning-rags.b",
    "dx": 1,
    "dy": 1.3,
    "yaw": 0
   }
  ]
 },
 {
  "id": "gate-trail",
  "name": "TRACKS TOWARD THE GATE",
  "size": "elongated",
  "x": 16,
  "y": 5.9,
  "items": [
   {
    "instanceId": "nave.interior.gate-trail.01",
    "modelId": "interior.blood.drag-trail.b",
    "dx": 0,
    "dy": 0,
    "yaw": 90
   },
   {
    "instanceId": "nave.interior.gate-trail.02",
    "modelId": "interior.remains.body-at-door.b",
    "dx": 0.1,
    "dy": -1.6,
    "yaw": 90
   },
   {
    "instanceId": "nave.interior.gate-trail.03",
    "modelId": "interior.textile.crumpled-carpet.b",
    "dx": -1,
    "dy": 0.8,
    "yaw": 90
   },
   {
    "instanceId": "nave.interior.gate-trail.04",
    "modelId": "interior.household.key-ring.a",
    "dx": 0.85,
    "dy": -0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.gate-trail.05",
    "modelId": "interior.blood.blood-drops.a",
    "dx": 1,
    "dy": -0.25,
    "yaw": 90
   }
  ]
 },
 {
  "id": "plundered-niche",
  "name": "THE PLUNDERED NICHE",
  "size": "medium",
  "x": 13.8,
  "y": 19.8,
  "items": [
   {
    "instanceId": "nave.interior.plundered-niche.01",
    "modelId": "interior.remains.burial-niche.a",
    "dx": 0,
    "dy": 0.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.plundered-niche.02",
    "modelId": "interior.ritual.iron-reliquary.b",
    "dx": -0.3,
    "dy": -0.7,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.plundered-niche.03",
    "modelId": "interior.ritual.broken-seal.a",
    "dx": 0.6,
    "dy": -0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.plundered-niche.04",
    "modelId": "interior.textile.rag-pile.b",
    "dx": -1.1,
    "dy": -0.6,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.plundered-niche.05",
    "modelId": "interior.ruin.cornice-fragment.b",
    "dx": 1.1,
    "dy": -0.5,
    "yaw": 15
   },
   {
    "instanceId": "nave.interior.plundered-niche.06",
    "modelId": "interior.ritual.scattered-coins.a",
    "dx": 0.1,
    "dy": -1.3,
    "yaw": 0
   }
  ]
 },
 {
  "id": "forgotten-burial",
  "name": "THE FORGOTTEN BURIAL",
  "size": "medium",
  "x": 9.8,
  "y": 23.1,
  "items": [
   {
    "instanceId": "nave.interior.forgotten-burial.01",
    "modelId": "interior.remains.covered-stretcher.b",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.forgotten-burial.02",
    "modelId": "interior.ritual.candle-group.b",
    "dx": -0.95,
    "dy": -0.4,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.forgotten-burial.03",
    "modelId": "interior.ritual.candle-stub.b",
    "dx": 0.9,
    "dy": 0.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.forgotten-burial.04",
    "modelId": "interior.ritual.dried-flowers.b",
    "dx": 0.8,
    "dy": -0.6,
    "yaw": 30
   },
   {
    "instanceId": "nave.interior.forgotten-burial.05",
    "modelId": "interior.textile.empty-shroud.b",
    "dx": -1,
    "dy": -0.6,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.forgotten-burial.06",
    "modelId": "interior.ruin.cracked-tile.a",
    "dx": 0.9,
    "dy": 1,
    "yaw": 0
   }
  ]
 },
 {
  "id": "hurried-departure",
  "name": "A HURRIED DEPARTURE",
  "size": "medium",
  "x": 15.4,
  "y": 12.8,
  "items": [
   {
    "instanceId": "nave.interior.hurried-departure.01",
    "modelId": "interior.storage.open-chest.b",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.hurried-departure.02",
    "modelId": "interior.furniture.upturned-stool.b",
    "dx": -1,
    "dy": -0.7,
    "yaw": 45
   },
   {
    "instanceId": "nave.interior.hurried-departure.03",
    "modelId": "interior.textile.abandoned-shirt.b",
    "dx": 0.9,
    "dy": 0.6,
    "yaw": 35
   },
   {
    "instanceId": "nave.interior.hurried-departure.04",
    "modelId": "interior.textile.fallen-banner.b",
    "dx": 0.2,
    "dy": 1.8,
    "yaw": 90
   },
   {
    "instanceId": "nave.interior.hurried-departure.05",
    "modelId": "interior.storage.empty-basket.a",
    "dx": 1.3,
    "dy": -0.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.hurried-departure.06",
    "modelId": "interior.household.single-shoe.a",
    "dx": -0.6,
    "dy": 0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.hurried-departure.07",
    "modelId": "interior.writing.scroll-case.a",
    "dx": 0.9,
    "dy": -1,
    "yaw": 20
   }
  ]
 },
 {
  "id": "burnt-corner",
  "name": "THE BURNT CORNER",
  "size": "large",
  "x": 12.7,
  "y": 16.9,
  "items": [
   {
    "instanceId": "nave.interior.burnt-corner.01",
    "modelId": "interior.decay.fire-scorch.b",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.burnt-corner.02",
    "modelId": "interior.furniture.broken-bed.b",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.burnt-corner.03",
    "modelId": "interior.remains.charred-remains.b",
    "dx": 0,
    "dy": 0,
    "yaw": 0,
    "z": 0.46
   },
   {
    "instanceId": "nave.interior.burnt-corner.04",
    "modelId": "interior.decay.ash-pile.a",
    "dx": -0.8,
    "dy": 1,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.burnt-corner.05",
    "modelId": "interior.ruin.wood-splinters.b",
    "dx": 0.8,
    "dy": 1.1,
    "yaw": 25
   },
   {
    "instanceId": "nave.interior.burnt-corner.06",
    "modelId": "interior.ritual.burnt-pages.b",
    "dx": 1,
    "dy": -0.6,
    "yaw": 10
   },
   {
    "instanceId": "nave.interior.burnt-corner.07",
    "modelId": "interior.ritual.fallen-censer.b",
    "dx": -0.9,
    "dy": -0.8,
    "yaw": 0
   }
  ]
 },
 {
  "id": "empty-refectory",
  "name": "THE EMPTY REFECTORY",
  "size": "large",
  "x": 15.3,
  "y": 23.3,
  "items": [
   {
    "instanceId": "nave.interior.empty-refectory.01",
    "modelId": "interior.furniture.refectory-table.a",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.empty-refectory.02",
    "modelId": "interior.furniture.split-bench.b",
    "dx": 0,
    "dy": -1.35,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.empty-refectory.03",
    "modelId": "interior.furniture.stone-bench.a",
    "dx": 0,
    "dy": 1.2,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.empty-refectory.04",
    "modelId": "interior.household.broken-plate.a",
    "dx": -1.7,
    "dy": -0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.empty-refectory.05",
    "modelId": "interior.household.clay-jug.a",
    "dx": 1.5,
    "dy": -1,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.empty-refectory.06",
    "modelId": "interior.storage.sack-pile.b",
    "dx": 2.6,
    "dy": 0.4,
    "yaw": 15
   },
   {
    "instanceId": "nave.interior.empty-refectory.07",
    "modelId": "interior.textile.runner.b",
    "dx": -0.5,
    "dy": 0,
    "yaw": 90
   },
   {
    "instanceId": "nave.interior.empty-refectory.08",
    "modelId": "interior.household.metal-tray.a",
    "dx": -0.6,
    "dy": 0,
    "yaw": 0,
    "z": 0.98
   },
   {
    "instanceId": "nave.interior.empty-refectory.09",
    "modelId": "interior.writing.fallen-book.b",
    "dx": 1.8,
    "dy": 0.9,
    "yaw": 25
   }
  ]
 },
 {
  "id": "interrupted-rite",
  "name": "THE INTERRUPTED RITE",
  "size": "large",
  "x": 8.8,
  "y": 17.5,
  "items": [
   {
    "instanceId": "nave.interior.interrupted-rite.01",
    "modelId": "interior.ritual.ritual-circle.a",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.02",
    "modelId": "interior.ritual.ritual-cup.a",
    "dx": 0,
    "dy": 0,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.03",
    "modelId": "interior.ritual.floor-censer.b",
    "dx": -1.25,
    "dy": -0.8,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.04",
    "modelId": "interior.ritual.ash-offering.a",
    "dx": 1,
    "dy": -0.7,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.05",
    "modelId": "interior.ritual.tied-offering.a",
    "dx": 1,
    "dy": 1,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.06",
    "modelId": "interior.ritual.candle-group.b",
    "dx": -0.9,
    "dy": 1,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.07",
    "modelId": "interior.ritual.burnt-pages.b",
    "dx": 0.2,
    "dy": 1.5,
    "yaw": 0
   },
   {
    "instanceId": "nave.interior.interrupted-rite.08",
    "modelId": "interior.blood.blood-soaked-cloth.b",
    "dx": -1.2,
    "dy": 0,
    "yaw": 0
   }
  ]
 }
]);
export const NAVE_INTERIOR_LIMITS=freeze({minX:1.7,maxX:43.3,minY:1.7,maxY:25.3});
// Keep the old fight, NPCs and all ritual-bonfire candidate positions untouched.
export const NAVE_INTERIOR_PROTECTED=freeze([
 {id:'combat-and-relic-core',minX:5.6,maxX:11.6,minY:6.3,maxY:14.7},
 {id:'door-light-and-candle-rows',minX:18.9,maxX:42.5,minY:1.3,maxY:25.3},
]);
export function naveInteriorPlacements(){return NAVE_COMPOSITIONS.flatMap(c=>c.items.map(item=>({
 instanceId:item.instanceId,compositionId:c.id,modelId:item.modelId,
 x:c.x+item.dx,y:c.y+item.dy,z:item.z??0,yaw:item.yaw,
 interaction:{type:'none',prompt:null},
})));}
