let express = require('express');
let router = express.Router();
// let firebase = require('firebase')
let fetch = require('node-fetch')
const {PythonShell} = require('python-shell')
let admin = require("firebase-admin");


// require("firebase/auth")

/* GET users listing. */
// const firebaseConfig = {
//     apiKey: "AIzaSyBifKFLyeb5Qm71HtCyJ7LnI7_ot8RPsvE",
//     authDomain: "anubis-c9edb.firebaseapp.com",
//     databaseURL: "https://anubis-c9edb-default-rtdb.firebaseio.com",
//     projectId: "anubis-c9edb",
//     storageBucket: "anubis-c9edb.appspot.com",
//     messagingSenderId: "745868178409",
//     appId: "1:745868178409:web:8e7e26aa3d73d2a5d8d178"
// };
console.log(process.env.GOOGLE_CREDS)
const serviceAccount = {"type":"service_account","project_id":"anubis-c9edb","private_key_id":"d50803b7daba4e215a928af60d7466cd885adc38","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0n7vb4lT31HiB\nSjviUfxLPH3Jq729UyzT+QwTWYKYiSJtFos1BAuDebs+AM03wmUePrINiGasoiog\nQ61LuIo9sU2DeCB4xcyP9qH2mTO/zfdPyNzVt20wmHB/KVV3eim+clul0egLEzjx\nkyw7Iao4vy4NxdopTkXFDrACGfmSZ2eB2nMt7mitZx/UUWxgc5DPhs4Y/hUzVavm\no8F9sPSY1ltJqUgsrQFYhJYjo5FB4XO+ehwMkAAYwC70yFF3b+/u/ahkSV87WYVt\nLWu8ERAbITAUJxAZ4vKZQmXW39ffoNPejz8wMPpKknmFg4rR8r8gwcCEt27fjW8s\nJnx+G0z9AgMBAAECggEABgBWrBAhlZhsJpOSWMszkEZiwYwgwkUctLBOK+hp8+p+\nh9RbbLgFL+mgBIffSa5+UJpxrQxuqOa8cpT9EYqAoVseQbOAlLKxwMjHidt+Qi20\nPWTlnX46NQajmj4D1nPrJiZDkEdgp9mMJ06mBhLwxnDntVJxFLVCkTETPQai6a/S\njjXLY+jo8y4nBkEQJnj564Osq4WgfeKhGQwdov26SJGEoZgHOqLBqr9Myyb2utUL\nn66Ymz/pNC7Q0OpNz+EOTyeQFdOcR/0BnIIhOnj7TbHS5NcVjbB+R/4uBa+eHf83\nNR181bcH/o7o+V6ynW55WOJJk6RYzNHhIbrw0E3mcQKBgQDfllw+T9LA9e2ocnzB\nvzexSytVFExK8+F4flSHCYXcYhdfgBNqTwywBM+3jn501H1pCLCAcYj/d+29cQnk\nbRJ4vg1LpBPiaQKYORJydd7BE1fY2SqsUjr8JhusnggpjjdCEU4McEFtkTNPghqR\nDgfbbUpvlbU7dBSvo6qy238NSQKBgQDOzvEsnS0hVABodlXxDDQ+c+MQPnF61KGG\nRU74uMi35HkgOEFMed+IWPEtEEPeUVGl3tnbWDBkIwYsLqu0ywM2JwUGloI+2kzc\n6z6vm2g9Msz5kd6odw8hXO+VUkdzWF5RZT6eH1s3Ly8idMhDwgapOoiaXKXcDHUM\n7/3tlOOGFQKBgQCaz/+63YZuOVp/YhZkCMTFK+krFczlsQwTZFWe0scvG3RXmdTX\nrTh5wDsbO7zvpBnZ2jxsEzDqwt2IaHaTBbreg6mtEET8Zf137TyKqHa+dWhEK8pS\nWvWglbpfwWShcWltg5HpJukGtp0ylkFS4sYp9vitXpmIOw3/t3GAOl80kQKBgQCZ\nXXwa4sCqG5pl3YPkS3Ge8t/rlvMe7PqQEWv8JUSsouF0lGNQbHzpp1PLYGmEP/f1\nsysKb/8K87JLJ50saPULvqoKdalHJSqlFkuZfP0zjS3W0mc1tX1h94Kw0KCuGFVx\ntUxXhNdnODWTLtmo7gV0kDTnjFdvtUlEe+Fqw+Rq9QKBgCAKjvrK0V/8Cidi1k/8\nDEnsgdSpEXSSRZ6PvVMEJN9kMRDVHWsl4wHO53tL/jTw38/ej5qfL7m6c2ar+DSA\ntLgdR1PdBiUGpZocJBJU+/JNrSejzTcBlSUCJr/GWm4XRnbILoaMCS30qOQ7IKQa\ndnVuHfEINmIBTMMT+eAI/T/B\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-padc2@anubis-c9edb.iam.gserviceaccount.com","client_id": "115433493371176591403","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-padc2%40anubis-c9edb.iam.gserviceaccount.com"}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://anubis-c9edb-default-rtdb.firebaseio.com"
});

const db = admin.database()

// firebase.initializeApp(firebaseConfig)

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
async function logout() {
    await db.signOut()
}
async function setBattleTag(id, battletag) {
    await db.ref('/users/' + id).update(
        {tag: battletag}
    )
}
async function addUserToFirebase(result) {
    console.log(result)
    let signIn = {signIn: false, result: result.user.uid}
    try {
        if (result.additionalUserInfo.isNewUser) {
            signIn.signIn = true
            await db.ref('/users/' + result.user.uid).update(
                {email: result.user.email}
            )
        }
        return signIn
    }
    catch (e) {
        return e
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
                pythonPath: '/Users/natesmac/opt/anaconda3/envs/tf/bin/python',
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
