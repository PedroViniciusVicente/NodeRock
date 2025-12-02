# REMBER TO NVM USE 10

import json
import os
import subprocess
import sys
import re
import time
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

ANALYZED_PROJECT_FILE = os.path.join(CURRENT_DIR, '../..', 'FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json')
with open(ANALYZED_PROJECT_FILE, 'r', encoding='utf-8') as file:
    analyzed_project_data = json.load(file)

ANALYZED_PROJECT_PATH = analyzed_project_data['pathProjectFolder']
ANALYZED_PROJECT_NAME = analyzed_project_data['benchmarkName']

PROJECT_PATH = ANALYZED_PROJECT_PATH

# PROJECT_PATH = "/home/pedroubuntu/coisasNodeRT/datasetNodeRT/datasetDoNodeRacer/exploratory/node-archiver"
TESTS_JSON_PATH = os.path.join(CURRENT_DIR, '../../..', ANALYZED_PROJECT_PATH, 'NodeRock_Info/', 'selected_tests_results.json')


NUM_CYCLES = 100       # Number of times to run the test suite in one iteration
NUM_ITERATIONS = 15    # Number of times to repeat the whole process

# Directory to save the result files
OUTPUT_DIR = os.path.join(CURRENT_DIR, '../../..', ANALYZED_PROJECT_PATH, 'NodeRock_Info/', 'nacd_execution_results') 

def run_single_test(project_path: str, test_file: str, test_title: str):
    """Executes a single Mocha test using its file and title."""
    escaped_title = f"^{re.escape(test_title)}$"
    command = [
        'nacd', 'plain2',
        'npx', 'mocha', test_file, '-g', escaped_title,
        '-t', '50000'
    ]
    result = subprocess.run(
        command,
        cwd=project_path,
        capture_output=True,
        text=True
    )
    return result

def run_test_iteration(iteration_num: int, total_iterations: int, project_path: str, tests_to_run: list, num_cycles: int) -> str:
    """
    Runs a full iteration consisting of `num_cycles` of the test suite.
    
    Returns:
        A formatted string containing the summary report for this iteration.
    """
    print(f"\n[INFO] Starting iteration {iteration_num}/{total_iterations}. The test suite will be run {num_cycles} times.")

    # --- Variables for this iteration's report ---
    total_tests_executed = 0
    failed_tests = []
    first_fail_elapsed_time = None
    
    start_time = time.monotonic()

    # --- Main Execution Loop for one iteration ---
    for cycle_num in range(1, num_cycles + 1):
        for test_index, test in enumerate(tests_to_run):
            test_file = test['file']
            test_title = test['title']
            
            if test_file.startswith(project_path):
                test_file = os.path.relpath(test_file, project_path)

            progress_msg = f"  -> Iteration {iteration_num}/{total_iterations} | Cycle {cycle_num}/{num_cycles} | Test {test_index + 1}/{len(tests_to_run)} | Running..."
            print(progress_msg, end='\r')

            result = run_single_test(project_path, test_file, test_title)
            total_tests_executed += 1
            
            if result.returncode != 0:
                print(" " * len(progress_msg), end='\r') 
                print(f"[FAILURE] In Iteration {iteration_num}, Cycle {cycle_num}: Test failed: {test_title}")

                failure_details = {
                    'title': test_title,
                    'file': test_file,
                    'cycle': cycle_num,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
                failed_tests.append(failure_details)
                
                if first_fail_elapsed_time is None:
                    first_fail_elapsed_time = time.monotonic() - start_time
            else:
                print(" " * len(progress_msg), end='\r')

    end_time = time.monotonic()
    total_elapsed_time = end_time - start_time

    # --- Generate the Report String ---
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append(f" Test Execution Summary for Iteration {iteration_num}/{total_iterations}")
    report_lines.append(f" Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append("=" * 80)
    report_lines.append(f"Total Elapsed Time:       {total_elapsed_time:.2f} seconds")

    if first_fail_elapsed_time is not None:
        report_lines.append(f"Time Until First Failure: {first_fail_elapsed_time:.2f} seconds")
    else:
        report_lines.append("Time Until First Failure: N/A (all tests passed)")

    report_lines.append(f"Total Tests Executed:     {total_tests_executed}")
    
    num_fails = len(failed_tests)
    report_lines.append(f"Number of Test Fails:     {num_fails}")

    if num_fails > 0:
        report_lines.append("\n--- List of Failed Tests ---")
        for i, failure in enumerate(failed_tests):
            report_lines.append(f"  {i+1}. In Cycle {failure['cycle']}: {failure['title']}")
            # Adding detailed output to the log file can be very useful for debugging
            report_lines.append(f"     File: {failure['file']}")
            report_lines.append("     --- stdout ---")
            report_lines.append(failure['stdout'] if failure['stdout'].strip() else "[No stdout]")
            report_lines.append("     --- stderr ---")
            report_lines.append(failure['stderr'] if failure['stderr'].strip() else "[No stderr]")
            report_lines.append("-" * 20)
    
    report_lines.append("=" * 80)
    
    return "\n".join(report_lines)


def main():
    """Main function to control the multi-iteration test execution."""

    # --- Validate Inputs ---
    if not os.path.isdir(PROJECT_PATH):
        print(f"[ERROR] Project path not found: {PROJECT_PATH}", file=sys.stderr)
        sys.exit(1)

    if not os.path.isfile(TESTS_JSON_PATH):
        print(f"[ERROR] Tests JSON file not found: {TESTS_JSON_PATH}", file=sys.stderr)
        sys.exit(1)

    # --- Load Test Data (once) ---
    try:
        with open(TESTS_JSON_PATH, 'r') as f:
            tests_to_run = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to parse tests JSON file: {e}", file=sys.stderr)
        sys.exit(1)
        
    if not tests_to_run:
        print("[INFO] No tests found in JSON file. Exiting.", file=sys.stderr)
        sys.exit(0)

    # --- Create output directory ---
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Results will be saved in the '{OUTPUT_DIR}' directory.")

    # --- Multi-Iteration Controller ---
    try:
        for i in range(1, NUM_ITERATIONS + 1):
            summary_report = run_test_iteration(
                iteration_num=i,
                total_iterations=NUM_ITERATIONS,
                project_path=PROJECT_PATH,
                tests_to_run=tests_to_run,
                num_cycles=NUM_CYCLES
            )
            
            # Print summary to console for immediate feedback
            print(summary_report)

            # Save summary to its own file
            output_filename = os.path.join(OUTPUT_DIR, f"iteration_{i:02d}_summary.txt")
            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(summary_report)
            print(f"Report for iteration {i} saved to: {output_filename}")

    except KeyboardInterrupt:
        print("\n\n[FATAL] Multi-iteration run stopped by user (Ctrl+C).")
        sys.exit(0)
    
    print("\nAll iterations completed successfully!")


if __name__ == "__main__":
    main()