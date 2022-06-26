$('.titleCheck').change(function() {
    if($(this).is(":checked")){
        $(this).parent().siblings().children().children().prop('checked', true);
    }else{
        $(this).parent().siblings().children().children().prop('checked', false);
    }
});

$(".checkLabel").change(function(){
    let checksInFamily = $(this).siblings().addBack().children();
        if(checksInFamily.toArray().every(element => element.checked == false)){
            $(this).parent().siblings().children().prop('checked', false);
        }else{
            $(this).parent().siblings().children().prop('checked', true);
        }
})

$(".titleCheck").trigger("click");
