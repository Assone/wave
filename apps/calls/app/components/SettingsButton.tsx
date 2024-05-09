import useRoomProvider from "@/hooks/useRoomProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AudioInputSelect from "./AudioInputSelect";
import VideoInputSelect from "./VideoInputSelect";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Switch } from "./ui/switch";

const FormSchema = z.object({
  videoInputDeviceId: z.string(),
  audioInputDeviceId: z.string(),
  blur: z.boolean(),
});

const SettingsButton: React.FC = () => {
  const { userMedia } = useRoomProvider();
  const { videoInputDeviceId, audioInputDeviceId } = userMedia;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoInputDeviceId,
      audioInputDeviceId,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Cog />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            You can change your audio and video input device here
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="videoInputDeviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera</FormLabel>
                  <FormControl>
                    <VideoInputSelect
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    />
                  </FormControl>

                  <FormDescription>
                    You can change your video input device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audioInputDeviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio</FormLabel>
                  <FormControl>
                    <AudioInputSelect
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    />
                  </FormControl>

                  <FormDescription>
                    You can change your audio input device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blur"
              render={({ field }) => (
                <FormItem className="">
                  <div className="flex gap-4 items-center">
                    <FormLabel>Background Blur</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled
                        aria-readonly
                      />
                    </FormControl>
                  </div>
                  <div className="space-y-0.5">
                    <FormDescription>Blur your background.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsButton;
