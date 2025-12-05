async function craftUsingInventory(bot, name, count) {
  const item = mcData.itemsByName[name];
  const recipe = bot.recipesFor(item.id, null, 1, null)[0]; // null for crafting table means inventory grid
  if (!recipe) {
    bot.chat(`No recipe for ${name} in inventory crafting grid`);
    return;
  }
  await bot.craft(recipe, count, null);
}

async function craftCraftingTable(bot) {
  // Step 1: Check if already have a crafting table
  const craftingTableId = mcData.itemsByName.crafting_table.id;
  if (bot.inventory.count(craftingTableId) >= 1) {
    bot.chat("Already have a crafting table.");
    return;
  }
  // Step 2: Check planks
  const plankNames = ["oak_planks", "jungle_planks", "spruce_planks", "birch_planks", "acacia_planks", "dark_oak_planks", "mangrove_planks"];
  let totalPlanks = 0;
  for (const name of plankNames) {
    totalPlanks += bot.inventory.count(mcData.itemsByName[name]?.id || 0);
  }
  if (totalPlanks < 4) {
    bot.chat("Not enough planks. Crafting planks from logs...");
    // Determine which log to use
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
      bot.chat("No logs available to craft planks.");
      return;
    }
    // Craft planks from one log (yields 4 planks)
    const logName = mcData.items[logId].name;
    const plankName = logName.replace('_log', '_planks');
    await craftUsingInventory(bot, plankName, 1); // 1 recipe yields 4 planks
    bot.chat(`Crafted 4 ${plankName}.`);
  }
  // Step 3: Craft crafting table
  bot.chat("Crafting a crafting table...");
  await craftUsingInventory(bot, "crafting_table", 1);
  // Verify
  if (bot.inventory.count(craftingTableId) >= 1) {
    bot.chat("Successfully crafted a crafting table.");
  } else {
    bot.chat("Failed to craft a crafting table.");
  }
}