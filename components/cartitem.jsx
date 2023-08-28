import { Badge, Divider, Select, Text, UnstyledButton } from "@mantine/core";
import { IconX } from "@tabler/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMutation } from "urql";
import { isOnSale } from "./productcard";

export default function CartItem({ order, noControls }) {
  const { data: session } = useSession();
  const router = useRouter();

  const UPDATE_CART = `
    mutation UPDATE_CART(
      $id: ID
      $removal: Boolean
      $quantity: Int
      $email: String
    ){
      updateCart(
        email: $email
        id: $id
        removal: $removal
        quantity: $quantity
      ){
        id
      }
    }
  `;

  const [_, _updateCart] = useMutation(UPDATE_CART);

  const handleChangeQty = (val) => {
    _updateCart({
      email: session?.user?.email,
      id: order?.id,
      quantity: Number(val),
      removal: false,
    }).then((data, error) => {
      console.log(data, error);
    });
  };

  const handleRemoveItem = () => {
    _updateCart({
      email: session?.user?.email,
      id: order?.id,
      removal: true,
    }).then((data, error) => {
      console.log(data, error);
    });
  };

  return (
    <div
      className={
        noControls
          ? "flex space-x-2 pb-4 min-w-[220px]"
          : "flex space-x-2 border-b-[0.5px] pb-4 min-w[220px]"
      }
    >
      <div className="w-[35%]">
        <img
          onClick={() => router.push(`/product/${order?.product?.id}`)}
          src={order?.product?.images[0]}
          className="w-full h-[70px] min-w-[60px] object-contain"
          alt={order?.product?.name}
        />
      </div>
      <div className="w-[60%] space-y-1 relative">
        <Text lineClamp={2} className="text-[#2c2c2c] font-medium">
          {order?.product?.name}
        </Text>
        <div className="flex space-x-3">
          <p className="text-[#0E5AA6] text-[0.9rem]">
            Ksh.{" "}
            {!noControls
              ? isOnSale(
                  order?.product.variants.filter(
                    (variant) => variant?.label == order?.variant
                  )[0]
                )
                ? order?.product.variants
                    .filter((variant) => variant?.label == order?.variant)[0]
                    .sale?.salePrice?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : order?.product.variants
                    .filter((variant) => variant?.label == order?.variant)[0]
                    .price.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : order?.salePrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
          {/* {!noControls && ( */}
          <Badge
            color="dark"
            radius="xs"
            variant="filled"
            style={{ marginTop: 4 }}
          >
            {order?.variant}
          </Badge>
          {/* )} */}
        </div>

        {noControls && <p>Qty: {order?.quantity}</p>}
        <div>
          {!noControls && (
            <div className="mt-12">
              <Select
                dropdownComponent="div"
                styles={() => ({
                  item: {
                    // applies styles to selected item
                    "&[data-selected]": {
                      "&, &:hover": {
                        backgroundColor: "#0E5AA6",
                        color: "white",
                      },
                    },

                    // applies styles to hovered item (with mouse or keyboard)
                    "&[data-hovered]": {},
                  },
                  zIndex: 30,
                })}
                value={String(order?.quantity)}
                onChange={(val) => handleChangeQty(val)}
                placeholder="Qty"
                data={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                size="xs"
                variant="filled"
                style={{ width: "50%", position: "absolute", bottom: 0 }}
              />
            </div>
          )}
        </div>
      </div>
      {!noControls && (
        <UnstyledButton
          onClick={handleRemoveItem}
          style={{
            background: "rgba(0,0,0,0.3)",
            height: 24,
            padding: 4,
            borderRadius: "50%",
          }}
        >
          <IconX size={16} />
        </UnstyledButton>
      )}
    </div>
  );
}
