async function craftWoodenPickaxe(bot) {
  // Step 1: Check if already have wooden pickaxe
  const woodenPickaxeId = mcData.itemsByName.wooden_pickaxe.id;
  if (bot.inventory.count(woodenPickaxeId) >= 1) {
    bot.chat("Already have a wooden pickaxe.");
    return;
  }

  // Step 2: Ensure we have a crafting table nearby (already placed, but we need to be near it)
  const craftingTable = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTable) {
    bot.chat("No crafting table found. Placing one...");
    const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", craftingTablePosition);
  }

  // Step 3: Check planks count
  const plankNames = ["oak_planks", "jungle_planks", "spruce_planks", "birch_planks", "acacia_planks", "dark_oak_planks", "mangrove_planks"];
  let totalPlanks = 0;
  for (const name of plankNames) {
    totalPlanks += bot.inventory.count(mcData.itemsByName[name]?.id || 0);
  }
  if (totalPlanks < 3) {
    bot.chat("Need more planks. Crafting additional planks...");
    // Use jungle logs if available, otherwise any log
    const logNames = ["oak_log", "jungle_log", "spruce_log", "birch_log", "acacia_log", "dark_oak_log", "mangrove_log"];
    let logId = null;
    for (const name of logNames) {
      const id = mcData.itemsByName[name]?.id;
      if (id && bot.inventory.count(id) > 0) {
        logId = id;
        break;
      }
    }
    if (!logId) {
      bot.chat("No logs available to craft planks. Need to collect wood logs first.");
      // Since we have jungle logs in inventory, this shouldn't happen, but for safety, we can explore and mine a log.
      // However, we cannot call mineBlock recursively, so we'll just exit and let the caller handle.
      return;
    }
    const logName = mcData.items[logId].name;
    const plankName = logName.replace('_log', '_planks');
    // Craft planks using the crafting table
    await craftItem(bot, plankName, 1); // 1 recipe yields 4 planks
    bot.chat(`Crafted 4 ${plankName}.`);
  }

  // Step 4: Check sticks
  const stickId = mcData.itemsByName.stick.id;
  const stickCount = bot.inventory.count(stickId);
  if (stickCount < 2) {
    bot.chat("Need more sticks. Crafting sticks...");
    // Craft sticks (requires 2 planks per recipe, yields 4 sticks)
    await craftItem(bot, "stick", 1);
  }

  // Step 5: Craft wooden pickaxe
  bot.chat("Crafting wooden pickaxe...");
  await craftItem(bot, "wooden_pickaxe", 1);

  // Step 6: Verify
  if (bot.inventory.count(woodenPickaxeId) >= 1) {
    bot.chat("Successfully crafted a wooden pickaxe.");
  } else {
    bot.chat("Failed to craft wooden pickaxe.");
  }
}