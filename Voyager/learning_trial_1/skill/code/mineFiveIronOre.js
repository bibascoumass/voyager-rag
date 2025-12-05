async function mineFiveIronOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Check if we already have 5 raw iron
  let rawIronCount = countItem("raw_iron");
  if (rawIronCount >= 5) {
    bot.chat("Already have at least 5 raw iron.");
    return;
  }

  // Step 2: Ensure iron pickaxe is equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe in inventory. Need to craft one first.");
    // Since we have an iron pickaxe in inventory, this shouldn't happen.
    return;
  }
  if (bot.heldItem?.name !== "iron_pickaxe") {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  }

  // Step 3: Explore underground to find iron ore
  bot.chat("Exploring underground to find iron ore...");
  const ironOreBlock = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName.iron_ore.id,
      maxDistance: 32
    });
    return block;
  });
  if (!ironOreBlock) {
    bot.chat("Could not find iron ore after exploration.");
    return;
  }
  bot.chat("Found iron ore! Mining 5 iron ore blocks.");

  // Step 4: Mine 5 iron ore blocks
  const needed = 5 - rawIronCount;
  // Use mineBlock to mine up to needed blocks
  // mineBlock will collect as many as possible up to count
  await mineBlock(bot, "iron_ore", needed);

  // Step 5: Verify
  rawIronCount = countItem("raw_iron");
  if (rawIronCount >= 5) {
    bot.chat(`Successfully mined 5 iron ore. Now have ${rawIronCount} raw iron.`);
  } else {
    bot.chat(`Only mined ${rawIronCount} raw iron, still short. Need to find more.`);
    // If still short, we could explore again, but for simplicity we stop.
  }
}