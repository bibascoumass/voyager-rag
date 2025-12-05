async function mineDeepslateDiamondOre(bot) {
  // Helper to count items
  function countItem(name) {
    const item = mcData.itemsByName[name];
    return bot.inventory.count(item.id);
  }

  // Step 1: Ensure we have an iron pickaxe or better
  const ironPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName.iron_pickaxe.id);
  if (!ironPickaxe) {
    bot.chat("No iron pickaxe. Need to find or craft one.");
    // We could craft one, but we have one in inventory.
    return;
  }

  // Step 2: Equip iron pickaxe
  if (bot.heldItem?.name !== "iron_pickaxe") {
    await bot.equip(ironPickaxe, "hand");
    bot.chat("Equipped iron pickaxe.");
  }

  // Step 3: Look for deepslate_diamond_ore nearby
  let deepslateDiamondOreBlock = bot.findBlock({
    matching: mcData.blocksByName.deepslate_diamond_ore.id,
    maxDistance: 32
  });
  if (deepslateDiamondOreBlock) {
    bot.chat("Found deepslate diamond ore nearby. Mining...");
    try {
      await mineBlock(bot, "deepslate_diamond_ore", 1);
      bot.chat("Mined deepslate diamond ore.");
      // Check diamond count
      const diamonds = countItem("diamond");
      bot.chat(`Now have ${diamonds} diamonds.`);
      return;
    } catch (error) {
      bot.chat(`Error mining deepslate diamond ore: ${error}. Trying to explore.`);
    }
  }

  // Step 4: If not found, explore to find deepslate_diamond_ore
  bot.chat("Exploring to find deepslate diamond ore...");
  // Choose a random direction: 0 for down, 1-4 for horizontal
  const dirChoice = Math.floor(Math.random() * 5);
  let direction;
  if (dirChoice === 0) {
    direction = new Vec3(0, -1, 0); // down
  } else {
    const dirs = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
    direction = dirs[dirChoice - 1];
  }
  const foundOre = await exploreUntil(bot, direction, 60, () => {
    const block = bot.findBlock({
      matching: mcData.blocksByName.deepslate_diamond_ore.id,
      maxDistance: 32
    });
    return block;
  });
  if (foundOre) {
    bot.chat("Found deepslate diamond ore during exploration. Mining...");
    try {
      await mineBlock(bot, "deepslate_diamond_ore", 1);
      bot.chat("Mined deepslate diamond ore.");
      const diamonds = countItem("diamond");
      bot.chat(`Now have ${diamonds} diamonds.`);
    } catch (error) {
      bot.chat(`Error mining deepslate diamond ore: ${error}.`);
    }
  } else {
    bot.chat("Could not find deepslate diamond ore.");
  }
}