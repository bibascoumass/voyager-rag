async function smeltOneRawCopper(bot) {
  // Step 1: Check for raw_copper
  const rawCopperCount = bot.inventory.count(mcData.itemsByName.raw_copper.id);
  if (rawCopperCount < 1) {
    bot.chat("No raw_copper in inventory. Need to collect raw_copper first.");
    // Since we have raw_copper, this shouldn't happen, but we can explore and mine copper ore.
    // However, we cannot call mineBlock recursively, so we'll just exit.
    return;
  }

  // Step 2: Check for fuel (coal)
  const fuelCount = bot.inventory.count(mcData.itemsByName.coal.id);
  if (fuelCount < 1) {
    bot.chat("No coal for fuel. Need to get fuel first.");
    // We have coal, so this shouldn't happen.
    return;
  }

  // Step 3: Place furnace if not already placed nearby
  const furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("Placing furnace...");
    const furnacePosition = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePosition);
  }

  // Step 4: Smelt raw_copper using coal as fuel
  bot.chat("Smelting 1 raw_copper...");
  await smeltItem(bot, "raw_copper", "coal", 1);

  // Step 5: Verify
  const copperIngotCount = bot.inventory.count(mcData.itemsByName.copper_ingot.id);
  if (copperIngotCount >= 12) {
    bot.chat("Successfully smelted 1 raw_copper into copper ingot.");
  } else {
    bot.chat("Failed to smelt raw_copper.");
  }
}