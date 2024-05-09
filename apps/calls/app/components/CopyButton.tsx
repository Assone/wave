import useClipboard from "@/hooks/useClipboard";
import { ClipboardCopy } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

const CopyButton: React.FC = () => {
  const { isSupported, copyText } = useClipboard();
  const { toast } = useToast();

  const onCopy = async () => {
    await copyText(window.location.href);

    toast({ title: "Copy Success" });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled={isSupported === false} onClick={onCopy}>
            <ClipboardCopy />
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>
            {isSupported
              ? "Copy Room URL"
              : "Your browser not support clipboard"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
