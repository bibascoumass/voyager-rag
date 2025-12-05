async function smeltFourRawCopper(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Check for placed furnace
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("No furnace found nearby. Placing furnace.");
    // Check if we have a furnace item
    if (countItem("furnace") === 0) {
      bot.chat("No furnace in inventory. Cannot smelt.");
      return;
    }
    // Place furnace near the player
    const furnacePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("Failed to place furnace.");
      return;
    }
  }

  // Step 2: Smelt 4 raw copper using coal
  const rawCopperCount = countItem("raw_copper");
  const coalCount = countItem("coal");
  if (rawCopperCount < 4) {
    bot.chat(`Only have ${rawCopperCount} raw copper, need 4.`);
    // We could mine more, but the task is to smelt 4 raw copper, and we have exactly 4.
    return;
  }
  if (coalCount < 4) {
    bot.chat(`Only have ${coalCount} coal, need at least 4 for smelting.`);
    // We have 6 coal, so this shouldn't happen.
    return;
  }
  bot.chat("Smelting 4 raw copper into copper ingots.");
  await smeltItem(bot, "raw_copper", "coal", 4);

  // Step 3: Verify
  const copperIngotCount = countItem("copper_ingot");
  if (copperIngotCount >= 4) {
    bot.chat(`Successfully smelted 4 copper ingots. Now have ${copperIngotCount}.`);
  } else {
    bot.chat(`Only smelted ${copperIngotCount} copper ingots.`);
  }
}