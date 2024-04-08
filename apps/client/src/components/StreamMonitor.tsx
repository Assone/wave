interface StreamMonitorProps {
  stream?: MediaStream;
  muted?: boolean;
  onClick?: VoidFunction;
}

const StreamMonitor: React.FC<StreamMonitorProps> = ({ stream, muted }) => {
  const instance = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    if (stream) {
      instance.current.srcObject = stream;
      instance.current
        .play()
        .catch((e) => console.log("Could not play preview video", e));
    }
  }, [stream]);

  return <video ref={instance} autoPlay muted={muted} controls playsInline />;
};

export default StreamMonitor;
