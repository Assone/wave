import useDevices from "@/hooks/useDevices";
import type { SelectProps } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const AudioInputSelect: React.FC<SelectProps> = (props) => {
  const [devices] = useDevices((info) => info.kind === "audioinput");

  return (
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Select the audio input device you want to use" />
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AudioInputSelect;
