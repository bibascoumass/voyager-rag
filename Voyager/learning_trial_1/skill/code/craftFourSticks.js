async function craftFourSticks(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check current sticks count
  const sticksBefore = countItem("stick");
  bot.chat(`I have ${sticksBefore} sticks.`);

  // Check if we have at least 2 oak_planks
  let planksCount = countItem("oak_planks");
  if (planksCount < 2) {
    bot.chat(`Only have ${planksCount} oak planks, need at least 2.`);
    // Check if we have oak_log to craft more planks
    const logsCount = countItem("oak_log");
    if (logsCount > 0) {
      bot.chat(`Crafting oak planks from ${Math.min(logsCount, 1)} oak log.`);
      // Craft planks in personal crafting grid: 1 log -> 4 planks
      const recipe = bot.recipesFor(mcData.itemsByName.oak_planks.id, null, 1, null)[0];
      if (recipe) {
        await bot.craft(recipe, 1, null);
        planksCount = countItem("oak_planks");
        bot.chat(`Now have ${planksCount} oak planks.`);
      } else {
        bot.chat("No recipe for oak planks?");
        return;
      }
    } else {
      bot.chat("No oak logs to craft planks.");
      return;
    }
  }

  // Now craft sticks: 2 planks -> 4 sticks
  bot.chat("Crafting 4 sticks from 2 oak planks.");
  const recipe = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (recipe) {
    await bot.craft(recipe, 1, null);
    const sticksAfter = countItem("stick");
    bot.chat(`Crafted ${sticksAfter - sticksBefore} sticks. Now have ${sticksAfter} sticks.`);
  } else {
    bot.chat("No recipe for sticks?");
  }
}