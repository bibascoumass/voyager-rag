async function mineStone(bot) {
  // Check for wooden pickaxe
  const woodenPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["wooden_pickaxe"].id);
  if (!woodenPickaxe) {
    bot.chat("No wooden pickaxe. Crafting one...");
    // We have materials: 3 spruce_planks, 2 sticks, 5 spruce_logs
    // We can craft more planks if needed, but we already have a pickaxe in inventory.
    // Actually, we have a wooden_pickaxe in inventory, so this shouldn't happen.
    // But if it does, we can craft one.
    // Since we have a crafting table in equipment, we can use it.
    // However, we should place a crafting table first.
    const craftingTablePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", craftingTablePos);
    // Craft planks from logs if needed
    if (bot.inventory.count(mcData.itemsByName["spruce_planks"].id) < 3) {
      await craftItem(bot, "spruce_planks", 1); // each craft gives 4 planks
    }
    // Craft sticks if needed
    if (bot.inventory.count(mcData.itemsByName["stick"].id) < 2) {
      await craftItem(bot, "stick", 1);
    }
    await craftItem(bot, "wooden_pickaxe", 1);
  }
  // Equip wooden pickaxe
  await bot.equip(woodenPickaxe || mcData.itemsByName["wooden_pickaxe"].id, "hand");
  bot.chat("Wooden pickaxe equipped.");

  // Check current cobblestone count
  let cobblestoneCount = bot.inventory.count(mcData.itemsByName["cobblestone"].id);
  if (cobblestoneCount >= 10) {
    bot.chat(`Already have ${cobblestoneCount} cobblestone. Task completed.`);
    return;
  }

  // Function to find stone blocks
  const findStone = () => {
    return bot.findBlocks({
      matching: mcData.blocksByName["stone"].id,
      maxDistance: 32,
      count: 10 - cobblestoneCount
    });
  };

  // Mine stone until we have 10 cobblestone
  while (cobblestoneCount < 10) {
    const stoneBlocks = findStone();
    if (stoneBlocks.length > 0) {
      // Mine as many as needed
      const toMine = Math.min(stoneBlocks.length, 10 - cobblestoneCount);
      await mineBlock(bot, "stone", toMine);
      cobblestoneCount = bot.inventory.count(mcData.itemsByName["cobblestone"].id);
      bot.chat(`Mined ${toMine} stone. Now have ${cobblestoneCount} cobblestone.`);
    } else {
      // No stone nearby, explore underground
      bot.chat("No stone nearby. Exploring underground...");
      const foundStone = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName["stone"].id,
          maxDistance: 32
        });
        return block;
      });
      if (!foundStone) {
        bot.chat("Could not find stone after exploration.");
        break;
      }
      // After exploration, loop again to mine
    }
  }
  if (cobblestoneCount >= 10) {
    bot.chat(`Successfully mined 10 stone. Task completed.`);
  } else {
    bot.chat(`Failed to mine 10 stone. Only have ${cobblestoneCount} cobblestone.`);
  }
}