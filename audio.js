const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// --- Background Music ---
let bgBuffer;
const masterGain = audioContext.createGain();
masterGain.gain.value = 0.12;
masterGain.connect(audioContext.destination);

let nextSourceStartTime = 0;
let isBgPlaying = false;
let loopTimeoutId = null;

async function init() {
    if (bgBuffer) return;
    try {
        const response = await fetch('bg.mp3');
        const arrayBuffer = await response.arrayBuffer();
        bgBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Failed to load background music:", error);
    }
}

function scheduleLoop() {
    if (!isBgPlaying || !bgBuffer) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = bgBuffer;
    const gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(masterGain);
    
    const crossfade = 15.0;
    const duration = bgBuffer.duration;
    const loopTime = duration - crossfade;
    const now = audioContext.currentTime;

    if (nextSourceStartTime < now) {
        nextSourceStartTime = now;
    }

    source.start(nextSourceStartTime);
    gainNode.gain.setValueAtTime(0, nextSourceStartTime);
    gainNode.gain.linearRampToValueAtTime(1, nextSourceStartTime + crossfade);
    gainNode.gain.setValueAtTime(1, nextSourceStartTime + loopTime);
    gainNode.gain.linearRampToValueAtTime(0, nextSourceStartTime + duration);

    source.onended = () => {
        gainNode.disconnect();
    };

    nextSourceStartTime += loopTime;
    
    const timeUntilNext = (nextSourceStartTime - audioContext.currentTime) * 1000;
    loopTimeoutId = setTimeout(scheduleLoop, timeUntilNext);
}

function startBackgroundMusic() {
    if (isBgPlaying || !bgBuffer) {
        if (!bgBuffer) setTimeout(startBackgroundMusic, 200);
        return;
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    
    isBgPlaying = true;
    nextSourceStartTime = audioContext.currentTime;
    scheduleLoop();
}

function toggleMuteBackgroundMusic() {
    const targetGain = masterGain.gain.value > 0 ? 0 : 0.5;
    masterGain.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + 0.2);
}

function playHoverSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.06);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playClickSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

function playWhooshSound() {
    const duration = 1.9;
    const now = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 200;
    bandpass.Q.value = 0.8; 

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.01, now);

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    bandpass.frequency.setValueAtTime(80, now);
    bandpass.frequency.exponentialRampToValueAtTime(700, now + 1); 
    bandpass.frequency.exponentialRampToValueAtTime(100, now + duration);

    gainNode.gain.exponentialRampToValueAtTime(0.1, now + 1); 
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.start(now);
    noise.stop(now + duration);
}

let whooshNode = null;
function startWhoosh() {
    if (whooshNode) return; 

    const noise = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 200;
    bandpass.Q.value = 7;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();

    whooshNode = { noise, gainNode };
}

function stopWhoosh() {
    if (!whooshNode) return;

    whooshNode.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    whooshNode.gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    whooshNode.noise.stop(audioContext.currentTime + 0.2);
    whooshNode = null;
}

window.SFX = {
    init,
    startBackgroundMusic,
    toggleMuteBackgroundMusic,
    playHoverSound,
    playClickSound,
    playWhooshSound,
    startWhoosh,
    stopWhoosh
};

SFX.init();

