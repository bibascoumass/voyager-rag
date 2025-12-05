async function mineThreeJungleLogs(bot) {
  // Check current inventory for jungle logs
  const jungleLogCount = bot.inventory.count(mcData.itemsByName.jungle_log.id);
  if (jungleLogCount >= 3) {
    bot.chat("Already have 3 jungle logs.");
    return;
  }
  // Explore until we find a jungle log
  const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0), new Vec3(-1, 0, 0)];
  const randomIndex = Math.floor(Math.random() * directions.length);
  const direction = directions[randomIndex];
  bot.chat("Exploring to find jungle logs...");
  const foundLog = await exploreUntil(bot, direction, 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName.jungle_log.id,
      maxDistance: 32
    });
    return block;
  });
  if (!foundLog) {
    bot.chat("Could not find jungle logs within exploration time.");
    return;
  }
  // Mine 3 jungle logs
  const needed = 3 - jungleLogCount;
  bot.chat(`Mining ${needed} jungle logs...`);
  await mineBlock(bot, "jungle_log", needed);
  // Verify we have at least 3
  const newCount = bot.inventory.count(mcData.itemsByName.jungle_log.id);
  if (newCount >= 3) {
    bot.chat("Successfully mined 3 jungle logs.");
  } else {
    bot.chat(`Only mined ${newCount} jungle logs. Need to find more.`);
    // Try again recursively? But we cannot use recursion due to rule. Instead, we can call the function again.
    // However, rule says no recursive functions. We'll just report and let the caller handle.
    // Since we are in a function, we can loop? But rule says no infinite loops.
    // We'll just exit; the task may be retried.
  }
}