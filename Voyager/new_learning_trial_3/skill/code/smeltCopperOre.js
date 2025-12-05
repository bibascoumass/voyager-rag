async function smeltCopperOre(bot) {
  // Check for furnace in the world
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName["furnace"].id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("No furnace nearby. Placing one...");
    // Place furnace near the bot
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", placePos);
    furnaceBlock = bot.blockAt(placePos);
    bot.chat("Furnace placed.");
  } else {
    bot.chat("Found existing furnace.");
  }

  // Ensure we have raw_copper
  const rawCopperCount = bot.inventory.count(mcData.itemsByName["raw_copper"].id);
  if (rawCopperCount < 1) {
    bot.chat("No raw_copper in inventory. Need to mine copper ore first.");
    // Since we have a stone_pickaxe, we can mine copper ore.
    // But the task is only to smelt, so we assume we have it.
    // However, we have 10 raw_copper, so this shouldn't happen.
    return;
  }

  // Use spruce_log as fuel (we have plenty)
  const fuelName = "spruce_log";
  const fuelCount = bot.inventory.count(mcData.itemsByName[fuelName].id);
  if (fuelCount < 1) {
    bot.chat(`No ${fuelName} for fuel. Using alternative...`);
    // Try other fuels
    const alternativeFuels = ["spruce_planks", "stick", "crafting_table"];
    let chosenFuel = null;
    for (const fuel of alternativeFuels) {
      if (bot.inventory.count(mcData.itemsByName[fuel].id) > 0) {
        chosenFuel = fuel;
        break;
      }
    }
    if (!chosenFuel) {
      bot.chat("No fuel available. Cannot smelt.");
      return;
    }
    fuelName = chosenFuel;
  }
  bot.chat(`Smelting 1 raw_copper using ${fuelName}...`);
  await smeltItem(bot, "raw_copper", fuelName, 1);

  // Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName["copper_ingot"].id);
  if (copperIngotCount > 0) {
    bot.chat(`Successfully smelted 1 copper ore. Now have ${copperIngotCount} copper ingot(s).`);
  } else {
    bot.chat("Failed to obtain copper ingot.");
  }
}