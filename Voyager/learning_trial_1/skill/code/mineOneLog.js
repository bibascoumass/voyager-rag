async function mineOneLog(bot) {
  const logTypes = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log"];
  let foundLogType = null;
  let logPosition = null;
  // Check for any log block nearby
  for (const logType of logTypes) {
    const block = bot.findBlock({
      matching: mcData.blocksByName[logType]?.id,
      maxDistance: 32
    });
    if (block) {
      foundLogType = logType;
      logPosition = block;
      break;
    }
  }
  // If no log found, explore until we find one
  if (!foundLogType) {
    const direction = new Vec3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);
    const result = await exploreUntil(bot, direction, 60, () => {
      for (const logType of logTypes) {
        const block = bot.findBlock({
          matching: mcData.blocksByName[logType]?.id,
          maxDistance: 32
        });
        if (block) {
          return {
            type: logType,
            pos: block
          };
        }
      }
      return null;
    });
    if (!result) {
      bot.chat("Could not find a log within exploration time.");
      return;
    }
    foundLogType = result.type;
    logPosition = result.pos;
  }
  // Mine one log block of the found type
  await mineBlock(bot, foundLogType, 1);
  bot.chat(`Mined 1 ${foundLogType}.`);
}