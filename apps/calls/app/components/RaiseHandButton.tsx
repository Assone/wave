import { playSound } from "@/hooks/useRoomSounds";
import { Hand } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

declare module "react" {
  interface CSSProperties {
    "--primary"?: string;
  }
}

interface RaiseHandButtonProps {
  up: boolean;
  onChange: (up: boolean) => void;
}

const RaiseHandButton: React.FC<RaiseHandButtonProps> = ({ up, onChange }) => {
  const onClick = () => {
    onChange(!up);

    if (!up) {
      playSound("raiseHand");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            color="orange"
            style={up ? { "--primary": "31 100% 43%" } : undefined}
          >
            <Hand />
          </Button>
        </TooltipTrigger>

        <TooltipContent>Raise Hand</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RaiseHandButton;
