import {
  Accordion,
  Badge,
  Button,
  Kbd,
  Notification,
  Popover,
  Text,
} from "@mantine/core";
import moment from "moment";
import CartItem from "./cartitem";
import { useMutation } from "urql";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconExclamationMark, IconLocation } from "@tabler/icons";
import { useState } from "react";
import Link from "next/link";

export default function OrderAdmin({ order, refresh }) {
  const UPDATE_ORDER = `
        mutation UPDATE_ORDER(
              $action: String
              $id: ID
          ){
          updateOrder(
              action: $action
              id: $id
          ){
              id
          }
      }
    `;

  const [_, _updateOrder] = useMutation(UPDATE_ORDER);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getTotal = () => {
    let sum = 0;

    order?.items.forEach((item) => {
      sum = sum + item?.salePrice * item?.quantity;
    });

    return sum;
  };

  const getStatus = () => {
    let status =
      order?.deliveryTimestamp && order?.dispatchTimestamp
        ? "delivered"
        : order?.dispatchTimestamp && !order?.deliveryTimestamp
        ? "in transit"
        : "in processing";

    return status;
  };

  const handleDispatch = () => {
    setLoading(true);

    _updateOrder({
      action: "dispatch",
      id: order?.id,
    })
      .then(({ data, error }) => {
        if (data?.updateOrder && !error) {
          notifications.show({
            title: "Order marked dispatched.",
            icon: <IconCheck />,
            color: "green",
          });
        } else {
          notifications.show({
            title: "Something occured",
            icon: <IconExclamationMark />,
            color: "red",
          });
        }
      })
      .catch((err) => {
        notifications.show({
          title: "Something occured",
          icon: <IconExclamationMark />,
          color: "red",
        });
      })
      .finally(() => {
        refresh();
        setLoading(false);
      });
  };

  const handleDeliver = () => {
    setLoading(true);

    _updateOrder({
      action: "deliver",
      id: order?.id,
    })
      .then(({ data, error }) => {
        if (data?.updateOrder && !error) {
          notifications.show({
            title: "Order marked delivered.",
            icon: <IconCheck />,
            color: "green",
          });
        } else {
          notifications.show({
            title: "Something occured",
            icon: <IconExclamationMark />,
            color: "red",
          });
        }
      })
      .catch((err) => {
        notifications.show({
          title: "Something occured",
          icon: <IconExclamationMark />,
          color: "red",
        });
      })
      .finally(() => {
        refresh();
        setLoading(false);
      });
  };

  return (
    <Notification
      color={
        getStatus() == "delivered"
          ? "green"
          : getStatus() == "in transit"
          ? "blue"
          : "orange"
      }
      withCloseButton={false}
    >
      <div className="p-4 space-y-2">
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">Order number</Text>
          <Kbd>{order?.id.slice(-10)}</Kbd>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">ORDER PLACEMENT</Text>
          <Text fw="lighter">
            {Date.now() - Number(order?.createdAt) > 24 * 60 * 60 * 1000
              ? moment(new Date(Number(order?.createdAt))).format(
                  "Do MMMM, YYYY"
                )
              : (Date.now() - Number(order?.createdAt)) / (1000 * 60) < 60
              ? moment(new Date(Number(order?.createdAt)))
                  .startOf("minute")
                  .fromNow()
              : (Date.now() - Number(order?.createdAt)) / (1000 * 60 * 24) <
                  24 &&
                moment(new Date(Number(order?.createdAt)))
                  .startOf("hour")
                  .fromNow()}
          </Text>
        </div>
        {order?.dispatchTimestamp && (
          <div className="flex justify-between w-full">
            <Text className="uppercase font-medium">ORDER DISPATCH</Text>
            <Text fw="lighter">
              {Date.now() - Number(order?.dispatchTimestamp) * 1000 >
              24 * 60 * 60 * 1000
                ? moment(new Date(Number(order?.dispatchTimestamp))).format(
                    "Do MMMM, YYYY"
                  )
                : (Date.now() - Number(order?.dispatchTimestamp) * 1000) /
                    (1000 * 60) <
                  60
                ? moment(new Date(Number(order?.dispatchTimestamp)))
                    .startOf("minute")
                    .fromNow()
                : (Date.now() - Number(order?.dispatchTimestamp) * 1000) /
                    (1000 * 60 * 24) <
                    24 &&
                  moment(new Date(Number(order?.dispatchTimestamp)))
                    .startOf("hour")
                    .fromNow()}
            </Text>
          </div>
        )}
        {order?.deliveryTimestamp && (
          <div className="flex justify-between w-full">
            <Text className="uppercase font-medium">ORDER DELIVERY</Text>
            <Text fw="lighter">
              {Date.now() - Number(order?.deliveryTimestamp) * 1000 >
              24 * 60 * 60 * 1000
                ? moment(new Date(Number(order?.deliveryTimestamp))).format(
                    "Do MMMM, YYYY"
                  )
                : (Date.now() - Number(order?.deliveryTimestamp) * 1000) /
                    (1000 * 60) <
                  60
                ? moment(new Date(Number(order?.deliveryTimestamp)))
                    .startOf("minute")
                    .fromNow()
                : (Date.now() - Number(order?.deliveryTimestamp) * 1000) /
                    (1000 * 60 * 24) <
                    24 &&
                  moment(new Date(Number(order?.deliveryTimestamp)))
                    .startOf("hour")
                    .fromNow()}
            </Text>
          </div>
        )}
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">Status</Text>
          <Badge
            color={
              getStatus() == "delivered"
                ? "green"
                : getStatus() == "in transit"
                ? "blue"
                : "orange"
            }
            className="uppercase"
          >
            {getStatus()}
          </Badge>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">NAME</Text>
          <Text fw="lighter">{order?.customer?.name}</Text>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">EMAIL</Text>
          <Text fw="lighter">{order?.customer?.email}</Text>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">PHONE NUMBER</Text>
          <Text fw="lighter">{order?.customer?.phoneNumber}</Text>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">products' worth</Text>
          <Text style={{ color: "#0E5AA6" }}>
            Ksh.{" "}
            {getTotal()
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </Text>
        </div>
        <div className="flex justify-between w-full">
          <Text className="uppercase font-medium">Delivery address</Text>

          <Link
            href={`https://maps.google.com/?q=${order?.deliveryLocation.lat},${order?.deliveryLocation.lng}&ll=${order?.deliveryLocation.lat},${order.deliveryLocation.lng}&z=15`}
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:text-blue-600 flex "
          >
            View on maps
            <IconLocation size={16} style={{ marginTop: 4, marginLeft: 8 }} />
          </Link>
        </div>
        <div>
          <Accordion>
            <Accordion.Item value="products">
              <Accordion.Control>
                <Text className="uppercase font-medium">Products</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <div className="md:mb-8 space-y-2 md:space-y-0 md:flex md:space-x-8 w-full md:overflow-x-auto">
                  {order?.items.map((item, i) => (
                    <CartItem key={i} order={item} noControls />
                  ))}
                </div>

                {getStatus() == "in processing" && (
                  <Popover
                    width={250}
                    shadow="md"
                    opened={popoverOpen}
                    onChange={setPopoverOpen}
                  >
                    <Popover.Target>
                      <Button
                        onClick={() => setPopoverOpen((o) => !o)}
                        color="green"
                        fullWidth
                      >
                        Dispatch
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm">
                        Are you sure you want to dispatch this order?{" "}
                      </Text>
                      <div className="flex justify-between mt-8 space-x-6">
                        <Button
                          loading={loading}
                          onClick={handleDispatch}
                          color="dark"
                          fw="lighter"
                          uppercase
                          fullWidth
                        >
                          YES
                        </Button>
                        <Button
                          onClick={() => {
                            setPopoverOpen(false);
                          }}
                          color="dark"
                          fw="lighter"
                          variant="outline"
                          uppercase
                          fullWidth
                        >
                          No
                        </Button>
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                )}

                {getStatus() == "in transit" && (
                  <Popover
                    width={250}
                    shadow="md"
                    opened={popoverOpen}
                    onChange={setPopoverOpen}
                  >
                    <Popover.Target>
                      <Button
                        onClick={() => setPopoverOpen((o) => !o)}
                        color="green"
                        fullWidth
                      >
                        Deliver
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm">
                        Has the customer received this order?{" "}
                      </Text>
                      <div className="flex justify-between mt-8 space-x-6">
                        <Button
                          loading={loading}
                          onClick={handleDeliver}
                          color="dark"
                          fw="lighter"
                          uppercase
                          fullWidth
                        >
                          YES
                        </Button>
                        <Button
                          onClick={() => {
                            setPopoverOpen(false);
                          }}
                          color="dark"
                          fw="lighter"
                          variant="outline"
                          uppercase
                          fullWidth
                        >
                          No
                        </Button>
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </Notification>
  );
}
