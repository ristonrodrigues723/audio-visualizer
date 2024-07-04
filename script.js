const audioInput = document.getElementById('audioInput');
const audio = document.getElementById('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const visualMode = document.getElementById('visualMode');
const colorPicker = document.getElementById('colorPicker');

let audioContext;
let analyser;
let dataArray;
let animationId;

audioInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
});

audio.addEventListener('play', setupAudioContext);
visualMode.addEventListener('change', restartVisualization);
colorPicker.addEventListener('change', restartVisualization);

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    resizeCanvas();
    restartVisualization();
}

function restartVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    draw();
}

function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mode = visualMode.value;
    const color = colorPicker.value;

    switch (mode) {
        case 'bars':
            drawBars(color);
            break;
        case 'wave':
            drawWave(color);
            break;
        case 'circular':
            drawCircular(color);
            break;
    }
}

function drawBars(color) {
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

function drawWave(color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const sliceWidth = canvas.width * 1.0 / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawCircular(color) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < dataArray.length; i++) {
        const angle = (i / dataArray.length) * Math.PI * 2;
        const amplitude = dataArray[i] / 255 * radius / 2;
        const x = centerX + Math.cos(angle) * (radius + amplitude);
        const y = centerY + Math.sin(angle) * (radius + amplitude);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.stroke();
}
