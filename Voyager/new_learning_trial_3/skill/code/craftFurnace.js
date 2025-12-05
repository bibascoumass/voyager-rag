async function craftFurnace(bot) {
  // Check cobblestone count
  const cobblestoneCount = bot.inventory.count(mcData.itemsByName["cobblestone"].id);
  if (cobblestoneCount < 8) {
    bot.chat(`Not enough cobblestone. Need 8, have ${cobblestoneCount}. Mining more...`);
    // Mine additional cobblestone
    const needed = 8 - cobblestoneCount;
    await mineBlock(bot, "stone", needed);
    bot.chat(`Mined ${needed} stone.`);
  }

  // Place a crafting table
  const craftingTablePos = bot.entity.position.offset(1, 0, 0);
  await placeItem(bot, "crafting_table", craftingTablePos);
  bot.chat("Placed crafting table.");

  // Craft furnace
  await craftItem(bot, "furnace", 1);
  bot.chat("Crafted furnace.");

  // Verify
  const furnaceCount = bot.inventory.count(mcData.itemsByName["furnace"].id);
  if (furnaceCount >= 1) {
    bot.chat("Successfully crafted 1 furnace.");
  } else {
    bot.chat("Failed to craft furnace.");
  }
}