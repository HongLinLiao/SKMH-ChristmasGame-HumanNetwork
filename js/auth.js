let listenUser = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // document.location.href = `main.html?uid=${user.uid}`;
      currentUser = user;
    }
    else{
      document.location.href = `index.html`;
    }
  });
}
 
 let signUpUser = async (email, password, name) => {

   await firebase.auth().createUserWithEmailAndPassword(email, password)
     .then(async (response) => {

      let user = response.user;

       await firebase.database().ref('users/' + user.uid).set({
           username: name,
           email: email,
           password: password
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
       alert('sign out success!');
     }).catch(function (error) {
       alert(error);
     });
 }