async function mineCopperOre(bot) {
  // Helper to craft stone pickaxe if needed
  async function craftStonePickaxeIfNeeded() {
    // Check if we have a stone pickaxe in inventory
    let stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
    if (stonePickaxe) {
      bot.chat("Stone pickaxe already in inventory.");
      return stonePickaxe;
    }
    bot.chat("Crafting stone pickaxe...");
    // Ensure we have a crafting table placed
    const craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName["crafting_table"].id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      const craftingTablePos = bot.entity.position.offset(1, 0, 0);
      await placeItem(bot, "crafting_table", craftingTablePos);
      bot.chat("Placed crafting table.");
    }
    // Check cobblestone (need 3)
    let cobblestoneCount = bot.inventory.count(mcData.itemsByName["cobblestone"].id);
    if (cobblestoneCount < 3) {
      bot.chat(`Need ${3 - cobblestoneCount} more cobblestone. Mining stone...`);
      await mineBlock(bot, "stone", 3 - cobblestoneCount);
    }
    // Check sticks (need 2)
    let sticksCount = bot.inventory.count(mcData.itemsByName["stick"].id);
    if (sticksCount < 2) {
      bot.chat("Need 2 sticks. Crafting sticks...");
      // Ensure we have planks to craft sticks
      if (bot.inventory.count(mcData.itemsByName["spruce_planks"].id) < 2) {
        // Craft planks from logs if available
        if (bot.inventory.count(mcData.itemsByName["spruce_log"].id) >= 1) {
          await craftItem(bot, "spruce_planks", 1);
        } else {
          bot.chat("No logs to craft planks. Cannot craft sticks.");
          return null;
        }
      }
      await craftItem(bot, "stick", 1);
    }
    // Craft stone pickaxe
    await craftItem(bot, "stone_pickaxe", 1);
    stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
    if (stonePickaxe) {
      bot.chat("Stone pickaxe crafted.");
    } else {
      bot.chat("Failed to craft stone pickaxe.");
    }
    return stonePickaxe;
  }

  // Step 1: Obtain stone pickaxe
  const stonePickaxe = await craftStonePickaxeIfNeeded();
  if (!stonePickaxe) {
    bot.chat("Cannot proceed without stone pickaxe.");
    return;
  }

  // Step 2: Equip stone pickaxe
  await bot.equip(stonePickaxe, "hand");
  bot.chat("Stone pickaxe equipped.");

  // Step 3: Find copper ore
  let copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName["copper_ore"].id,
    maxDistance: 32
  });
  if (!copperOreBlock) {
    bot.chat("No copper ore nearby. Exploring underground...");
    // Explore in a random direction, prioritizing down
    const directions = [new Vec3(0, -1, 0),
    // down
    new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const foundOre = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName["copper_ore"].id,
        maxDistance: 32
      });
      return block;
    });
    if (!foundOre) {
      bot.chat("Could not find copper ore after exploration.");
      return;
    }
    copperOreBlock = foundOre;
  }

  // Step 4: Mine copper ore
  bot.chat("Mining copper ore with stone pickaxe...");
  await mineBlock(bot, "copper_ore", 1);

  // Step 5: Verify
  const rawCopperCount = bot.inventory.count(mcData.itemsByName["raw_copper"].id);
  if (rawCopperCount >= 1) {
    bot.chat(`Successfully mined 1 copper ore. Obtained ${rawCopperCount} raw copper.`);
  } else {
    bot.chat("Failed to obtain raw copper.");
  }
}