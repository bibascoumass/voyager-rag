async function craftWoodenPickaxe(bot) {
  // Check if we already have a wooden pickaxe
  const woodenPickaxeItem = mcData.itemsByName.wooden_pickaxe;
  if (bot.inventory.count(woodenPickaxeItem.id) > 0) {
    bot.chat("Already have a wooden pickaxe.");
    return;
  }

  // Place crafting table if not already placed nearby
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table...");
    // Find a suitable position near the bot to place the crafting table
    const placePos = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", placePos);
    // Update the crafting table block
    craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName.crafting_table.id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      bot.chat("Failed to place crafting table.");
      return;
    }
  }

  // Ensure we have enough oak_planks (need at least 5)
  const oakPlanksItem = mcData.itemsByName.oak_planks;
  let oakPlanksCount = bot.inventory.count(oakPlanksItem.id);
  if (oakPlanksCount < 5) {
    bot.chat("Crafting oak planks...");
    // We have oak_log, craft planks from them
    const oakLogItem = mcData.itemsByName.oak_log;
    const oakLogCount = bot.inventory.count(oakLogItem.id);
    // Each log gives 4 planks, we need at least 5 planks, so we need 2 logs (8 planks)
    const logsNeeded = Math.ceil((5 - oakPlanksCount) / 4);
    if (oakLogCount < logsNeeded) {
      bot.chat(`Not enough oak logs. Need ${logsNeeded}, have ${oakLogCount}.`);
      // We could mine more logs, but the task assumes we have enough. For robustness, we could explore and mine.
      // However, the inventory shows 3 oak_log, which is enough for 12 planks.
      // So we should be fine.
      return;
    }
    // Craft planks using the crafting table
    // craftItem function crafts the item using the crafting table.
    // We need to craft planks multiple times? Actually, craftItem can craft multiple items at once?
    // The craftItem function uses bot.craft with the recipe and count. The count is the number of times to craft the recipe.
    // For oak_planks, the recipe yields 4 planks per log. So if we want 8 planks, we need to craft 2 times.
    // We'll craft logsNeeded times.
    try {
      await craftItem(bot, "oak_planks", logsNeeded);
    } catch (err) {
      bot.chat(`Failed to craft oak planks: ${err.message}`);
      return;
    }
    // Update count
    oakPlanksCount = bot.inventory.count(oakPlanksItem.id);
    bot.chat(`Now have ${oakPlanksCount} oak planks.`);
  }

  // Ensure we have sticks (need at least 2)
  const stickItem = mcData.itemsByName.stick;
  let stickCount = bot.inventory.count(stickItem.id);
  if (stickCount < 2) {
    bot.chat("Crafting sticks...");
    // Each craft of sticks requires 2 planks and yields 4 sticks.
    // We need at least 2 sticks, so craft once.
    // Check if we have enough planks (need 2 planks)
    if (oakPlanksCount < 2) {
      bot.chat("Not enough planks to craft sticks.");
      return;
    }
    try {
      await craftItem(bot, "stick", 1);
    } catch (err) {
      bot.chat(`Failed to craft sticks: ${err.message}`);
      return;
    }
    stickCount = bot.inventory.count(stickItem.id);
    bot.chat(`Now have ${stickCount} sticks.`);
  }

  // Craft wooden pickaxe
  bot.chat("Crafting wooden pickaxe...");
  try {
    await craftItem(bot, "wooden_pickaxe", 1);
  } catch (err) {
    bot.chat(`Failed to craft wooden pickaxe: ${err.message}`);
    return;
  }

  // Final check
  if (bot.inventory.count(woodenPickaxeItem.id) > 0) {
    bot.chat("Successfully crafted a wooden pickaxe.");
  } else {
    bot.chat("Failed to craft a wooden pickaxe.");
  }
}