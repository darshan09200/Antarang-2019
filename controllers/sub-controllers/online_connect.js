
var admin = require("firebase-admin");

var serviceAccount = require("../../serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://plastic-factory-f22e2.firebaseio.com"
});

/*
admin.auth().createUser({
    email: 'user@example.com',
    emailVerified: false,
    phoneNumber: '+11234567890',
    password: 'secretPassword',
    displayName: 'John Doe',
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully created new user:', userRecord.uid);
    })
    .catch(function(error) {
      console.log('Error creating new user:', error);
    });

*/


// var client_config = {
//     apiKey: "AIzaSyAv2-EpbD2UrsEMjzlc7kYO74FPiSgxbL8",
//     authDomain: "plastic-factory-f22e2.firebaseapp.com",
//     databaseURL: "https://plastic-factory-f22e2.firebaseio.com",
//     projectId: "plastic-factory-f22e2",
//     storageBucket: "plastic-factory-f22e2.appspot.com",
//     messagingSenderId: "175039860653",
//     appId: "1:175039860653:web:bbde767da0c4e70e"
// };

//Realtime Databse 
var realTime = admin.database()

//Cloud Firestore
var fireStore = admin.firestore()

//Authentication object
var fauth = admin.auth

var get_id = function get_id(fid) {
    var promise = new Promise(function (resolve, reject) {
        admin.auth().verifyIdToken(fid)
            .then(function (decodedToken) {
                var uid = decodedToken.uid;
                resolve(uid);
            })
            .catch(function (err) {
                reject();
            })
    });
    return promise;
}

var verify_user = function verify_user(uid) {
    var promise = new Promise(function (resolve, reject) {
        admin.auth().getUser(uid)
            .then(function (user_data) {
                resolve(user_data);
            })
            .catch(function (err) {
                console.log(err)
                reject();
            })
    });
    return promise;
}

var verify_id = function verify_id(fid) {
    var promise = new Promise(function (resolve, reject) {
        get_id(fid)
            .then(function (uid) {
                verify_user(uid)
                    .then(function (userRecord) {
                        var data = userRecord.toJSON();
                        resolve(data);
                    })
                    .catch(function (error) {
                        console.log('Error fetching user data:', error);
                        reject();
                    });
            })
            .catch(function (error) {
                reject();
            });
    });
    return promise;
}

var encrypt_fid = function (fid, key) {

    var promise = new Promise(function (resolve, reject) {
        verify_id(fid)
            .then(function (data) {
                var efid = "";
                var i;
                var temp = "";
                for (i = 0, j = 0; i < fid.length && j < key.length; i = i + 4, j++) {
                    temp = fid.substring(i, i + 4);
                    efid += temp + key.charAt(j).toString();
                }
                temp = fid.substring(i);
                efid += temp;
                resolve(efid);
            })
            .catch(function () {
                reject();
            })
    });
    return promise;
}

var decrypt_fid = function (efid, key) {

    var promise = new Promise(function (resolve, reject) {
        var fid = "";
        var i;
        var in_key = "";
        var j = 0;
        for (i = 0; i < key.length; i++) {

            temp = efid.substring(j, j + 4);
            fid += temp;
            in_key += efid.charAt(j + 4).toString();
            j = j + 5;

        }

        temp = efid.substring(j);

        fid += temp;
        if (key == in_key) {
            verify_id(fid)
                .then(function () {
                    resolve();
                })
                .catch(function () {
                    reject();
                })
        } else {
            reject();
        }
    });

    return promise;
}

var event_data = function event_data() {
    var promise = new Promise(function (resolve, reject) {
        let eventsRef = fireStore.collection('Event name');
        eventsRef.get()
            .then(function (eventsData) {
                resolve(eventsData);
            })
            .catch(function (err) {
                console.log(err)
                reject();
            })
    });

    return promise;
}

var participant_data = function participant_data(uid, event_code) {
    var promise = new Promise(function (resolve, reject) {
        var participantsRef = fireStore.collection('Participants').where('uid', '==', uid).where('event_code', '==', event_code);
        participantsRef.get()
            .then(function (participants) {
                resolve(participants);
            })
            .catch(function (err) {
                console.log(err)
                reject();
            })
    });
    return promise;
}

var event_size = function event_size(uid, event_code) {
    var promise = new Promise(function (resolve, reject) {
        var eventMaxRef = fireStore.collection('Event name').where('event_code', '==', event_code);
        eventMaxRef.get()
            .then(function (event) {
                if (event.empty) {
                    resolve();
                } else {
                    participant_data(uid, event_code)
                        .then(function (participants) {
                            var filled_size = participants.size;
                            var allowed_size = event.data().max;

                            if (filled_size < allowed_size) {
                                resolve("allow");
                            } else {
                                reject("full");
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            reject();
                        })
                }
            })
            .catch(function (err) {
                console.log(err);
                reject();
            })
    });
    return promise;
}

var check_duplicate = function check_duplicate(uid, event_code, course, div, year, roll_no) {
    var promise = new Promise(function (resolve, reject) {
        var participantsRef = fireStore.collection('Participants').where('uid', '==', uid).where('event_code', '==', event_code).where('course', '==', course).where('course_div', '==', div).where('course_year', '==', year).where('roll_no', '==', roll_no);
        participantsRef.get()
            .then(function (participants) {
                if (participants.empty) {
                    resolve();
                } else {
                    reject("duplicate");
                }
            })
            .catch(function (err) {
                console.log(err)
                reject();
            })
    })
    return promise;
}

var add_data = function add_data(pdata, state) {
    var promise = new Promise(function (resolve, reject) {
        check_duplicate(pdata["uid"], pdata["event_code"], pdata["name"], pdata["course"], pdata["course_div"], pdata["course_year"], pdata["roll_no"])
            .then(function () {
                event_size(pdata["uid"], pdata["event_code"])
                    .then(function (participant) {
                        fireStore.collection('Participants').add(pdata)
                            .then(function (ref) {
                                console.log('Added document with ID: ', ref.id);
                                resolve();
                            })
                            .catch(function (err) {
                                console.log(err);
                                reject();
                            })
                    })
                    .catch(function (err) {
                        reject(err);
                    })
            })
            .catch(function (err) {
                reject(err)
            })
    })
    return promise;
}

var update_event_size = function update_event_size(uid, event_code, old_event_code) {
    var promise = new Promise(function (resolve, reject) {
        var eventMaxRef = fireStore.collection('Event name').where('event_code', '==', event_code);
        eventMaxRef.get()
            .then(function (events) {
                if (events.empty) {
                    console.log(";liukjmhfn")
                    resolve();
                } else {
                    participant_data(uid, event_code)
                        .then(function (participants) {
                            var allowed_size;
                            events.forEach(function (event) {
                                allowed_size = event.data().max;
                            })
                            var filled_size = participants.size;

                            if (old_event_code === event_code) {
                                if (filled_size <= allowed_size) {
                                    resolve("allow");
                                } else {
                                    reject("full");
                                }
                            } else {
                                if (filled_size < allowed_size) {
                                    resolve("allow");
                                } else {
                                    reject("full");
                                }
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            reject();
                        })
                }
            })
            .catch(function (err) {
                console.log(err);
                reject();
            })
    });
    return promise;
}


var check_update_duplicate = function check_update_duplicate(uid, event_code, course, div, year, roll_no, name, no, email) {
    var promise = new Promise(function (resolve, reject) {
        var participantsRef = fireStore.collection('Participants').where('uid', '==', uid).where('event_code', '==', event_code).where('course', '==', course).where('course_div', '==', div).where('course_year', '==', year).where('roll_no', '==', roll_no).where('name', '==', name).where('no', '==', no).where('email', '==', email);
        participantsRef.get()
            .then(function (participants) {
                if (participants.empty) {
                    resolve();
                } else {
                    reject("duplicate");

                }
            })
            .catch(function (err) {
                reject(err);
            })
    })
    return promise;
}

var update_data = function update_data(pdata) {
    var promise = new Promise(function (resolve, reject) {
        check_update_duplicate(pdata["uid"], pdata["event_code"], pdata["course"], pdata["course_div"], pdata["course_year"], pdata["roll_no"], pdata["name"], pdata["no"], pdata["email"])
            .then(function () {
                console.log(pdata["key"])
                var participantsRef = fireStore.collection('Participants').doc(pdata["key"]);
                participantsRef.get()
                    .then(function (participant) {
                        var event_code = participant.data().event_code;
                        update_event_size(pdata["uid"], pdata["event_code"], event_code)
                            .then(function (participant) {
                                var pdata_new = {
                                    course: pdata["course"].trim(),
                                    course_div: pdata["course_div"].trim(),
                                    course_year: pdata["course_year"].trim(),
                                    email: pdata["email"].trim(),
                                    event: pdata["event"].trim(),
                                    event_code: pdata["event_code"].trim(),
                                    name: pdata["name"].trim(),
                                    no: pdata["no"].trim(),
                                    roll_no: pdata["roll_no"].trim(),
                                    uid: pdata["uid"].trim()
                                };
                                fireStore.collection('Participants').doc(pdata["key"]).update(pdata_new)
                                    .then(function (ref) {
                                        resolve();
                                    })
                                    .catch(function (err) {
                                        reject("unavailable")
                                    })
                            })
                            .catch(function (err) {
                                console.log(err)
                                reject("error");
                            })

                    })
                    .catch(function (err) {
                        console.log(err)
                        reject("unavailable");
                    })
            })
            .catch(function (err) {
                console.log(err)
                reject("error")
            })
    })
    return promise;
}

var get_user = function get_user(uid, event_code, name, course, div, year, roll_no) {
    var promise = new Promise(function (resolve, reject) {
        var participantsRef = fireStore.collection('Participants').where('uid', '==', uid);
        participantsRef.get()
            .then(function (participants) {
                if (participants.empty) {
                    reject("error");
                } else {
                    var pdata;
                    var flag = false;
                    var final_data;
                    participants.forEach(function (participant) {
                        pdata = participant.data();                        
                        if (pdata["name"] == name && pdata["course_div"] == div && pdata["course_year"] == year && pdata["roll_no"] == roll_no) {                                                        
                            pdata["data_id"] = participant.id;                            
                            final_data = pdata;                            
                            flag = true;
                            return;
                        }
                    })
                    if (flag) {
                        resolve(final_data);
                    }
                    else {
                        reject("unavailable");
                    }

                }
            })
            .catch(function (err) {
                console.log(err)
                reject();
            })
    })
    return promise;
}

module.exports = {
    server: admin,
    encrypt_fid: encrypt_fid,
    decrypt_fid: decrypt_fid,
    get_id: get_id,
    verify_id: verify_id,
    verify_user: verify_user,
    event_data: event_data,
    participant_data: participant_data,
    add_data: add_data,
    get_user: get_user,
    update_data: update_data
};