async function smeltOneRawCopper(bot) {
  // Check for raw_copper
  const rawCopperCount = bot.inventory.count(mcData.itemsByName.raw_copper.id);
  if (rawCopperCount < 1) {
    bot.chat("No raw_copper in inventory. Need to collect raw_copper first.");
    // Since we have raw_copper, this shouldn't happen, but we can explore and mine copper ore.
    // However, we cannot call mineBlock recursively, so we'll just exit.
    return;
  }

  // Check for fuel (jungle_planks)
  const fuelCount = bot.inventory.count(mcData.itemsByName.jungle_planks.id);
  if (fuelCount < 1) {
    bot.chat("No jungle_planks for fuel. Need to get fuel first.");
    // We have jungle_planks, so this shouldn't happen.
    return;
  }

  // Place furnace if not already placed nearby
  const furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("Placing furnace...");
    const furnacePosition = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePosition);
  }

  // Smelt raw_copper using jungle_planks as fuel
  bot.chat("Smelting 1 raw_copper...");
  await smeltItem(bot, "raw_copper", "jungle_planks", 1);

  // Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName.copper_ingot.id);
  if (copperIngotCount > 0) {
    bot.chat("Successfully smelted 1 raw_copper into copper ingot.");
  } else {
    bot.chat("Failed to smelt raw_copper.");
  }
}