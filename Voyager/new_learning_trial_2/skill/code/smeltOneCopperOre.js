async function smeltOneCopperOre(bot) {
  // Step 1: Check for copper ore in inventory
  const copperOreCount = bot.inventory.count(mcData.itemsByName.copper_ore.id);
  if (copperOreCount >= 1) {
    bot.chat("Already have copper ore.");
  } else {
    bot.chat("No copper ore. Need to mine copper ore.");
    // Step 2: Ensure we have a suitable pickaxe (stone or better)
    const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "diamond_pickaxe", "golden_pickaxe", "netherite_pickaxe"];
    let hasPickaxe = false;
    for (const name of pickaxeNames) {
      if (bot.inventory.count(mcData.itemsByName[name]?.id || 0) > 0) {
        hasPickaxe = true;
        // Equip it if not already equipped
        const item = bot.inventory.findInventoryItem(mcData.itemsByName[name].id);
        if (item) {
          await bot.equip(item, "hand");
        }
        break;
      }
    }
    if (!hasPickaxe) {
      bot.chat("No suitable pickaxe. Cannot mine copper ore.");
      return;
    }
    // Step 3: Find copper ore nearby or explore
    let copperOreBlock = bot.findBlock({
      matching: mcData.blocksByName["copper_ore"].id,
      maxDistance: 32
    });
    if (!copperOreBlock) {
      bot.chat("No copper ore nearby. Exploring...");
      // Random direction: down, or horizontal
      const directions = [new Vec3(0, -1, 0),
      // down
      new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
      const randomIndex = Math.floor(Math.random() * directions.length);
      const direction = directions[randomIndex];
      copperOreBlock = await exploreUntil(bot, direction, 60, () => {
        return bot.findBlock({
          matching: mcData.blocksByName["copper_ore"].id,
          maxDistance: 32
        });
      });
    }
    if (copperOreBlock) {
      bot.chat("Found copper ore. Mining...");
      await mineBlock(bot, "copper_ore", 1);
      bot.chat("Mined 1 copper ore.");
    } else {
      bot.chat("Could not find copper ore.");
      return;
    }
  }

  // Step 4: Check for furnace nearby or place one
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("Placing furnace...");
    // Place furnace near player
    const furnacePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
  }

  // Step 5: Check for fuel (coal)
  const coalCount = bot.inventory.count(mcData.itemsByName.coal.id);
  if (coalCount < 1) {
    bot.chat("No coal for fuel. Need to get coal.");
    // We have coal, but just in case, we can mine coal ore if needed.
    // Since we have coal, this shouldn't happen.
    return;
  }

  // Step 6: Smelt copper ore
  bot.chat("Smelting copper ore...");
  await smeltItem(bot, "copper_ore", "coal", 1);

  // Step 7: Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName.copper_ingot.id);
  bot.chat(`Smelting complete. Total copper ingots: ${copperIngotCount}`);
  if (copperIngotCount >= 13) {
    bot.chat("Successfully smelted 1 copper ore.");
  } else {
    bot.chat("Failed to smelt copper ore.");
  }
}