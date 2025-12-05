async function craftCraftingTable(bot) {
  // Check if we already have a crafting table
  const craftingTableItem = mcData.itemsByName.crafting_table;
  if (bot.inventory.count(craftingTableItem.id) > 0) {
    bot.chat("Already have a crafting table.");
    return;
  }

  // Check for oak_planks
  const oakPlanksItem = mcData.itemsByName.oak_planks;
  let oakPlanksCount = bot.inventory.count(oakPlanksItem.id);
  if (oakPlanksCount < 4) {
    // Need to craft oak_planks from oak_log
    const oakLogItem = mcData.itemsByName.oak_log;
    const oakLogCount = bot.inventory.count(oakLogItem.id);
    if (oakLogCount < 1) {
      bot.chat("No oak logs to craft planks.");
      // We need to collect oak logs first, but the task only asks to craft a crafting table.
      // Since we have 4 oak_log in inventory, this should not happen.
      // However, for robustness, we could mine more logs, but the task doesn't require it.
      // We'll assume we have logs.
      return;
    }
    bot.chat("Crafting oak planks...");
    // Craft 4 oak_planks from 1 oak_log using the personal crafting grid.
    // The craftItem function requires a crafting table, but we don't have one yet.
    // We need to use bot.craft directly for the 2x2 grid.
    const recipe = bot.recipesFor(oakPlanksItem.id, null, 1, null)[0];
    if (!recipe) {
      bot.chat("No recipe for oak planks found.");
      return;
    }
    try {
      await bot.craft(recipe, 1, null);
      bot.chat("Crafted 4 oak planks.");
    } catch (err) {
      bot.chat(`Failed to craft oak planks: ${err.message}`);
      return;
    }
    // Update count
    oakPlanksCount = bot.inventory.count(oakPlanksItem.id);
  }

  // Now craft crafting table
  if (oakPlanksCount >= 4) {
    bot.chat("Crafting a crafting table...");
    const recipe = bot.recipesFor(craftingTableItem.id, null, 1, null)[0];
    if (!recipe) {
      bot.chat("No recipe for crafting table found.");
      return;
    }
    try {
      await bot.craft(recipe, 1, null);
      bot.chat("Crafted a crafting table.");
    } catch (err) {
      bot.chat(`Failed to craft crafting table: ${err.message}`);
      return;
    }
  } else {
    bot.chat("Not enough oak planks to craft a crafting table.");
  }

  // Final check
  if (bot.inventory.count(craftingTableItem.id) > 0) {
    bot.chat("Successfully crafted a crafting table.");
  } else {
    bot.chat("Failed to craft a crafting table.");
  }
}