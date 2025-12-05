async function mineTenCobblestone(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check if we have a pickaxe
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.wooden_pickaxe.id);
  if (!pickaxe) {
    bot.chat("No wooden pickaxe. Need to craft one first.");
    // Since we have a crafting table and materials, we can craft one.
    // But according to inventory, we have a wooden_pickaxe, so this shouldn't happen.
    return;
  }

  // Equip the pickaxe
  await bot.equip(pickaxe, "hand");
  bot.chat("Equipped wooden pickaxe.");

  // Check current cobblestone count
  let cobbleCount = countItem("cobblestone");
  bot.chat(`I have ${cobbleCount} cobblestone.`);
  if (cobbleCount >= 10) {
    bot.chat("Already have at least 10 cobblestone.");
    return;
  }

  // Explore to find stone
  bot.chat("Looking for stone...");
  const stoneBlock = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 32
    });
    return block;
  });
  if (!stoneBlock) {
    bot.chat("Could not find stone within exploration time.");
    return;
  }

  // Mine stone blocks until we have 10 cobblestone
  const needed = 10 - cobbleCount;
  bot.chat(`Need to mine ${needed} stone blocks.`);
  try {
    await mineBlock(bot, "stone", needed);
  } catch (error) {
    bot.chat(`Error while mining: ${error}. Trying to mine individually.`);
    // Try mining one by one
    for (let i = 0; i < needed; i++) {
      const block = bot.findBlock({
        matching: mcData.blocksByName.stone.id,
        maxDistance: 32
      });
      if (block) {
        await mineBlock(bot, "stone", 1);
      } else {
        bot.chat("No more stone nearby.");
        break;
      }
    }
  }

  // Final check
  cobbleCount = countItem("cobblestone");
  if (cobbleCount >= 10) {
    bot.chat(`Successfully mined 10 cobblestone. Now have ${cobbleCount}.`);
  } else {
    bot.chat(`Only mined ${cobbleCount} cobblestone, still short.`);
  }
}