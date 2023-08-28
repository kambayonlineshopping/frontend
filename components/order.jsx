import { Accordion, Badge, Kbd, Text } from "@mantine/core";
import moment from "moment";
import CartItem from "./cartitem";
import { IconLocation } from "@tabler/icons";
import Link from "next/link";

export default function Order({ order, deliveryLocation }) {
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
  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between w-full">
        <Text className="uppercase font-medium">Order number</Text>
        <Kbd>{order?.id.slice(-10)}</Kbd>
      </div>
      <div className="flex justify-between w-full">
        <Text className="uppercase font-medium">ORDER PLACEMENT</Text>
        <Text fw="lighter">
          {Date.now() - Number(order?.createdAt) > 24 * 60 * 60 * 1000
            ? moment(new Date(Number(order?.createdAt))).format("Do MMMM, YYYY")
            : (Date.now() - Number(order?.createdAt)) / (1000 * 60) < 60
            ? moment(new Date(Number(order?.createdAt)))
                .startOf("minute")
                .fromNow()
            : (Date.now() - Number(order?.createdAt)) / (1000 * 60 * 24) < 24 &&
              moment(new Date(Number(order?.createdAt)))
                .startOf("hour")
                .fromNow()}
        </Text>
      </div>
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
          <Text fw="lighter">{deliveryLocation && deliveryLocation}</Text>
          <IconLocation size={16} style={{ marginTop: 6, marginLeft: 8 }} />
        </Link>
      </div>

      <div>
        <Accordion>
          <Accordion.Item value="products">
            <Accordion.Control>
              <Text className="uppercase font-medium">Products</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="space-y-2 md:space-y-0 md:flex md:space-x-8 w-full md:overflow-x-auto">
                {order?.items.map((item, i) => (
                  <CartItem key={i} order={item} noControls />
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
