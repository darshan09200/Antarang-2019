//Course Section Update
function updateYear(course) {
    $("#pcourse_year").prop('disabled', false);
    var div = ['FY', 'SY', 'TY'];
    var div_html = "<option value=-1>Year</option>";
    for (var i = 0; i < add[course].length; i++) {
        div_html += "<option value=" + i + ">" + div[i] + "</option>";
    }
    $("#pcourse_year").html(div_html);
}
function updateDiv(course, year) {
    $("#pcourse_div").prop('disabled', false);
    var div = 'A';
    var div_html = "<option value=-1>Div</option>";
    for (var i = 0; i < add[course][year]; i++) {
        div_html += "<option value=" + i + ">" + div + "</option>";
        div = String.fromCharCode(div.charCodeAt(0) + 1);
    }
    $("#pcourse_div").html(div_html);
}

function clearYear() {
    $("#pcourse_year").prop('disabled', true);
    $("#pcourse_year").html("<option value=-1>Year</option>");
}

function clearDiv() {
    $("#pcourse_div").prop('disabled', true);
    $("#pcourse_div").html("<option value=-1>Div</option>");
}

function updateData(course, year) {
    if (!(course.localeCompare("Course") == 0) && (year == -1)) {
        updateYear(course);
        clearDiv();
    } else if (!(course.localeCompare("Course") == 0) && !(year == -1)) {
        updateDiv(course, year)
    } else if ((course.localeCompare("Course") == 0)) {
        clearYear();
        clearDiv();
    } else if ((year == -1)) {
        clearDiv();
    }
}

//Event Section Update
function updateEvent() {
    var event_code = $("#pevent option:selected").val();
    if ((event_code > -1)) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                var card_display = '<div class="row justify-content-center">' +
                    '<link rel="stylesheet" href="/css/card-style.css">';
                if (data.length <= 0) {
                    card_display += "<span> No participants</span>"
                } else {
                    //card_display+="<div class='row'><span>Total "+data.length+" Partcipants</span></div>";
                    for (var j = 0; j < data.length; j++) {
                        var temp = JSON.parse(data[j]);
                        card_display +=
                            '       <div class=" card_container offset-1 col-10 text-center" title="' + temp["name"] + '">' +
                            '           <div class="content">' +
                            '               <div>Course: <span>' + temp["course"] + '</span></div>' +
                            '               <div>Year: <span>' + temp["course_year"] + '</span></div>' +
                            '               <div>Div: <span>' + temp["course_div"] + '</span></div>' +
                            '               <div>Roll No.: <span>' + temp["roll_no"] + '</span></div>' +
                            '               <div>Contact No.: <span>' + temp["no"] + '</span></div>' +
                            '               <div>Email Address: <span>' + temp["email"] + '</span></div>' +
                            '          </div>' +
                            '          <div class="heading h3">' +
                            '               <span>' + temp["name"].split(" ")[0] + '</span>' +
                            '           </div>' +
                            '       </div>';
                    }
                }
                card_display += '</div>';
                var id = "#event_data";
                $(id).html(card_display);
            }

        }

        xhttp.open("POST", "/view/" + temp + "/ec" + event_code, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();
    } else {
        var card_display = "";
        var id = "#event_data";
        $(id).html(card_display);
        $("#add_btn").prop('disabled', false);
    }
}

//Validation

function show_popup(msg) {
    $("#snackbar").html(msg);
    $("#snackbar").addClass("show");
    setTimeout(function () {
        $("#snackbar").removeClass("show");
        $("#login_btn").prop("disabled", false);
    }, 5000);
}


$(document).ready(function () {
    $("#pcourse").on('change', function () {
        clearYear();
        clearDiv();
        var course = $("#pcourse option:selected").text();
        var year = $("#pcourse_year option:selected").val();
        updateData(course, year);
    })

    $("#pcourse_year").on('change', function () {
        var course = $("#pcourse option:selected").text();
        var year = $("#pcourse_year option:selected").val();
        updateData(course, year);
    })

    $("#pevent").on('change', function () {
        updateEvent();
    });
    updateEvent();

    $("#add_form").on('submit', function (event) {
        event.preventDefault();
        $("#add_btn").prop("disabled", true);
        var flag = false;
        var data = {};
        data["name"] = $("#pname").val().trim();
        data["course"] = $("#pcourse option:selected").text().trim();
        data["course_year"] = $("#pcourse_year option:selected").text().trim();
        data["course_div"] = $("#pcourse_div option:selected").text().trim();
        data["roll_no"] = $("#proll_no").val().trim();
        data["no"] = $("#pno").val().trim();
        data["email"] = $("#pemail").val().trim();
        data["event"] = $("#pevent option:selected").text().trim();
        data["event_code"] = "ec" + $("#pevent option:selected").val().trim();
        for (key in data) {
            if (data[key] == '') {
                flag = true;
                $("#p" + key).removeClass("is-valid");
                $("#p" + key).addClass("is-invalid");
            } else if ((data[key].localeCompare("Course") == 0) || (data[key].localeCompare("Year") == 0) || (data[key].localeCompare("Div") == 0) || (data[key].localeCompare("Event") == 0)) {
                flag = true;
                $("#p" + key).removeClass("is-valid");
                $("#p" + key).addClass("is-invalid");
            } else if (key.localeCompare("email") == 0) {
                var emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (emailPattern.test(data[key])) {
                    $("#p" + key).removeClass("is-invalid");
                    $("#p" + key).addClass("is-valid");
                } else {
                    flag = true;
                    $("#p" + key).removeClass("is-valid");
                    $("#p" + key).addClass("is-invalid");
                }
            } else if (key.localeCompare("no") == 0) {
                var noPattern = /^\d*$/
                if (noPattern.test(data[key])) {
                    $("#p" + key).removeClass("is-invalid");
                    $("#p" + key).addClass("is-valid");
                } else {
                    flag = true;
                    $("#p" + key).removeClass("is-valid");
                    $("#p" + key).addClass("is-invalid");
                }
            } else {
                $("#p" + key).removeClass("is-invalid");
                $("#p" + key).addClass("is-valid");
            }
        }
        if (!flag) {
            data["key"] = $("#key").val();
            var state = $("#state").val();
            var xhttp;
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var responseData = JSON.parse(this.responseText);
                    var currentState = responseData.state;
                    console.log(currentState)
                    if (currentState.localeCompare("duplicate") == 0) {
                        console.log(currentState)
                        show_popup("Entry has been already made for the given details");
                    } else if (currentState.localeCompare("full") == 0) {
                        show_popup("Entry is full for the event");
                    } else if (currentState.localeCompare("unavailable") == 0) {
                        show_popup("There was some internal error please reload the page");
                    } else if (currentState.localeCompare("done") == 0) {
                        firebase.auth().onAuthStateChanged(function (user) {
                            if (user) {
                                var user = firebase.auth().currentUser;
                                user.getIdToken(true)
                                    .then(function (idToken) {
                                        
                                        var event_code = data["event_code"];
                                        console.log(event_code)
                                        $form = $('<form action="/view" method="post" id="login-submit"></form>');
                                        $form.append('<input type="hidden" name="id" value="' + idToken + '">');
                                        $form.append('<input type="hidden" name="state" value="' + state + '">');
                                        $form.append('<input type="hidden" name="event_code" value=' + event_code +'>');
                                        $('body').append($form);
                                        $("#login-submit").submit();
                                    }).catch(function (error) {
                                        console.log(error)
                                        show_popup("unexpected error! Please reload the Page");
                                    });
                            } else {
                                show_popup("unexpected error! Please reload the Page");
                            }
                        })
                    } else if (currentState.localeCompare("done") == 0) {
                        show_popup("unexpected error! Please reload the Page");
                    } else {
                        var data = responseData.pdata;
                        for (key in data) {
                            if ((data[key].indexOf('.oops') > 0) || (data[key] == ".oops")) {
                                $("#p" + key).addClass("is-invalid");
                            } else {
                                $("#p" + key).addClass("is-valid");
                            }
                        }
                    }
                    $("#add_btn").prop("disabled", false);
                }
            };
            xhttp.open("POST", "/add-validate/" + temp, true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("pdata=" + JSON.stringify(data) + "&state=" + state);
        } else {
            $("#add_btn").prop("disabled", false);
        }
    })

});

// function validate() {

//     // Fetch all the forms we want to apply custom Bootstrap validation styles to
//     var form = $('.needs-validation');
//     // Loop over them and prevent submission
//     if (form.checkValidity() === false) {
//         event.preventDefault();
//         event.stopPropagation();
//     }
//     form.classList.add('was-validated');

// };