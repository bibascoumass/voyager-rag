async function mineCopperOre(bot) {
  // Check if we already have raw_copper from mining copper ore? The task is to mine copper ore block.
  // We'll just mine one copper ore block.
  const copperOreBlockName = "copper_ore";
  const rawCopperName = "raw_copper";
  const rawCopperId = mcData.itemsByName[rawCopperName].id;
  const initialRawCopper = bot.inventory.count(rawCopperId);

  // Ensure we have a pickaxe that can mine copper ore (stone or better)
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

  // Try to find copper ore block nearby
  const copperOreBlock = bot.findBlock({
    matching: mcData.blocksByName[copperOreBlockName].id,
    maxDistance: 32
  });
  if (copperOreBlock) {
    bot.chat("Found copper ore nearby. Mining...");
    await mineBlock(bot, copperOreBlockName, 1);
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
        matching: mcData.blocksByName[copperOreBlockName].id,
        maxDistance: 32
      });
      return block;
    });
    if (found) {
      bot.chat("Found copper ore during exploration. Mining...");
      await mineBlock(bot, copperOreBlockName, 1);
    } else {
      bot.chat("Could not find copper ore within exploration time.");
      return;
    }
  }

  // Verify that raw_copper increased
  const finalRawCopper = bot.inventory.count(rawCopperId);
  if (finalRawCopper > initialRawCopper) {
    bot.chat(`Successfully mined copper ore. Raw copper increased from ${initialRawCopper} to ${finalRawCopper}.`);
  } else {
    bot.chat("Failed to mine copper ore.");
  }
}