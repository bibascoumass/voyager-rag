// helper function to count items
function countItem(bot, name) {
  const item = mcData.itemsByName[name];
  return bot.inventory.count(item.id);
}

async function craftIronChestplate(bot) {
  // Step 1: Check if already have iron chestplate
  if (countItem(bot, "iron_chestplate") > 0) {
    bot.chat("Already have an iron chestplate.");
    return;
  }

  // Step 2: Count iron ingots
  let ironIngots = countItem(bot, "iron_ingot");
  if (ironIngots >= 8) {
    bot.chat(`Have ${ironIngots} iron ingots, enough to craft.`);
  } else {
    bot.chat(`Only have ${ironIngots} iron ingots, need 8. Need to mine iron ore.`);
    // Step 3: Mine iron ore
    // We need at least (8 - ironIngots) raw iron, which is at least that many iron ore.
    const needed = 8 - ironIngots;
    bot.chat(`Need to mine at least ${needed} iron ore.`);
    // Explore for iron ore
    const direction = new Vec3(0, -1, 0); // look underground
    const ironOreBlock = await exploreUntil(bot, direction, 60, () => {
      const block = bot.findBlock({
        matching: mcData.blocksByName.iron_ore.id,
        maxDistance: 32
      });
      return block;
    });
    if (!ironOreBlock) {
      bot.chat("Could not find iron ore within exploration time.");
      return;
    }
    // Mine the required amount
    try {
      await mineBlock(bot, "iron_ore", needed);
    } catch (err) {
      bot.chat(`Failed to mine iron ore: ${err}. Trying to explore more.`);
      // Try again with another direction
      const dir2 = new Vec3(Math.random() > 0.5 ? 1 : -1, -1, Math.random() > 0.5 ? 1 : -1);
      const found = await exploreUntil(bot, dir2, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName.iron_ore.id,
          maxDistance: 32
        });
        return block;
      });
      if (found) {
        await mineBlock(bot, "iron_ore", needed);
      } else {
        bot.chat("Still cannot find iron ore.");
        return;
      }
    }

    // Step 4: Check furnace
    let furnaceBlock = bot.findBlock({
      matching: mcData.blocksByName.furnace.id,
      maxDistance: 32
    });
    if (!furnaceBlock) {
      bot.chat("No furnace nearby. Placing one.");
      if (countItem(bot, "furnace") === 0) {
        bot.chat("No furnace in inventory.");
        return;
      }
      // Place furnace near the player
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

    // Step 5: Smelt raw iron
    const rawIronCount = countItem(bot, "raw_iron");
    const coalCount = countItem(bot, "coal");
    if (rawIronCount < needed) {
      bot.chat(`Mined ${rawIronCount} raw iron, but need ${needed}.`);
      // We might have mined less than needed, but we'll smelt what we have.
    }
    if (coalCount < needed) {
      bot.chat(`Not enough coal. Have ${coalCount}, need ${needed}.`);
      // We have 8 coal, so should be enough.
    }
    const toSmelt = Math.min(rawIronCount, needed);
    bot.chat(`Smelting ${toSmelt} raw iron.`);
    await smeltItem(bot, "raw_iron", "coal", toSmelt);

    // Update iron ingot count
    ironIngots = countItem(bot, "iron_ingot");
    if (ironIngots < 8) {
      bot.chat(`Still only have ${ironIngots} iron ingots. Cannot craft.`);
      return;
    }
  }

  // Step 6: Ensure crafting table is placed
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("No crafting table nearby. Placing one.");
    if (countItem(bot, "crafting_table") === 0) {
      bot.chat("No crafting table in inventory.");
      return;
    }
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

  // Step 7: Craft iron chestplate
  bot.chat("Crafting iron chestplate.");
  await craftItem(bot, "iron_chestplate", 1);

  // Step 8: Verify and equip
  if (countItem(bot, "iron_chestplate") > 0) {
    bot.chat("Successfully crafted an iron chestplate.");
    const ironChestplate = bot.inventory.findInventoryItem(mcData.itemsByName.iron_chestplate.id);
    if (ironChestplate) {
      await bot.equip(ironChestplate, "torso");
      bot.chat("Equipped iron chestplate.");
    }
  } else {
    bot.chat("Failed to craft iron chestplate.");
  }
}