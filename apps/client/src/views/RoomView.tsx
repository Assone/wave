import {
  Mic,
  MicOff,
  Settings,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardCover,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import StreamMonitor from "../components/StreamMonitor";
import useDisplayMedia from "../hooks/useDisplayMedia";
import useMediaInput from "../hooks/useMediaInput";
import useRoom from "../hooks/useRoom";

const RoomView: React.FC = () => {
  const [open, setOpen] = useState(false);
  const stream = useRef<MediaStream>();

  const {
    enabled: isUsingScreenStream,
    stream: screenStream,
    start: onGetScreenStream,
    stop: onStopScreenStream,
    isSupported: isSupportShareScreen,
  } = useDisplayMedia();
  const {
    cameraStatus,
    micStatus,
    videoInput,
    audioInput,

    selectedCamera,
    selectedAudio,
    setSelectedCamera,
    setSelectedAudio,

    stream: mediaStream,

    onOpenCamera,
    onOffCamera,
    onOpenMic,
    onOffMic,
  } = useMediaInput();
  const {
    clientStreams,
    hostStream,

    selectedStream,
    onSetCurrentSelectedStream,

    isSharing,
    onShare,
    onStopShare,
  } = useRoom(stream);

  const processStreamHandler =
    (callback: () => Promise<void> | void) => async () => {
      await callback();

      const newStream = new MediaStream();

      const tracks = [screenStream.current, mediaStream.current]
        .filter((stream) => stream !== undefined)
        .flatMap((stream) => stream!.getTracks());
      tracks.forEach((track) => newStream.addTrack(track));

      stream.current = newStream;

      if (tracks.length === 0 && isSharing) {
        onStopShare();
      } else if (tracks.length > 0) {
        onShare();
      }
    };

  const playerStream = useMemo(
    () =>
      selectedStream === hostStream
        ? hostStream
        : clientStreams.find(({ stream }) => stream === selectedStream)?.stream,
    [clientStreams, hostStream, selectedStream]
  );

  return (
    <main>
      {playerStream && <StreamMonitor stream={playerStream} />}

      <div className="fixed bottom-1/4 left-10">
        <Stack spacing={2} direction="row">
          {clientStreams.map(({ sid, stream }) => (
            <Card
              sx={{ minWidth: 300, minHeight: 180 }}
              className="overflow-hidden"
              key={sid}
            >
              <CardCover>
                <StreamMonitor
                  stream={stream}
                  onClick={() => onSetCurrentSelectedStream(stream)}
                />
              </CardCover>
            </Card>
          ))}
        </Stack>
      </div>

      {hostStream && selectedStream !== hostStream && (
        <div
          className="fixed bottom-24 right-10"
          onClick={() => onSetCurrentSelectedStream(hostStream)}
        >
          <Card
            sx={{ minWidth: 300, minHeight: 180 }}
            className="overflow-hidden"
          >
            <CardCover>
              <StreamMonitor stream={hostStream} />
            </CardCover>

            <CardContent>
              <Typography
                level="body-lg"
                fontWeight="lg"
                textColor="#fff"
                mt={16}
              >
                You
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography>Settings</Typography>
          <FormControl>
            <FormLabel>Camera</FormLabel>
            <Select
              value={selectedCamera}
              disabled={cameraStatus === false}
              onChange={(_, id) => {
                if (id) {
                  setSelectedCamera(id);
                }
              }}
            >
              {videoInput.map(({ deviceId, label }) => (
                <Option key={deviceId} value={deviceId}>
                  {label}
                </Option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Audio</FormLabel>
            <Select
              value={selectedAudio}
              disabled={micStatus === false}
              onChange={(_, id) => {
                if (id) {
                  setSelectedAudio(id);
                }
              }}
            >
              {audioInput.map(({ deviceId, label }) => (
                <Option key={deviceId} value={deviceId}>
                  {label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </ModalDialog>
      </Modal>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <ButtonGroup>
          <Button
            startDecorator={
              isUsingScreenStream ? (
                <StopScreenShareIcon />
              ) : (
                <ScreenShareIcon />
              )
            }
            disabled={!isSupportShareScreen}
            onClick={processStreamHandler(
              isUsingScreenStream ? onStopScreenStream : onGetScreenStream
            )}
          >
            {isUsingScreenStream ? "Stop Share" : "Share"}
          </Button>

          {cameraStatus ? (
            <Button
              startDecorator={<VideocamOff />}
              onClick={processStreamHandler(onOffCamera)}
            >
              Off Camera
            </Button>
          ) : (
            <Button
              startDecorator={<Videocam />}
              onClick={processStreamHandler(onOpenCamera)}
            >
              Open Camera
            </Button>
          )}

          {micStatus ? (
            <Button
              startDecorator={<MicOff />}
              onClick={processStreamHandler(onOffMic)}
            >
              Off Mic
            </Button>
          ) : (
            <Button
              startDecorator={<Mic />}
              onClick={processStreamHandler(onOpenMic)}
            >
              Open Mic
            </Button>
          )}

          <IconButton onClick={() => setOpen(true)}>
            <Settings />
          </IconButton>
        </ButtonGroup>
      </div>
    </main>
  );
};

export default RoomView;
