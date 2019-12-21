let listenOpen = async () => {

    await firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            let codeSnapshot = await firebase.database().ref('users').child(user.uid).child('random').once('value');
            let code = codeSnapshot.val();
            $('#code').text(code);
        } else {
            document.location.href = `index.html`;
        }
    });

    let openSnapshot = firebase.database().ref('state');
    openSnapshot.on('value', function (snapshot) {

        openState = snapshot.val();

        if (openState) {
            $('#openState').attr("class", "text-primary");
            $('#openState').text('Open');
            $('#linkBtn').css('display', 'inline');
        } else {
            $('#openState').attr("class", "text-danger");
            $('#openState').text('Close');
            $('#linkBtn').css('display', 'none');
        }

    });


}

let linkPeople = async () => {

    if (openState) {
        const linkApi = firebase.functions().httpsCallable('linkPeople');

        let email = $('#linkInputEmail').val();
        let code = $('#linkInputCode').val();

        await linkApi({
            email: email,
            code: code
        }).then((response) => {
            if (response.data.isOk) {
                alert('Success!');
            } else {
                alert(response.data.message);
            }
        });
    } else {
        alert("Stop Linking!");
    }

}

let listenFL = async () => {

    await firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            let uid = user.uid;

            let listenSnapshot = firebase.database().ref('links').child(uid);
            listenSnapshot.on('value', async (snapshot) => {

                let obj = snapshot.val();

                let keys = Object.keys(obj);

                for (let i = 0; i < keys.length; i++) {
                    let check = firstLevel.filter(x => x == keys[i]);
                    if (check.length == 0) {
                        let nameSnapshot = await firebase.database().ref('users').child(keys[i]).child('username').once('value');
                        let name = nameSnapshot.val();
                        $('#FLCount').text(Number($('#FLCount').text()) + 1);

                        $('#FL').append(`<li class="list-group-item">${name}</li>`);
                        firstLevel.push(keys[i]);
                    }
                }
            });
        } else {
            document.location.href = `index.html`;
        }
    });



}

let repeatGetRank = async () => {


    // 5 seconds call api refresh
    window.setInterval(async () => {

        const rankApi = firebase.functions().httpsCallable('getRank');

        await rankApi().then((response) => {
            if (response.data.isOk) {
                let rankArray = response.data.data;

                let insertString = '';
                rankArray.forEach((item) => {
                    insertString += `<li class="list-group-item"><p class="text-center">${item.rank}. ${item.name}: ${item.score}</p></li>`;
                });

                $('#rankList').html(insertString);
            } else {
                $('#rankList').html("");
                alert(response.data.message);
            }
        });

        console.log("Refresh!");
    }, 5000);

}