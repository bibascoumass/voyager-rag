async function craftIronHelmet(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Check if already have iron helmet
  if (countItem("iron_helmet") > 0) {
    bot.chat("Already have an iron helmet.");
    return;
  }

  // Step 2: Ensure crafting table is placed
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("No crafting table nearby. Placing one.");
    // Find a solid block to place the crafting table on.
    // We'll try the block directly under the player.
    const playerPos = bot.entity.position;
    const groundPos = new Vec3(Math.floor(playerPos.x), Math.floor(playerPos.y) - 1, Math.floor(playerPos.z));
    const groundBlock = bot.blockAt(groundPos);
    if (groundBlock && groundBlock.name !== "air") {
      // Place the crafting table on top of the ground block.
      const tablePos = groundPos.offset(0, 1, 0);
      await placeItem(bot, "crafting_table", tablePos);
    } else {
      // If the block under is air, try to find a nearby solid block.
      // We'll search in a small radius.
      let found = false;
      const offsets = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 1), new Vec3(-1, 0, -1), new Vec3(1, 0, -1), new Vec3(-1, 0, 1)];
      for (const offset of offsets) {
        const checkPos = groundPos.plus(offset);
        const block = bot.blockAt(checkPos);
        if (block && block.name !== "air") {
          const tablePos = checkPos.offset(0, 1, 0);
          await placeItem(bot, "crafting_table", tablePos);
          found = true;
          break;
        }
      }
      if (!found) {
        bot.chat("Could not find a solid block to place crafting table.");
        return;
      }
    }
    // Verify placement
    craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      bot.chat("Failed to place crafting table.");
      return;
    }
  }

  // Step 3: Check for iron ingots
  const ironIngots = countItem("iron_ingot");
  if (ironIngots < 5) {
    bot.chat(`Need 5 iron ingots, but only have ${ironIngots}.`);
    return;
  }

  // Step 4: Craft iron helmet
  bot.chat("Crafting iron helmet.");
  await craftItem(bot, "iron_helmet", 1);

  // Step 5: Verify and optionally equip
  if (countItem("iron_helmet") > 0) {
    bot.chat("Successfully crafted an iron helmet.");
    const ironHelmet = bot.inventory.findInventoryItem(mcData.itemsByName.iron_helmet.id);
    if (ironHelmet) {
      await bot.equip(ironHelmet, "head");
      bot.chat("Equipped iron helmet.");
    }
  } else {
    bot.chat("Failed to craft iron helmet.");
  }
}