interface WatchAudioVolumeOptions {
  track: MediaStreamTrack;
  onChange: (volume: number) => void;
}

export const watchAudioVolume = ({
  track,
  onChange,
}: WatchAudioVolumeOptions) => {
  let tid: number;

  const context = new AudioContext();
  const stream = new MediaStream();

  stream.addTrack(track);

  const analyser = context.createAnalyser();
  analyser.fftSize = 32;

  const pcmData = new Float32Array(analyser.fftSize);

  const node = context.createMediaStreamSource(stream);
  node.connect(analyser);

  const start = () => {
    tid = requestAnimationFrame(() => {
      analyser.getFloatTimeDomainData(pcmData);

      const sumSquares = pcmData.reduce(
        (sum, amplitude) => sum + amplitude * amplitude,
        0.0
      );
      const current = Math.sqrt(sumSquares / pcmData.length);

      onChange(current);

      start();
    });
  };

  const stop = () => {
    cancelAnimationFrame(tid);
    // cancelAnimationFrame(cid);
  };

  return {
    start,
    stop,
  };
};
