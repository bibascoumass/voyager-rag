async function smeltFourRawCopper(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return item ? bot.inventory.count(item.id) : 0;
  }

  // Step 1: Check if we already have at least 4 copper_ingot
  const copperIngotCount = countItem("copper_ingot");
  if (copperIngotCount >= 4) {
    bot.chat("Already have at least 4 copper ingots.");
    return;
  }

  // Step 2: Check raw_copper count
  const rawCopperCount = countItem("raw_copper");
  const neededRawCopper = 4 - copperIngotCount;
  if (rawCopperCount < neededRawCopper) {
    bot.chat(`Not enough raw copper. Have ${rawCopperCount}, need ${neededRawCopper}.`);
    return;
  }

  // Step 3: Check fuel
  const coalCount = countItem("coal");
  const oakPlanksCount = countItem("oak_planks");
  const oakLogCount = countItem("oak_log");
  // Calculate total fuel value (simplified: coal=8, oak_planks=1.5, oak_log=1.5)
  let fuelValue = coalCount * 8 + oakPlanksCount * 1.5 + oakLogCount * 1.5;
  if (fuelValue < neededRawCopper) {
    bot.chat(`Not enough fuel. Have fuel value ${fuelValue}, need ${neededRawCopper}.`);
    return;
  }

  // Step 4: Place a furnace if not already nearby
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("Placing a furnace...");
    // Place furnace near the bot
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", placePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("Failed to place furnace.");
      return;
    }
  }

  // Step 5: Smelt the raw copper
  bot.chat(`Smelting ${neededRawCopper} raw copper...`);
  // Use coal first
  if (coalCount > 0) {
    await smeltItem(bot, "raw_copper", "coal", neededRawCopper);
  } else if (oakPlanksCount > 0) {
    await smeltItem(bot, "raw_copper", "oak_planks", neededRawCopper);
  } else if (oakLogCount > 0) {
    await smeltItem(bot, "raw_copper", "oak_log", neededRawCopper);
  }

  // Step 6: Verify
  const finalCopperIngots = countItem("copper_ingot");
  if (finalCopperIngots >= 4) {
    bot.chat(`Successfully smelted ${neededRawCopper} raw copper into ${finalCopperIngots} copper ingots.`);
  } else {
    bot.chat(`Only have ${finalCopperIngots} copper ingots, need 4.`);
  }
}