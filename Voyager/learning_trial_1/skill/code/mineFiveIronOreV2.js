async function mineFiveIronOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Equip iron pickaxe if not already equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe in inventory. Need to craft one first.");
    // Since we have an iron pickaxe in inventory, this shouldn't happen.
    return;
  }
  if (bot.heldItem?.name !== "iron_pickaxe") {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  }

  // Step 2: Check current raw iron count
  let rawIronCount = countItem("raw_iron");
  bot.chat(`I have ${rawIronCount} raw iron.`);
  if (rawIronCount >= 5) {
    bot.chat("Already have at least 5 raw iron.");
    return;
  }

  // Step 3: Calculate how many iron ore blocks we need to mine
  const needed = 5 - rawIronCount;
  bot.chat(`Need to mine ${needed} iron ore blocks.`);

  // Step 4: Look for iron ore nearby
  const ironOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.iron_ore.id,
    maxDistance: 32,
    count: needed
  });
  if (ironOreBlocks.length >= needed) {
    bot.chat(`Found ${ironOreBlocks.length} iron ore blocks nearby. Mining...`);
    try {
      await mineBlock(bot, "iron_ore", needed);
    } catch (error) {
      bot.chat(`Error mining iron ore: ${error}. Trying one by one.`);
      // Fallback: mine one by one
      for (let i = 0; i < needed; i++) {
        const block = bot.findBlock({
          matching: mcData.blocksByName.iron_ore.id,
          maxDistance: 32
        });
        if (block) {
          await mineBlock(bot, "iron_ore", 1);
        } else {
          bot.chat("No more iron ore nearby.");
          break;
        }
      }
    }
  } else {
    bot.chat(`Only found ${ironOreBlocks.length} iron ore blocks nearby. Exploring for more...`);
    // Explore underground to find iron ore
    const foundIronOre = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.iron_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (foundIronOre) {
      // Now mine the needed amount
      for (let i = 0; i < needed; i++) {
        const block = bot.findBlock({
          matching: mcData.blocksByName.iron_ore.id,
          maxDistance: 32
        });
        if (block) {
          await mineBlock(bot, "iron_ore", 1);
        } else {
          bot.chat("Ran out of iron ore while mining.");
          break;
        }
      }
    } else {
      bot.chat("Could not find iron ore after exploration.");
      return;
    }
  }

  // Step 5: Verify
  rawIronCount = countItem("raw_iron");
  if (rawIronCount >= 5) {
    bot.chat(`Successfully mined 5 iron ore. Now have ${rawIronCount} raw iron.`);
  } else {
    bot.chat(`Only mined ${rawIronCount} raw iron, still short.`);
  }
}