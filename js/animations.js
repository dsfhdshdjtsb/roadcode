
$(".menuIcon").click(()=>{
    if ($(".container").css("left") == "-335px") {
        $(".container").animate({left: "0px"}, 350);
    }else{
        $(".container").animate({left: "-335px"}, 350);
    }
});

$(".slideIcon").on("click", function(e){
    $(this).toggleClass("rotated")
    $(this).parent().children().next().children().slideToggle();
})
