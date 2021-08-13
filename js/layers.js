function check(id) {
  if (Math.ceil(id/100) <= tmp.p.buyables[13].effect.toNumber()+3 && Math.ceil(id%100) <= tmp.p.buyables[13].effect.toNumber()+3 && player.p.grid[id]) {
    return true
  } else {
    return false
  }
}

function random(seed) {
    let value = seed % 16777216
    var x = Math.tan(value*1000+1);
    x = x / 125
    x = Math.min(Math.sin(x+1) * 16777216, 16777216)
    return x - Math.floor(x);
}

function getColor(layer, id) {
  let value = Math.min(random(Math.sin(getGridData(layer, id).toNumber())), 16777216)
  let string = ("#"+value.toString(16).split('0.')[1])
  string = string.slice(0, -2);
  if (string.length < 7) {
     do {
      string = string + "0"
     }
     while (string.length < 7)
  }
  string = string + "ff"
  return string
}

function critMult() {
    let critMult = new Decimal(5)
    critMult = critMult.add(tmp.rgb.buyables[13].effect)
    return critMult
}
  
function grab(id, crit, explode) {
  if (!tmp.p.grid.getUnlocked(id) && check(id)) return
  if (player.p.grid[id].lt(1)) return
  let chance = Math.random()*100
  let chance2 = Math.random()*100
  if (player.rgb.best.lt(1) && player.p.buyables[11].gte(1)) {
    player.rgb.unlocked = true
  }
  if (chance < tmp.p.buyables[21].effect && crit == true) {
    makeParticles(coolParticle, 2)
    addPoints('p', Decimal.pow(2.5, player.p.grid[id].sub(1)).mul(tmp.p.prestigePointMult).mul(critMult()))
  } else {
    addPoints('p', Decimal.pow(2.5, player.p.grid[id].sub(1)).mul(tmp.p.prestigePointMult))
  }
  if (chance2 < tmp.p.buyables[22].effect && explode == true) {
    makeParticles(coolerParticle, 4)
    let chance3 = Math.random()*100
    if (check(id+1)) {
      grab(id+1, true, false)
    }
    if (check(id-1)) {
      grab(id-1, true, false)
    }
    if (check(id+100)) {
      grab(id+100, true, false)
    }
    if (check(id-100)) {
      grab(id-100, true, false)
    }
    if (chance3 < tmp.rgb.buyables[12].effect) {
      makeParticles(coolerParticle, 8)
      console.log('KABOOM')
      if (check(id+2)) {
        grab(id+2, true, false)
      }
      if (check(id-2)) {
        grab(id-2, true, false)
      }
      if (check(id+200)) {
        grab(id+200, true, false)
      }
      if (check(id-200)) {
        grab(id-200, true, false)
      }
      if (check(id+101)) {
        grab(id+101, true, false)
      }
      if (check(id-101)) {
        grab(id-101, true, false)
      }
      if (check(id+99)) {
        grab(id+99, true, false)
      }
      if (check(id-99)) {
        grab(id-99, true, false)
      }
    }
  }
  player.p.grid[id] = new Decimal(0)
}
  
addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
        harvestCounter: new Decimal(0)
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    grid: {
        maxRows: 9,
        maxCols: 9,
        rows() {
          let rows = 2
          rows += tmp[this.layer].buyables[13].effect.toNumber()
          return rows
        },
        cols() {
          let cols = 2
          cols += tmp[this.layer].buyables[13].effect.toNumber()
          return cols
        },
        getStartData(id) {
            return new Decimal(0)
        },
        getUnlocked(id) { // Default
            return true
        },
        getCanClick(data, id) {
            return player[this.layer].grid[id].gte(1)
        },
        onClick(data, id) { // Don't forget onHold=
            grab(id, true, true)
        },
        getStyle(data, id) {
            if (player[this.layer].grid[id].gte(1)) return {'background-color': getColor(this.layer, id)}
        },
        getTitle(data, id) {
            return data
        },
    },
    buyables: {
            showRespec: false,
            11: {
                title: "Quantum Fluctuations", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(5, x).mul(10)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.2, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 50\n\
                    Squares are produced " + format(data.effect) + "x faster."
                },
                tooltip: 'Gives +20% speed per upgrade',
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(50),
            },
            12: {
                title: "Controlled Fusion", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(7.5, x).mul(7.5)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 50\n\
                    Squares give " + format(data.effect) + "x more prestige points."
                },
                tooltip: 'Gives +50% more prestige points per upgrade',
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(50),
            },
            13: {
                title: "Framework Expansion", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(100, x.pow(2)).mul(100)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(x, 1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 10\n\
                    Gives +" + format(data.effect) + " row and column of squares per upgrade."
                },
                tooltip: 'Gives 1 row and column per upgrade',
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            21: {
                title: "Atomic Burst", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x).mul(5)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    if (x.lte(0)) return new Decimal(0)
                    let eff = Decimal.mul(2, x).add(10)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 15\n\
                    Squares have a " + format(data.effect) + "% chance to give "+format(critMult())+"x more prestige points."
                },
                tooltip: 'Gives a +2% chance per upgrade (Base trigger chance of 10%)',
                unlocked() { return player[this.layer].buyables[13].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(15),
            },
            22: {
                title: "Unstable Reaction", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(6, x).mul(25)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    if (x.lte(0)) return new Decimal(0)
                    let eff = Decimal.mul(1, x).add(5)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 25\n\
                    Harvesting has a " + format(data.effect) + "% chance to also harvest adjacent squares, if possible."
                },
                tooltip: 'Gives a +1% chance per upgrade (Base trigger chance of 5%)',
                unlocked() { return player[this.layer].buyables[13].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(25),
            },
            23: {
                title: "Mega Boost", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x).mul(125)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    if (x.lte(0)) return new Decimal(0)
                    let eff = Decimal.mul(0.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " prestige points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 100\n\
                    Squares have a " + format(data.effect) + "% chance to gain +1 level."
                },
                tooltip: 'Gives a +0.5% chance per upgrade. Triggers whenever a square is tiered up.',
                unlocked() { return player[this.layer].buyables[13].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(100),
            },
    },
    prestigePointMult() {
      let effect = new Decimal(1)
      effect = effect.mul(tmp[this.layer].buyables[12].effect)
      if (player.d.buyables[12].gte(1)) effect = effect.mul(tmp.d.buyables[12].effect.div(100))
      return effect
    },
    harvestRate() {
      let effect = new Decimal(1)
      effect = effect.mul(tmp[this.layer].buyables[11].effect)
      return effect
    },
    update(diff) {
      player[this.layer].harvestCounter = player[this.layer].harvestCounter.add(tmp[this.layer].harvestRate.mul(diff))
      if (player[this.layer].grid) {
        for (var i in player[this.layer].grid) {
          let chance = Math.random()*100
          let chance2 = Math.random()*100
          if (check(i) && player[this.layer].harvestCounter.gte(player[this.layer].grid[i].add(1).pow(2).mul(2+Math.random()*4))) {
            player[this.layer].harvestCounter = player[this.layer].harvestCounter.div((Math.random()*2)+1.5)
            if (chance < tmp.p.buyables[21].effect.toNumber()) {
              if (chance2 < tmp.rgb.buyables[14].effect.toNumber()) {
                player[this.layer].grid[i] = player[this.layer].grid[i].add(3)
              } else {
                player[this.layer].grid[i] = player[this.layer].grid[i].add(2)
              }
            } else {
              player[this.layer].grid[i] = player[this.layer].grid[i].add(1)
            }
          }
        }
      }
    },
    midsection: ["grid", "blank"],
    layerShown(){return true}
})

addLayer("d", {
    name: "dark power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "D", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new Decimal(0),
        harvestCounter: new Decimal(0)
    }},
    color: "#BB6666",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "dark points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(tmp[this.layer].buyables[11].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 'side', // Row the layer is in on the tree (0 is the first row)
    buyables: {
            showRespec: false,
            11: {
                title: "Summoning Circle", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(5, x).mul(10)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.12, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " dark points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 50\n\
                    Dark points are produced " + format(data.effect) + "x faster."
                },
                tooltip: 'Gives +12% speed per upgrade',
                unlocked() { return player[this.layer].best.gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(50),
            },
            12: {
                title: "Controlling Eye", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(25, x).mul(5)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    if (x.lte(0)) return new Decimal(1)
                    let base = Decimal.mul(0.01, x)
                    let eff = Decimal.mul(base, player.d.points).add(100)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " dark points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 125\n\
                    Dark points increase prestige point gain by " + format(data.effect.sub(100)) + "%."
                },
                tooltip: 'Gives +0.01% boost per dark point per upgrade',
                unlocked() { return player[this.layer].best.gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(125),
            },
            13: {
                title: "Mystic Brew", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, x).mul(100)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    if (x.lte(0)) return new Decimal(0)
                    let eff = Decimal.pow(1.2, x).div(6).mul(tmp[this.layer].gainMult)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " dark points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 50\n\
                    You gain "+ format(data.effect)+ " dark points per second while online."
                },
                tooltip: 'Multiplies online dark point gain by 1.2 (base gain of 0.2/s)',
                unlocked() { return player[this.layer].best.gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(50),
            },
    },
    update(diff) {
      addPoints(this.layer, tmp[this.layer].buyables[13].effect.mul(diff))
    },
    midsection: [["display-text", "You produce dark points while offline"], "blank"],
    layerShown(){return true}
})

let colorCycle = ['#FF2400', '#E81D1D', '#E8B71D', '#e3e81d', '#1de840', '#1ddde8', '#2b1de8', '#dd00f3', '#dd00f3']

addLayer("rgb", {
    name: "RGB power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "RGB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		    points: new Decimal(0)
    }},
    color() {
      return colorCycle[Math.floor(Date.now()/250)%9]
    },
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "RGB points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = tmp[this.layer].buyables[11].effect
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    buyables: {
            showRespec: false,
            11: {
                title: "Rainbow Rush", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(5, x).mul(1)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(1.75, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " RGB points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 10\n\
                    Produces " + format(data.effect) + " RGB points per second, up to "+format(tmp[this.layer].getMaxPoints)+" RGB points."
                },
                tooltip: 'Gives +75% speed per upgrade. RGB point cap is based on total RGB upgrades.',
                unlocked() { return player[this.layer].best.gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            12: {
                title: "Explosive Impact", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(2, x).mul(10)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(10, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " RGB points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 10\n\
                    <b>Unstable Impact</b> has a " + format(data.effect) + "% chance to affect much more squares."
                },
                tooltip: 'Gives +10% chance per upgrade',
                unlocked() { return player[this.layer].buyables[11].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            13: {
                title: "Solar Fusion", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(3, x).mul(25)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(0.2, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " RGB points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 20\n\
                    <b>Atomic Burst</b> gains a +" + format(data.effect) + "x multiplier."
                },
                tooltip: 'Gives +0.2x multiplier per upgrade',
                unlocked() { return player[this.layer].buyables[12].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(10),
            },
            14: {
                title: "Ultra Boost", // Optional, displayed at the top in a larger font
                cost(x) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(3, x).mul(10)
                    return cost.floor()
                },
                effect(x) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.mul(3, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " RGB points\n\
                    Amount: " + player[this.layer].buyables[this.id] + " / 15\n\
                    Gives a +" + format(data.effect) + "% chance to add +1 tier to a square that has been affected by <b>Mega Boost</b>."
                },
                tooltip: 'Gives +3% chance per upgrade',
                unlocked() { return player[this.layer].buyables[13].gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
                purchaseLimit: new Decimal(15),
            },
    },
    getMaxPoints() {
      let effect = new Decimal(10)
      effect = effect.add(player[this.layer].buyables[11].mul(10))
      effect = effect.add(player[this.layer].buyables[12].mul(20))
      effect = effect.add(player[this.layer].buyables[13].mul(30))
      effect = effect.add(player[this.layer].buyables[14].mul(40))
      return effect
    },
    update(diff) {
      if (player.rgb.unlocked) {
        if (player[this.layer].points.lt(tmp[this.layer].getMaxPoints)) {
          addPoints(this.layer, tmp[this.layer].gainMult.mul(diff))
          player[this.layer].points = player[this.layer].points.min(tmp[this.layer].getMaxPoints)
        }
      }
    },
    midsection: [["display-text", "Welcome to Rainbow Haven, where all the rainbows are!"], "blank"],
    layerShown(){return player.rgb.best.gte(1) || player.rgb.unlocked},
    branches: ['p']
})



const coolParticle = {
    image:"options_wheel.png",
    spread: 20,
    gravity: 2,
    time: 3,
    rotation (id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 8 
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'p',
}

const coolerParticle = {
    image:"remove.png",
    spread: 40,
    gravity: 0,
    time: 1,
    rotation (id) {
        return 20 * (id - 1.5) + (Math.random() - 0.5) * 10
    },
    dir() {
        return (Math.random() - 0.5) * 10
    },
    speed() {
        return (Math.random() + 1.2) * 12 
    },
    update() {
        //this.width += 1
        //setDir(this, 135)
    },
    layer: 'p',
}