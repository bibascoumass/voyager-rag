async function mineCopperOre(bot) {
  // Check for a pickaxe that can mine copper ore (stone or better)
  const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "diamond_pickaxe", "golden_pickaxe", "netherite_pickaxe"];
  let hasPickaxe = false;
  for (const name of pickaxeNames) {
    if (bot.inventory.count(mcData.itemsByName[name]?.id || 0) > 0) {
      hasPickaxe = true;
      break;
    }
  }
  if (!hasPickaxe) {
    bot.chat("No suitable pickaxe found. Need at least stone pickaxe.");
    // We could craft one, but we have stone_pickaxe, so this shouldn't happen.
    return;
  }

  // Find copper ore block nearby
  const copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName["copper_ore"].id,
    maxDistance: 32
  });
  if (copperOreBlock) {
    bot.chat("Found copper ore nearby. Mining...");
    await mineBlock(bot, "copper_ore", 1);
    bot.chat("Successfully mined 1 copper ore.");
    return;
  }

  // If not found, explore in a random direction
  const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1), new Vec3(0, -1, 0),
  // down
  new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0), new Vec3(-1, 0, 0)];
  const randomIndex = Math.floor(Math.random() * directions.length);
  const direction = directions[randomIndex];
  bot.chat("No copper ore nearby. Exploring...");
  const foundBlock = await exploreUntil(bot, direction, 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName["copper_ore"].id,
      maxDistance: 32
    });
    return block;
  });
  if (foundBlock) {
    bot.chat("Found copper ore during exploration. Mining...");
    await mineBlock(bot, "copper_ore", 1);
    bot.chat("Successfully mined 1 copper ore.");
  } else {
    bot.chat("Could not find copper ore within exploration time.");
  }
}