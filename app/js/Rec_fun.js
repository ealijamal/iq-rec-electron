const { desktopCapturer, ipcRenderer } = require("electron");


exports.fun = {
    record_now: false,
    mic: true,
    localstream: undefined,
    mic_stream: undefined,
    recorde_data: [],
    recorde_byte_no: 0,
    recorder: undefined,
    dev_id: undefined,
    get_strem_and_play(id) {

        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
            for (const source of sources) {

                if (source.id === id) {;
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: {
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: source.id,
                                    minWidth: 1280,
                                    maxWidth: 1280,
                                    minHeight: 720,
                                    maxHeight: 720
                                }
                            }
                        })
                        handleStream(stream)
                    } catch (e) {
                        handleError(e)
                    }
                    return
                }
            }
        })

        function handleStream(stream) {

            const video = document.querySelector('video')
            video.srcObject = stream

            video.onloadedmetadata = (e) => video.play()

            fun.start_rec(stream)

        }

        function handleError(e) {
            console.log(e)
        }
    },
    init_audio_strem(id) {
        const getMicroAudio = (stream) => {
            console.log('Received audio stream')
            fun.record_now = true
            fun.mic_stream = stream
            stream.onended = () => { console.log('mic audio ended.') }
            fun.soundeffect(stream)
        }

        const getUserMediaError = () => {
            console.log('getUserMedia() failed.')
        }

        var video = document.querySelector('video')
        video.muted = true
        navigator.webkitGetUserMedia({ audio: { deviceId: id ? { exact: id } : 'default' }, video: false },
            getMicroAudio, getUserMediaError)




    },
    push_rec_data: (event) => {

        if (event.data && event.data.size > 0) {

            fun.recorde_data.push(event.data)
            fun.recorde_byte_no += event.data.byteLength
        }
    },
    start_rec(stream) {

        let video = document.querySelector('video')


        fun.localStream = stream
        video.srcObject = stream

        stream.onended = () => { console.log('Media stream ended.') }



        if (fun.mic) {
            console.log('Adding audio track.')
            let audioTracks = fun.mic_stream.getAudioTracks()
            fun.localStream.addTrack(audioTracks[0])
        }

        try {
            var options = {
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 2500000,

            }
            console.log('init recording the stream.')
            fun.recorder = new MediaRecorder(fun.localStream, options)

        } catch (e) {
            console.assert(false, 'Exception while creating MediaRecorder: ' + e)
            return
        }
        fun.recorder.ondataavailable = fun.push_rec_data

    },
    download() {
        let blob = new Blob(fun.recorde_data, { mimeType: 'video/webm; codecs=vp9' })
        let url = URL.createObjectURL(blob)
            // ipcRenderer.send('save', url)
        const d = new Date();
        let time = d.getTime();
        let a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        a.href = url
        a.download = `record-time-${d.getHours()}-${d.getMinutes()}.mp4`
        a.click()
        ipcRenderer.on('st', (ev, state) => {

            if (state == 'successfully') {
                document.location.reload()
            } else {

                $('#save').attr("disabled", false)
                let chack = confirm("Do you want to delete the recorded video ?! ")
                if (chack) {

                    document.location.reload()


                } else {
                    console.log("record is save");
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)

                    this.reset_rec()
                }
            }
        })




    },
    stopRecording() {
        console.log('Stopping record')


        fun.recorder.stop()
        fun.localStream.getVideoTracks()[0].stop()
        if (fun.mic) {
            fun.localStream.getAudioTracks()[0].stop()
        }

    },
    reset_rec() {
        fun.recorde_data = []
        fun.recorde_byte_no = 0
        let video = document.querySelector('video');
        video.controls = false;


    },
    rec_cam() {
        navigator.webkitGetUserMedia({
            audio: false,
            video: { mandatory: { minWidth: 1280, minHeight: 720 } }
        }, handleStream, handleError)

        function handleStream(stream) {

            const video = document.querySelector('video')
            video.srcObject = stream
            video.onloadedmetadata = (e) => video.play()
            fun.url = video.captureStream()

            fun.start_rec(stream)

        }

        function handleError(e) {
            console.log(e)
        }
    },

    video_data() {
        if (fun.recorde_data) {
            return fun.recorde_data
        }
    },

    play_now() {
        fun.recorde_data[0]
        let video = document.querySelector('video')
        video.controls = true;
        video.muted = false
        video.src = null;
        video.srcObject = null;



        let blob = new Blob(fun.recorde_data, { type: 'video/webm' })
        video.src = window.URL.createObjectURL(blob)
        video.play();
    },
    soundDevice() {
        navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                devices.forEach(function(device) {
                    let menu = document.getElementById("inputdevices");
                    if (device.kind == "audioinput") {
                        let item = document.createElement("option");
                        item.innerText = device.label;
                        item.value = device.deviceId;
                        menu.appendChild(item);

                    }
                });
            });
    },
    soundeffect(stream) {
        // CodePen Home HTML 5 Microphone Visualizer by Zachary Skalko
        // https://codepen.io/zapplebee/pen/gbNbZE
        var paths = document.getElementsByTagName('path');
        var visualizer = document.getElementById('visualizer');
        var mask = visualizer.getElementById('mask');

        var path;
        window.persistAudioStream = stream;

        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource(stream);
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 255 255');

        //Through the frequencyArray has a length longer than 255, there seems to be no
        //significant data after this point. Not worth visualizing.
        for (var i = 0; i < 255; i++) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-dasharray', '4,1');
            mask.appendChild(path);
        }
        var doDraw = function() {

            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
            var adjustedLength;
            for (var i = 0; i < 255; i++) {
                adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                paths[i].setAttribute('d', 'M ' + (i) + ',255 l 0,-' + adjustedLength);
            }

        }
        doDraw();
    }

}