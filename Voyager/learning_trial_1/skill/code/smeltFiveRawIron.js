async function smeltFiveRawIron(bot) {
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

  // Step 2: Smelt 5 raw iron using coal
  const rawIronCount = countItem("raw_iron");
  const coalCount = countItem("coal");
  if (rawIronCount < 5) {
    bot.chat(`Only have ${rawIronCount} raw iron, need 5.`);
    return;
  }
  if (coalCount < 1) {
    bot.chat(`Only have ${coalCount} coal, need at least 1 for smelting.`);
    return;
  }
  bot.chat("Smelting 5 raw iron into iron ingots.");
  // smeltItem can smelt multiple items at once, but we need to call it 5 times? Actually smeltItem can smelt count items.
  // However, smeltItem uses one fuel per item, but coal can smelt 8 items. We'll use smeltItem with count=5.
  await smeltItem(bot, "raw_iron", "coal", 5);

  // Step 3: Verify
  const ironIngotCount = countItem("iron_ingot");
  if (ironIngotCount >= 5) {
    bot.chat(`Successfully smelted 5 iron ingots. Now have ${ironIngotCount}.`);
  } else {
    bot.chat(`Only smelted ${ironIngotCount} iron ingots.`);
  }
}