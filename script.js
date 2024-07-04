const audioInput = document.getElementById('audioInput');
const audio = document.getElementById('audio');


let audioContext;
let analyser;

audioInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
});

audio.addEventListener('play', setupAudioContext);
colorPicker.addEventListener('change', () => cancelAnimationFrame(animationId));

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

}