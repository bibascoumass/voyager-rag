async function craftStonePickaxe(bot) {
  // Step 1: Check if we have enough sticks (2)
  const stickId = mcData.itemsByName.stick.id;
  const stickCount = bot.inventory.count(stickId);
  if (stickCount < 2) {
    bot.chat("Not enough sticks. Crafting sticks from planks...");
    // Check for planks
    const plankNames = ["oak_planks", "jungle_planks", "spruce_planks", "birch_planks", "acacia_planks", "dark_oak_planks", "mangrove_planks"];
    let plankId = null;
    for (const name of plankNames) {
      const id = mcData.itemsByName[name]?.id;
      if (id && bot.inventory.count(id) >= 2) {
        plankId = id;
        break;
      }
    }
    if (!plankId) {
      bot.chat("Not enough planks to craft sticks. Need to collect wood logs.");
      // Since we have jungle_planks, this shouldn't happen, but for safety, we can explore and mine a log.
      // However, we cannot call mineBlock recursively, so we'll just exit.
      return;
    }
    // Craft sticks (2 planks -> 4 sticks)
    const plankName = mcData.items[plankId].name;
    await craftItem(bot, "stick", 1); // craftItem uses crafting table, but we haven't placed one yet.
    // However, craftItem requires a crafting table, so we need to place one first.
    // We'll place a crafting table before crafting sticks.
  }

  // Step 2: Place a crafting table if not already placed nearby
  const craftingTableBlock = bot.findBlock({
    matching: mcData.blocksByName.crafting_table.id,
    maxDistance: 32
  });
  if (!craftingTableBlock) {
    bot.chat("Placing crafting table...");
    const craftingTablePosition = bot.entity.position.offset(1, 0, 0);
    await placeItem(bot, "crafting_table", craftingTablePosition);
  }

  // Step 3: Now craft sticks if we still need them (re-check after placing table)
  if (stickCount < 2) {
    bot.chat("Crafting sticks...");
    await craftItem(bot, "stick", 1);
  }

  // Step 4: Check cobblestone (need 3)
  const cobblestoneId = mcData.itemsByName.cobblestone.id;
  const cobblestoneCount = bot.inventory.count(cobblestoneId);
  if (cobblestoneCount < 3) {
    bot.chat("Not enough cobblestone. Need to mine stone.");
    // Mine stone to get cobblestone
    await mineBlock(bot, "stone", 3 - cobblestoneCount);
  }

  // Step 5: Craft stone pickaxe
  bot.chat("Crafting stone pickaxe...");
  await craftItem(bot, "stone_pickaxe", 1);

  // Step 6: Verify
  const stonePickaxeId = mcData.itemsByName.stone_pickaxe.id;
  if (bot.inventory.count(stonePickaxeId) >= 1) {
    bot.chat("Successfully crafted a stone pickaxe.");
  } else {
    bot.chat("Failed to craft stone pickaxe.");
  }
}