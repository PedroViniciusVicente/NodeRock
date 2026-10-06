[![DOI](https://zenodo.org/badge/814622987.svg)](https://doi.org/10.5281/zenodo.22967154)

# NodeRock: A Machine Learning Approach to Select Node.js Tests with Event Races

This repository contains the source code, datasets and scripts associated with the study presented in the paper: "NodeRock: A Machine Learning Approach to Select Node.js Tests with Event Races", submitted and accepted to the [25th Brazilian Symposium on Software Quality (SBQS 2026)](https://sbqs.sbc.org.br/2026/index.php/en-us/).

#### Overview
NodeRock is a dynamic analysis tool designed to address the challenge of detecting event races in Node.js applications. Event races are subtle concurrency bugs that are difficult to find and reproduce.

Instead of attempting to detect these bugs directly, which can be computationally expensive, NodeRock uses a machine learning approach to analyze and select tests prone to event races. The tool operates by collecting execution traces, extracting a set of 15 dynamic features that characterize asynchronous behavior (like callback usage and Promise lifecycles), and then using a ML model to classify and prioritize tests.

This allows developers to focus their debugging efforts and run expensive detection tools (like [NACD](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ECOOP.2025.9)) on the most critical tests, making the process of identifying tests prone to event races more efficient.

#### Link to Paper:
The full paper can be accessed on our GitHub ([Full Paper PDF](https://github.com/PedroViniciusVicente/ArtifactsCharacterizingConcurrencyIssues/blob/main/SBQS2026_paper.pdf?raw=true)) and on our Zenodo repository.

## NodeRock Artifacts Organization
The repository is organized into several modules, extending from low-level profiling infrastructure to machine learning evaluation implemented by different projects:

* **NodeProf Core (`nodeprof.js/`)**: Contains the NodeProf profiling framework running on GraalVM, providing instrumentation hooks to intercept asynchronous and runtime JavaScript execution events.
* **NodeRT Instrumentation & Analysis (`src/`)**: Comprises the TypeScript codebase that implements NodeRT logic built on top of NodeProf.
* **NodeRock Execution Pipeline (`NodeRock_src/`)**: Houses the main orchestration pipeline in `NodeRock_src/entrypoint_NodeRock/`, containing sequential Node.js scripts for test discovery, trace collection, feature extraction, and ML filtering via Python scripts in `pythonML_scripts/`.
* **Python Research Notebooks (`notebooks/`)**: Contains Jupyter Notebooks (`.ipynb`), including `main_research.ipynb` and RQ figure generation scripts, used for training ML models, computing Information Gain, and running statistical analyses on extracted datasets.
* **Datasets & Experimental Results (`results/`)**: Stores extracted feature CSV datasets (`results/extracted_datasets/`) and execution logs from experiments (`results/RQ3_results/`).

## Research Questions (RQs) and Key Findings

The empirical evaluation of NodeRock is driven by three main Research Questions. And the implementation of all machine learning models, experiments and statistical evaluations can be found in [**notebooks/main_research**](notebooks/main_research.ipynb) in its respective sections.

### [RQ1 - Model Evaluation](notebooks/main_research.ipynb) - Section "Application of ML Models"

> **RQ1:** How effective are different machine learning models at selecting tests with event races? 

Positive Unlabeled (PU) Learning outperformed traditional supervised classifiers (such as SVM, KNN, and Random Forest) in our experiments, achieving 75% accuracy and 84.38% recall, demonstrating competency in detecting tests prone to event races.

<!-- **Figure:** [RQ1_fig.ipynb](notebooks/RQ1_fig.ipynb). -->


### [RQ2 - Feature Analysis](notebooks/main_research.ipynb) - Section "Information Gain Calculation"

> **RQ2:** How much predictive value do the different dynamic features add to the classifiers?

Asynchronous timing and callback behaviors were the most critical indicators of event races in our experiments. Information Gain (IG) analysis revealed that `Invoked_Callbacks` (IG = 0.189) and `Invokes_Interval_Greater_100ms` (IG = 0.155) have the highest predictive power among the extracted dynamic features.

<!-- **Figure:** [RQ2_fig.ipynb](notebooks/RQ2_fig.ipynb). -->


### [RQ3 - Performance Evaluation](notebooks/main_research.ipynb) - Section "Practical Application of Detection"

> **RQ3:** What is the practical runtime performance of using NodeRock to select and prioritize tests?

When filtering tests on the `node-archiver` benchmark prior to running the NACD detector, NodeRock reduced the number of tests to analyze by ~31%, leading to an overall ~6.02% reduction in analysis time across 100 test suite executions without compromising race detection coverage.

<!-- **Figure:** [RQ3_fig.ipynb](notebooks/RQ3_fig.ipynb). -->

## Requirements
To conduct this research, the following hardware and software specs were employed:

### Hardware
- **CPU:** 2 Cores / 4 Threads @ 3.00GHz.
- **RAM:** 8 GB.
- **Disk Space:** At least 5 GB of free space (to store downloaded project archives, node_modules, datasets, scripts and execution logs).

### Software
- **Operating System:** Linux (tested on Ubuntu 22.04 LTS; native installation).
- **Java / GraalVM:** GraalVM Community Edition v21.2.0 (based on Java 11).
- **Node.js & npm:** Node.js v14.16.1 and npm (managed via [nvm](https://github.com/nvm-sh/nvm)).
- **Python:** Version 3.10 or higher.
- **Python Dependencies:** Explicitly versioned in [`requirements.txt`](requirements.txt).

## Installation

### 1. Python Environment Setup
To setup the environment and install the required Python dependencies:
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Full Instrumentation Framework Setup (NodeProf & GraalVM)
To conclude the prerequisites and installation steps for JavaScript code instrumentation and trace collection (setting up GraalVM v21.2.0, Node.js v14.16.1, and the underlying NodeProf framework), follow the detailed step-by-step instructions in [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) file.

> **Note:** To run the Sanity Check below, the steps in INSTALLATION_GUIDE.md are not necessary, as the sanity check evaluates the pre-extracted dataset with the ML model.

### Sanity Check
To verify that the environment and Python dependencies were installed correctly, after the "Python Environment Setup", execute the sanity check script:

```
$ python3 NodeRock_src/python_sanity_check.py 
```
If the setup is functional, the output should conclude with the test prioritization results for the benchmark `node-archiver` (from RQ3):
```
======================================================================
1. LOADING AND PREPARING DATA
======================================================================

Loaded 'results/combined_df.csv' with 1667 rows and 34 columns

Known data (training): 1632 samples
Unknown data (prediction): 35 samples
Total features used: 30

y_known distribution (0=Unknown/False, 1=True): [1601   31]

======================================================================
2. TRAINING PU LEARNING MODEL
======================================================================
Positive examples: 31, unlabeled: 1601

======================================================================
3. PREDICTING LABELS FOR BENCHMARK 'node-archiver'
======================================================================

======================================================================
4. FINAL RESULTS: 'node-archiver' TESTS PRIORITIZED FOR 'HasEventRace'
======================================================================

Total tests analyzed: 35
Tests selected (predicted TRUE): 23
Tests filtered out (predicted FALSE/UNKNOWN): 12

--- Priority ranking (23 tests) ---
1. archiver api #directory should support setting data properties via function
2. archiver api #directory should support ignoring matches via function
3. archiver api #directory should find dot files
4. plugins tar should append manual symlink
5. plugins tar should retain symlinks via directory
6. plugins tar should append stream
7. archiver api #directory should append multiple entries
8. archiver api #directory should handle windows path separators in prefix
9. plugins tar should append folder
10. plugins tar should append buffer
11. plugins tar should append via directory
12. archiver api #glob should append multiple entries
13. plugins tar should append multiple entries
14. plugins zip should append manual symlink
15. plugins zip should allow for custom unix mode
16. plugins zip should append via file
17. plugins zip should append stream
18. archiver api #file should fallback to filepath when no name is set
19. archiver api #file should append filepath
20. plugins zip should append via directory
21. plugins zip should append buffer
22. archiver api #errors should allow continue on stat failing
23. plugins zip should append multiple entries

--- Tests filtered out (12 tests) ---
- plugins zip should allow for entry comments
- archiver api #abort should have a state of aborted
- archiver core #_normalizeEntryData should support prefix of the entry name
- archiver api #file should append multiple entries
- archiver api #file should fallback to file stats when applicable
- archiver core #_normalizeEntryData should support special bits on unix
- archiver api #promise should use a promise
- plugins zip should allow for archive comment
- archiver api #append should append multiple entries
- archiver api #append should append buffer
- archiver api #append should append stream
- archiver api #append should append directory
```

<!-- 
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource$ python3 -m venv venv
pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource$ source venv/bin/activate
(venv) pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource$ pip install -r requirements.txt 
Collecting numpy==1.26.4
  Using cached numpy-1.26.4-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (18.2 MB)
Collecting pandas<3.0.0
  Using cached pandas-2.3.3-cp310-cp310-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl (12.8 MB)
Collecting pulearn==0.0.11
  Using cached pulearn-0.0.11-py3-none-any.whl (18 kB)
Collecting scikit-learn<1.6.0,>=1.0.0
  Using cached scikit_learn-1.5.2-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (13.3 MB)
Collecting six~=1.16.0
  Using cached six-1.16.0-py2.py3-none-any.whl (11 kB)
Collecting python-dateutil>=2.8.2
  Using cached python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
Collecting tzdata>=2022.7
  Using cached tzdata-2026.5-py2.py3-none-any.whl (347 kB)
Collecting pytz>=2020.1
  Using cached pytz-2026.5-py2.py3-none-any.whl (506 kB)
Collecting joblib>=1.2.0
  Using cached joblib-1.6.0-py3-none-any.whl (306 kB)
Collecting scipy>=1.6.0
  Using cached scipy-1.15.3-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (37.7 MB)
Collecting threadpoolctl>=3.1.0
  Using cached threadpoolctl-3.7.0-py3-none-any.whl (26 kB)
Collecting cloudpickle>=3.0
  Using cached cloudpickle-3.1.2-py3-none-any.whl (22 kB)
Installing collected packages: pytz, tzdata, threadpoolctl, six, numpy, cloudpickle, scipy, python-dateutil, joblib, scikit-learn, pandas, pulearn
Successfully installed cloudpickle-3.1.2 joblib-1.6.0 numpy-1.26.4 pandas-2.3.3 pulearn-0.0.11 python-dateutil-2.9.0.post0 pytz-2026.5 scikit-learn-1.5.2 scipy-1.15.3 six-1.16.0 threadpoolctl-3.7.0 tzdata-2026.5
(venv) pedroubuntu@Aspire-A514-54:~/coisasNodeRT/NodeRT-OpenSource$ python3 NodeRock_src/python_sanity_check.py 

======================================================================
1. LOADING AND PREPARING DATA
======================================================================

Loaded 'results/combined_df.csv' with 1667 rows and 34 columns

Known data (training): 1632 samples
Unknown data (prediction): 35 samples
Total features used: 30

y_known distribution (0=Unknown/False, 1=True): [1601   31]

======================================================================
2. TRAINING PU LEARNING MODEL
======================================================================
Positive examples: 31, unlabeled: 1601

======================================================================
3. PREDICTING LABELS FOR BENCHMARK 'node-archiver'
======================================================================

======================================================================
4. FINAL RESULTS: 'node-archiver' TESTS PRIORITIZED FOR 'HasEventRace'
======================================================================

Total tests analyzed: 35
Tests selected (predicted TRUE): 23
Tests filtered out (predicted FALSE/UNKNOWN): 12

--- Priority ranking (23 tests) ---
1. archiver api #directory should support setting data properties via function
2. archiver api #directory should support ignoring matches via function
3. archiver api #directory should find dot files
4. plugins tar should append manual symlink
5. plugins tar should retain symlinks via directory
6. plugins tar should append stream
7. archiver api #directory should append multiple entries
8. archiver api #directory should handle windows path separators in prefix
9. plugins tar should append folder
10. plugins tar should append buffer
11. plugins tar should append via directory
12. archiver api #glob should append multiple entries
13. plugins tar should append multiple entries
14. plugins zip should append manual symlink
15. plugins zip should allow for custom unix mode
16. plugins zip should append via file
17. plugins zip should append stream
18. archiver api #file should fallback to filepath when no name is set
19. archiver api #file should append filepath
20. plugins zip should append via directory
21. plugins zip should append buffer
22. archiver api #errors should allow continue on stat failing
23. plugins zip should append multiple entries

--- Tests filtered out (12 tests) ---
- plugins zip should allow for entry comments
- archiver api #abort should have a state of aborted
- archiver core #_normalizeEntryData should support prefix of the entry name
- archiver api #file should append multiple entries
- archiver api #file should fallback to file stats when applicable
- archiver core #_normalizeEntryData should support special bits on unix
- archiver api #promise should use a promise
- plugins zip should allow for archive comment
- archiver api #append should append multiple entries
- archiver api #append should append buffer
- archiver api #append should append stream
- archiver api #append should append directory
-->

## The NodeRock Pipeline
The core logic of the NodeRock execution pipeline is implemented as a series of sequential scripts located in the [NodeRock_src/entrypoint_NodeRock](NodeRock_src/entrypoint_NodeRock). The pipeline is divided into three main stages:

> **Test Info Runner:** Sets the configuration for the target project ([1_chosenProject.js](NodeRock_src/entrypoint_NodeRock/1_chosenProject.js)) and discovers all executable, passing tests within it using a custom reporter ([2_getTestsNames.js](NodeRock_src/entrypoint_NodeRock/2_getTestsNames.js)).

> **Metric Extractor:** Executes each test individually to capture raw execution traces ([3_executeTests.js](NodeRock_src/entrypoint_NodeRock/3_executeTests.js)), parses these traces to extract function details and callback delays ([4_extractFunctions.js](NodeRock_src/entrypoint_NodeRock/4_extractFunctions.js)), aggregates trace data into a high-level feature set ([5_extractFeatures.js](NodeRock_src/entrypoint_NodeRock/5_extractFeatures.js)), and runs a second, separate execution with monkey-patching to capture detailed Promise lifecycle metrics ([6_executeMonkeyPatching.js](NodeRock_src/entrypoint_NodeRock/6_executeMonkeyPatching.js)).

> **Machine Learning Detector:** Executes the main Python script to select and prioritize tests based on their features ([10_executePythonML.js](NodeRock_src/entrypoint_NodeRock/10_executePythonML.js)) and (for validation) runs an external race detection tool like NACD only on the tests flagged as "suspicious" by the model ([11_executeRaceDetection.js](NodeRock_src/entrypoint_NodeRock/11_executeRaceDetection.js)).


<!-- ## Instrumentation Hooks
The core data collection logic is powered by NodeProf (which runs on GraalVM). The specific hooks used to intercept asynchronous events and gather trace data are implemented in [src/Analysis/MyFunctionCallAnalysis/MyFunctionCallAnalysis.ts](src/Analysis/MyFunctionCallAnalysis/MyFunctionCallAnalysis.ts)

This file defines the analysis class (MyFunctionCallAnalysis) that instruments the JavaScript code. It is responsible for capturing:

- Function entries and exits (functionEnter, functionExit).

- Function invocations, identifying which ones use callbacks (invokeFunPre).

- The lifecycle of async/await operations (asyncFunctionEnter, awaitPre, awaitPost).

- Timestamps (using performance.now()) for calculating delays between asynchronous operations. -->


## Data and Results
The repository also includes the data and experimental results discussed in the paper:

- [results/extracted_datasets:](results/extracted_datasets) Contains the final .csv files with all 15 dynamic features extracted from each test case in the 24 known projects.

- [results/RQ3_results:](results/RQ3_results) Contains the raw execution logs and time measurements from the experiment conducted for Research Question 3 (RQ3), which compared the performance of the full test suite versus the NodeRock-filtered suite.

- [projects:](projects) Stores the description and projects used in this experiment. The built projects, together with their NodeRock analysis logs, are archived on Zenodo.


## License

NodeRock builds upon and extends NodeRT. We gratefully acknowledge
the original authors of [NodeRT](https://doi.org/10.1145/3597926.3598139), whose work is licensed under the GNU GPLv3. NodeRock contains modifications to the original NodeRT source code made from 2024 onward. These modifications and extensions are also distributed under the GNU GPLv3 license.