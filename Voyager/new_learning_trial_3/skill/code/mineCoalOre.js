async function mineCoalOre(bot) {
  // Check for pickaxe in inventory
  const stonePickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["stone_pickaxe"].id);
  const woodenPickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["wooden_pickaxe"].id);
  let pickaxe = stonePickaxe || woodenPickaxe;
  if (!pickaxe) {
    bot.chat("No pickaxe available. Crafting a wooden pickaxe...");
    // We have spruce_planks and sticks? Check inventory.
    if (bot.inventory.count(mcData.itemsByName["spruce_planks"].id) < 3) {
      // Craft more planks from logs
      await craftItem(bot, "spruce_planks", 1);
    }
    if (bot.inventory.count(mcData.itemsByName["stick"].id) < 2) {
      await craftItem(bot, "stick", 1);
    }
    // Place a crafting table if not already placed nearby
    const craftingTableBlock = bot.findBlock({
      matching: mcData.blocksByName["crafting_table"].id,
      maxDistance: 32
    });
    if (!craftingTableBlock) {
      const placePos = bot.entity.position.offset(1, 0, 0);
      await placeItem(bot, "crafting_table", placePos);
    }
    await craftItem(bot, "wooden_pickaxe", 1);
    pickaxe = bot.inventory.findInventoryItem(mcData.itemsByName["wooden_pickaxe"].id);
  }
  // Equip the pickaxe
  await bot.equip(pickaxe, "hand");
  bot.chat("Pickaxe equipped.");

  // Check current coal count
  let coalCount = bot.inventory.count(mcData.itemsByName["coal"].id);
  if (coalCount >= 5) {
    bot.chat(`Already have ${coalCount} coal. Task completed.`);
    return;
  }

  // Function to find coal ore blocks
  const findCoalOre = () => {
    return bot.findBlocks({
      matching: mcData.blocksByName["coal_ore"].id,
      maxDistance: 32,
      count: 5 - coalCount
    });
  };

  // Mine coal ore until we have 5 coal
  while (coalCount < 5) {
    const coalOreBlocks = findCoalOre();
    if (coalOreBlocks.length > 0) {
      // Mine as many as needed
      const toMine = Math.min(coalOreBlocks.length, 5 - coalCount);
      await mineBlock(bot, "coal_ore", toMine);
      coalCount = bot.inventory.count(mcData.itemsByName["coal"].id);
      bot.chat(`Mined ${toMine} coal ore. Now have ${coalCount} coal.`);
    } else {
      // No coal ore nearby, explore underground
      bot.chat("No coal ore nearby. Exploring...");
      // Random direction: prioritize down, then random horizontal
      const directions = [new Vec3(0, -1, 0), new Vec3(1, 0, 1), new Vec3(-1, 0, 1), new Vec3(1, 0, -1), new Vec3(-1, 0, -1)];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      const foundCoal = await exploreUntil(bot, randomDir, 60, () => {
        const block = bot.findBlock({
          matching: mcData.blocksByName["coal_ore"].id,
          maxDistance: 32
        });
        return block;
      });
      if (!foundCoal) {
        bot.chat("Could not find coal ore after exploration.");
        break;
      }
      // After exploration, loop again to mine
    }
  }
  if (coalCount >= 5) {
    bot.chat(`Successfully mined 5 coal ore. Task completed.`);
  } else {
    bot.chat(`Failed to mine 5 coal ore. Only have ${coalCount} coal.`);
  }
}