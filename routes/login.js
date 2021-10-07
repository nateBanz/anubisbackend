let express = require('express');
let router = express.Router();
let firebase = require('firebase')
let fetch = require('node-fetch')
const {PythonShell} = require('python-shell')
const {python} = require('pythonia')


require("firebase/auth")

/* GET users listing. */
const firebaseConfig = {
    apiKey: "AIzaSyBifKFLyeb5Qm71HtCyJ7LnI7_ot8RPsvE",
    authDomain: "anubis-c9edb.firebaseapp.com",
    databaseURL: "https://anubis-c9edb-default-rtdb.firebaseio.com",
    projectId: "anubis-c9edb",
    storageBucket: "anubis-c9edb.appspot.com",
    messagingSenderId: "745868178409",
    appId: "1:745868178409:web:8e7e26aa3d73d2a5d8d178"
};
firebase.initializeApp(firebaseConfig)
async function tensor(request) {
    const tf = await python('tensorflow')
    const model = await tf.keras.models.load_model('anubisModel.h5')
    let answer = model.predict(request.tensorData)
}
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


async function addUserToFirebase(result) {
    let signIn = {signIn: false, result: result.user.uid}

     // if(result.additionalUserInfo.isNewUser) {
         signIn.signIn = true
         await firebase.database().ref('/users/' + result.user.uid).set(
             {email: result.user.email}
         )
     //}
    return signIn
}
let login = async (googleUser) => {
    let info = {};

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
    return info
}

router.post('/', async function(req, res, next) {
    if (req && req.body.hasOwnProperty('id_token')) {
        let firstLogin = await login(req.body.id_token)
        if (firstLogin && firstLogin.hasOwnProperty('result')) {
            if (firstLogin.signIn === true)
                res.json({firstLogin: firstLogin, screenName: 'SetBattleTagScreen', userId: firstLogin.result})
            else if (firstLogin.signIn === false) {
                res.json({firstLogin: firstLogin, screenName: 'RankingScreen', userId: firstLogin.result})
            }
        } else
            res.json(firstLogin)

    }
    else {
        res.json('No request')
    }
})

router.post('/python', async function(req, res){
    if (req && req.body.hasOwnProperty('fullTag')) {
        let battletag = req.body.fullTag
        let info = await getInfo(battletag)
        let options = {
            pythonPath: '/Users/natesmac/opt/anaconda3/envs/tf/bin/python',
            args: [info] //An argument which can be accessed in the script using sys.argv[1]
        };

        PythonShell.run('AnubisProject1.py', options, function (err, result) {
            if (err) throw err;
            // result is an array consisting of messages collected
            //during execution of script.
            console.log('result: ', result.toString());
            res.send(result[0])
        });
    }
})


module.exports = router;
