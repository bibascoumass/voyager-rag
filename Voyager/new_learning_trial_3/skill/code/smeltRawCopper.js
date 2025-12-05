async function smeltRawCopper(bot) {
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
  if (rawCopperCount < 9) {
    bot.chat(`Only have ${rawCopperCount} raw_copper. Need to mine more.`);
    // Mine additional copper ore
    const needed = 9 - rawCopperCount;
    await mineBlock(bot, "copper_ore", needed);
    bot.chat(`Mined ${needed} copper ore.`);
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
  bot.chat(`Smelting 9 raw_copper using ${fuelName}...`);
  await smeltItem(bot, "raw_copper", fuelName, 9);

  // Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName["copper_ingot"].id);
  const expected = rawCopperCount + 1; // because we already had 1
  if (copperIngotCount >= expected) {
    bot.chat(`Successfully smelted 9 raw copper. Now have ${copperIngotCount} copper ingot(s).`);
  } else {
    bot.chat(`Failed to smelt all raw copper. Have ${copperIngotCount} copper ingots.`);
  }
}