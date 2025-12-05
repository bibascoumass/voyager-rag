async function craftInPersonalGrid(bot, name, count) {
  const item = mcData.itemsByName[name];
  const recipe = bot.recipesFor(item.id, null, 1, null)[0];
  if (!recipe) {
    bot.chat(`No recipe for ${name} in personal crafting grid`);
    return;
  }
  await bot.craft(recipe, count, null);
}

async function craftCraftingTable(bot) {
  // Check if we already have a crafting table
  const craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName.crafting_table.id);
  if (craftingTable) {
    bot.chat("Already have a crafting table.");
    return;
  }
  // Check oak_planks
  const oakPlanks = mcData.itemsByName.oak_planks;
  let planksCount = bot.inventory.count(oakPlanks.id);
  if (planksCount < 4) {
    // Need to craft planks from oak_log
    const oakLog = mcData.itemsByName.oak_log;
    const logsCount = bot.inventory.count(oakLog.id);
    if (logsCount < 1) {
      bot.chat("No oak_log to craft planks.");
      // We could explore to find logs, but we have 2 oak_log according to inventory.
      // Actually, inventory shows 2 oak_log, so this shouldn't happen.
      return;
    }
    // Each log gives 4 planks, we need at least 1 log to get 4 planks.
    const logsNeeded = Math.ceil((4 - planksCount) / 4);
    const logsToUse = Math.min(logsNeeded, logsCount);
    bot.chat(`Crafting ${logsToUse * 4} oak_planks from ${logsToUse} oak_log.`);
    await craftInPersonalGrid(bot, "oak_planks", logsToUse);
    planksCount = bot.inventory.count(oakPlanks.id);
  }
  // Now craft crafting table
  if (planksCount >= 4) {
    bot.chat("Crafting a crafting table.");
    await craftInPersonalGrid(bot, "crafting_table", 1);
    // Verify
    const craftedTable = bot.inventory.findInventoryItem(mcData.itemsByName.crafting_table.id);
    if (craftedTable) {
      bot.chat("Crafted a crafting table.");
    } else {
      bot.chat("Failed to craft crafting table.");
    }
  } else {
    bot.chat("Not enough oak_planks to craft crafting table.");
  }
}