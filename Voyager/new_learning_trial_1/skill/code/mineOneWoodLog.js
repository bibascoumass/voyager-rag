async function mineOneWoodLog(bot) {
  // Step 1: Explore until we find a wood log
  const logTypes = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log"];
  let foundLog = null;
  // Choose a random direction for exploration (one of the four cardinal directions plus up/down)
  const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  bot.chat("Exploring to find a wood log...");
  foundLog = await exploreUntil(bot, randomDir, 60, () => {
    for (const logName of logTypes) {
      const block = bot.findBlock({
        matching: mcData.blocksByName[logName]?.id,
        maxDistance: 32
      });
      if (block) return block;
    }
    return null;
  });
  if (!foundLog) {
    bot.chat("Could not find a wood log within exploration time.");
    return;
  }
  // Step 2: Mine 1 log
  const logName = mcData.blocks[foundLog.type].name;
  bot.chat(`Found ${logName}, mining...`);
  await mineBlock(bot, logName, 1);
  // Step 3: Verify we have a log
  const logItem = mcData.itemsByName[logName];
  if (bot.inventory.count(logItem.id) < 1) {
    bot.chat("Failed to mine a wood log.");
  } else {
    bot.chat("Successfully mined 1 wood log.");
  }
}