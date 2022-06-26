$('.titleCheck').change(function() {
    if($(this).is(":checked")){
        console.log($(this).parent().eq(1))
        $(this).next().children().prop('checked', true);
    }
});
