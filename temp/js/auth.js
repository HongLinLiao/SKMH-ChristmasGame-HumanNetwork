let listenUser = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // document.location.href = `main.html?uid=${user.uid}`;
      currentUser = user;
    } else {
      document.location.href = `index.html`;
    }
  });
}

let signUpUser = async (email, password, name) => {

  await firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(async (response) => {

      let user = response.user;

      let random = (Math.floor(Math.random() * Math.floor(9))+1).toString()+(Math.floor(Math.random() * Math.floor(9))+1).toString()+(Math.floor(Math.random() * Math.floor(9))+1).toString()+(Math.floor(Math.random() * Math.floor(9))+1).toString();
      
      await firebase.database().ref('users/' + user.uid).set({
          username: name,
          email: email,
          password: password,
          random: random
        })
        .then(() => {
          //  alert('sign up success!');
          document.location.href = "main.html";
        })
        .catch((error) => {
          alert(error);
        })

    }).catch((error) => {
      alert(error);
    });
};

let signIn = async (email, password) => {
  await firebase.auth().signInWithEmailAndPassword(email, password)
    .then((response) => {
      document.location.href = `main.html`;
    })
    .catch((error) => {
      alert(error);
    });
}

let signOut = async () => {
  await firebase.auth().signOut()
    .then(() => {
      document.location.href = `index.html`;
    }).catch(function (error) {
      alert(error);
    });
}