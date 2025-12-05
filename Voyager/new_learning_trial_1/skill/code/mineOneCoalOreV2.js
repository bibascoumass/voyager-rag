async function mineOneCoalOre(bot) {
  // Check if we already have a coal_ore block? Actually we mine to get coal.
  // But the task is to mine coal_ore, so we just mine one.
  const coalOreBlock = bot.findBlock({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32
  });
  if (coalOreBlock) {
    bot.chat("Found coal ore nearby, mining...");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Mined 1 coal ore.");
    return;
  }
  // If not found, explore
  bot.chat("No coal ore nearby, exploring...");
  // Random direction: choose from four cardinal directions plus up/down
  const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const found = await exploreUntil(bot, randomDir, 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName["coal_ore"].id,
      maxDistance: 32
    });
    return block;
  });
  if (found) {
    bot.chat("Found coal ore during exploration, mining...");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Mined 1 coal ore.");
  } else {
    bot.chat("Could not find coal ore within exploration time.");
  }
}