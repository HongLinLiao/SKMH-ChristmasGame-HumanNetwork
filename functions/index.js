const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');

admin.initializeApp();

const firebaseConfig = {
    // firebase config
};

firebase.initializeApp(firebaseConfig);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.linkPeople = functions.https.onCall(async (data, context) => {

    try {

        let {
            email,
            code
        } = data;
        let uid = context.auth.uid;

        let linkId = '';

        let result = {
            isOk: false,
            message: 'Connect Error!'
        };

        let openState = true;
        await admin.database().ref("state").once('value', function (snapshot) {
            snapshot.forEach(function (item) {
                if (item.val() == false) {
                    openState = false;
                    result.isOk = false;
                    result.message = "Stop Linking!";
                }
            })
        });

        if (!openState) {
            return result;
        }

        await admin.database().ref("users").orderByChild("email").equalTo(email.toString()).once('value', function (snapshot) {
            snapshot.forEach(function (item) {
                if (item.key != uid) {
                    if (item.val().random == code.toString()) {
                        linkId = item.key;
                        result.isOk = true;
                        result.message = '';
                    }
                } else {
                    result.isOk = false;
                    result.message = "Don't link yourself!";
                }
            })
        });

        if (result.isOk) {
            await admin.database().ref("links").child(uid).child(linkId).set(true);
            await admin.database().ref("links").child(linkId).child(uid).set(true);
        }

        return result;

    } catch (error) {
        console.log(context.auth.uid + ' : ' + error.toString());

        return result = {
            isOk: false,
            message: error.toString()
        };
    }

})

exports.getRank = functions.https.onCall(async (data, context) => {

    let result = {
        isOk: true,
        message: '',
        data: []
    };

    try {

        let dataCollection = {};
        let rankArray = [];

        await admin.database().ref("links").once('value', function (snapshot) {
            snapshot.forEach(function (item) {
                // for search link
                dataCollection[item.key] = item.val();

                let obj = {};
                // origin scroe
                obj[item.key] = 0;
                // rank array
                rankArray.push(obj);
            })
        });

        rankArray.forEach((item) => {
            let targetKey = Object.keys(item)[0];

            let userMap = [];

            let level = 1;

            let score = search(dataCollection, userMap, targetKey, level, targetKey);
            item[targetKey] = Math.ceil(score);
        })

        rankArray.sort((a, b) => {
            return b[Object.keys(b)[0]] - a[Object.keys(a)[0]]
        }).slice(0, 10);

        rankArray = rankArray.slice(0, 10);

        result.data = await rankResult(rankArray);
        return result;

    } catch (error) {
        result.isOk = false;
        result.message = error.toString();
        result.data = [];
        return result;
    }
})

const rankResult = async (array) => {
    let returnArray = [];

    let promise = array.map(async (element, index) => {
        let obj = {
            uid: Object.keys(element)[0],
            name: '',
            rank: index + 1,
            score: element[Object.keys(element)[0]]
        };
        await admin.database().ref("users").child(Object.keys(element)[0]).once('value', (snapshot) => {
            console.log(snapshot.val());
            if (snapshot.val()) {
                obj.name = snapshot.val().username;
                returnArray.push(obj);
            }

        });
    })

    await Promise.all(promise);

    return returnArray;
}

const search = (dataCollection, userMap, targetKey, level, mainKey) => {

    let newMap = userMap;

    let searchMap = [];

    let score = 0;

    if (dataCollection[targetKey] != null) {

        Object.keys(dataCollection[targetKey]).forEach(element => {
            if ((newMap.filter(x => x == element).length) == 0 && element != mainKey) {
                newMap.push(element);
                searchMap.push(element);
            }
        });

        searchMap.forEach(element => {
            let searchSum = search(dataCollection, newMap, element, level + 1, mainKey)
            score = score + searchSum;
        });
        let levelSum = searchMap.length * (100 * Math.pow(0.5, level - 1));
        score = score + levelSum;
    }

    return score;
}