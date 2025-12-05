async function smeltRawIron(bot) {
  // Check if we already have iron_ingot
  const ironIngot = mcData.itemsByName.iron_ingot;
  if (bot.inventory.count(ironIngot.id) > 0) {
    bot.chat("Already have an iron ingot.");
    return;
  }

  // Ensure we have raw_iron
  const rawIron = mcData.itemsByName.raw_iron;
  if (bot.inventory.count(rawIron.id) === 0) {
    bot.chat("No raw iron to smelt.");
    return;
  }

  // Ensure we have fuel (coal)
  const coal = mcData.itemsByName.coal;
  if (bot.inventory.count(coal.id) === 0) {
    bot.chat("No coal for fuel.");
    return;
  }

  // Find a placed furnace nearby
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });

  // If not found, place one
  if (!furnaceBlock) {
    bot.chat("Placing furnace...");
    // Find a suitable position near the bot
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", placePos);
    // Update furnace block
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("Failed to place furnace.");
      return;
    }
  }

  // Smelt raw iron using coal
  bot.chat("Smelting raw iron...");
  try {
    await smeltItem(bot, "raw_iron", "coal", 1);
  } catch (err) {
    bot.chat(`Failed to smelt: ${err.message}`);
    return;
  }

  // Verify
  if (bot.inventory.count(ironIngot.id) > 0) {
    bot.chat("Successfully smelted 1 raw iron into an iron ingot.");
  } else {
    bot.chat("Failed to smelt raw iron.");
  }
}