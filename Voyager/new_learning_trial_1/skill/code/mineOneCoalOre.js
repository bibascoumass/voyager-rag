async function mineOneCoalOre(bot) {
  // Check if we already have coal
  const coalItem = mcData.itemsByName.coal;
  if (bot.inventory.count(coalItem.id) >= 1) {
    bot.chat("Already have coal.");
    return;
  }

  // Find a coal_ore block nearby
  let coalOreBlock = bot.findBlock({
    matching: mcData.blocksByName.coal_ore.id,
    maxDistance: 32
  });

  // If not found, explore
  if (!coalOreBlock) {
    bot.chat("No coal ore nearby, exploring...");
    const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    coalOreBlock = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.coal_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (!coalOreBlock) {
      bot.chat("Could not find coal ore within exploration time.");
      return;
    }
  }

  // Mine the coal ore
  bot.chat("Found coal ore, mining...");
  await mineBlock(bot, "coal_ore", 1);

  // Verify
  if (bot.inventory.count(coalItem.id) >= 1) {
    bot.chat("Successfully mined 1 coal.");
  } else {
    bot.chat("Failed to mine coal.");
  }
}