// helper function to craft using inventory grid (similar to craftUsingInventory defined earlier)
async function craftUsingInventory(bot, name, count) {
  const item = mcData.itemsByName[name];
  const recipe = bot.recipesFor(item.id, null, 1, null)[0]; // null for crafting table means inventory grid
  if (!recipe) {
    bot.chat(`No recipe for ${name} in inventory crafting grid`);
    return;
  }
  await bot.craft(recipe, count, null);
}

// main function

// main function
async function craftFourJunglePlanks(bot) {
  // Step 1: Check current jungle planks count
  const junglePlanksId = mcData.itemsByName.jungle_planks.id;
  const currentPlanks = bot.inventory.count(junglePlanksId);
  if (currentPlanks >= 4) {
    bot.chat("Already have 4 jungle planks.");
    return;
  }
  // Step 2: Check jungle logs
  const jungleLogId = mcData.itemsByName.jungle_log.id;
  const logCount = bot.inventory.count(jungleLogId);
  if (logCount < 1) {
    bot.chat("Need at least 1 jungle log to craft 4 jungle planks.");
    // Since we have none, we need to collect jungle logs first.
    // But according to inventory we have 3, so this shouldn't happen.
    // However, for robustness, we can call a function to mine jungle logs.
    // But we don't have a predefined function for that, and we cannot define recursive functions.
    // We'll just exit and let the caller handle.
    return;
  }
  // Step 3: Craft jungle planks
  bot.chat("Crafting 4 jungle planks from 1 jungle log...");
  await craftUsingInventory(bot, "jungle_planks", 1);
  // Step 4: Verify
  const newPlanks = bot.inventory.count(junglePlanksId);
  if (newPlanks >= 4) {
    bot.chat("Successfully crafted 4 jungle planks.");
  } else {
    bot.chat(`Only crafted ${newPlanks} jungle planks.`);
  }
}