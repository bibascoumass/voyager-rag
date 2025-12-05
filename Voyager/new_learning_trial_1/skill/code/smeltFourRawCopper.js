async function smeltFourRawCopper(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return item ? bot.inventory.count(item.id) : 0;
  }
  const copperIngotCount = countItem("copper_ingot");
  if (copperIngotCount >= 4) {
    bot.chat("Already have at least 4 copper ingots.");
    return;
  }
  const rawCopperCount = countItem("raw_copper");
  const neededRawCopper = 4 - copperIngotCount;
  bot.chat(`Need to smelt ${neededRawCopper} more raw copper. Currently have ${rawCopperCount} raw copper.`);

  // If we don't have enough raw copper, we need to mine more.
  if (rawCopperCount < neededRawCopper) {
    const toMine = neededRawCopper - rawCopperCount;
    bot.chat(`Need to mine ${toMine} copper ore.`);
    // Ensure we have a pickaxe that can mine copper (stone or better)
    const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
    let pickaxeItem = null;
    for (const name of pickaxeNames) {
      const item = mcData.itemsByName[name];
      if (item && bot.inventory.count(item.id) > 0) {
        pickaxeItem = item;
        break;
      }
    }
    if (!pickaxeItem) {
      bot.chat("No suitable pickaxe (stone or better) found.");
      return;
    }
    // Equip pickaxe
    const pickaxe = bot.inventory.findInventoryItem(pickaxeItem.id);
    if (pickaxe) await bot.equip(pickaxe, "hand");
    for (let i = 0; i < toMine; i++) {
      let copperOreBlock = bot.findBlock({
        matching: mcData.blocksByName.copper_ore.id,
        maxDistance: 32
      });
      if (!copperOreBlock) {
        bot.chat("Exploring for copper ore...");
        const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, -1, 0)];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        copperOreBlock = await exploreUntil(bot, randomDir, 60, () => {
          return bot.findBlock({
            matching: mcData.blocksByName.copper_ore.id,
            maxDistance: 32
          });
        });
        if (!copperOreBlock) {
          bot.chat("Could not find copper ore.");
          return;
        }
      }
      await mineBlock(bot, "copper_ore", 1);
    }
    bot.chat(`Mined ${toMine} copper ore.`);
  }

  // Ensure we have a furnace placed
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    // Check if we have a furnace item
    if (countItem("furnace") === 0) {
      bot.chat("Crafting a furnace...");
      // Need 8 cobblestone
      const cobblestoneCount = countItem("cobblestone");
      if (cobblestoneCount < 8) {
        bot.chat(`Not enough cobblestone (have ${cobblestoneCount}, need 8).`);
        return;
      }
      // Ensure crafting table is placed
      let craftingTableBlock = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 32
      });
      if (!craftingTableBlock) {
        bot.chat("Placing crafting table...");
        const placePos = bot.entity.position.offset(1, 0, 0);
        await placeItem(bot, "crafting_table", placePos);
        craftingTableBlock = bot.findBlock({
          matching: mcData.blocksByName.crafting_table.id,
          maxDistance: 32
        });
        if (!craftingTableBlock) {
          bot.chat("Failed to place crafting table.");
          return;
        }
      }
      // Craft furnace
      await craftItem(bot, "furnace", 1);
      bot.chat("Furnace crafted.");
    }
    // Now place the furnace
    bot.chat("Placing furnace...");
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", placePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("Failed to place furnace.");
      return;
    }
  }

  // Ensure we have fuel
  const fuelNeeded = neededRawCopper;
  let coalCount = countItem("coal");
  let oakPlanksCount = countItem("oak_planks");
  let oakLogCount = countItem("oak_log");
  let totalFuel = coalCount + oakPlanksCount + oakLogCount;
  if (totalFuel < fuelNeeded) {
    bot.chat(`Need ${fuelNeeded} fuel, but only have ${totalFuel}. Getting more fuel...`);
    // Try to mine coal ore
    const coalNeeded = fuelNeeded - totalFuel;
    for (let i = 0; i < coalNeeded; i++) {
      let coalOreBlock = bot.findBlock({
        matching: mcData.blocksByName.coal_ore.id,
        maxDistance: 32
      });
      if (!coalOreBlock) {
        bot.chat("Exploring for coal ore...");
        const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, -1, 0)];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        coalOreBlock = await exploreUntil(bot, randomDir, 60, () => {
          return bot.findBlock({
            matching: mcData.blocksByName.coal_ore.id,
            maxDistance: 32
          });
        });
        if (!coalOreBlock) {
          bot.chat("Could not find coal ore.");
          break;
        }
      }
      await mineBlock(bot, "coal_ore", 1);
    }
    // Update fuel counts
    coalCount = countItem("coal");
    oakPlanksCount = countItem("oak_planks");
    oakLogCount = countItem("oak_log");
    totalFuel = coalCount + oakPlanksCount + oakLogCount;
  }
  if (totalFuel < fuelNeeded) {
    bot.chat(`Not enough fuel. Have ${totalFuel}, need ${fuelNeeded}.`);
    return;
  }

  // Smelt the raw copper
  bot.chat(`Smelting ${neededRawCopper} raw copper...`);
  let smelted = 0;
  while (smelted < neededRawCopper) {
    if (coalCount > 0) {
      await smeltItem(bot, "raw_copper", "coal", 1);
      coalCount--;
      smelted++;
    } else if (oakPlanksCount > 0) {
      await smeltItem(bot, "raw_copper", "oak_planks", 1);
      oakPlanksCount--;
      smelted++;
    } else if (oakLogCount > 0) {
      await smeltItem(bot, "raw_copper", "oak_log", 1);
      oakLogCount--;
      smelted++;
    } else {
      bot.chat("Ran out of fuel.");
      break;
    }
  }

  // Verify
  const finalCopperIngots = countItem("copper_ingot");
  if (finalCopperIngots >= 4) {
    bot.chat(`Successfully smelted 4 raw copper into ${finalCopperIngots} copper ingots.`);
  } else {
    bot.chat(`Only have ${finalCopperIngots} copper ingots, need 4.`);
  }
}