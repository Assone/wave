export const createSound = () => {
  const context = new AudioContext();
  const source = context.createBufferSource();
  const gainNode = context.createGain();

  const connect = () => {
    source.connect(gainNode);
    gainNode.connect(context.destination);
  };

  const disconnect = () => {
    source.disconnect();
    gainNode.disconnect();
  };

  return {
    context,
    source,
    gainNode,

    connect,
    disconnect,
  };
};
