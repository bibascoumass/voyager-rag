import re
from collections import defaultdict

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

#     # --- STEP 3: find iteration number using your new format ---
#     ITER_PATTERN = re.compile(
#         r"Recorder message:\s*(\d+)\s*iteration passed"
#     )

#     def find_iteration(step, start_index):
#         pattern = re.escape(step)
#         literal = "Completed task " + re.escape(step)
#         for i in range(start_index + 1, len(lines)):
#             # Check if the action step exists
#             if re.search(literal, lines[i]):
#                 # Build the literal we want to match
#                 # print("49 ", re.search(literal, lines[i]))
                
#                 # Check if the literal exists in the same line
#                 if re.search(literal, lines[i]):
#                     # Look backwards a few lines to find the iteration marker
#                     for j in range(i, max(-1, i - 40), -1):
#                         m = ITER_PATTERN.search(lines[j])
#                         # print(m)
#                         if m:
#                             # print(m.group(1))
#                             return int(m.group(1))  # Return immediately after first match
#                 break  # Stop searching after first occurrence of the action
#         return None


#     # --- Build final result ---
#     final_result = {}

#     for (task_line, task_name), decomp_line in paired:
#         steps = extract_steps(decomp_line)
#         # print("hihiiihihabhrobhalijbebda", steps)

#         raw_iters = []
#         for step in steps:
#             # print(step)
#             it = find_iteration(step, decomp_line)
#             raw_iters.append(it)

#         # Shift to make first iteration = 1
#         shift = min(raw_iters) - 1
#         shifted = [it - shift for it in raw_iters]

#         task_dict = {step: [iter_val] for step, iter_val in zip(steps, shifted)}

#         final_result[task_name] = task_dict

#     return final_result

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

    # --- Helper: extract step list on next line ---
    def extract_steps(start_index):
        for i in range(start_index + 1, len(lines)):
            match = re.search(r'\[(.*)\]', lines[i])
            if match:
                return eval(match.group(0))
        return []

    # --- STEP 3: find iteration number ---
    ITER_PATTERN = re.compile(r"Recorder message:\s*(\d+)\s*iteration passed")

    def find_iteration(step, start_index):
        literal = "Completed task " + re.escape(step)
        for i in range(start_index + 1, len(lines)):
            if re.search(literal, lines[i]):
                for j in range(i, max(-1, i - 40), -1):
                    m = ITER_PATTERN.search(lines[j])
                    if m:
                        return int(m.group(1))
                break
        return None

    # --- Build final result for this file ---
    file_result = {}
    for (task_line, task_name), decomp_line in paired:
        steps = extract_steps(decomp_line)
        raw_iters = [find_iteration(step, decomp_line) for step in steps]

        # Shift to make first iteration = 1
        shift = min(raw_iters) - 1
        shifted = [it - shift for it in raw_iters]

        task_dict = {step: [iter_val] for step, iter_val in zip(steps, shifted)}
        file_result[task_name] = task_dict

    return file_result

def process_logs(*filenames):
    aggregated_result = {}
    step_orders = {}  # record first-seen order of steps per task

    for filename in filenames:
        file_result = process_log(filename)

        for task_name, steps in file_result.items():
            if task_name not in aggregated_result:
                aggregated_result[task_name] = {}
                step_orders[task_name] = []

            for step, it_list in steps.items():
                # Append iteration numbers
                if step in aggregated_result[task_name]:
                    aggregated_result[task_name][step].extend(it_list)
                else:
                    aggregated_result[task_name][step] = list(it_list)

                # Record order if step is seen first time
                if step not in step_orders[task_name]:
                    step_orders[task_name].append(step)

    # Reorder each task dictionary according to step_orders
    for task_name, order in step_orders.items():
        ordered_dict = {step: aggregated_result[task_name][step] for step in order}
        aggregated_result[task_name] = ordered_dict

    return aggregated_result

result = process_logs("Voyager/results/voyager-baseline-zeroshot-1.out", "Voyager/results/voyager-baseline-zeroshot-2.out")

import json
print(json.dumps(result, indent=2))
