let express = require('express');
let router = express.Router();
// let firebase = require('firebase')
let fetch = require('node-fetch')
const {PythonShell} = require('python-shell')
let admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDS);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://anubis-c9edb-default-rtdb.firebaseio.com"
});

const db = admin.database()

async function getInfo(fullTag) {

    try {
        const encodedURI = encodeURI("https://ow-api.com/v1/stats/pc/us/" + fullTag + "/complete");
        let res = await fetch(encodedURI);
        let data = await res.json()
        let newData = JSON.stringify(data)

        if (!data.toString().includes("bad tag") || !data.toString().indexOf("Player not found") || !data.toString().includes("error")){
            console.log(data)
            return newData
        }
    }
    catch(error){
        console.log(error)
    }
}


async function getBattleTag(id) {
    console.log(id)
    let res = db.ref('/users/' + id)
    let value = await res.once('value')
    console.log(value.child('tag').exists())
    return value.val().tag
}
async function returnCardText(text) {
    let res = db.ref('OverallMetrics').child(text.title)
    let cat = await res.once('value')
    if(cat.val()) {
        return cat.val().summary
    }

}

async function addTextInfo () {
    let dataArray = [
        {name: 'allDamageDoneAvgPer10Min',
        summary: 'Like ‘Hero Damage’, the “All Damage Done” statistic just show how much of a destructive force you are!',
        },
        {name: 'deathsAvgPer10Min',
        summary: 'The worst thing you can do is die! Dying frequently usually points to errors in your positioning. Try to take high ground positions more often and always be aware of your team location. Make frequent callouts to let your team know if you are being attacked by enemy heroes.'
            },
        {name: 'healingDoneAvgPer10Min',
        summary: 'High healing output means you are countering the damage done by the enemy team. Triage teammates by likelihood of death: if possible, heal a low health (well positioned) damage dealer or fellow healer over a self-healing tank. Keep in mind you DO NOT have to fully heal a teammate during combat to be effective. Wait for a lull in battle!'
            },
        {name: 'heroDamageDoneAvgPer10Min', summary: 'A consistently high damage output is important! Reducing enemy health gives you the team better opportunities to finish them off and capture objectives or the payload. If you are having trouble, try switching to heroes with higher damage output and mobility (Echo, Soldier) or train your aim.'},
        {name: 'objectiveKillsAvgPer10Min', summary: 'Objective kills are incredibly important. Fend off enemies from taking the objectives to prolong the battle. Take advantage of the fact that you are defending an objective, so the enemy has a limited number of tactics to invade'},
        {name: 'soloKillsAvgPer10Min', summary:'Solo kills, 1vs1’s, same thing! Mechanical skill and understanding your hero’ abilities is incredibly important here. Improving this ability directly improves your carry potential and elevates you above other Damage Dealers and Tanks.' },
        {name: 'timeSpentOnFireAvgPer10Min', summary: 'Consistently getting kills, objectives, effectively using hero abilities and shutting down other players’ abilities give you fire. The more time on fire you have, the more consistent you are with these metrics'},
        {name: 'barrierDamageDoneAvgPer10Min', summary: 'Make sure to destroy barriers!'},
        {name: 'objectiveTimeAvgPer10Min', summary: 'Prioritize the objective!' },
        {name: 'finalBlowsAvgPer10Min', summary: 'Eliminations are key to winning fights! Focus on finishing off low health enemies to stop fights and keep the enemy team on the run and stops the dead hero from gaining ult charge!'
                },
        {name: 'eliminationsAvgPer10Min', summary: 'Overall Eliminations are a good indicator if you’re coordinating with you team to get finish off enemies. High eliminations don’t always correlate with a good player, but it does mean you are an active participant and contributing in battles! ' }

    ]
    for(let metric of dataArray) {
        await db.ref('/OverallMetrics/' + metric.name).set(
            {summary: metric.summary}
        )
    }

}

async function setBattleTag(id, battletag) {
    await db.ref('/users/' + id).update(
        {tag: battletag}
    )
}
async function addUserToFirebase(result) {
    console.log(result)
    if(result && result.hasOwnProperty('user')) {
        let signIn = {signIn: false, result: result.user.uid}
        try {
            if (result.additionalUserInfo.isNewUser) {
                signIn.signIn = true
                await db.ref('/users/' + result.user.uid).update(
                    {email: result.user.email}
                )
            }
            return signIn
        } catch (e) {
            return e
        }
    }
    else {
        return {error: 'User is not found (null), try again'}
    }
}
let login = async (googleUser, username = undefined, password = undefined) => {
    let info = {};

    if(googleUser) {
        let credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser);


        try {// Sign in with credential from the Google user.
            let res = await firebase.auth().signInWithCredential(credential)

            let final = await addUserToFirebase(res)
            if (final) {
                info = final
            }
        } catch (error) {
            return {error: error}
        }

    }

    else if(username && password) {

        try {
            let res = await firebase.auth().signInWithEmailAndPassword(username, password)
            let final = await addUserToFirebase(res)
            if (final) {
               info = final
            }
        }
        catch(error) {
            return {error: error}
        }
    }

    return info
}

router.post('/loggedPython', async function(req, res){
    if (req && req.body.hasOwnProperty('battleTag')) {
        let battleTag = req.body.battleTag
        let id = req.body.userId
        let info = await getInfo(battleTag)
        if(info.includes('error')) {
            res.send(info)
        }

        else {
            await setBattleTag(id, battleTag)
            let options = {
                args: [info] //An argument which can be accessed in the script using sys.argv[1]
            };

            PythonShell.run('AnubisProject1.py', options, function (err, result) {
                if (err) res.send(err);
                // result is an array consisting of messages collected
                //during execution of script.
                console.log('result: ', result.toString());
                res.send(result)
            });
        }

    }
    // EDIT THIS
    else {
        let id = req.body.userId
        let battleTag = await getBattleTag(id)
        console.log(battleTag)
        let info = await getInfo(battleTag)
        if(info.includes('error')) {
            res.send(info)
        }
        else {
            let options = {
                args: [info] //An argument which can be accessed in the script using sys.argv[1]
            };

            PythonShell.run('AnubisProject1.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected
                //during execution of script.
                console.log('result: ', result.toString());
                res.send(result)
            });

        }

    }
})


router.post('/', async function(req, res, next) {
    let firstLogin;
    if (req && req.body.hasOwnProperty('id_token')) {
        firstLogin = await login(req.body.id_token)
    }
    else if(req && req.body.hasOwnProperty('username')) {
         firstLogin = await login(req.body.username, req.body.password)
    }

    if (firstLogin && firstLogin.hasOwnProperty('result')) {
        if (firstLogin.signIn === true)
            res.json({firstLogin: firstLogin, screenName: 'SetBattleTagScreen', userId: firstLogin.result})
        else if (firstLogin.signIn === false) {
            res.json({firstLogin: firstLogin, screenName: 'RankingScreen', userId: firstLogin.result})
        }
    } else
        res.json(firstLogin)

})

router.post('/addToFirebase', async function(req, res, next) {

    if (req && req.body.hasOwnProperty('user')) {
        let response = await addUserToFirebase(req.body.user)
        res.send(response)
    }

})



router.post('/python', async function(req, res){
    if (req && req.body.hasOwnProperty('fullTag')) {
        let battletag = req.body.fullTag
        let id = req.body.userId
        let info = await getInfo(battletag)

        if(info.includes('error')) {
            res.send(info)
        }
        else {
            await setBattleTag(id, battletag)
            let options = {
                args: [info] //An argument which can be accessed in the script using sys.argv[1]
            };

            PythonShell.run('AnubisProject1.py', options, function (err, result) {
                if (err) throw err;
                // result is an array consisting of messages collected
                //during execution of script.
                console.log('result: ', result.toString());
                res.send(result)
            });
        }
    }
})

router.post('/textEntry', async function(req, res){
    let re = await addTextInfo()
    res.send(re)
})

router.post('/getTextOnCard', async function(req, res){
    let re = await returnCardText(req.body)
    res.send(re)
})

router.post('/logout', async function(req, res){
    res.send('logged out')
})

module.exports = router;
