import re
import sys
import ast
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict

def parse_trials_from_files(file_paths):
    """
    Parses multiple log files. Extracts distinct item counts for every trial found.
    Returns a list of dictionaries: [{iter: count, ...}, {iter: count, ...}, ...]
    """
    
    all_trials_data = []
    
    # Regex patterns
    trial_start_pattern = re.compile(r'=== Starting lifelong learning trial (\d+) ===')
    iter_pattern = re.compile(r'\*\*\*\*Recorder message: (\d+) iteration passed\*\*\*\*')
    inventory_pattern = re.compile(r'Inventory \(\d+/\d+\): (.+)')
    
    for file_path in file_paths:
        print(f"Reading file: {file_path}...")
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                
                # State for the current trial being parsed
                current_trial_items = set()
                current_trial_counts = {0: 0} # Start at 0 items at iteration 0
                in_trial = False
                
                for line in f:
                    line = line.strip()
                    
                    # 1. Detect Start of a Trial
                    trial_match = trial_start_pattern.search(line)
                    if trial_match:
                        # If we were already tracking a trial, save it before starting new one
                        if in_trial and len(current_trial_counts) > 1:
                            all_trials_data.append(current_trial_counts)
                        
                        # Reset for new trial
                        current_trial_items = set()
                        current_trial_counts = {0: 0}
                        in_trial = True
                        continue

                    # 2. Parse Inventory (to track distinct items)
                    inv_match = inventory_pattern.search(line)
                    if inv_match and in_trial:
                        content = inv_match.group(1).strip()
                        if content == "Empty":
                            continue
                        try:
                            # Safe parsing of python-dict style inventory
                            items_dict = ast.literal_eval(content)
                            if isinstance(items_dict, dict):
                                current_trial_items.update(items_dict.keys())
                        except (ValueError, SyntaxError):
                            # Fallback regex for malformed lines
                            keys = re.findall(r"'([\w\s_]+)':", content)
                            current_trial_items.update(keys)
                        continue

                    # 3. Detect Iteration Milestone
                    iter_match = iter_pattern.search(line)
                    if iter_match and in_trial:
                        iteration = int(iter_match.group(1))
                        # Record the cumulative distinct items found up to this point
                        current_trial_counts[iteration] = len(current_trial_items)
                        continue
                
                # End of file: Save the last trial if it had data
                if in_trial and len(current_trial_counts) > 1:
                    all_trials_data.append(current_trial_counts)

        except FileNotFoundError:
            print(f"Error: File {file_path} not found.")
            continue

    return all_trials_data

def plot_average_performance(all_trials_data, interval=5):
    """
    Calculates mean and std dev at each iteration step and plots the results.
    """
    if not all_trials_data:
        print("No valid trial data found to plot.")
        return

    # 1. Consolidate Data
    # Find the maximum iteration reached across all trials to set X-axis range
    max_iter = max(max(t.keys()) for t in all_trials_data)
    
    # Organized structure: iteration -> list of counts from valid trials
    # iter_data[5] = [10, 12, 9] (counts from trial 1, 2, 3 at iter 5)
    iter_data = defaultdict(list)

    for i in range(0, max_iter + 1):
        for trial in all_trials_data:
            # If a trial has data for this iteration, include it
            if i in trial:
                iter_data[i].append(trial[i])
            else:
                # Forward fill: if trial stopped logging at iter 10, 
                # assume iter 11 has same count as iter 10? 
                # Or treat as missing? 
                # VOYAGER paper typically forward fills (metrics don't decrease).
                # Let's find the max iter this trial DID reach.
                last_seen_iter = max(k for k in trial.keys() if k <= i)
                iter_data[i].append(trial[last_seen_iter])

    # 2. Calculate Stats
    x_values = sorted(iter_data.keys())
    means = []
    std_devs = []

    for x in x_values:
        counts = iter_data[x]
        means.append(np.mean(counts))
        std_devs.append(np.std(counts))
    
    means = np.array(means)
    std_devs = np.array(std_devs)

    # 3. Plotting
    plt.figure(figsize=(12, 7))
    
    # Main Average Line
    plt.plot(x_values, means, label='Average Distinct Items', color='#007acc', linewidth=2.5)
    
    # Standard Deviation Shading
    plt.fill_between(x_values, means - std_devs, means + std_devs, 
                     color='#007acc', alpha=0.2, label='Standard Deviation')

    # Markers every 'interval' (e.g., 5) iterations
    marker_indices = [i for i in x_values if i % interval == 0 and i > 0]
    marker_means = [means[i] for i in marker_indices]
    
    plt.scatter(marker_indices, marker_means, color='red', zorder=5, s=40)
    
    # Styling
    plt.title(f'Exploration Performance (Average of {len(all_trials_data)} Trials)', fontsize=14)
    plt.xlabel('Prompting Iterations', fontsize=12)
    plt.ylabel('Cumulative Distinct Items Found', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(loc='upper left')
    
    # Save
    output_filename = 'voyager_average_performance.png'
    plt.savefig(output_filename)
    print(f"\nPlot saved to {output_filename}")
    
    # Text Report
    print(f"\n{'Iter':<5} | {'Avg Items':<10} | {'Std Dev':<10}")
    print("-" * 30)
    for i in marker_indices:
        idx = x_values.index(i)
        print(f"{i:<5} | {means[idx]:<10.2f} | {std_devs[idx]:<10.2f}")
        
    plt.show()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python plot_voyager_average.py file1.log file2.log ...")
    else:
        files = sys.argv[1:]
        data = parse_trials_from_files(files)
        plot_average_performance(data, interval=5)