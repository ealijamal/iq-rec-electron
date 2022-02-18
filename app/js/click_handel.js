//handl click event
//======================================== handl click top bar


$(".top button").on("click", (ev) => {
    let btn = ev.currentTarget;
    window[btn.id](); // call function dynamic
});

//=========================================== handl click left bar

$(".left button").on("click", (ev) => {
    let btn = ev.currentTarget;
    window[btn.id](ev); // call function dynamic


    $.map($(".left button"), (el) => {
        if (el.id == btn.id && el.id !== 'save') {
            $(el).attr("disabled", false);
            $(el).addClass("record_now")
            disable_control_btn()
            $('#cancel').attr("disabled", false)

        } else {
            $(el).attr("disabled", true);
        }
    });

})


//================================================= handl record btn bottom

$(".control button").on("click", (ev) => {
    let btn = ev.currentTarget;

    window[btn.id](); // call function dynamic
    if (btn.id == 'record') {
        $(btn).addClass("record_now")
            // $(btn).attr("disabled", true);
        $.map($(".control button"), (el) => {
            if (el.id !== 'record' && el.id !== 'play') {
                $(el).attr("disabled", false);
            }


        });

    }
    if (btn.id == 'pause') {
        $('#play').attr("disabled", false)
        $('#pause').attr("disabled", true)
    }
    if (btn.id == 'play') {
        $('#play').attr("disabled", true)
        $('#pause').attr("disabled", false)
    }
    if (btn.id == 'stop') {
        $.map($(".control button"), (el) => {

            $(el).attr("disabled", true);



        });

    }



});
//================================================= handl mic + darkmod + sound device chackeboxs
$("input").on("click", (ev) => {
    let btn = ev.currentTarget.id;
    if (btn == "select_dev") {
        chang_device(ev)
    } else {
        btn == "mic" ? mic(ev) : darkmode();
    }

});


//================================================= handl sound device select
function chang_device(ev) {
    if (ev.target.checked) {
        $('#inputdevices').attr("disabled", false)
    } else {
        $('#inputdevices').attr("disabled", true)
    }

}
$("#inputdevices").on("change", (ev) => {
        let option = $(ev.target.options[ev.target.options.selectedIndex]).val()
        fun.dev_id = option
        fun.init_audio_strem(fun.dev_id)

    })
    //================================================= disable and enable control btn
function disable_control_btn(params) {
    $.map($(".control button"), (el) => {
        if (el.id == 'record') {
            $(el).attr("disabled", false);
        }


    });
}

function enable_control_btn(params) {

    $.map($(".left button"), (el) => {

        $(el).attr("disabled", false);
        $(el).removeClass("record_now")


    });
}

//================================================= disable and enable control btn

//****************************** handl click event ************************************************