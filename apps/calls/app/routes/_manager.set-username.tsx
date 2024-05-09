import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { commitSession } from "@/session";
import { isString } from "@/utils/is";
import { setUsername } from "@/utils/username";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunction } from "@remix-run/cloudflare";
import { Form as RemixForm, redirect } from "@remix-run/react";
import { useForm } from "react-hook-form";
import invariant from "tiny-invariant";
import { z } from "zod";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const { username } = Object.fromEntries(body);

  invariant(isString(username));

  const session = await setUsername(request, username);

  throw redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const SetUsername: React.FC = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Username</CardTitle>
        <CardDescription>This is your public display name.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <RemixForm className="flex flex-col gap-4" method="post">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex justify-end">
              <Button>Submit</Button>
            </FormItem>
          </RemixForm>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SetUsername;
