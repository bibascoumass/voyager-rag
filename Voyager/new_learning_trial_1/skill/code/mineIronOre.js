async function mineIronOre(bot) {
  // Check if we already have raw_iron
  const rawIronItem = mcData.itemsByName.raw_iron;
  if (bot.inventory.count(rawIronItem.id) > 0) {
    bot.chat("Already have raw iron.");
    return;
  }

  // Ensure we have a pickaxe that can mine iron (stone or better)
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

  // Find iron_ore nearby
  let ironOreBlock = bot.findBlock({
    matching: mcData.blocksByName.iron_ore.id,
    maxDistance: 32
  });

  // If not found, explore
  if (!ironOreBlock) {
    bot.chat("No iron ore nearby, exploring...");
    // Random direction
    const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0), new Vec3(0, -1, 0)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    ironOreBlock = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.iron_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (!ironOreBlock) {
      bot.chat("Could not find iron ore within exploration time.");
      return;
    }
  }

  // Mine the iron ore
  bot.chat("Found iron ore, mining...");
  await mineBlock(bot, "iron_ore", 1);

  // Verify
  if (bot.inventory.count(rawIronItem.id) > 0) {
    bot.chat("Successfully mined 1 iron ore.");
  } else {
    bot.chat("Failed to mine iron ore.");
  }
}