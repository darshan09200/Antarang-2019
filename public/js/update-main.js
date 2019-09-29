$(document).ready(function () {
    function updateEvent() {
        var event_code = $("#pevent_update option:selected").val();
        if ((event_code > -1)) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    table.rows().remove().draw(); //Deleting every data
                    var data = JSON.parse(this.responseText);
                    var table_data = [];
                    for (var j = 0; j < data.length; j++) {
                        var temp = JSON.parse(data[j]);
                        table_data.push([
                            temp["name"],
                            temp["course_year"] + "" + temp["course"] + " " + temp["course_div"],
                            temp["roll_no"],
                            temp["no"]
                        ]
                        )
                    }
                    table.rows.add(table_data).draw();
                    update_click();
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
    $("#pevent_update").on('change', function () {
        updateEvent();
    });

    function update_click() {
        $("#event_table_data tr").click(function (e) {
            console.log(e)
            
            var event_code = $("#pevent_update option:selected").val();
            console.log(event_code)
            if ((event_code > -1)) {
                $("body").append("<form method='POST' action='/update/" + temp + "/ec" + event_code + "' id='update_pform'></form>");
                $("#update_pform").append("<input type='hidden' value='"+e.currentTarget.childNodes[0].innerText+"' name='pname'>")
                $("#update_pform").append("<input type='hidden' value='"+e.currentTarget.childNodes[1].innerText+"' name='pcourse'>")
                $("#update_pform").append("<input type='hidden' value='"+e.currentTarget.childNodes[2].innerText+"' name='proll_no'>")
                $("#update_pform").append("<input type='hidden' value='"+e.currentTarget.childNodes[3].innerText+"' name='pno'>")
                $("#update_pform").submit();
            }
        });
    }

});