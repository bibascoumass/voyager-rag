async function craftDiamondSword(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Ensure crafting table is placed
  let craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("No crafting table nearby. Placing one.");
    // Place crafting table near the player
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

  // Step 2: Check materials
  const diamonds = countItem("diamond");
  const sticks = countItem("stick");
  if (diamonds < 2) {
    bot.chat(`Need 2 diamonds, but only have ${diamonds}.`);
    // We could explore for diamonds, but we have 5, so this shouldn't happen.
    return;
  }
  if (sticks < 1) {
    bot.chat(`Need 1 stick, but only have ${sticks}.`);
    // We have 3 sticks, so this shouldn't happen.
    return;
  }

  // Step 3: Craft diamond sword
  bot.chat("Crafting diamond sword.");
  await craftItem(bot, "diamond_sword", 1);

  // Step 4: Verify and optionally equip
  if (countItem("diamond_sword") > 0) {
    bot.chat("Successfully crafted a diamond sword.");
    const diamondSword = bot.inventory.findInventoryItem(mcData.itemsByName.diamond_sword.id);
    if (diamondSword) {
      await bot.equip(diamondSword, "hand");
      bot.chat("Equipped diamond sword.");
    }
  } else {
    bot.chat("Failed to craft diamond sword.");
  }
}