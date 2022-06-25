
// $(".container").animate({width:'5%'}, 250);
// $(".createBtn").animate({width:'toggle%'}, 250);

$(".menuIcon").click(()=>{
    if ($(".container").css("left") == "-302px") {
        $(".container").animate({left: "0px"}, 350);
    }else{
        $(".container").animate({left: "-302px"}, 350);
    }
});