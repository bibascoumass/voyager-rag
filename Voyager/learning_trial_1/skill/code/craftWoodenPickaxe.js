async function craftWoodenPickaxe(bot) {
  // Helper function to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Ensure we have a crafting table placed
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

  // Step 2: Check planks and craft more if needed
  let planksCount = countItem("oak_planks");
  if (planksCount < 3) {
    bot.chat(`Only have ${planksCount} oak planks, need at least 3.`);
    // Check if we have oak logs to craft more planks
    const logsCount = countItem("oak_log");
    if (logsCount > 0) {
      bot.chat(`Crafting oak planks from ${Math.min(logsCount, 1)} oak log.`);
      // Craft planks: one log yields 4 planks
      await craftItem(bot, "oak_planks", 1);
      planksCount = countItem("oak_planks");
      bot.chat(`Now have ${planksCount} oak planks.`);
    } else {
      bot.chat("No oak logs to craft planks. Need to find oak logs.");
      // Explore to find oak logs
      const direction = new Vec3(Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1);
      const foundLog = await exploreUntil(bot, direction, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName.oak_log.id,
          maxDistance: 32
        });
        return block;
      });
      if (foundLog) {
        await mineBlock(bot, "oak_log", 1);
        // Now craft planks
        await craftItem(bot, "oak_planks", 1);
        planksCount = countItem("oak_planks");
      } else {
        bot.chat("Could not find oak logs.");
        return;
      }
    }
  }

  // Step 3: Check sticks (we should have enough, but verify)
  let sticksCount = countItem("stick");
  if (sticksCount < 2) {
    bot.chat(`Only have ${sticksCount} sticks, need at least 2.`);
    // Craft sticks from planks
    if (planksCount >= 2) {
      bot.chat("Crafting sticks.");
      await craftItem(bot, "stick", 1); // 2 planks -> 4 sticks
      sticksCount = countItem("stick");
    } else {
      // Need more planks first
      bot.chat("Not enough planks for sticks.");
      // This shouldn't happen because we already ensured planks >=3
      return;
    }
  }

  // Step 4: Craft wooden pickaxe
  planksCount = countItem("oak_planks");
  sticksCount = countItem("stick");
  if (planksCount >= 3 && sticksCount >= 2) {
    bot.chat("Crafting wooden pickaxe.");
    await craftItem(bot, "wooden_pickaxe", 1);
    const pickaxeCount = countItem("wooden_pickaxe");
    if (pickaxeCount > 0) {
      bot.chat("Successfully crafted a wooden pickaxe.");
    } else {
      bot.chat("Failed to craft wooden pickaxe.");
    }
  } else {
    bot.chat(`Cannot craft wooden pickaxe: need 3 planks and 2 sticks, have ${planksCount} planks and ${sticksCount} sticks.`);
  }
}