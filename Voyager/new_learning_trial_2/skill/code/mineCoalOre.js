async function mineCoalOre(bot) {
  // Check for a pickaxe that can mine coal ore (wooden or better)
  const pickaxeNames = ["wooden_pickaxe", "stone_pickaxe", "iron_pickaxe", "diamond_pickaxe", "golden_pickaxe", "netherite_pickaxe"];
  let hasPickaxe = false;
  for (const name of pickaxeNames) {
    if (bot.inventory.count(mcData.itemsByName[name]?.id || 0) > 0) {
      hasPickaxe = true;
      break;
    }
  }
  if (!hasPickaxe) {
    bot.chat("No suitable pickaxe found. Need at least wooden pickaxe.");
    // Since we have wooden_pickaxe and stone_pickaxe, this shouldn't happen.
    return;
  }

  // Check if coal ore is nearby
  const coalOreBlock = bot.findBlock({
    matching: mcData.blocksByName["coal_ore"].id,
    maxDistance: 32
  });
  if (coalOreBlock) {
    bot.chat("Found coal ore nearby. Mining...");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Successfully mined 1 coal ore.");
    // Verify
    const coalCount = bot.inventory.count(mcData.itemsByName.coal.id);
    if (coalCount > 0) {
      bot.chat(`Now have ${coalCount} coal.`);
    } else {
      bot.chat("Failed to collect coal.");
    }
    return;
  }

  // If not found, explore in a random direction
  const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1), new Vec3(0, -1, 0),
  // down
  new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0), new Vec3(-1, 0, 0)];
  const randomIndex = Math.floor(Math.random() * directions.length);
  const direction = directions[randomIndex];
  bot.chat("No coal ore nearby. Exploring...");
  const foundBlock = await exploreUntil(bot, direction, 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName["coal_ore"].id,
      maxDistance: 32
    });
    return block;
  });
  if (foundBlock) {
    bot.chat("Found coal ore during exploration. Mining...");
    await mineBlock(bot, "coal_ore", 1);
    bot.chat("Successfully mined 1 coal ore.");
    const coalCount = bot.inventory.count(mcData.itemsByName.coal.id);
    if (coalCount > 0) {
      bot.chat(`Now have ${coalCount} coal.`);
    } else {
      bot.chat("Failed to collect coal.");
    }
  } else {
    bot.chat("Could not find coal ore within exploration time.");
  }
}