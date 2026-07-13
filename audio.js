const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playHoverSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playClickSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

function playWhooshSound() {
    const noise = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 1; // 1 second buffer
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 400;
    bandpass.Q.value = 1;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3;

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);

    bandpass.frequency.setValueAtTime(200, audioContext.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.3);
}

let whooshNode = null;
function startWhoosh() {
    if (whooshNode) return; // Already playing

    const noise = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 2; // 2-second buffer for looping
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 5;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);

    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();

    whooshNode = { noise, gainNode };
}

function stopWhoosh() {
    if (!whooshNode) return;

    whooshNode.gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    whooshNode.gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
    whooshNode.noise.stop(audioContext.currentTime + 0.2);
    whooshNode = null;
}

window.SFX = {
    playHoverSound,
    playClickSound,
    playWhooshSound,
    startWhoosh,
    stopWhoosh
};
