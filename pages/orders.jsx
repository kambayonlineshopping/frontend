import { Button, Select, Space, Text } from "@mantine/core";
import { Footer, Logoheader, Order } from "../components";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import { Userdatacontext } from "../context/userdata";
import { useContext, useState } from "react";

export default function Orders() {
  const router = useRouter();
  const { data: userData } = useContext(Userdatacontext);
  const [filter, setFilter] = useState("");

  const GET_ORDERS = `
      query GET_ORDERS(
        $customer: String
      ){
        getOrders(
          customer: $customer
        ){
          id
          items{
            product{
              id
              images
              variants{
                label
              }
              name
            }
            salePrice
            quantity
            variant
          }
          deliveryLocation{
            lat
            lng
          }
          payment{
            code
            timestamp            
            amount
          }
          deliveryTimestamp
          dispatchTimestamp
          pickUpTimestamp
          createdAt
        }
      }
  `;

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_ORDERS,
    variables: {
      customer: userData?.id,
    },
  });

  if (fetching) return <p>Fetching...</p>;
  if (error) return <p>Error...</p>;

  return (
    <div>
      <Logoheader />

      <div className="space-y-8 mt-[80px] relative bg-red-400">
        <div className="w-full fixed top-[72px] left-0 z-40 bg-white pb-3 px-8">
          <div className="flex justify-between mb-3">
            <h1 className="font-medium text-[1.5rem] mt-2">My orders</h1>
            <span className="block text-[#909090] mt-3">
              {data?.getOrders.length} items
            </span>
          </div>
          <Select
            clearable
            value={filter}
            onChange={setFilter}
            placeholder="Filter orders"
            data={[
              { value: "processing", label: "In processing" },
              { value: "transit", label: "In transit" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
      </div>

      <div className="p-4 mt-[170px] relative">
        {data?.getOrders
          .filter((order) => {
            if (!filter) {
              return order;
            } else if (filter == "delivered") {
              return order?.deliveryTimestamp && order?.dispatchTimestamp;
            } else if (filter == "transit") {
              return order?.dispatchTimestamp && !order?.deliveryTimestamp;
            } else if (filter == "processing") {
              return !order?.dispatchTimestamp && !order?.deliveryTimestamp;
            } else {
              return null;
            }
          })
          .sort((a, b) => Number(b?.createdAt) - Number(a?.createdAt))
          .map((order, i) => {
            let deliveryLocation;
            userData?.addresses?.map((address) => {
              if (
                order?.deliveryLocation?.lat == address.lat &&
                order?.deliveryLocation?.lng == address?.lng
              ) {
                deliveryLocation = address.label;
              }
            });

            return (
              <Order
                key={i}
                order={order}
                deliveryLocation={deliveryLocation}
              />
            );
          })}

        {data?.getOrders.length == 0 && (
          <>
            <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
              <Text>No order has been made yet.</Text>
            </div>

            <Button
              style={{ color: "#0E5AA6" }}
              variant="subtle"
              fullWidth
              fw="lighter"
              onClick={() => router.push("/")}
              uppercase
            >
              Browse products
            </Button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
