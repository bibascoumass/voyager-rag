async function craftIronPickaxe(bot) {
  // Check if we already have an iron pickaxe
  const ironPickaxeItem = mcData.itemsByName.iron_pickaxe;
  if (bot.inventory.count(ironPickaxeItem.id) > 0) {
    bot.chat("Already have an iron pickaxe.");
    return;
  }

  // Ensure we have a crafting table placed nearby
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table...");
    // Find a suitable position near the bot
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

  // Check sticks
  const stickItem = mcData.itemsByName.stick;
  let stickCount = bot.inventory.count(stickItem.id);
  if (stickCount < 2) {
    bot.chat("Crafting sticks...");
    // We need at least 2 sticks, craft from oak_planks
    const oakPlanksItem = mcData.itemsByName.oak_planks;
    const oakPlanksCount = bot.inventory.count(oakPlanksItem.id);
    // Each stick recipe uses 2 planks and yields 4 sticks
    if (oakPlanksCount < 2) {
      bot.chat("Not enough oak planks to craft sticks.");
      // We have oak_log, we could craft more planks, but we have 3 planks already, so this shouldn't happen.
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

  // Check iron ingots
  const ironIngotItem = mcData.itemsByName.iron_ingot;
  const ironIngotCount = bot.inventory.count(ironIngotItem.id);
  if (ironIngotCount < 3) {
    bot.chat(`Need 3 iron ingots, but only have ${ironIngotCount}.`);
    // We have 6, so this shouldn't happen.
    return;
  }

  // Craft iron pickaxe
  bot.chat("Crafting iron pickaxe...");
  try {
    await craftItem(bot, "iron_pickaxe", 1);
  } catch (err) {
    bot.chat(`Failed to craft iron pickaxe: ${err.message}`);
    return;
  }

  // Verify
  if (bot.inventory.count(ironPickaxeItem.id) > 0) {
    bot.chat("Successfully crafted an iron pickaxe.");
  } else {
    bot.chat("Failed to craft an iron pickaxe.");
  }
}