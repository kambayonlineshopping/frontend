import { Button } from "@mantine/core";
import { Novu } from "@novu/node";
import {
  NovuProvider,
  PopoverNotificationCenter,
  NotificationBell,
  IMessage,
} from "@novu/notification-center";
import { Loader } from "../components";

const novu = new Novu(process.env.NEXT_PUBLIC_NOVU_API_KEY);

export default function Test() {
  const triggerNotification = async () => {
    const response = await novu
      .trigger("on-boarding-notification-A72_hAYmG", {
        to: {
          subscriberId: process.env.NEXT_PUBLIC_NOVU_SUBSCRIBER_ID,
        },
        payload: {
          number: 45,
        },
      })
      .catch((err) => console.error(err));
    return response;
  };

  function onNotificationClick(message) {
    // your logic to handle the notification click
    if (message?.cta?.data?.url) {
      window.location.href = message.cta.data.url;
    }
  }

  return (
    <div className="bg-[#0E5AA6] w-full h-screen">
      <Loader />
    </div>
  );
}
