async function mineThreeOakLogs(bot) {
  // Helper function to count oak logs in inventory
  function countOakLogs() {
    const oakLogId = mcData.itemsByName.oak_log.id;
    return bot.inventory.count(oakLogId);
  }
  const neededLogs = 3;
  let currentLogs = countOakLogs();
  bot.chat(`I have ${currentLogs} oak logs. Need ${neededLogs - currentLogs} more.`);

  // If we already have enough, return early
  if (currentLogs >= neededLogs) {
    bot.chat("Already have at least 3 oak logs.");
    return;
  }

  // Try to mine the remaining logs
  const logsToMine = neededLogs - currentLogs;
  try {
    await mineBlock(bot, "oak_log", logsToMine);
  } catch (error) {
    // If mineBlock fails (e.g., not enough blocks), we'll explore
    bot.chat("Could not find enough oak logs nearby. Exploring...");
  }

  // Update count
  currentLogs = countOakLogs();
  if (currentLogs >= neededLogs) {
    bot.chat(`Successfully mined ${neededLogs} oak logs.`);
    return;
  }

  // Still need more logs, explore until we find them
  const remaining = neededLogs - currentLogs;
  bot.chat(`Still need ${remaining} oak logs. Exploring...`);
  // Choose a random direction for exploration
  const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, 1), new Vec3(-1, 0, -1)];
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const foundLogs = await exploreUntil(bot, randomDir, 60, () => {
    // Check if there is an oak log within 32 blocks
    const block = bot.findBlock({
      matching: mcData.blocksByName.oak_log.id,
      maxDistance: 32
    });
    if (block) {
      return block;
    }
    return null;
  });
  if (foundLogs) {
    // Mine the remaining logs
    await mineBlock(bot, "oak_log", remaining);
    currentLogs = countOakLogs();
    if (currentLogs >= neededLogs) {
      bot.chat(`Successfully mined ${neededLogs} oak logs after exploration.`);
    } else {
      bot.chat(`Only mined ${currentLogs} oak logs, still short.`);
    }
  } else {
    bot.chat("Could not find oak logs after exploration.");
  }
}