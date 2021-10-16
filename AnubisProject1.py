# In[1]:
import sys
import joblib
import pandas as pd
import json
import flatten_json as fj
import sklearn.preprocessing as scale


data = json.loads((sys.argv[1]))
updatedDf = pd.read_csv('dfForAnubis.csv')
upDf = pd.read_csv('finalDf.csv')
# model = tf.keras.models.load_model('anubisModel.h5')
inputData = {}  # This will be what is flattened
dict_flattened = [fj.flatten(data, '.', root_keys_to_ignore={'topHeroes', 'quickPlayStats', 'icon', 'ratingIcon',
                                                             'levelIcon', 'prestigeIcon', 'endorsement',
                                                             'endorsementIcon'})]
df = pd.DataFrame(dict_flattened)


df = df[~df['rating'].isnull()]

df = df[~df['competitiveStats.awards.cards'].isnull()]

remove = ['ana',
          'ashe',
          'baptiste',
          'brigitte',
          'doomfist',
          'dVa',
          'echo',
          'genji',
          'hanzo',
          'junkrat',
          'lucio',
          'mccree',
          'mei',
          'mercy',
          'moira',
          'orisa',
          'pharah',
          'reaper',
          'reinhardt',
          'sigma',
          'soldier76',
          'tracer',
          'widowmaker',
          'winston',
          'zarya',
          'zenyatta', ]

for el in remove:
    df = df.loc[:, ~df.columns.str.startswith('competitiveStats.careerStats.' + el)]

df = df.loc[:, ~df.columns.str.startswith('competitiveStats.careerStats.wreckingBall')]

remove2 = ["bastion", "symmetra", "torbjorn", "sombra", "roadhog"]

for el in remove2:
    df = df.loc[:, ~df.columns.str.startswith('competitiveStats.careerStats.' + el)]

df = df.loc[:, ~df.columns.str.startswith('competitiveStats.topHeroes')]

df = df.loc[:, ~df.columns.str.startswith('competitiveStats.careerStats.allHeroes.miscellaneous.')]

df = df.loc[:,
     ~df.columns.str.startswith('competitiveStats.careerStats.allHeroes.best.teleporterPadsDestroyedMostInGame')];
df = df.loc[:, ~df.columns.str.startswith('ratings.0.rankIcon')];
df = df.loc[:, ~df.columns.str.startswith('ratings.1.rankIcon')];
df = df.loc[:, ~df.columns.str.startswith('ratings.2.rankIcon')];
df = df.loc[:, ~df.columns.str.startswith('error')];

df.drop_duplicates(inplace=True)
df = df.loc[:, ~df.columns.str.startswith('ratings.0.roleIcon')];
df = df.loc[:, ~df.columns.str.startswith('ratings.1.roleIcon')];
df = df.loc[:, ~df.columns.str.startswith('ratings.2.roleIcon')];
df.dropna(subset=['competitiveStats.awards.cards'], inplace=True)
df.dropna(axis=1, how='all', inplace=True)
df.rename(columns={'ratings.0.level': 'tankLevel'}, inplace=True)
df.rename(columns={'ratings.1.level': 'dpsLevel'}, inplace=True)
df.rename(columns={'ratings.2.level': 'supportLevel'}, inplace=True)
df = df.loc[:, ~df.columns.str.startswith('ratings.0.role')];
df = df.loc[:, ~df.columns.str.startswith('ratings.1.role')];
df = df.loc[:, ~df.columns.str.startswith('ratings.2.role')];

col = df.columns.values.tolist()


df.drop('name', 1, inplace=True)
df.drop('private', 1, inplace=True)

common = (df.columns & upDf.columns)

scalar = scale.StandardScaler()


scaler = joblib.load('AnubisScalar')
imputer = joblib.load('AnubisImputer')

clean_xtest = df.drop(['tankLevel', 'dpsLevel', 'supportLevel', 'rating'], axis=1)

final_xtest = clean_xtest.select_dtypes(include='number')

imputer.fit(final_xtest)
XTest = imputer.transform(final_xtest)
x_x = pd.DataFrame(XTest, columns=final_xtest.columns, index=final_xtest.index)

XTestScaled = scaler.fit_transform(x_x.values.reshape(-1 ,1))

XTestScaled = XTestScaled.reshape(1,-1)

random = joblib.load('AnubisForest')
prediction = random.predict(XTestScaled)
prediction = prediction.tolist()
print(json.dumps(prediction))
# predictiontf = model.predict(XTestScaled)

nameModifier = 'competitiveStats.careerStats.allHeroes.average.'
importantFactors = ['allDamageDoneAvgPer10Min',
                    'barrierDamageDoneAvgPer10Min',
                    'deathsAvgPer10Min',
                    'eliminationsAvgPer10Min',
                    'finalBlowsAvgPer10Min',
                    'healingDoneAvgPer10Min',
                    'heroDamageDoneAvgPer10Min',
                    'objectiveKillsAvgPer10Min',
                    'objectiveTimeAvgPer10Min',
                    'soloKillsAvgPer10Min',
                    'timeSpentOnFireAvgPer10Min' ]
topStats = []
bottomStats = []

a = updatedDf['competitiveStats.careerStats.allHeroes.average.' + 'allDamageDoneAvgPer10Min'].mean()

for var in importantFactors:
    combo = nameModifier+var

    if var == 'timeSpentOnFireAvgPer10Min' or var == 'objectiveTimeAvgPer10Min' :
        df[combo] = pd.to_datetime(df[combo])
        updatedDf[combo] = pd.to_datetime(updatedDf[combo])
    else:
        df[combo] = df[combo].astype(float)
        updatedDf[combo] = updatedDf[combo].astype(float)
    var_mean = updatedDf[combo].mean()
    if var == 'timeSpentOnFireAvgPer10Min' or var == 'objectiveTimeAvgPer10Min':
        var_mean = float(var_mean.timestamp())
        current = float(df[combo].mean().timestamp())
        percent = abs(var_mean - current) / var_mean * 100
        # percent = (dt.datetime.min + percent).time()

    else:
        percent = abs(var_mean - df[combo].mean()) / var_mean * 100
        current = df[combo].mean()
    if var_mean != 0:
        if var_mean > current:
            if 'deaths' in var:
                topStats.append((var, percent))
            else:
                bottomStats.append((var, percent))
        if var_mean < current:
            if 'deaths' in var:
                bottomStats.append((var, percent))
            else:
                topStats.append((var, percent))
top = dict(sorted(topStats, key=lambda item: item[1], reverse=True))
bottom = dict(sorted(bottomStats, key=lambda item: item[1], reverse=True))


topList = list(top.items())[:3] if len(top) >= 3 else list(top.items())
bottomList = list(bottom.items())[:3] if len(bottom) >= 3 else list(bottom.items())

if len(topList) == 0:
    topList = json.dumps("No Top Stats")
else:
    topList = json.dumps(topList)

if len(bottomList) == 0:
    bottomList = json.dumps("No Bottom Stats")
else:
    bottomList = json.dumps(bottomList)

full = {topList, bottomList}

print(full)
