function getYearIndex(course, year){
    var div = ['FY', 'SY', 'TY'];    
    console.log(('A'-'F'));
    for( var i = 0 ; i < add[course].length; i++){
        if(year === div[i]){
            return i;
        }
    }
    return -1;
}

function getDivIndex(div){
    var start = 'A';
    return (start.charCodeAt(0) - div.charCodeAt(0));
}
function setValues() {
    var user_data = JSON.parse($("#user_data").val());
    console.log(user_data)
    $("#pname").val(user_data.name);
    $("#pcourse").val(user_data.course);
    updateYear(user_data.course);
    var year = getYearIndex(user_data.course, user_data.course_year)
    updateDiv(user_data.course, year);
    $("#pcourse_year").val(year);
    $("#pcourse_div").val(getDivIndex(user_data.course_div));
    $("#proll_no").val(user_data.roll_no);
    $("#pno").val(user_data.no);
    $("#pemail").val(user_data.email);
    $("#pevent").val(user_data.event_code.split("c")[1]);
}
setValues();
$(document).ready(function () {

});