async function smeltCopperOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Check for placed furnace
  let furnaceBlock = bot.findBlock({
    matching: mcData.blocksByName.furnace.id,
    maxDistance: 32
  });
  if (!furnaceBlock) {
    bot.chat("No furnace found nearby. Crafting a furnace.");
    // Check if we have a furnace item
    if (countItem("furnace") === 0) {
      // Craft furnace: need 8 cobblestone
      const cobbleCount = countItem("cobblestone");
      if (cobbleCount < 8) {
        bot.chat(`Not enough cobblestone to craft furnace. Have ${cobbleCount}, need 8.`);
        // Mine more cobblestone if needed (but we have 14)
        return;
      }
      // Ensure crafting table is placed
      let craftingTableBlock = bot.findBlock({
        matching: mcData.blocksByName.crafting_table.id,
        maxDistance: 32
      });
      if (!craftingTableBlock) {
        bot.chat("Placing crafting table.");
        const tablePos = bot.entity.position.offset(1, 0, 0);
        await placeItem(bot, "crafting_table", tablePos);
        craftingTableBlock = bot.findBlock({
          matching: mcData.blocksByName.crafting_table.id,
          maxDistance: 32
        });
      }
      // Craft furnace
      await craftItem(bot, "furnace", 1);
      bot.chat("Furnace crafted.");
    }
    // Place furnace
    const furnacePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "furnace", furnacePos);
    furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("Failed to place furnace.");
      return;
    }
  }

  // Step 2: Mine copper ore if not already in inventory
  if (countItem("copper_ore") === 0) {
    bot.chat("Mining one copper ore.");
    // Ensure we have a pickaxe equipped (stone or better)
    const pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id) || bot.inventory.findInventoryItem(mcData.itemsByName.wooden_pickaxe.id);
    if (pickaxe && bot.heldItem?.name !== "stone_pickaxe" && bot.heldItem?.name !== "wooden_pickaxe") {
      await bot.equip(pickaxe, "hand");
    }
    // Look for copper ore nearby
    const copperOreBlock = bot.findBlock({
      matching: mcData.blocksByName.copper_ore.id,
      maxDistance: 32
    });
    if (!copperOreBlock) {
      bot.chat("No copper ore nearby. Exploring...");
      const direction = new Vec3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);
      const found = await exploreUntil(bot, direction, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName.copper_ore.id,
          maxDistance: 32
        });
        return block;
      });
      if (!found) {
        bot.chat("Could not find copper ore.");
        return;
      }
    }
    // Mine one copper ore
    await mineBlock(bot, "copper_ore", 1);
    bot.chat("Copper ore mined.");
  }

  // Step 3: Smelt copper ore
  if (countItem("copper_ore") > 0) {
    bot.chat("Smelting copper ore into copper ingot.");
    await smeltItem(bot, "copper_ore", "coal", 1);
    // Verify
    if (countItem("copper_ingot") > 0) {
      bot.chat("Successfully smelted 1 copper ingot.");
    } else {
      bot.chat("Failed to smelt copper ore.");
    }
  } else {
    bot.chat("No copper ore to smelt.");
  }
}