$(document).ready(function () {

    for (let i = 1; i <= count; i++) {
        $("#event_data_heading-" + i).click(function () {
            if ($("#event_data-" + i).html() == "") {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(this.responseText);
                        var card_display = '<div class="row justify-content-center">' +
                            '<link rel="stylesheet" href="/css/card-style.css">';
                        var length = 3;
                        var offset = "";
                        if(data.length <= 0 ){
                            card_display+="<span> NO Participants</span>"
                        }
                        if (data.length < 3) {
                            offset = "offset-lg-" + ((data.length == 2) ? 0 : 2);
                            length = 5;
                        }
                        for (var j = 0; j < data.length; j++) {
                            var temp = JSON.parse(data[j]);
                            card_display +=
                                '       <div class=" card_container col-sm-5 col-md-4 col-lg-' + length + ' text-center" title="'+temp["name"]+'">' +
                                '           <div class="content">' +
                                '               <div>Course: <span>'+temp["course"]+'</span></div>' +
                                '               <div>Year: <span>'+temp["course_year"]+'</span></div>' +
                                '               <div>Div: <span>'+temp["course_div"]+'</span></div>' +
                                '               <div>Roll No.: <span>'+temp["roll_no"]+'</span></div>' +
                                '               <div>Contact No.: <span>'+temp["no"]+'</span></div>' +
                                '               <div>Email Address: <span>'+temp["email"]+'</span></div>' +
                                '          </div>' +
                                '          <div class="heading h3">' +
                                '               <span>' + temp["name"] + '</span>' +
                                '           </div>' +
                                '       </div>';

                            
                        }
                        card_display += '</div>';
                        var id = "#event_data-" + (i);
                        $(id).html(card_display);
                        
                    }
                };
                xhttp.open("POST", "/view/" + temp + "/ec" + i, true);
                xhttp.send();
            }
        });
    }

});