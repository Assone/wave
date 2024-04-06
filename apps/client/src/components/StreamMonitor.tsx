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
    }
  }, [stream]);

  return <video ref={instance} autoPlay muted={muted} />;
};

export default StreamMonitor;
