import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  ListDivider,
  Typography,
} from "@mui/joy";
import { useNavigate } from "@tanstack/react-router";
import { HomeRoute } from "../router";

const HomeView: React.FC = () => {
  const navigate = useNavigate({ from: HomeRoute.id });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const formJson = Object.fromEntries(formData.entries()) as {
      roomId: string;
      autoClose: string;
    };

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    navigate({
      to: "/room/$id",
      params: {
        id: formJson.roomId,
      },
      search: {
        autoClose: formJson.autoClose === "on",
      },
    });
  };

  return (
    <div className=" fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <form onSubmit={onSubmit}>
        <Box
          sx={{
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel>Room ID</FormLabel>
            <Input name="roomId" required disabled={loading} />
          </FormControl>
          <FormControl>
            <Checkbox
              name="autoClose"
              value={"on"}
              label={
                <Typography color="neutral" level="body-xs">
                  Close Room after you leave
                </Typography>
              }
              disabled={loading}
            />
          </FormControl>
          <ListDivider component="hr" />
          <FormControl>
            <Button type="submit" loading={loading}>
              Join Or Create Room
            </Button>
          </FormControl>
        </Box>
      </form>
    </div>
  );
};

export default HomeView;
