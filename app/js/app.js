const { desktopCapturer, ipcRenderer } = require("electron");
const { fun } = require("./js/Rec_fun")
let video = document.querySelector('video')
    //=================================================== call check dark mod state
dark_s()
ipcRenderer.on('ver', (ev, data) => {
        console.log(data);
        $('.app_logo').append(`
        <span>Ver|${data}</span>
        `);
    })
    //=================================================== call set defult mic device function
fun.soundDevice()
    //=================================================== darkmode function
function darkmode() {
    console.log("from darkmod");

    $("body").toggleClass("dark");
    //=====================> send app mod to main
    if ($("body").hasClass("dark")) {
        $(".app_logo img").attr('src', './imag/icon.png')
        ipcRenderer.send('darkmode', "dark")
    } else {
        $(".app_logo img").attr('src', './imag/iconb.png')
        ipcRenderer.send('darkmode', "white")
    }
}
//========================> get app mod from min after refresh
function dark_s(params) {
    ipcRenderer.send('dark_s')
    ipcRenderer.on('re_dark_s', (ev, mod) => {
        if (mod == true) {
            $("body").addClass("dark")
            $(".app_logo img").attr('src', './imag/icon.png')
        } else {
            $("body").removeClass("dark");
            $(".app_logo img").attr('src', './imag/iconb.png')
        }
    })
}
//=================================================== cancel from app function
function cancel() {
    console.log("from cancel");
    document.location.reload()
}

//=================================================== exit from app function
function exit() {
    console.log("from exit");
    let chack = confirm("exit from app ?!")
    if (chack) {
        ipcRenderer.send("exit")
    }
}

//=================================================== active microphone function
function mic(ev) {
    if (ev.target.checked) {

        $('#select_dev').attr("disabled", false)


        fun.mic = true
    } else {
        fun.mic = false
        $('#select_dev').attr("disabled", true)
        $('#inputdevices').attr("disabled", true)
    }
    console.log("from mic");

}
//=================================================== record screen function
function screen(ev) {

    fun.reset_rec()
    console.log("from screen");
    $(".info").hide();
    $(".player").show();
    reset_player()
    fun.init_audio_strem(fun.dev_id)
    fun.get_strem_and_play('screen:0:0')


}
//=================================================== record from app interface function
function windows(ev) {

    fun.reset_rec()
    $(".app_win").css("display", 'flex');
    $(".player").hide();
    $('.app_win').empty()
    $(".info").hide();
    reset_player()
    console.log("from windows");
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {

            $('.app_win').append(`
            <div onclick="select_win(this)" class="sc" data-id="${source.id}"  >
            <p >${source.name}</p>
            <img src="${source.thumbnail.toDataURL()}" >
          
            </div>
            `)
        }
    })
}
//=================================================== select app interface function
function select_win(ev) {


    $('.app_win').hide('slow')
    $(".player").show('slow');
    reset_player()
    fun.reset_rec()
    fun.init_audio_strem(fun.dev_id)
    fun.get_strem_and_play(ev.dataset.id)
    $('.app_win').empty()
}
//=================================================== record from camera function
function cam(ev) {

    console.log("from cam");
    $(".player").show();
    reset_player()
    fun.reset_rec()
    $(".info").hide();
    fun.init_audio_strem(fun.dev_id)
    fun.rec_cam()
}
//=================================================== stop record function
function stop() {
    if ($('#folder').hasClass('record_now')) {
        $(".app_win").hide();
        $(".player").hide();
        $(".info").show();
    } else {
        enable_control_btn()
        console.log("from stop");
        $(".app_win").hide();
        $(".player").show();
        reset_player()

        fun.stopRecording()
        setTimeout(() => {
            fun.play_now()
        }, 2000);

    }


}
//=================================================== open video from  folder function


function folder() {
    console.log("from folder");
    if ($(".folder button").hasClass('record_now')) {
        document.location.reload()
    } else {

        ipcRenderer.send('play')
        ipcRenderer.on('re_play', (ev, data) => {
            if (data) {
                reset_player()
                $("#player video").attr("src", data)
                $(".player").show();
                $(".info").hide();

            } else {
                document.location.reload()
            }


        })
    }



}
//===================================================  save video function
function save() {
    console.log("from save");
    fun.download()


}
//=================================================== start record function

function record() {
    fun.recorder.start()

    console.log('recorder is started.')
}
//=================================================== play record function
function play() {
    console.log("from play");

    if ($('#folder').hasClass('record_now')) {

        video.controls = true;
        video.play()
    } else {
        fun.recorder.resume()
    }



}
//=================================================== pause record function
function pause() {
    if ($('#folder').hasClass('record_now')) {

        video.controls = true;
        video.pause()
    } else {
        fun.recorder.pause()
    }


}
//=================================================== stop record function
function stopRecord() {
    fun.recorder.onstop = () => { console.log('recorder Stop ') }
    fun.recorder.stop()
}


//=================================================== reset player  function
function reset_player() {

}
//=================================================== riceve try command
ipcRenderer.on('control', (ev, command) => {
        console.log(command);
        $(`#${command}`).click()
    })
    //=================================================== send record now to try 
ipcRenderer.on('chack_record', (ev) => {
    if (fun.record_now) {
        ipcRenderer.send("state", fun.record_now)
    } else {
        alert('no recoed mode select!! please select record mode')
    }


})


// =========================================update