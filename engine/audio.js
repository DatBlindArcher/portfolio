const ctx = new AudioContext();

const gainNode = ctx.createGain();
gainNode.gain.value = 0.2;
gainNode.connect(ctx.destination);

let source;

function playAudio(url) {
	fetch(url)
		.then(data => data.arrayBuffer())
		.then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
		.then(decodedAudio => {
			source = ctx.createBufferSource();
			source.buffer = decodedAudio;
			source.loop = true;
			source.connect(gainNode);
			source.start(ctx.currentTime);
		});
}

function getTime() {
	return ctx.currentTime;
}