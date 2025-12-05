async function mineCopperOre(bot) {
  // Check if we already have copper_ore
  const copperOreId = mcData.itemsByName.copper_ore?.id;
  if (!copperOreId) {
    bot.chat("Copper ore item not found in data.");
    return;
  }
  if (bot.inventory.count(copperOreId) >= 1) {
    bot.chat("Already have 1 copper ore.");
    return;
  }

  // Ensure we have a pickaxe that can mine copper (stone or better)
  const stonePickaxeId = mcData.itemsByName.stone_pickaxe.id;
  const woodenPickaxeId = mcData.itemsByName.wooden_pickaxe.id;
  const diamondPickaxeId = mcData.itemsByName.diamond_pickaxe.id;
  const ironPickaxeId = mcData.itemsByName.iron_pickaxe.id;
  const goldenPickaxeId = mcData.itemsByName.golden_pickaxe.id;
  const netheritePickaxeId = mcData.itemsByName.netherite_pickaxe.id;
  const pickaxes = [stonePickaxeId, woodenPickaxeId, diamondPickaxeId, ironPickaxeId, goldenPickaxeId, netheritePickaxeId];
  let hasPickaxe = false;
  for (const pickaxeId of pickaxes) {
    if (bot.inventory.count(pickaxeId) > 0) {
      hasPickaxe = true;
      break;
    }
  }
  if (!hasPickaxe) {
    bot.chat("No pickaxe available to mine copper ore.");
    // We could craft a stone pickaxe, but we have one in inventory, so this shouldn't happen.
    return;
  }

  // Try to mine copper ore directly if within range
  const copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName.copper_ore.id,
    maxDistance: 32
  });
  if (copperOreBlock) {
    bot.chat("Found copper ore nearby. Mining...");
    await mineBlock(bot, "copper_ore", 1);
  } else {
    // Explore until we find copper ore
    bot.chat("No copper ore nearby. Exploring...");
    // Choose a random direction (including down because copper ore is underground)
    const directions = [new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1), new Vec3(0, -1, 0),
    // down
    new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0), new Vec3(-1, 0, 0)];
    const randomIndex = Math.floor(Math.random() * directions.length);
    const direction = directions[randomIndex];
    const found = await exploreUntil(bot, direction, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.copper_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (found) {
      bot.chat("Found copper ore during exploration. Mining...");
      await mineBlock(bot, "copper_ore", 1);
    } else {
      bot.chat("Could not find copper ore within exploration time.");
      return;
    }
  }

  // Verify
  if (bot.inventory.count(copperOreId) >= 1) {
    bot.chat("Successfully mined 1 copper ore.");
  } else {
    bot.chat("Failed to mine copper ore.");
  }
}