async function mineOneWoodLog(bot) {
  // Step 1: Explore until we find a wood log
  bot.chat("Exploring to find a wood log...");
  const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0), new Vec3(-1, 0, 0)];
  const randomIndex = Math.floor(Math.random() * directions.length);
  const direction = directions[randomIndex];
  const logTypes = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log", "mangrove_log"];
  const logBlock = await exploreUntil(bot, direction, 60, () => {
    for (const logName of logTypes) {
      const block = bot.findBlock({
        matching: mcData.blocksByName[logName].id,
        maxDistance: 32
      });
      if (block) return block;
    }
    return null;
  });
  if (!logBlock) {
    bot.chat("Could not find a wood log within exploration time.");
    return;
  }
  // Step 2: Mine the log
  bot.chat("Found a wood log. Mining...");
  await mineBlock(bot, mcData.blocks[logBlock.type].name, 1);
  bot.chat("Successfully mined 1 wood log.");
}