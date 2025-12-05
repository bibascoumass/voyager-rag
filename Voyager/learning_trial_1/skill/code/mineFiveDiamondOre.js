// helper function to count items
function countItem(bot, name) {
  const item = mcData.itemsByName[name];
  return bot.inventory.count(item.id);
}

async function mineFiveDiamondOre(bot) {
  // Step 1: Check current diamond ore count
  let diamondOreCount = countItem(bot, "diamond");
  bot.chat(`I have ${diamondOreCount} diamonds.`);
  if (diamondOreCount >= 5) {
    bot.chat("Already have at least 5 diamonds.");
    return;
  }

  // Step 2: Ensure we have an iron pickaxe equipped
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe in inventory. Cannot mine diamond ore.");
    return;
  }
  if (bot.heldItem?.name !== "iron_pickaxe") {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  }

  // Step 3: Explore and mine until we have 5 diamonds
  const needed = 5 - diamondOreCount;
  bot.chat(`Need to mine ${needed} diamond ore blocks.`);

  // We'll try to find diamond ore by exploring downwards and horizontally
  let mined = 0;
  while (mined < needed) {
    // First, try to find diamond ore nearby
    const diamondOreBlock = bot.findBlock({
      matching: mcData.blocksByName.diamond_ore.id,
      maxDistance: 32
    });
    if (diamondOreBlock) {
      bot.chat("Found diamond ore nearby. Mining...");
      try {
        await mineBlock(bot, "diamond_ore", 1);
        mined++;
        diamondOreCount = countItem(bot, "diamond");
        bot.chat(`Mined diamond ore. Now have ${diamondOreCount} diamonds.`);
        continue;
      } catch (error) {
        bot.chat(`Error mining diamond ore: ${error}. Trying to explore.`);
      }
    }

    // If not found nearby, explore in a random direction (prefer downwards)
    // Choose a random direction: 0 for down, 1-4 for horizontal
    const dirChoice = Math.floor(Math.random() * 5);
    let direction;
    if (dirChoice === 0) {
      direction = new Vec3(0, -1, 0); // down
    } else {
      // horizontal directions
      const dirs = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
      direction = dirs[dirChoice - 1];
    }
    bot.chat(`Exploring in direction ${direction} to find diamond ore.`);
    const foundOre = await exploreUntil(bot, direction, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.diamond_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (foundOre) {
      bot.chat("Found diamond ore during exploration. Mining...");
      try {
        await mineBlock(bot, "diamond_ore", 1);
        mined++;
        diamondOreCount = countItem(bot, "diamond");
        bot.chat(`Mined diamond ore. Now have ${diamondOreCount} diamonds.`);
      } catch (error) {
        bot.chat(`Error mining diamond ore: ${error}.`);
      }
    } else {
      bot.chat("Could not find diamond ore in this direction. Trying another direction.");
      // Optionally place a torch to mark explored area
      if (countItem(bot, "torch") > 0) {
        // Place a torch on a solid block near the bot
        const torchPos = bot.entity.position.offset(0, 0, 0).floored();
        const blockBelow = bot.blockAt(torchPos.offset(0, -1, 0));
        if (blockBelow && blockBelow.name !== "air") {
          await placeItem(bot, "torch", torchPos);
        }
      }
    }
  }

  // Final check
  diamondOreCount = countItem(bot, "diamond");
  if (diamondOreCount >= 5) {
    bot.chat(`Successfully mined 5 diamond ore. Now have ${diamondOreCount} diamonds.`);
  } else {
    bot.chat(`Only mined ${diamondOreCount} diamonds, still short.`);
  }
}