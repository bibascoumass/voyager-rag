async function mineSpruceLogs(bot) {
  const targetCount = 5;
  // Check current inventory
  let currentLogs = bot.inventory.count(mcData.itemsByName["spruce_log"].id);
  if (currentLogs >= targetCount) {
    bot.chat(`Already have ${currentLogs} spruce logs. Task completed.`);
    return;
  }
  // Function to find logs within 32 blocks
  const findLogs = () => {
    return bot.findBlocks({
      matching: mcData.blocksByName["spruce_log"].id,
      maxDistance: 32,
      count: targetCount - currentLogs
    });
  };
  // Mine logs until we have enough
  while (currentLogs < targetCount) {
    // Find logs nearby
    const logBlocks = findLogs();
    if (logBlocks.length > 0) {
      // Mine as many as needed
      const toMine = Math.min(logBlocks.length, targetCount - currentLogs);
      await mineBlock(bot, "spruce_log", toMine);
      currentLogs = bot.inventory.count(mcData.itemsByName["spruce_log"].id);
      bot.chat(`Mined ${toMine} spruce logs. Now have ${currentLogs}.`);
    } else {
      // No logs nearby, explore
      bot.chat("No spruce logs nearby. Exploring...");
      // Choose a random direction (four cardinal directions)
      const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      const foundLog = await exploreUntil(bot, randomDir, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName["spruce_log"].id,
          maxDistance: 32
        });
        return block;
      });
      if (!foundLog) {
        bot.chat("Could not find spruce logs after exploration.");
        break;
      }
      // After exploration, we should have logs nearby, loop again to mine
    }
  }
  if (currentLogs >= targetCount) {
    bot.chat(`Successfully mined ${currentLogs} spruce logs. Task completed.`);
  } else {
    bot.chat(`Failed to mine ${targetCount} spruce logs. Only have ${currentLogs}.`);
  }
}