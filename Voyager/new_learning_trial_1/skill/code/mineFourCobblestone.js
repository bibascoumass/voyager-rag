async function mineFourCobblestone(bot) {
  const cobblestoneItem = mcData.itemsByName.cobblestone;
  const requiredCount = 4;
  // Step 1: Check current cobblestone count
  let currentCount = bot.inventory.count(cobblestoneItem.id);
  if (currentCount >= requiredCount) {
    bot.chat("Already have at least 4 cobblestone.");
    return;
  }
  // Step 2: Ensure we have a pickaxe
  const pickaxeNames = ["wooden_pickaxe", "stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
  let hasPickaxe = false;
  for (const name of pickaxeNames) {
    const item = mcData.itemsByName[name];
    if (item && bot.inventory.count(item.id) > 0) {
      hasPickaxe = true;
      break;
    }
  }
  if (!hasPickaxe) {
    bot.chat("No pickaxe found. Need a pickaxe to mine stone.");
    // Could craft one, but task assumes we have one. We'll just return.
    return;
  }
  // Step 3: Explore until find stone
  bot.chat("Exploring to find stone...");
  const stoneBlocks = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const blocks = bot.findBlocks({
      matching: mcData.blocksByName.stone.id,
      maxDistance: 32,
      count: requiredCount
    });
    if (blocks.length >= requiredCount) {
      return blocks;
    }
    return null;
  });
  if (!stoneBlocks) {
    bot.chat("Could not find enough stone within exploration time.");
    return;
  }
  // Step 4: Mine stone
  bot.chat(`Found stone, mining ${requiredCount}...`);
  await mineBlock(bot, "stone", requiredCount);
  // Step 5: Verify
  currentCount = bot.inventory.count(cobblestoneItem.id);
  if (currentCount >= requiredCount) {
    bot.chat(`Successfully mined ${requiredCount} cobblestone. Now have ${currentCount}.`);
  } else {
    bot.chat(`Failed to mine enough cobblestone. Only have ${currentCount}.`);
  }
}