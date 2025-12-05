async function craftStonePickaxe(bot) {
  // Check if we already have a stone pickaxe
  const stonePickaxeItem = mcData.itemsByName.stone_pickaxe;
  if (bot.inventory.count(stonePickaxeItem.id) > 0) {
    bot.chat("Already have a stone pickaxe.");
    return;
  }

  // Check required materials: 3 cobblestone and 2 sticks
  const cobblestoneItem = mcData.itemsByName.cobblestone;
  const stickItem = mcData.itemsByName.stick;
  const cobblestoneCount = bot.inventory.count(cobblestoneItem.id);
  const stickCount = bot.inventory.count(stickItem.id);
  if (cobblestoneCount < 3) {
    bot.chat(`Need 3 cobblestone, but only have ${cobblestoneCount}.`);
    // We could mine more cobblestone, but the task assumes we have enough.
    // Since we have 4 cobblestone, this should not happen.
    return;
  }
  if (stickCount < 2) {
    bot.chat(`Need 2 sticks, but only have ${stickCount}.`);
    // We have 2 sticks, so this should not happen.
    return;
  }

  // Ensure a crafting table block is placed nearby
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

  // Craft stone pickaxe
  bot.chat("Crafting stone pickaxe...");
  try {
    await craftItem(bot, "stone_pickaxe", 1);
  } catch (err) {
    bot.chat(`Failed to craft stone pickaxe: ${err.message}`);
    return;
  }

  // Final check
  if (bot.inventory.count(stonePickaxeItem.id) > 0) {
    bot.chat("Successfully crafted a stone pickaxe.");
  } else {
    bot.chat("Failed to craft a stone pickaxe.");
  }
}