async function mineFourOakLog(bot) {
  const requiredCount = 4;
  const currentCount = bot.inventory.count(mcData.itemsByName.oak_log.id);
  bot.chat(`I have ${currentCount} oak logs, need ${requiredCount - currentCount} more.`);
  if (currentCount >= requiredCount) {
    bot.chat("Already have enough oak logs.");
    return;
  }
  const needed = requiredCount - currentCount;
  // Explore until we find enough oak_log blocks
  const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const foundBlocks = await exploreUntil(bot, randomDir, 60, () => {
    const blocks = bot.findBlocks({
      matching: mcData.blocksByName.oak_log.id,
      maxDistance: 32,
      count: needed
    });
    if (blocks.length >= needed) {
      return blocks;
    }
    return null;
  });
  if (!foundBlocks) {
    bot.chat("Could not find enough oak logs within exploration time.");
    return;
  }
  bot.chat(`Found enough oak logs, mining ${needed}...`);
  await mineBlock(bot, "oak_log", needed);
  const finalCount = bot.inventory.count(mcData.itemsByName.oak_log.id);
  if (finalCount >= requiredCount) {
    bot.chat(`Successfully mined ${needed} oak logs. Now have ${finalCount}.`);
  } else {
    bot.chat(`Failed to mine enough oak logs. Only have ${finalCount}.`);
  }
}