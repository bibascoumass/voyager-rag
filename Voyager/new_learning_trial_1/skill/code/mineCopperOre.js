async function mineCopperOre(bot) {
  // Check if we already have raw_copper
  const rawCopperItem = mcData.itemsByName.raw_copper;
  if (rawCopperItem && bot.inventory.count(rawCopperItem.id) > 0) {
    bot.chat("Already have raw copper.");
    return;
  }

  // Ensure we have a pickaxe that can mine copper (stone or better)
  const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
  let pickaxeItem = null;
  for (const name of pickaxeNames) {
    const item = mcData.itemsByName[name];
    if (item && bot.inventory.count(item.id) > 0) {
      pickaxeItem = item;
      break;
    }
  }
  if (!pickaxeItem) {
    bot.chat("No suitable pickaxe (stone or better) found.");
    return;
  }
  // Equip the pickaxe
  const pickaxe = bot.inventory.findInventoryItem(pickaxeItem.id);
  if (pickaxe) {
    await bot.equip(pickaxe, "hand");
  }

  // Find copper_ore nearby
  let copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName.copper_ore.id,
    maxDistance: 32
  });

  // If not found, explore
  if (!copperOreBlock) {
    bot.chat("No copper ore nearby, exploring...");
    // Random direction
    const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    copperOreBlock = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.copper_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (!copperOreBlock) {
      bot.chat("Could not find copper ore within exploration time.");
      return;
    }
  }

  // Mine the copper ore
  bot.chat("Found copper ore, mining...");
  await mineBlock(bot, "copper_ore", 1);

  // Verify
  if (rawCopperItem && bot.inventory.count(rawCopperItem.id) > 0) {
    bot.chat("Successfully mined 1 copper ore.");
  } else {
    bot.chat("Failed to mine copper ore.");
  }
}