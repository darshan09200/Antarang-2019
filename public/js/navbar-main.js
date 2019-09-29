$(document).ready(function () {

    $("#menu_icon").click(function () {
        var check = $("#navbar").hasClass("show");
        if (check) {
            $("#navbar").addClass("remove");
            $("#menu_icon").removeClass("active");
            setTimeout(function () {
                $("#navbar").removeClass("show");
                $("#navbar").removeClass("remove");
                $("#navbar li").css('display', '');
            }, 1000);
        } else {
            $("#navbar").addClass("show");
            $("#menu_icon").addClass("active");
            $("#navbar li").css('display', 'block');
        }
    });

})