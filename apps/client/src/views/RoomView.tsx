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
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import StreamMonitor from "../components/StreamMonitor";
import useMediaInput from "../hooks/useMediaInput";
import useRoom from "../hooks/useRoom";

const RoomView: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { cameraStatus, micStatus } = useMediaInput();
  const {
    clientStreams,
    hostStream,

    selectedStream,
    onSetCurrentSelectedStream,

    isUsingScreenStream,
    isSupportShareScreen,
    onShareScreen,
    onStopShareScreen,
  } = useRoom();
  const stream = useMemo(
    () =>
      selectedStream === hostStream
        ? hostStream
        : clientStreams.find(({ stream }) => stream === selectedStream)?.stream,
    [clientStreams, hostStream, selectedStream]
  );

  return (
    <main>
      {stream && <StreamMonitor stream={stream} />}

      <div className="fixed bottom-1/4 left-10">
        <Stack spacing={2} direction="row">
          {clientStreams.map(({ sid, stream }) => (
            <Card
              component="div"
              sx={{ minWidth: 300, minHeight: 180 }}
              className="overflow-hidden"
              key={sid}
              onClick={() => onSetCurrentSelectedStream(stream)}
            >
              <CardCover component="div">
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
            component="div"
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
                mt={{ xs: 8, sm: 12 }}
              >
                You
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog>
            <ModalClose />
            <Typography>Settings</Typography>
          </ModalDialog>
        </Modal>

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
            onClick={isUsingScreenStream ? onStopShareScreen : onShareScreen}
          >
            {isUsingScreenStream ? "Stop Share" : "Share"}
          </Button>

          {cameraStatus ? (
            <Button startDecorator={<VideocamOff />}>Off Camera</Button>
          ) : (
            <Button startDecorator={<Videocam />}>Open Camera</Button>
          )}

          {micStatus ? (
            <Button startDecorator={<MicOff />}>Off Mic</Button>
          ) : (
            <Button startDecorator={<Mic />}>Open Mic</Button>
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
