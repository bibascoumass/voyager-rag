async function mineOneLog(bot) {
  // Check for any log type
  const logTypes = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log"];
  let logBlock = null;
  for (const logType of logTypes) {
    logBlock = bot.findBlock({
      matching: mcData.blocksByName[logType].id,
      maxDistance: 32
    });
    if (logBlock) break;
  }
  // If no log found, explore
  if (!logBlock) {
    const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const foundLog = await exploreUntil(bot, randomDir, 60, () => {
      for (const logType of logTypes) {
        const block = bot.findBlock({
          matching: mcData.blocksByName[logType].id,
          maxDistance: 32
        });
        if (block) return block;
      }
      return null;
    });
    if (!foundLog) {
      bot.chat("Could not find a log within exploration time.");
      return;
    }
  }
  // Mine one log
  await mineBlock(bot, "spruce_log", 1); // Since we are in spruce biome, we assume spruce_log
  bot.chat("Mined 1 log.");
}