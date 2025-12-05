async function mineCopperOre(bot) {
  // Check for stone pickaxe in inventory
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
  // Check if we have a stone pickaxe equipped in hand
  const heldItem = bot.heldItem;
  if (!heldItem || heldItem.name !== "stone_pickaxe") {
    if (stonePickaxe) {
      await bot.equip(stonePickaxe, "hand");
      bot.chat("Equipped stone pickaxe.");
    } else {
      bot.chat("No stone pickaxe available. Cannot mine copper ore.");
      return;
    }
  } else {
    bot.chat("Stone pickaxe already equipped.");
  }

  // Find copper ore
  let copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName["copper_ore"].id,
    maxDistance: 32
  });
  if (!copperOreBlock) {
    bot.chat("No copper ore nearby. Exploring...");
    // Explore in a random direction (prioritize down because ore is underground)
    const directions = [new Vec3(0, -1, 0), new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const foundOre = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName["copper_ore"].id,
        maxDistance: 32
      });
      return block;
    });
    if (!foundOre) {
      bot.chat("Could not find copper ore after exploration.");
      return;
    }
    copperOreBlock = foundOre;
  }

  // Mine one copper ore
  bot.chat("Mining copper ore...");
  await mineBlock(bot, "copper_ore", 1);

  // Verify
  const rawCopperCount = bot.inventory.count(mcData.itemsByName["raw_copper"].id);
  if (rawCopperCount > 0) {
    bot.chat(`Successfully mined 1 copper ore. Now have ${rawCopperCount} raw copper.`);
  } else {
    bot.chat("Failed to obtain raw copper.");
  }
}