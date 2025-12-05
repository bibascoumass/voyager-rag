async function craftWoodenPickaxe(bot) {
  // Place crafting table
  const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePosition);
  bot.chat("Placed crafting table.");

  // Craft spruce planks from spruce logs
  const logsNeeded = 2; // we have 2 logs, use both
  if (bot.inventory.count(mcData.itemsByName["spruce_log"].id) < logsNeeded) {
    bot.chat("Not enough spruce logs. Need to collect more.");
    // Since we are in spruce biome, we can mine more logs if needed.
    // But we already have 2 logs, so this shouldn't happen.
    await mineBlock(bot, "spruce_log", logsNeeded - bot.inventory.count(mcData.itemsByName["spruce_log"].id));
  }
  // Craft planks: each log gives 4 planks, we need at least 5 planks (3 for pickaxe + 2 for sticks)
  // We'll craft all logs into planks.
  const logsCount = bot.inventory.count(mcData.itemsByName["spruce_log"].id);
  const planksPerCraft = 4;
  const crafts = Math.ceil(logsCount / 1); // each craft uses 1 log
  for (let i = 0; i < crafts; i++) {
    await craftItem(bot, "spruce_planks", 1);
  }
  bot.chat(`Crafted ${crafts * planksPerCraft} spruce planks.`);

  // Craft sticks from planks
  const sticksNeeded = 2;
  const planksForSticks = Math.ceil(sticksNeeded / 4) * 2; // each craft uses 2 planks and yields 4 sticks
  if (bot.inventory.count(mcData.itemsByName["spruce_planks"].id) < planksForSticks) {
    bot.chat("Not enough planks for sticks.");
    // This shouldn't happen because we have enough planks.
    return;
  }
  await craftItem(bot, "stick", 1); // 1 recipe gives 4 sticks
  bot.chat("Crafted sticks.");

  // Craft wooden pickaxe
  const pickaxePlanksNeeded = 3;
  const pickaxeSticksNeeded = 2;
  if (bot.inventory.count(mcData.itemsByName["spruce_planks"].id) < pickaxePlanksNeeded || bot.inventory.count(mcData.itemsByName["stick"].id) < pickaxeSticksNeeded) {
    bot.chat("Not enough materials for wooden pickaxe.");
    return;
  }
  await craftItem(bot, "wooden_pickaxe", 1);
  bot.chat("Crafted wooden pickaxe.");
}