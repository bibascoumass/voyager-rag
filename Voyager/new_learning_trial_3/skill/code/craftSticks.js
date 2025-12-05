async function craftSticks(bot) {
  // Check current planks count
  let planksCount = bot.inventory.count(mcData.itemsByName["spruce_planks"].id);
  bot.chat(`I have ${planksCount} spruce planks.`);
  if (planksCount < 2) {
    bot.chat("Need more planks. Crafting from spruce logs...");
    // We have 11 spruce_logs, enough for many planks.
    // Each craft uses 1 log and yields 4 planks.
    const logsNeeded = Math.ceil((2 - planksCount) / 4); // each craft gives 4 planks
    // But we can just craft one batch (1 log) to get 4 planks, which is enough.
    // Place a crafting table first if not already placed nearby.
    const craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName["crafting_table"].id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      const placePos = bot.entity.position.offset(1, 0, 0);
      await placeItem(bot, "crafting_table", placePos);
      bot.chat("Placed crafting table.");
    }
    await craftItem(bot, "spruce_planks", 1); // craft one batch (4 planks)
    planksCount = bot.inventory.count(mcData.itemsByName["spruce_planks"].id);
    bot.chat(`Now have ${planksCount} spruce planks.`);
  }

  // Ensure we have a crafting table placed
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName["crafting_table"].id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", placePos);
    bot.chat("Placed crafting table.");
    craftingTableBlock = bot.blockAt(placePos);
  }

  // Craft sticks
  const sticksBefore = bot.inventory.count(mcData.itemsByName["stick"].id);
  bot.chat(`Crafting sticks... Currently have ${sticksBefore} sticks.`);
  await craftItem(bot, "stick", 1); // 1 recipe yields 4 sticks
  const sticksAfter = bot.inventory.count(mcData.itemsByName["stick"].id);
  bot.chat(`Crafted ${sticksAfter - sticksBefore} sticks. Now have ${sticksAfter} sticks.`);
  if (sticksAfter >= sticksBefore + 4) {
    bot.chat("Successfully crafted 4 sticks.");
  } else {
    bot.chat("Failed to craft 4 sticks.");
  }
}