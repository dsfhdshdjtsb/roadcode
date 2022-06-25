$(".checkOption").hide();

$(".menuIcon").click(()=>{
    if ($(".container").css("left") == "-305px") {
        $(".container").animate({left: "0px"}, 350);
    }else{
        $(".container").animate({left: "-305px"}, 350);
    }
});

$(".slideIcon").on("click", function(e){
    $(this).toggleClass("rotated")
    let options = $(this).next().children();
    if (options.is(":visible")){
        options.slideDown()
    }
    else{
        options.slideUp()
    }
    $(this).next().children().slideToggle();

})
