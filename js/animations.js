
// $(".container").animate({width:'5%'}, 250);
// $(".createBtn").animate({width:'toggle%'}, 250);

$(".menuIcon").click(()=>{
    if ($(".container").css("left") == "-305px") {
        $(".container").animate({left: "0px"}, 350);
    }else{
        $(".container").animate({left: "-305px"}, 350);
    }
});

$(".titleCheck").on("click", function(e){
    
    $(this).next().children().slideToggle();

    // console.log("Added!");
    // let clicked = $(this.element);
    // let category = clicked.siblings();
    // category.fadeOut();
})
