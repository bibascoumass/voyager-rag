async function mineOneCoalOre(bot) {
  // Check if we already have coal (coal item)
  const coalItem = mcData.itemsByName.coal;
  if (coalItem && bot.inventory.count(coalItem.id) > 0) {
    bot.chat("Already have coal.");
    return;
  }
  // Mine 1 coal_ore
  await mineBlock(bot, "coal_ore", 1);
  bot.chat("Mined 1 coal ore.");
}