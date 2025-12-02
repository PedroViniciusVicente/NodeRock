# NodeRock: A Machine Learning Approach to Select Node.js Tests with Event Races

NodeRock is a dynamic analysis tool designed to address the challenge of detecting event races in Node.js applications. Event races are subtle concurrency bugs that are notoriously difficult to find and reproduce.

Instead of attempting to detect these bugs directly, which can be computationally expensive , NodeRock uses a machine learning approach to analyze and select tests that have the highest probability of containing event races. The tool operates by collecting detailed execution traces, extracting a set of 15 dynamic features that characterize asynchronous behavior (like callback usage and Promise lifecycles), and then using an ML model to classify and prioritize tests.

This allows developers to focus their debugging efforts and run expensive detection tools (like [NACD](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ECOOP.2025.9)) only on the most critical, high-risk tests, making the entire process more efficient.

This repository contains the source code for the NodeRock tool and the analysis scripts associated.

## Installation and Requirements

All prerequisites and installation steps, including setting up GraalVM (v21.2.0), Node.js (v14.16.1), and the underlying NodeProf framework, are detailed in the [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) file.

## The NodeRock Pipeline
The core logic of the NodeRock execution pipeline is implemented as a series of sequential scripts located in the [NodeRock_src/entrypoint_NodeRock/directory](NodeRock_src/entrypoint_NodeRock/directory). The pipeline is divided into three main stages:

- **Test Info Runner:** Sets the configuration for the target project ([1_chosenProject.js](NodeRock_src/entrypoint_NodeRock/1_chosenProject.js)) and discovers all executable, passing tests within it using a custom reporter ([2_getTestsNames.js](NodeRock_src/entrypoint_NodeRock/2_getTestsNames.js).

- **Metric Extractor:** Executes each test individually to capture raw execution traces ([3_executeTests.js](NodeRock_src/entrypoint_NodeRock/3_executeTests.js)), parses these traces to extract function details and callback delays ([4_extractFunctions.js](NodeRock_src/entrypoint_NodeRock/4_extractFunctions.js)), aggregates trace data into a high-level feature set ([5_extractFeatures.js](NodeRock_src/entrypoint_NodeRock/5_extractFeatures.js)), and runs a second, separate execution with monkey-patching to capture detailed Promise lifecycle metrics ([6_executeMonkeyPatching.js](NodeRock_src/entrypoint_NodeRock/6_executeMonkeyPatching.js)).

- **Machine Learning Detector:** Executes the main Python script to select and prioritize tests based on their features ([10_executePythonML.js](NodeRock_src/entrypoint_NodeRock/10_executePythonML.js)) and (for validation) runs an external race detection tool like NACD only on the tests flagged as "suspicious" by the model ([11_executeRaceDetection.js](NodeRock_src/entrypoint_NodeRock/11_executeRaceDetection.js)).


## Instrumentation Hooks
The core data collection logic is powered by NodeProf (which runs on GraalVM). The specific hooks used to intercept asynchronous events and gather trace data are implemented in:

[src/Analysis/MyFunctionCallAnalysis/novo_MyFunctionCallAnalysis.ts](src/Analysis/MyFunctionCallAnalysis/novo_MyFunctionCallAnalysis.ts)

This file defines the analysis class (MyFunctionCallAnalysis) that instruments the JavaScript code. It is responsible for capturing:

- Function entries and exits (functionEnter, functionExit).

- Function invocations, identifying which ones use callbacks (invokeFunPre).

- The lifecycle of async/await operations (asyncFunctionEnter, awaitPre, awaitPost).

- Timestamps (using performance.now()) for calculating delays between asynchronous operations.

## Research Questions (RQs) and Analysis

This repository supports the research conducted. The analysis for each Research Question (QP) can be found in the following Jupyter Notebooks:

### [RQ1_Model_Evaluation](notebooks/main_research.ipynb) - Section "Aplicação dos Modelos de ML - QP1"

**Question:** How effective are different machine learning models at selecting tests with event races? 

**Analysis:** This notebook evaluates various classifiers (SVM, KNN, Random Forest, etc.) and demonstrates the effectiveness of Positive Unlabeled (PU) Learning, which was chosen for NodeRock after achieving 75% accuracy and 84.38% recall.

**Figure:** [RQ1_fig.ipynb](notebooks/RQ1_fig.ipynb).


### [RQ2_Feature_Analysis](notebooks/main_research.ipynb) - Section "Cálculo do Information Gain - QP2"

**Question:** How much predictive value do the different dynamic features add to the classifiers? 

**Analysis:** This notebook contains the Information Gain analysis for the 15 dynamic features. It shows that metrics like Invokes_with_callback_Normalized (IG=0.189) and InvokesInterval_Greater_Than_100_ms_Raw (IG=0.155) are promising predictors for event races.

**Figure:** [RQ2_fig.ipynb](notebooks/RQ2_fig.ipynb).


### [RQ3_Performance_Evaluation](notebooks/main_research.ipynb) - Section "Aplicação Prática da Detecção - QP3"

**Question:** What is the practical runtime performance of using NodeRock to filter tests? 

**Analysis:** This notebook details the experiment comparing the runtime of a full test suite analysis (using NACD) vs. the NodeRock-filtered analysis. The results on the node-archiver project showed that NodeRock reduced the number of tests to analyze by ~31% and the runtime to execute 1,000 runs of the test suite by ~6.5%, suggesting its use as a practical optimization strategy.

**Figure:** [RQ3_fig.ipynb](notebooks/RQ3_fig.ipynb).


## Data and Results
The repository also includes the data and experimental results discussed in the dissertation:

- [results/extracted_datasets:](results/extracted_datasets) Contains the final .csv files with all 15 dynamic features extracted from each test case in the 24 known projects.

- [results/QP3_results:](results/QP3_results) Contains the raw execution logs and time measurements from the experiment conducted for Research Question 3 (QP3), which compared the performance of the full test suite versus the NodeRock-filtered suite.

- [projects:](projects) Stores the projects used in this experiment. Their builded version can be downloaded from [drive](https://drive.google.com/drive/folders/1tSmqRCo-l0s_pRtEbzld8SCLYkLamiD3?usp=sharing) along with their NodeRock analysis log in NodeRock_Info.