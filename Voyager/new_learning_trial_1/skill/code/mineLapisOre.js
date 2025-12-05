async function mineLapisOre(bot) {
  // Check if we already have lapis lazuli
  const lapisItem = mcData.itemsByName.lapis_lazuli;
  if (bot.inventory.count(lapisItem.id) > 0) {
    bot.chat("Already have lapis lazuli.");
    return;
  }

  // Ensure we have a pickaxe that can mine lapis (stone or better)
  const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
  let hasPickaxe = false;
  for (const name of pickaxeNames) {
    const item = mcData.itemsByName[name];
    if (item && bot.inventory.count(item.id) > 0) {
      hasPickaxe = true;
      break;
    }
  }
  if (!hasPickaxe) {
    bot.chat("No suitable pickaxe (stone or better) found.");
    return;
  }

  // Find lapis_ore nearby
  let lapisOreBlock = bot.findBlock({
    matching: mcData.blocksByName.lapis_ore.id,
    maxDistance: 32
  });

  // If not found, explore
  if (!lapisOreBlock) {
    bot.chat("No lapis ore nearby, exploring...");
    // Random direction
    const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    lapisOreBlock = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.lapis_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (!lapisOreBlock) {
      bot.chat("Could not find lapis ore within exploration time.");
      return;
    }
  }

  // Mine the lapis ore
  bot.chat("Found lapis ore, mining...");
  await mineBlock(bot, "lapis_ore", 1);

  // Verify
  if (bot.inventory.count(lapisItem.id) > 0) {
    bot.chat("Successfully mined 1 lapis lazuli.");
  } else {
    bot.chat("Failed to mine lapis lazuli.");
  }
}