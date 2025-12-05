async function mineStoneToFindIronOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Check if we have a stone pickaxe
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.stone_pickaxe.id);
  if (!stonePickaxe) {
    bot.chat("No stone pickaxe. Need to craft one first.");
    // We could craft one, but inventory shows we have two.
    return;
  }

  // Equip stone pickaxe
  await bot.equip(stonePickaxe, "hand");
  bot.chat("Equipped stone pickaxe.");

  // Explore underground to find iron ore
  bot.chat("Exploring underground to find iron ore...");
  const ironOreBlock = await exploreUntil(bot, new Vec3(0, -1, 0), 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName.iron_ore.id,
      maxDistance: 32
    });
    return block;
  });
  if (ironOreBlock) {
    bot.chat("Found iron ore! Mining it.");
    await mineBlock(bot, "iron_ore", 1);
    bot.chat("Iron ore mined.");
    // Check if we got raw iron
    if (countItem("raw_iron") > 0) {
      bot.chat("Got raw iron!");
    }
  } else {
    bot.chat("Could not find iron ore after exploration.");
  }
}