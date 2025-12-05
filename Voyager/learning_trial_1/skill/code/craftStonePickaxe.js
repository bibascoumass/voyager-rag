async function craftStonePickaxe(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check if we already have a stone pickaxe
  if (countItem("stone_pickaxe") > 0) {
    bot.chat("Already have a stone pickaxe.");
    return;
  }

  // Check if we have a crafting table placed nearby
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table.");
    // Place the crafting table near the player
    const tablePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", tablePos);
    craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      bot.chat("Failed to place crafting table.");
      return;
    }
  }

  // Ensure we have at least 2 sticks
  let sticksCount = countItem("stick");
  if (sticksCount < 2) {
    bot.chat(`Need 2 sticks, but only have ${sticksCount}. Crafting sticks from oak planks.`);
    // Check if we have oak planks
    const planksCount = countItem("oak_planks");
    if (planksCount < 2) {
      bot.chat("Not enough oak planks to craft sticks. Need at least 2 oak planks.");
      // We could try to get more planks, but for simplicity, we'll assume we have them.
      return;
    }
    // Craft sticks: 2 planks -> 4 sticks
    await craftItem(bot, "stick", 1);
    sticksCount = countItem("stick");
    if (sticksCount < 2) {
      bot.chat("Failed to craft enough sticks.");
      return;
    }
  }

  // Ensure we have at least 3 cobblestone
  let cobbleCount = countItem("cobblestone");
  if (cobbleCount < 3) {
    bot.chat(`Need 3 cobblestone, but only have ${cobbleCount}. Mining cobblestone.`);
    // Mine cobblestone from stone
    const needed = 3 - cobbleCount;
    try {
      await mineBlock(bot, "stone", needed);
    } catch (error) {
      bot.chat(`Error mining stone: ${error}. Exploring for stone.`);
      // Explore to find stone
      const direction = new Vec3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);
      const foundStone = await exploreUntil(bot, direction, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName.stone.id,
          maxDistance: 32
        });
        return block;
      });
      if (foundStone) {
        await mineBlock(bot, "stone", needed);
      } else {
        bot.chat("Could not find stone.");
        return;
      }
    }
    cobbleCount = countItem("cobblestone");
    if (cobbleCount < 3) {
      bot.chat("Still not enough cobblestone.");
      return;
    }
  }

  // Craft stone pickaxe
  bot.chat("Crafting stone pickaxe.");
  await craftItem(bot, "stone_pickaxe", 1);

  // Verify crafting
  if (countItem("stone_pickaxe") > 0) {
    bot.chat("Successfully crafted a stone pickaxe.");
    // Optionally equip it
    const stonePick = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);
    if (stonePick) {
      await bot.equip(stonePick, "hand");
      bot.chat("Equipped stone pickaxe.");
    }
  } else {
    bot.chat("Failed to craft stone pickaxe.");
  }
}