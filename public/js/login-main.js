
$(document).ready(function(){

    //Login Button
    $("#login_btn").click(function(){
        $(this).prop("disabled", true);
        email = $("#login_user_uname").val();
        pwd =  $("#login_user_pwd").val();                                
        console.log(email, pwd)
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( this.readyState == 4 && this.status == 200) {
                data = JSON.parse(this.responseText);
                console.log(data)
                if( (data.email.indexOf('.oops') < 0) || (data.pwd.indexOf('.oops') < 0) || (data.email == ".oops") ||(data.pwd == ".oops") ){
                    show_popup("Failed to hack into this app");
                }else{
                    console.log(data.email+" "+data.pwd);
                    login(email, pwd);                        
                }
            }
        };
        xhttp.open("POST", "/validate", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("email="+email+"&pwd="+pwd);
    });

});

function show_popup(msg){
    $("#snackbar").html(msg);
    $("#snackbar").addClass("show");    
    setTimeout(function(){ 
        $("#snackbar").removeClass("show");
        $("#login_btn").prop("disabled", false); 
    }, 5000);
}

var ban_acc = [
    'Sorry!! I am unable to grant you access &#128517;',
    'I think you are banned by ur owner &#128530;',
    'Hey you!! Just stop using this account it\'s closed &#128533;',
];
var wrong = [
    'Oops!! You entered wrong data &#128532;',
    'Wait, it\'s wrong. Don\'t be in a hurry &#128521;',
    'Woahh!! I think you are in hurry. Take your time &#128549;',
];
var unknown = [
    'Sorry &#128543; I think something went wrong <br> Try reloading the page',
    'Sorry for the inconvinience occured &#128531; <br> Try reloading the page',
    'Try reloading the page',
];
var multiple = [
    [
        'Sorry &#128543; I think something went wrong <br> Please Login again',
        'Sorry for the inconvinience occured &#128531; <br> Please Login again',
        'Please Login again',
    ],
    [
        'Sorry &#128543; I think something went wrong <br> Please Login again',
        'Sorry for the inconvinience occured &#128531; <br> Please Login again',
        'Please Login again',
    ],
    [
        'Sorry &#128543; I think something went wrong <br> Please Login again',
        'Sorry for the inconvinience occured &#128531; <br> Please Login again',
        'Please Login again',
    ],
    [
        'Sorry &#128543; I think something went wrong <br> Please Login again',
        'Sorry for the inconvinience occured &#128531; <br> Please Login again',
        'Please Login again',
    ]
];

var login_msg = [
    "Please wait logging you in"
];

function login(email, pwd){
                
    /*
    
    Error Codes:
        auth/invalid-email
            Thrown if the email address is not valid.
        auth/user-disabled
            Thrown if the user corresponding to the given email has been disabled.
        auth/user-not-found
            Thrown if there is no user corresponding to the given email.
        auth/wrong-password
            Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.

    */

    var uemail = email.split('.oops')[0];
    var upwd = pwd.split('.oops')[0];
    console.log(uemail + upwd)
    firebase.auth().signInWithEmailAndPassword(uemail, upwd)
        .then(function(data){
            console.log(data);     
            verifyLogin((new Date().getMilliseconds())%3);                                               
        })
        .catch(function(error) {     
            console.log(error)
            var xhttp;
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if ( this.readyState == 4 && this.status == 200) {
                    attempt = typeof parseInt(this.responseText) === "number" ? parseInt(this.responseText) : 3;                    
                    var code = error.code;
                    if( code === "auth/user-disabled" ){
                        var msg = ban_acc[(new Date().getMilliseconds())%3];
                        show_popup(msg);
                    }else if( ( code === "auth/user-not-found" ) || ( code === "auth/wrong-password" ) || ( code === "auth/invalid-email" ) ){
                        var msg = wrong[(new Date().getMilliseconds())%3];
                        show_popup(msg);
                    }else{
                        var msg = unknown[(new Date().getMilliseconds())%3];
                        show_popup(msg);
                    }
                    console.log(error);
                }
            };
            xhttp.open("GET", "/attempt", true);            
            xhttp.send();            
        });                            
    
}

function verifyLogin(pos){
    $("#login_btn").prop("disabled", true);    
    firebase.auth().onAuthStateChanged(function(user){
        if(user){
            var msg =login_msg[(new Date().getMilliseconds())%1];
            show_popup(msg);
            console.log(user)
            firebase.auth().currentUser.getIdToken(true)
                .then(function(idToken) {                    
                    $form = $('<form action="/login" method="post" id="login-submit"></form>');
                    $form.append('<input type="hidden" name="id" value="'+idToken+'">');
                    $('body').append($form);
                    $("#login-submit").submit();
                }).catch(function(error) {
                    show_popup(unknown[pos]);
                });
        }
        else{            
            if(attempt > 1){
                attempt = (attempt>3)?3:attempt;
                show_popup(multiple[attempt][pos]);   
            }
        }
    });
    $("#login_btn").prop("disabled", false);
}

function verifyAttempt(){

    if( attempt != 1 ){
        console.log(attempt)
        console.log("enetered")
        var db;
        var request = window.indexedDB.open("firebaseLocalStorageDb", 1);
        
        request.onerror = function(event) {};
        
        request.onsuccess = function(event) {
            db = request.result;
            var objectStore = db.transaction("firebaseLocalStorage","readwrite").objectStore("firebaseLocalStorage");
    
            objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            
                if (cursor) {
                    var new_request = objectStore.delete(cursor.key);
                    
                    new_request.onsuccess = function(event) {console.log("done")};
                    cursor.continue();
                } else {
                    verifyLogin((new Date().getMilliseconds())%3);
                }
            }
        };
    }  else {
        verifyLogin((new Date().getMilliseconds())%3);
    }  
}
verifyAttempt();