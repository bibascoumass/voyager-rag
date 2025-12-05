import re
import math
import ast
import sys

def measure_metrics(log_file_path):
    """
    Parses voyager console output and measure Exploration Performance, 
    Tech Tree Mastery, and Map Coverage.
    """
    
    unique_items = set()
    unique_biomes = set()
    
    tech_tree_mastery = {
        "Wooden Tool": None,
        "Stone Tool": None,
        "Iron Tool": None,
        "Diamond Tool": None
    }
        
    positions = [] # list of (x, y, z) tuples
    total_distance = 0.0
    
    current_iteration = 0

    tech_tiers = {
        "Wooden Tool": ["wooden_pickaxe", "wooden_sword", "wooden_axe", "wooden_shovel", "wooden_hoe"],
        "Stone Tool": ["stone_pickaxe", "stone_sword", "stone_axe", "stone_shovel", "stone_hoe"],
        "Iron Tool": ["iron_pickaxe", "iron_sword", "iron_axe", "iron_shovel", "iron_hoe"],
        "Diamond Tool": ["diamond_pickaxe", "diamond_sword", "diamond_axe", "diamond_shovel", "diamond_hoe"]
    }

    iter_pattern = re.compile(r'\*\*\*\*Recorder message: (\d+) iteration passed\*\*\*\*')
    
    inventory_pattern = re.compile(r'Inventory \(\d+/\d+\): (.+)')

    equipment_pattern = re.compile(r'Equipment: (.+)')

    pos_pattern = re.compile(r'Position: x=([\d.-]+), y=([\d.-]+), z=([\d.-]+)')

    # biome_pattern = re.compile(r'Biome: (.+)')

    try:
        with open(log_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                
                # track iters
                iter_match = iter_pattern.search(line)
                if iter_match:
                    current_iteration = int(iter_match.group(1))
                    continue

                # get position
                pos_match = pos_pattern.search(line)
                if pos_match:
                    x, y, z = float(pos_match.group(1)), float(pos_match.group(2)), float(pos_match.group(3))
                    current_pos = (x, y, z)
                    
                    if positions:
                        prev_pos = positions[-1]
                        # 3D euclidean distance
                        dist = math.sqrt(
                            (x - prev_pos[0])**2 + 
                            (y - prev_pos[1])**2 + 
                            (z - prev_pos[2])**2
                        )
                        total_distance += dist
                    
                    positions.append(current_pos)
                    continue

                # biome_match = biome_pattern.search(line)
                # if biome_match:
                #     biome_name = biome_match.group(1).strip()
                #     if biome_name: # Ignore empty strings
                #         unique_biomes.add(biome_name)
                #     continue

                # inventory for Exploration & Tech Tree
                inv_match = inventory_pattern.search(line)
                if inv_match:
                    content = inv_match.group(1).strip()
                    
                    current_items = set()
                    
                    if content != "Empty":
                        try:
                            # use ast.literal_eval to safely parse the python-dict-like string
                            items_dict = ast.literal_eval(content)
                            if isinstance(items_dict, dict):
                                current_items.update(items_dict.keys())
                                unique_items.update(items_dict.keys())
                        except (ValueError, SyntaxError):                            
                            pass
                    
                    # verify tech tree based on inventory
                    for tier, tools in tech_tiers.items():
                        if tech_tree_mastery[tier] is None: # Not yet unlocked
                            if any(tool in current_items for tool in tools):
                                tech_tree_mastery[tier] = current_iteration
                    continue

                # get equipment for Tech Tree (tool is equipped sometimes)
                equip_match = equipment_pattern.search(line)
                if equip_match:
                    content = equip_match.group(1).strip()
                    try:
                        equipment_list = ast.literal_eval(content)
                        if isinstance(equipment_list, list):
                            equipped_items = {item for item in equipment_list if item is not None}
                            
                            # verify tech tree based on Equipment
                            for tier, tools in tech_tiers.items():
                                if tech_tree_mastery[tier] is None:
                                    if any(tool in equipped_items for tool in tools):
                                        tech_tree_mastery[tier] = current_iteration
                    except (ValueError, SyntaxError):
                        pass
                    continue

    except FileNotFoundError:
        print(f"Error: File '{log_file_path}' not found.")
        return

    print("="*40)
    print(f"METRICS REPORT FOR: {log_file_path}")
    print("="*40)
    
    print("\n1. EXPLORATION PERFORMANCE")
    print(f"   Total Unique Items Found: {len(unique_items)}")
    if unique_items:
        # Print first 10 items as sample
        sample = list(unique_items)[:10]
        print(f"   Sample Items: {sample}...")

    print("\n2. TECH TREE MASTERY (Iteration Unlocked)")
    for tier, iteration in tech_tree_mastery.items():
        status = iteration if iteration is not None else "Not Unlocked"
        print(f"   {tier:<15}: {status}")

    print("\n3. MAP COVERAGE")
    print(f"   Total Distance Traveled: {total_distance:.2f} blocks")
    print(f"   Unique Biomes Visited:   {len(unique_biomes)}")
    if unique_biomes:
        print(f"   Biomes: {', '.join(unique_biomes)}")
    print("="*40)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python measure_voyager_metrics.py <path_to_log_file>")
    else:
        measure_metrics(sys.argv[1])