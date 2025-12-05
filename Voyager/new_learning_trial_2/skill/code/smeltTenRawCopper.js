async function smeltTenRawCopper(bot) {
  // Helper function to craft planks from logs using crafting table
  async function craftPlanksFromLog(bot, logName) {
    const plankName = logName.replace('_log', '_planks');
    const craftingTable = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTable) {
      bot.chat("Placing crafting table...");
      const tablePos = bot.entity.position.offset(1, 0, 0);
      await placeItem(bot, "crafting_table", tablePos);
    }
    await craftItem(bot, plankName, 1); // 1 recipe yields 4 planks
  }

  // Step 1: Ensure we have enough fuel
  bot.chat("Checking fuel...");
  const coalCount = bot.inventory.count(mcData.itemsByName.coal.id);
  const plankNames = ["oak_planks", "jungle_planks", "spruce_planks", "birch_planks", "acacia_planks", "dark_oak_planks", "mangrove_planks"];
  let totalPlanks = 0;
  for (const name of plankNames) {
    totalPlanks += bot.inventory.count(mcData.itemsByName[name]?.id || 0);
  }
  // Calculate required fuel: need to smelt 10 items.
  // Coal smelts 8 items each, planks smelt 1.5 each.
  let fuelNeeded = 10;
  let hasEnoughFuel = false;
  if (coalCount >= 1) {
    fuelNeeded -= 8;
    if (fuelNeeded <= 0) hasEnoughFuel = true;
  }
  if (!hasEnoughFuel) {
    // Use planks
    const plankFuel = totalPlanks * 1.5;
    if (plankFuel >= fuelNeeded) hasEnoughFuel = true;
  }
  if (!hasEnoughFuel) {
    bot.chat("Not enough fuel. Getting more fuel...");
    // First, craft jungle_planks from jungle_log if we have one
    const jungleLogCount = bot.inventory.count(mcData.itemsByName.jungle_log.id);
    if (jungleLogCount > 0) {
      bot.chat("Crafting jungle_planks from jungle_log...");
      await craftPlanksFromLog(bot, "jungle_log");
    }
    // Check again for planks
    totalPlanks = 0;
    for (const name of plankNames) {
      totalPlanks += bot.inventory.count(mcData.itemsByName[name]?.id || 0);
    }
    // If still not enough, mine coal ore
    fuelNeeded = 10;
    if (coalCount >= 1) fuelNeeded -= 8;
    if (fuelNeeded > 0) {
      const plankFuel = totalPlanks * 1.5;
      if (plankFuel < fuelNeeded) {
        bot.chat("Need coal. Exploring for coal ore...");
        // Explore for coal ore
        const directions = [new Vec3(0, -1, 0),
        // down
        new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
        const randomIndex = Math.floor(Math.random() * directions.length);
        const direction = directions[randomIndex];
        const coalBlock = await exploreUntil(bot, direction, 60, () => {
          return bot.findBlock({
            matching: mcData.blocksByName["coal_ore"].id,
            maxDistance: 32
          });
        });
        if (coalBlock) {
          bot.chat("Found coal ore. Mining...");
          await mineBlock(bot, "coal_ore", 1);
          bot.chat("Mined coal ore.");
        } else {
          bot.chat("Could not find coal ore. Using available fuel...");
          // We'll try with what we have, but may not smelt all 10.
        }
      }
    }
  }

  // Step 2: Place furnace if not already placed
  bot.chat("Checking for furnace...");
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("Placing furnace...");
    const furnacePos = bot.entity.position.offset(1, 0, 0);
    // Ensure we have a furnace in inventory (we do)
    await placeItem(bot, "furnace", furnacePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
  }

  // Step 3: Smelt 10 raw_copper
  bot.chat("Smelting 10 raw_copper...");
  // We'll smelt in batches using available fuel.
  const rawCopperCount = bot.inventory.count(mcData.itemsByName.raw_copper.id);
  const toSmelt = Math.min(rawCopperCount, 10);
  let smelted = 0;
  while (smelted < toSmelt) {
    // Determine fuel to use: prefer coal, then planks
    let fuelName = null;
    if (bot.inventory.count(mcData.itemsByName.coal.id) > 0) {
      fuelName = "coal";
    } else {
      // Find any planks
      for (const name of plankNames) {
        if (bot.inventory.count(mcData.itemsByName[name]?.id || 0) > 0) {
          fuelName = name;
          break;
        }
      }
    }
    if (!fuelName) {
      bot.chat("No fuel left. Cannot smelt more.");
      break;
    }
    // Smelt one at a time to manage fuel usage
    await smeltItem(bot, "raw_copper", fuelName, 1);
    smelted++;
    bot.chat(`Smelted ${smelted}/${toSmelt} raw_copper.`);
  }

  // Step 4: Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName.copper_ingot.id);
  bot.chat(`Smelting complete. Total copper ingots: ${copperIngotCount}`);
  if (copperIngotCount >= 11) {
    // we started with 1, so 10 more
    bot.chat("Successfully smelted 10 raw copper.");
  } else {
    bot.chat(`Only smelted ${copperIngotCount - 1} raw copper. Need more fuel.`);
  }
}