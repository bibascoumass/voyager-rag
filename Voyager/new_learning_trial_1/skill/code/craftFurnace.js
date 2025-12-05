async function craftFurnace(bot) {
  // Step 1: Check if we already have a furnace
  const furnaceItem = mcData.itemsByName.furnace;
  if (bot.inventory.count(furnaceItem.id) > 0) {
    bot.chat("Already have a furnace.");
    return;
  }

  // Step 2: Check cobblestone count
  const cobblestoneItem = mcData.itemsByName.cobblestone;
  let cobblestoneCount = bot.inventory.count(cobblestoneItem.id);
  const requiredCobblestone = 8;
  if (cobblestoneCount < requiredCobblestone) {
    bot.chat(`Need ${requiredCobblestone} cobblestone, but only have ${cobblestoneCount}. Mining more stone...`);
    const needed = requiredCobblestone - cobblestoneCount;
    // Ensure we have a pickaxe
    const pickaxeNames = ["wooden_pickaxe", "stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
    let hasPickaxe = false;
    for (const name of pickaxeNames) {
      const item = mcData.itemsByName[name];
      if (item && bot.inventory.count(item.id) > 0) {
        hasPickaxe = true;
        break;
      }
    }
    if (!hasPickaxe) {
      bot.chat("No pickaxe to mine stone.");
      return;
    }
    // Mine stone (which drops cobblestone)
    await mineBlock(bot, "stone", needed);
    // Update count
    cobblestoneCount = bot.inventory.count(cobblestoneItem.id);
    bot.chat(`Now have ${cobblestoneCount} cobblestone.`);
  }

  // Step 3: Place a crafting table if not already nearby
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table...");
    // Find a suitable position near the bot
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", placePos);
    // Update the crafting table block
    craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      bot.chat("Failed to place crafting table.");
      return;
    }
  }

  // Step 4: Craft furnace
  bot.chat("Crafting furnace...");
  try {
    await craftItem(bot, "furnace", 1);
  } catch (err) {
    bot.chat(`Failed to craft furnace: ${err.message}`);
    return;
  }

  // Step 5: Verify
  if (bot.inventory.count(furnaceItem.id) > 0) {
    bot.chat("Successfully crafted a furnace.");
  } else {
    bot.chat("Failed to craft a furnace.");
  }
}