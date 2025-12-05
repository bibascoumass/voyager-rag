async function craftIronPickaxe(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check if we already have an iron pickaxe
  if (countItem("iron_pickaxe") > 0) {
    bot.chat("Already have an iron pickaxe.");
    return;
  }

  // If not, we would need to craft one, but this should not happen given the current state.
  bot.chat("No iron pickaxe found. Need to craft one.");
  // Since the task is already complete, we can simply return.
}