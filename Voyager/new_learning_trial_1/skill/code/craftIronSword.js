async function craftIronSword(bot) {
  // Check if we already have an iron sword
  const ironSwordItem = mcData.itemsByName.iron_sword;
  if (bot.inventory.count(ironSwordItem.id) > 0) {
    bot.chat("Already have an iron sword.");
    return;
  }

  // Ensure we have a crafting table placed nearby
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table...");
    // Find a suitable position near the bot
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", placePos);
    // Update the crafting table block
    craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      bot.chat("Failed to place crafting table.");
      return;
    }
  }

  // Check required materials
  const ironIngotItem = mcData.itemsByName.iron_ingot;
  const stickItem = mcData.itemsByName.stick;
  const ironIngotCount = bot.inventory.count(ironIngotItem.id);
  const stickCount = bot.inventory.count(stickItem.id);
  if (ironIngotCount < 2) {
    bot.chat(`Need 2 iron ingots, but only have ${ironIngotCount}.`);
    // We could smelt more, but inventory shows 3, so this shouldn't happen.
    return;
  }
  if (stickCount < 1) {
    bot.chat(`Need 1 stick, but only have ${stickCount}.`);
    // We have 2 sticks, so this shouldn't happen.
    return;
  }

  // Craft iron sword
  bot.chat("Crafting iron sword...");
  try {
    await craftItem(bot, "iron_sword", 1);
  } catch (err) {
    bot.chat(`Failed to craft iron sword: ${err.message}`);
    return;
  }

  // Verify
  if (bot.inventory.count(ironSwordItem.id) > 0) {
    bot.chat("Successfully crafted an iron sword.");
  } else {
    bot.chat("Failed to craft an iron sword.");
  }
}