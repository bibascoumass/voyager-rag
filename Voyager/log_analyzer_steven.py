# import re
# from collections import defaultdict

# # def process_log(filename):
# #     with open(filename, "r") as f:
# #         lines = f.readlines()

# #     # --- STEP 1: find all tasks ---
# #     task_indices = []
# #     for i, line in enumerate(lines):
# #         if line.startswith("Final task:"):
# #             task_name = line.strip().split("Final task:")[1].strip()
# #             task_indices.append((i, task_name))

# #     # --- STEP 2: find decomposition lists following even occurrences ---
# #     decomposition_indices = []
# #     count = 0
# #     for i, line in enumerate(lines):
# #         if "****Curriculum Agent task decomposition****" in line:
# #             count += 1
# #             if count % 2 == 0:
# #                 decomposition_indices.append(i)

# #     if len(decomposition_indices) < len(task_indices):
# #         raise ValueError("Not enough decomposition blocks found.")

# #     paired = [(task, decomp) for (task, decomp) in zip(task_indices, decomposition_indices)]

# #     # --- Helper: extract step list on next line ---
# #     def extract_steps(start_index):
# #         for i in range(start_index + 1, len(lines)):
# #             match = re.search(r'\[(.*)\]', lines[i])
# #             if match:
# #                 return eval(match.group(0))
# #         return []

# #     # --- STEP 3: find iteration number using your new format ---
# #     ITER_PATTERN = re.compile(
# #         r"Recorder message:\s*(\d+)\s*iteration passed"
# #     )

# #     def find_iteration(step, start_index):
# #         pattern = re.escape(step)
# #         literal = "Completed task " + re.escape(step)
# #         for i in range(start_index + 1, len(lines)):
# #             # Check if the action step exists
# #             if re.search(literal, lines[i]):
# #                 # Build the literal we want to match
# #                 # print("49 ", re.search(literal, lines[i]))
                
# #                 # Check if the literal exists in the same line
# #                 if re.search(literal, lines[i]):
# #                     # Look backwards a few lines to find the iteration marker
# #                     for j in range(i, max(-1, i - 40), -1):
# #                         m = ITER_PATTERN.search(lines[j])
# #                         # print(m)
# #                         if m:
# #                             # print(m.group(1))
# #                             return int(m.group(1))  # Return immediately after first match
# #                 break  # Stop searching after first occurrence of the action
# #         return None


# #     # --- Build final result ---
# #     final_result = {}

# #     for (task_line, task_name), decomp_line in paired:
# #         steps = extract_steps(decomp_line)
# #         # print("hihiiihihabhrobhalijbebda", steps)

# #         raw_iters = []
# #         for step in steps:
# #             # print(step)
# #             it = find_iteration(step, decomp_line)
# #             raw_iters.append(it)

# #         # Shift to make first iteration = 1
# #         shift = min(raw_iters) - 1
# #         shifted = [it - shift for it in raw_iters]

# #         task_dict = {step: [iter_val] for step, iter_val in zip(steps, shifted)}

# #         final_result[task_name] = task_dict

# #     return final_result

# def process_log(filename):
#     with open(filename, "r") as f:
#         lines = f.readlines()

#     # --- STEP 1: find all tasks ---
#     task_indices = []
#     for i, line in enumerate(lines):
#         if line.startswith("Final task:"):
#             task_name = line.strip().split("Final task:")[1].strip()
#             task_indices.append((i, task_name))

#     # --- STEP 2: find decomposition lists following even occurrences ---
#     decomposition_indices = []
#     count = 0
#     for i, line in enumerate(lines):
#         if "****Curriculum Agent task decomposition****" in line:
#             count += 1
#             if count % 2 == 0:
#                 decomposition_indices.append(i)

#     if len(decomposition_indices) < len(task_indices):
#         raise ValueError("Not enough decomposition blocks found.")

#     paired = [(task, decomp) for (task, decomp) in zip(task_indices, decomposition_indices)]

#     # --- Helper: extract step list on next line ---
#     def extract_steps(start_index):
#         for i in range(start_index + 1, len(lines)):
#             match = re.search(r'\[(.*)\]', lines[i])
#             if match:
#                 return eval(match.group(0))
#         return []

#     # --- STEP 3: find iteration number ---
#     ITER_PATTERN = re.compile(r"Recorder message:\s*(\d+)\s*iteration passed")

#     def find_iteration(step, start_index):
#         literal = "Completed task " + re.escape(step)
#         for i in range(start_index + 1, len(lines)):
#             if re.search(literal, lines[i]):
#                 for j in range(i, max(-1, i - 40), -1):
#                     m = ITER_PATTERN.search(lines[j])
#                     if m:
#                         return int(m.group(1))
#                 break
#         return None

#     # --- Build final result for this file ---
#     file_result = {}
#     for (task_line, task_name), decomp_line in paired:
#         steps = extract_steps(decomp_line)
#         raw_iters = [find_iteration(step, decomp_line) for step in steps]

#         # Shift to make first iteration = 1
#         shift = min(raw_iters) - 1
#         shifted = [it - shift for it in raw_iters]

#         task_dict = {step: [iter_val] for step, iter_val in zip(steps, shifted)}
#         file_result[task_name] = task_dict

#     return file_result

# def process_logs(*filenames):
#     aggregated_result = {}
#     step_orders = {}  # record first-seen order of steps per task

#     for filename in filenames:
#         file_result = process_log(filename)

#         for task_name, steps in file_result.items():
#             if task_name not in aggregated_result:
#                 aggregated_result[task_name] = {}
#                 step_orders[task_name] = []

#             for step, it_list in steps.items():
#                 # Append iteration numbers
#                 if step in aggregated_result[task_name]:
#                     aggregated_result[task_name][step].extend(it_list)
#                 else:
#                     aggregated_result[task_name][step] = list(it_list)

#                 # Record order if step is seen first time
#                 if step not in step_orders[task_name]:
#                     step_orders[task_name].append(step)

#     # Reorder each task dictionary according to step_orders
#     for task_name, order in step_orders.items():
#         ordered_dict = {step: aggregated_result[task_name][step] for step in order}
#         aggregated_result[task_name] = ordered_dict

#     return aggregated_result

# result = process_logs("Voyager/results/voyager-baseline-zeroshot-1.out", "Voyager/results/voyager-baseline-zeroshot-2.out")

# # for task_name, steps in result.items():
# #     #find average
# #     for step, it_list in steps.items():
# #         avg = sum(it_list) / len(it_list)
# #         steps[step] = avg

# #     # sort in ascending order
# #     sorted_steps = dict(sorted(steps.items(), key=lambda x: x[1]))
# #     result[task_name] = sorted_steps

# import json
# print(json.dumps(result, indent=2))
import re
import json
import ast
from statistics import mean

def process_log(filename):
    with open(filename, "r") as f:
        lines = f.readlines()

    # --- STEP 1: find all tasks ---
    task_indices = []
    for i, line in enumerate(lines):
        if line.startswith("Final task:"):
            task_name = line.strip().split("Final task:")[1].strip()
            task_indices.append((i, task_name))

    # --- STEP 2: find decomposition lists following even occurrences ---
    decomposition_indices = []
    count = 0
    for i, line in enumerate(lines):
        if "****Curriculum Agent task decomposition****" in line:
            count += 1
            if count % 2 == 0:
                decomposition_indices.append(i)

    if len(decomposition_indices) < len(task_indices):
        raise ValueError("Not enough decomposition blocks found.")

    paired = [(task, decomp) for (task, decomp) in zip(task_indices, decomposition_indices)]

    # --- Helper: extract step list on next line (safer eval) ---
    def extract_steps(start_index):
        for i in range(start_index + 1, len(lines)):
            match = re.search(r'(\[.*\])', lines[i])
            if match:
                try:
                    return ast.literal_eval(match.group(0))
                except Exception:
                    return []
        return []

    # --- STEP 3: iteration pattern ---
    ITER_PATTERN = re.compile(r"Recorder message:\s*(\d+)\s*iteration passed")

    def find_iteration_for_step(step, task_start, task_end):
        """Find the iteration number for a specific step within a task's section."""
        literal = "Completed task " + re.escape(step)
        
        # First, find where this step is completed
        for i in range(task_start, task_end):
            if re.search(literal, lines[i]):
                # Look backwards for the iteration marker (within reasonable range)
                for j in range(i, max(task_start - 1, i - 50), -1):
                    m = ITER_PATTERN.search(lines[j])
                    if m:
                        return int(m.group(1))
        
        # For "Craft a crafting table" that might not be explicitly completed
        if "craft" in step.lower() and "table" in step.lower():
            # Search for crafting table placement or crafting within this task
            for i in range(task_start, task_end):
                if re.search(r'(crafting table|crafting_table)', lines[i], re.IGNORECASE):
                    # Check if this is about crafting or placing a crafting table
                    if 'craft' in lines[i].lower() or 'place' in lines[i].lower() or 'I can make crafting_table' in lines[i]:
                        for j in range(i, max(task_start - 1, i - 50), -1):
                            m = ITER_PATTERN.search(lines[j])
                            if m:
                                return int(m.group(1))
        
        return None

    # --- Build final result for this file ---
    file_result = {}
    
    # First, identify task boundaries
    task_boundaries = []
    for i in range(len(task_indices)):
        task_start = task_indices[i][0]
        task_end = len(lines)
        if i + 1 < len(task_indices):
            # Find next task start
            for j in range(task_start + 1, len(lines)):
                if "STARTING ZERO-SHOT TASK:" in lines[j]:
                    task_end = j
                    break
        task_boundaries.append((task_start, task_end))

    for idx, ((task_line, task_name), decomp_line) in enumerate(paired):
        steps = extract_steps(decomp_line)
        task_start, task_end = task_boundaries[idx]
        
        # For tasks that require crafting (button, trapdoor), add crafting table step
        # if the final product needs a crafting table
        needs_crafting_table = False
        task_lower = task_name.lower()
        
        # Check what we're crafting
        if 'button' in task_lower or 'trapdoor' in task_lower:
            needs_crafting_table = True
        
        # Also check steps - if any step crafts something that needs a table
        for step in steps:
            step_lower = step.lower()
            if ('button' in step_lower or 'trapdoor' in step_lower or 
                ('craft' in step_lower and ('plank' in step_lower or 'table' in step_lower))):
                needs_crafting_table = True
        
        # Add crafting table step if needed and not already in steps
        if needs_crafting_table and not any('crafting table' in step.lower() for step in steps):
            # Try to find when crafting table was crafted/placed in this specific task
            craft_table_iter = find_iteration_for_step("Craft a crafting table", task_start, task_end)
            
            # If not found with explicit search, look for crafting table mentions
            if craft_table_iter is None:
                for i in range(task_start, task_end):
                    line = lines[i]
                    if 'crafting_table' in line or 'crafting table' in line.lower():
                        # Check if this line is about the bot crafting or placing a table
                        if 'craft' in line.lower() or 'place' in line.lower() or 'I can make' in line:
                            for j in range(i, max(task_start - 1, i - 50), -1):
                                m = ITER_PATTERN.search(lines[j])
                                if m:
                                    craft_table_iter = int(m.group(1))
                                    break
                        if craft_table_iter:
                            break
            
            # If we found an iteration, add the step
            if craft_table_iter is not None:
                steps.insert(0, 'Craft a crafting table')
        
        # Find iterations for each step
        step_iters = {}
        for step in steps:
            iter_val = find_iteration_for_step(step, task_start, task_end)
            step_iters[step] = iter_val
        
        # Only shift if we have valid iterations
        valid_iters = [v for v in step_iters.values() if v is not None]
        if valid_iters:
            shift = min(valid_iters) - 1
            shifted = {step: (v - shift if v is not None else None) for step, v in step_iters.items()}
        else:
            shifted = step_iters
        
        # Store as single-number lists
        task_dict = {step: [shifted_val] for step, shifted_val in shifted.items()}
        file_result[task_name] = task_dict

    return file_result


def process_logs(*filenames):
    aggregated_result = {}
    step_orders = {}

    for filename in filenames:
        file_result = process_log(filename)

        for task_name, steps in file_result.items():
            if task_name not in aggregated_result:
                aggregated_result[task_name] = {}
                step_orders[task_name] = []

            for step, it_list in steps.items():
                if step in aggregated_result[task_name]:
                    aggregated_result[task_name][step].extend(it_list)
                else:
                    aggregated_result[task_name][step] = list(it_list)

                if step not in step_orders[task_name]:
                    step_orders[task_name].append(step)

    # Reorder each task dictionary according to step_orders
    for task_name, order in step_orders.items():
        ordered_dict = {step: aggregated_result[task_name][step] for step in order}
        aggregated_result[task_name] = ordered_dict
    
    # Calculate averages and clean up
    final_result = {}
    for task_name, steps in aggregated_result.items():
        averaged_steps = {}
        for step, it_list in steps.items():
            # Filter out None values
            valid_iters = [it for it in it_list if it is not None]
            if valid_iters:
                averaged_steps[step] = mean(valid_iters)
        
        # Sort by average
        if averaged_steps:
            sorted_steps = dict(sorted(averaged_steps.items(), key=lambda x: x[1]))
            final_result[task_name] = sorted_steps

    return final_result


# --- Process files ---
result = process_logs("Voyager/results/voyager-baseline-zeroshot-1.out", "Voyager/results/voyager-baseline-zeroshot-2.out", "Voyager/results/voyager-baseline-zeroshot-3.out")
print(json.dumps(result, indent=2))