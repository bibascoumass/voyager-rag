async function mineFourCopperOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return item ? bot.inventory.count(item.id) : 0;
  }

  // Step 1: Check if we already have enough raw_copper? Actually task is to mine ore blocks.
  // We'll just mine 4 blocks regardless.
  const requiredOreBlocks = 4;

  // Step 2: Ensure we have a pickaxe that can mine copper (stone or better)
  const pickaxeNames = ["stone_pickaxe", "iron_pickaxe", "golden_pickaxe", "diamond_pickaxe", "netherite_pickaxe"];
  let pickaxeItem = null;
  for (const name of pickaxeNames) {
    const item = mcData.itemsByName[name];
    if (item && countItem(name) > 0) {
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

  // Step 3: Find copper_ore blocks
  let copperOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.copper_ore.id,
    maxDistance: 32,
    count: requiredOreBlocks
  });

  // If not enough, explore
  if (copperOreBlocks.length < requiredOreBlocks) {
    bot.chat("Not enough copper ore nearby, exploring...");
    // Random direction: prefer down because copper ore is often underground
    const directions = [new Vec3(0, -1, 0), new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const foundBlocks = await exploreUntil(bot, randomDir, 60, () => {
      const blocks = bot.findBlocks({
        matching: mcData.blocksByName.copper_ore.id,
        maxDistance: 32,
        count: requiredOreBlocks
      });
      if (blocks.length >= requiredOreBlocks) {
        return blocks;
      }
      return null;
    });
    if (foundBlocks) {
      copperOreBlocks = foundBlocks;
    } else {
      bot.chat("Could not find enough copper ore within exploration time.");
      return;
    }
  }

  // Step 4: Mine the copper ore blocks
  bot.chat(`Found copper ore, mining ${requiredOreBlocks} blocks...`);
  await mineBlock(bot, "copper_ore", requiredOreBlocks);

  // Step 5: Verify
  const rawCopperCount = countItem("raw_copper");
  bot.chat(`Mined ${requiredOreBlocks} copper ore blocks. Now have ${rawCopperCount} raw copper.`);
}