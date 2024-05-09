import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isString } from "@/utils/is";
import { getUsername } from "@/utils/username";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Link,
  Form as RemixForm,
  json,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { useForm } from "react-hook-form";
import invariant from "tiny-invariant";
import { z } from "zod";

const FormSchema = z.object({
  roomName: z.string().min(2, {
    message: "RoomID must be at least 2 characters.",
  }),
  closeOnOwnerLeave: z.boolean(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const username = await getUsername(request);
  const roomName = crypto.randomUUID().split("-")[0];

  invariant(isString(username));

  return json({ username });
};

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { roomName } = Object.fromEntries(body);

  invariant(isString(roomName));

  const path = `/${encodeURIComponent(roomName)}`;

  return redirect(path);
};

const Join: React.FC = () => {
  const { username, roomName } = useLoaderData<typeof loader>();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      roomName,
      closeOnOwnerLeave: false,
    },
  });

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
        <CardDescription>Join or create Room.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <RemixForm className="space-y-6" method="post">
            <FormItem className="flex justify-between items-center">
              <div>
                <FormLabel>User Name</FormLabel>
                <FormDescription>{username}</FormDescription>
              </div>
              <Link className="underline" to="/set-username">
                Change
              </Link>
            </FormItem>
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Please input Room Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closeOnOwnerLeave"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      id={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor={field.name}>Auto Close</FormLabel>
                    <FormDescription>
                      Close room after you leave
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </RemixForm>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Join;
