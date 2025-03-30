# =============== LIBS ===============

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import csv

# Normalização Min-Max
from sklearn.preprocessing import MinMaxScaler

# Modelos
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC

# Métricas
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import confusion_matrix, roc_auc_score, roc_curve, classification_report


# =============== IMPORTANDO OS CVS ===============
# No futuro automatizar esse processo pra ele pegar todos os csv de csvBenchmarks automaticamente

# -=+=- Known bugs -=+=-
df_aka = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataAKA.csv')
df_fps = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataFPS.csv')
df_gho = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataGHO.csv')
df_mkd = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataMKD.csv')
# nes
df_nlf = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataNLF.csv')
df_sio = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataSIO.csv')
df_del = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataDel.csv')
df_lst = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataLST.csv')
df_nsc = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataNSC.csv')
# xls
# -=+=- Open issues -=+=-
df_blueblird = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataBluebird.csv')
df_express_user = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataExpressUser.csv')
df_gpt = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataGPT.csv')
df_lvs = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataLVS.csv')
df_sioc = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataSIOC.csv')
# -=+=- Exploratory -=+=-
df_mongoexpress = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataMongoExpress.csv')
df_nedb = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataNEDB.csv')
df_arc = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataARC.csv')
df_obj = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataOBJ.csv')
# -=+=- Fs-Extra -=+=-
df_fsextra = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/csvBenchmarks/dataFsExtra.csv')

# print(df_aka)


# =============== JUNTANDO OS CVS ===============

df = pd.concat([df_aka, df_fps, df_gho, df_mkd, df_nlf, df_sio, df_del, df_lst, df_nsc,
                df_blueblird, df_express_user, df_gpt, df_lvs, df_sioc,
                df_mongoexpress, df_nedb, df_arc, df_obj, df_fsextra], ignore_index=True)
df['HasEventRace'] = df['HasEventRace'].replace(True, 'True')
df['HasEventRace'] = df['HasEventRace'].replace('Undefined', 'False')



# =============== FAZENDO A AMOSTRAGEM (3X1) ===============

# Atualmente temos 96 linhas, sendo 24 true e 72 false
df_true = df[df["HasEventRace"] == "True"]
df_false = df[df["HasEventRace"] == "False"]

# Amostragem com proporcao 3 False para 1 True
df_false_sampled = df_false.sample(n=3 * len(df_true), random_state=0)
df_sampled = pd.concat([df_true, df_false_sampled])

# Embaralhando as linhas
df_sampled = df_sampled.sample(frac=1, random_state=0).reset_index(drop=True)


# =============== PRE-PROCESSAMENTO ===============

# x sao as variaveis Independentes
x = df_sampled.drop(columns=["BenchmarkName", "TestFilePath", "TestCaseName", "HasEventRace"])
# print(x)

# y eh a variaveis Target (Dependente)
y = df_sampled["HasEventRace"].apply(lambda x: 1 if x == "True" else 0)
# print(y)

#
scaler = MinMaxScaler()
scaler.fit(x)
x_scaled = scaler.transform(x) # x_scaled sao os atributos normalizados


# =============== TREINANDO OS MODELOS DE MACHINE LEARNING ===============

# -=+=- KNN -=+=-
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(x_scaled, y)

# -=+=- DECISION TREE -=+=-
dt = DecisionTreeClassifier(random_state=0)
dt.fit(x_scaled, y)

# -=+=- RANDOM FOREST -=+=-
rf = RandomForestClassifier(n_estimators=100, random_state=0)
rf.fit(x_scaled, y)

# -=+=- NAIVE BAYES -=+=-
nb = GaussianNB()
nb.fit(x_scaled, y)

# -=+=- SUPPORT VECTOR MACHINES (SVM) -=+=-
svm = SVC(probability=True, kernel='rbf', C=1.0, random_state=0)
svm.fit(x_scaled, y)


# =============== CARREGAMENTO DA ENTRADA ===============

df_entrada = pd.read_csv('./NodeRock_src/FoldersUsedDuringExecution/collectedCsvFolder/data.csv')

df_testsInfo = df_entrada[["BenchmarkName", "TestFilePath", "TestCaseName"]].copy()
# print(df_testsInfo)


# =============== PRE PROCESSAMENTO DA ENTRADA ===============

x_entrada = df_entrada.drop(columns=["BenchmarkName", "TestFilePath", "TestCaseName", "HasEventRace", 
                                     "avgRejected_Normalized", "avgRejected_Raw", "avgResolved_Normalized", "avgResolved_Raw", "awaitIntervals_Normalized", "awaitIntervals_Raw",
                                     "longestResolved_Normalized", "longestResolved_Raw", "resolvedPercentage_Normalized", "resolvedPercentage_Raw", "totalSettledPromises_Normalized", "totalSettledPromises_Raw"])
# print(x_entrada)
x_entrada_scaled = scaler.transform(x_entrada)
# print(x_entrada_scaled)



# =============== FAZENDO A PREVISAO ===============

rotulo_previsto = []

for i in range(len(x_entrada_scaled)):
    rotulo_previsto.append(0)
    rotulo_previsto[i] += knn.predict([x_entrada_scaled[i]])[0]
    rotulo_previsto[i] += dt.predict([x_entrada_scaled[i]])[0]
    rotulo_previsto[i] += rf.predict([x_entrada_scaled[i]])[0]
    rotulo_previsto[i] += nb.predict([x_entrada_scaled[i]])[0]
    rotulo_previsto[i] += svm.predict([x_entrada_scaled[i]])[0]

# Imprimindo o rótulo previsto
# for i in range (len(x_entrada_scaled)):
#     print(f"Qtd de modelos que deram true para a linha {i} sao: {rotulo_previsto[i]}")


# =============== GERANDO O CSV DE SAIDA ===============
df_testsInfo['QuantidadeRotulosPositivo'] = rotulo_previsto
# print(df_testsInfo)

# df_testsInfo.to_csv('collectedResultsMLFolder/resultados_testes.csv')

# Fix the problem that Pandas doubles the double quotes (""testname"") if testname already had quotes. For example in: almost_through2-concurrent
# df_testsInfo.to_csv(
#     './NodeRock_src/FoldersUsedDuringExecution/collectedResultsMLFolder/resultados_testes.csv',
#     index=False,
#     quoting=csv.QUOTE_NONE,  # Do not unnecessarily quote fields
#     escapechar='\\'  # Escape special characters instead of adding extra quotes
# )

df_testsInfo.to_csv('./NodeRock_src/FoldersUsedDuringExecution/collectedResultsMLFolder/resultados_testes.csv');



print("finalizou")
