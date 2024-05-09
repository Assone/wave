import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/signal";
import { useEffect, useState } from "react";

export default function useUserJoinOrLeaveToast(users: User[]) {
  const { toast } = useToast();
  const [trackedUsers, setTrackedUsers] = useState(users);

  useEffect(() => {
    const newUsers = users.filter(
      (user) =>
        trackedUsers.some((trackedUser) => trackedUser.id === user.id) ===
        false,
    );
    const leaveUsers = trackedUsers.filter(
      (trackedUser) =>
        users.some((user) => user.id === trackedUser.id) === false,
    );

    newUsers.forEach((user) => {
      const { dismiss } = toast({
        description: <div>{user.name} Join</div>,
        action: (
          <ToastAction altText="dismiss" onClick={() => dismiss()}>
            Dismiss
          </ToastAction>
        ),
      });
    });
    leaveUsers.forEach((user) => {
      const { dismiss } = toast({
        description: <div>{user.name} Leave</div>,
        action: (
          <ToastAction altText="dismiss" onClick={() => dismiss()}>
            Dismiss
          </ToastAction>
        ),
      });
    });

    setTrackedUsers(users);
  }, [users, trackedUsers]);
}
