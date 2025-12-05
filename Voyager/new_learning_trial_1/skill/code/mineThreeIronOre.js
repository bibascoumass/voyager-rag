async function mineThreeIronOre(bot) {
  // Check if we already have enough raw_iron
  const rawIronItem = mcData.itemsByName.raw_iron;
  const requiredCount = 3;
  if (bot.inventory.count(rawIronItem.id) >= requiredCount) {
    bot.chat("Already have at least 3 raw iron.");
    return;
  }

  // Ensure we have a stone pickaxe or better
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

  // Explore until we find at least 3 iron_ore blocks
  bot.chat("Exploring to find iron ore...");
  const ironOreBlocks = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const blocks = bot.findBlocks({
      matching: mcData.blocksByName.iron_ore.id,
      maxDistance: 32,
      count: requiredCount
    });
    if (blocks.length >= requiredCount) {
      return blocks;
    }
    return null;
  });
  if (!ironOreBlocks) {
    bot.chat("Could not find enough iron ore within exploration time.");
    return;
  }

  // Mine the iron ore
  bot.chat(`Found iron ore, mining ${requiredCount}...`);
  await mineBlock(bot, "iron_ore", requiredCount);

  // Verify
  const rawIronCount = bot.inventory.count(rawIronItem.id);
  if (rawIronCount >= requiredCount) {
    bot.chat(`Successfully mined ${requiredCount} iron ore. Now have ${rawIronCount} raw iron.`);
  } else {
    bot.chat(`Failed to mine enough iron ore. Only have ${rawIronCount} raw iron.`);
  }
}