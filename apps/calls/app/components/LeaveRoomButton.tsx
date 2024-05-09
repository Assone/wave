import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useNavigate } from "@remix-run/react";

const LeaveRoomButton: React.FC = () => {
  const navigate = useNavigate();

  const onLeave = () => {
    navigate("/");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive" onClick={onLeave}>
            <LogOut />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Leave this room</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LeaveRoomButton;
