async function craftFourTorches(bot) {
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
    // We have a crafting_table item in inventory
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
  const sticks = countItem("stick");
  const coal = countItem("coal");
  if (sticks < 1) {
    bot.chat(`Need at least 1 stick, but only have ${sticks}.`);
    // We have 4 sticks, so this shouldn't happen.
    return;
  }
  if (coal < 1) {
    bot.chat(`Need at least 1 coal, but only have ${coal}.`);
    // We have 2 coal, so this shouldn't happen.
    return;
  }

  // Step 3: Craft torches
  bot.chat("Crafting 4 torches.");
  await craftItem(bot, "torch", 1); // craftItem will craft one recipe, which yields 4 torches.

  // Step 4: Verify
  const torches = countItem("torch");
  if (torches >= 4) {
    bot.chat(`Successfully crafted ${torches} torches.`);
  } else {
    bot.chat(`Only crafted ${torches} torches.`);
  }
}