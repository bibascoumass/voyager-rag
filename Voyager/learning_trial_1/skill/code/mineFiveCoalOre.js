async function mineFiveCoalOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check current coal count
  let coalCount = countItem("coal");
  bot.chat(`I have ${coalCount} coal.`);
  if (coalCount >= 5) {
    bot.chat("Already have at least 5 coal.");
    return;
  }

  // Ensure we have a pickaxe that can mine coal (wooden or better)
  const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id) || bot.inventory.findInventoryItem(mcData.itemsByName.wooden_pickaxe.id);
  if (!pickaxe) {
    bot.chat("No pickaxe available. Need to craft one.");
    // Since we have materials, we could craft, but according to inventory we have pickaxes.
    return;
  }
  // Equip a pickaxe if not already equipped
  if (bot.heldItem?.name !== "stone_pickaxe" && bot.heldItem?.name !== "wooden_pickaxe") {
    await bot.equip(pickaxe, "hand");
    bot.chat("Equipped pickaxe.");
  }

  // Calculate how many coal ore blocks we need to mine
  const needed = 5 - coalCount;
  bot.chat(`Need to mine ${needed} coal ore blocks.`);

  // Look for coal ore nearby
  const coalOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.coal_ore.id,
    maxDistance: 32,
    count: needed
  });
  if (coalOreBlocks.length >= needed) {
    bot.chat(`Found ${coalOreBlocks.length} coal ore blocks nearby. Mining...`);
    try {
      await mineBlock(bot, "coal_ore", needed);
    } catch (error) {
      bot.chat(`Error mining coal ore: ${error}. Trying one by one.`);
      // Fallback: mine one by one
      for (let i = 0; i < needed; i++) {
        const block = bot.findBlock({
          matching: mcData.blocksByName.coal_ore.id,
          maxDistance: 32
        });
        if (block) {
          await mineBlock(bot, "coal_ore", 1);
        } else {
          bot.chat("No more coal ore nearby.");
          break;
        }
      }
    }
  } else {
    bot.chat(`Only found ${coalOreBlocks.length} coal ore blocks nearby. Exploring for more...`);
    // Explore in a random direction to find coal ore
    const directions = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, 1), new Vec3(-1, 0, -1)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    const foundCoal = await exploreUntil(bot, randomDir, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.coal_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (foundCoal) {
      // Now mine the needed amount
      for (let i = 0; i < needed; i++) {
        const block = bot.findBlock({
          matching: mcData.blocksByName.coal_ore.id,
          maxDistance: 32
        });
        if (block) {
          await mineBlock(bot, "coal_ore", 1);
        } else {
          bot.chat("Ran out of coal ore while mining.");
          break;
        }
      }
    } else {
      bot.chat("Could not find coal ore after exploration.");
      return;
    }
  }

  // Final check
  coalCount = countItem("coal");
  if (coalCount >= 5) {
    bot.chat(`Successfully mined 5 coal. Now have ${coalCount}.`);
  } else {
    bot.chat(`Only mined ${coalCount} coal, still short.`);
  }
}