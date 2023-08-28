import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Indicator,
  Modal,
  NavLink,
  Radio,
  Space,
  Stack,
  Text,
  Timeline,
  Transition,
  UnstyledButton,
  useMantineTheme,
  Menu,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconExclamationMark,
  IconLogout,
  IconUser,
} from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { Turn as Hamburger } from "hamburger-react";
import { useContext, useEffect, useState } from "react";
import CartItem from "./cartitem";

import { Userdatacontext } from "../context/userdata";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Address from "./address";
import { useMutation } from "urql";
import { notifications } from "@mantine/notifications";
import io from "socket.io-client";
import Spinner from "react-svg-spinner";
import logo from "../public/logo.svg";
import Image from "next/image";
import CustomRefinementList from "./refinementlist";
import Error from "next/error";
import { isOnSale } from "./productcard";

let socket;

export default function Logoheader() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const router = useRouter();
  const theme = useMantineTheme();

  const { data } = useContext(Userdatacontext);
  const [selectedAddress, setSelectedAddress] = useState(
    () => data?.addresses.filter((address) => address?.default == true)[0]?.id
  );
  const [selectedPayment, setSelectedPayment] = useState("pay-now");

  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState("");
  const [loadingPay, setLoadingPay] = useState(false);
  const [txDetails, setTxDetails] = useState({});

  const lgScreen = useMediaQuery("(min-width: 48em)");

  useEffect(() => {
    socketInitializer(data);

    return () => {
      socket ? socket.disconnect() : null;
    };
  }, [data, selectedAddress]);

  async function socketInitializer(data) {
    // ping the server to setup a socket if not already running
    await fetch("/api/socket/");

    // Setup the Socket
    socket = io({
      transports: ["websocket"],
    });

    // Manage socket message events
    socket.on("mpesaCallback", (stkCallback) => {
      setLoadingPay(false);
      console.log(stkCallback);
      setTxDetails(stkCallback);
      if (stkCallback?.ResultCode == 0) {
        let _items = [];

        data?.cart.forEach((cartItem) => {
          let entry = {
            product: cartItem?.product?.id,
            salePrice: cartItem?.product?.variants?.filter(
              (variant) => variant?.label == cartItem?.variant
            )[0].price,
            quantity: cartItem?.quantity,
            variant: cartItem?.variant,
          };
          _items.push(entry);
        });

        let _payment = {
          code: stkCallback?.CallbackMetadata?.Item.filter(
            (item) => item.Name == "MpesaReceiptNumber"
          )[0].Value,
          timestamp: stkCallback?.CallbackMetadata?.Item.filter(
            (item) => item.Name == "TransactionDate"
          )[0].Value,
          amount: stkCallback?.CallbackMetadata?.Item.filter(
            (item) => item.Name == "Amount"
          )[0].Value,
          phoneNumber: stkCallback?.CallbackMetadata?.Item.filter(
            (item) => item.Name == "PhoneNumber"
          )[0].Value,
        };

        let _deliveryLocation = {
          lat: data?.addresses.filter(
            (_address) => _address.id == selectedAddress
          )[0]?.lat,
          lng: data?.addresses.filter(
            (_address) => _address.id == selectedAddress
          )[0]?.lng,
        };

        let order = {
          items: JSON.stringify(_items),
          customer: data?.id,
          payment: JSON.stringify(_payment),
          _deliveryLocation: JSON.stringify(_deliveryLocation),
        };

        _checkout(order)
          .then(({ data, error }) => {
            if (!error) {
              notifications.show({
                title: "Order complete.",
                message: "Track your orders in the orders section",
                icon: <IconCheck />,
                color: "green",
              });
            } else {
              notifications.show({
                title: "Something occured",
                icon: <IconExclamationMark />,
                message: "Payment received but order completion failed",
                color: "red",
              });
            }
          })
          .catch((err) => {
            notifications.show({
              title: "Something occured",
              icon: <IconExclamationMark />,
              message: "Payment received but order completion failed",
              color: "red",
            });
          });
      }
    });
  }

  const CHECKOUT = `
      mutation CHECKOUT(
        $items: String
        $customer: ID
        $payment: String
        $_deliveryLocation: String
      ){
        checkout(
          items: $items
          customer: $customer
          payment: $payment
          _deliveryLocation: $_deliveryLocation
        ){
          id
        }
      }
  `;

  const [_, _checkout] = useMutation(CHECKOUT);

  const getPrice = () => {
    let sum = 0;
    data?.cart.forEach((order) => {
      sum =
        sum +
        (isOnSale(
          order?.product.variants.filter(
            (variant) => variant?.label == order?.variant
          )[0]
        )
          ? order?.product.variants.filter(
              (variant) => variant?.label == order?.variant
            )[0].sale?.salePrice
          : order?.product.variants.filter(
              (variant) => variant?.label == order?.variant
            )[0].price) *
          order?.quantity;
    });

    return sum;
  };

  const getEstimatedFees = () => {
    // an api call that looks at the number of products to be delivered , cost of products , distance to determine the delivery fees
    return 50;
  };

  const handlePay = async () => {
    setTxDetails({});
    setLoadingPay(true);

    if (!selectedAddress) {
      notifications.show({
        title: "Please select a delivery address",
        color: "orange",
      });
      setLoadingPay(false);
      return;
    }

    if (selectedPayment == "pay-now") {
      try {
        const response = await fetch(`/api/initiateNI`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: getPrice() + getEstimatedFees(),
          }),
        });

        const data = await response.json();

        if (response.status !== 200) {
          throw new Error("Error occured , Retry");
        }

        if (response.status == 200) {
          setStatus("STK push sent");
          setOpenModal(true);
          return;
        }
        return;
      } catch (error) {
        console.log(error);
        setStatus("Error occured , Retry");
        setLoadingPay(false);
        return;
      }
    }

    alert(`Pay later not yet implemented`);
  };

  return (
    <div>
      <div className="w-full fixed top-0 left-0 z-50">
        <div className="md:flex items-center justify-between w-[90%] bg-white py-4 md:px-10 px-7">
          <div className="cursor-pointer mt-2" onClick={() => router.push(`/`)}>
            <Image height={40} priority src={logo} alt="logo" />
          </div>

          <div className="space-x-3 flex absolute right-8 top-4">
            <div
              className="mt-3 cursor-pointer"
              onClick={() => setCartOpen(true)}
            >
              <Indicator
                color="#0E5AA6"
                inline
                label={data?.cart?.length || 0}
                size={16}
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M13.5 21c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m-6 2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5m0-2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5m16.5-16h-2.964l-3.642 15h-13.321l-4.073-13.003h19.522l.728-2.997h3.75v1zm-22.581 2.997l3.393 11.003h11.794l2.674-11.003h-17.861z" />
                </svg>
              </Indicator>
            </div>

            <div className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <Hamburger
                onToggle={() => {
                  setCategoriesOpen(false);
                  setMenuOpen((o) => !o);
                }}
                size={24}
                className="inline"
              />
            </div>
          </div>

          <ul
            className={`shadow-md md:flex md:shadow-none md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-[100%] md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
              menuOpen ? "top-16 " : "top-[-490px]"
            }`}
          >
            <li key={`home`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    Home
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <li key={`categories`} className="md:ml-8 text-xl md:my-0 my-3">
              {!lgScreen ? (
                <NavLink
                  onChange={() => setCategoriesOpen((o) => !o)}
                  label={
                    <a
                      href="#"
                      className=" uppercase text-gray-800 hover:text-gray-400 duration-500"
                    >
                      Categories
                    </a>
                  }
                  opened={categoriesOpen}
                  childrenOffset={28}
                >
                  <CustomRefinementList
                    attribute="category"
                    sortBy={["count:desc", "name:asc"]}
                  />
                </NavLink>
              ) : (
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <a
                      href="#"
                      className=" uppercase text-gray-800 hover:text-gray-400 text-[14px] duration-500"
                    >
                      Categories
                    </a>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <CustomRefinementList
                      attribute="category"
                      sortBy={["count:desc", "name:asc"]}
                    />
                  </Menu.Dropdown>
                </Menu>
              )}
            </li>

            <li key={`saved`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/saved"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    Saved
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <li key={`orders`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/orders"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    Orders
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <li key={`help`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/help"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    Help
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <li key={`contact`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/contact"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    Contact us
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <Divider />

            <li key={`account`} className="md:ml-8 text-xl md:my-0 my-3">
              <NavLink
                label={
                  <a
                    href="/account"
                    className="uppercase text-gray-800 hover:text-gray-400 duration-500"
                  >
                    My account
                  </a>
                }
                childrenOffset={28}
              />
            </li>

            <div className="md:hidden">
              <li key={`contact`} className="md:ml-8 text-xl md:my-0 my-3">
                <NavLink
                  label={
                    <a className="uppercase text-gray-800 hover:text-gray-400 duration-500">
                      <span
                        className="hover:cursor-pointer"
                        onClick={() => {
                          if (data) {
                            signOut();
                            notifications.show({
                              title: "You are now logged out",
                              color: "green",
                            });
                          }
                        }}
                      >
                        Log out
                      </span>
                    </a>
                  }
                  childrenOffset={28}
                />
              </li>
            </div>
          </ul>
        </div>
      </div>

      <Drawer
        position="right"
        opened={cartOpen}
        title={null}
        withCloseButton={false}
      >
        <div>
          <div className="sticky top-0 bg-white z-40">
            <div className="p-3 relative">
              <IconChevronRight
                onClick={() => setCartOpen(false)}
                className="absolute mt-[6px]"
              />
              <h2 className="w-full text-center text-[1.2rem] font-medium">
                Shopping cart
              </h2>
            </div>
          </div>

          {data?.cart?.length > 0 ? (
            <>
              <div className="p-2 pt-6">
                <span className="block text-[#909090] mb-3">
                  {data?.cart?.length} items
                </span>
                <div className="space-y-6 overflow-y-auto">
                  {data?.cart.map((cartItem, i) => (
                    <CartItem key={i} order={cartItem} />
                  ))}
                </div>
              </div>
              <div className=" p-4 border-t-[1px] border-gray-400 space-y-5">
                <div className="flex justify-between">
                  <p className="font-medium">
                    Subtotal ({data?.cart?.length} items)
                  </p>
                  <p className="text-[#0E5AA6]">
                    Ksh.{" "}
                    {getPrice()
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Shipping</p>
                    <span className="text-[0.8rem] text-[#909090] font-light">
                      Flat rate for deliveries in Juja vicinity
                    </span>
                  </div>
                  <p className="text-[#0E5AA6]">
                    Ksh.{" "}
                    {getEstimatedFees()
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="text-[#0E5AA6]">
                    ≈ Ksh.{" "}
                    {(getPrice() + getEstimatedFees())
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
                <Button
                  color="dark"
                  size="sm"
                  uppercase
                  fullWidth
                  onClick={() => setCheckoutOpen(true)}
                  rightIcon={<IconChevronRight size={16} />}
                >
                  checkout
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-[20%] relative  w-full">
              <img
                src={`/empty-cart.jpg`}
                className="h-[250px] mb-6 absolute left-[50%] translate-x-[-50%]"
              />
              <div className="absolute top-[270px] w-[90%] left-[50%] translate-x-[-50%]">
                <h1 className="w-full text-center text-[1.3rem] font-semibold mb-6">
                  Your cart is empty
                </h1>
                <Text className="w-full text-center">
                  Looks like you haven&apos;t added anything to your cart yet.
                </Text>
                <Button
                  color="dark"
                  size="sm"
                  fw="lighter"
                  radius={null}
                  uppercase
                  fullWidth
                  onClick={() => router.push("/")}
                  mt={32}
                >
                  start shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <Drawer
        position="right"
        opened={checkoutOpen}
        title={null}
        withCloseButton={false}
      >
        <div>
          <div className="sticky top-0 bg-white z-40">
            <div className="p-3 relative">
              <IconChevronRight
                onClick={() => setCheckoutOpen(false)}
                className="absolute mt-[6px]"
              />
              <h2 className="w-full text-center text-[1.2rem] font-medium">
                Checkout
              </h2>
            </div>
          </div>
          <div className="p-2 pt-6 space-y-12">
            <Timeline color="dark" active={2} bulletSize={24} lineWidth={2}>
              <Timeline.Item title="Order summary">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <div className="space-y-2 p-2">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        Subtotal ({data?.cart?.length} items)
                      </p>
                      <p className="text-[#0E5AA6]">Ksh. {getPrice()}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Shipping</p>
                      </div>
                      <p className="text-[#0E5AA6]">
                        Ksh. {getEstimatedFees()}
                      </p>
                    </div>
                    <Divider />
                    <div className="flex justify-between">
                      <p className="font-medium">Total</p>
                      <p className="text-[#0E5AA6]">
                        ≈ Ksh. {getPrice() + getEstimatedFees()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Timeline.Item>

              <Timeline.Item title="Delivery location">
                <div className="py-4">
                  <Radio.Group
                    value={selectedAddress}
                    onChange={setSelectedAddress}
                    name="delivery address"
                    description="Select an address to be used for shipping"
                    withAsterisk
                  >
                    <Stack spacing="xs" mt={24}>
                      {data?.addresses.map((address, i) => (
                        <Radio
                          key={i}
                          value={address?.id}
                          label={<Address address={address} noActions />}
                        />
                      ))}
                      {data?.addresses?.length < 1 && (
                        <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
                          <Text>
                            No addresses added yet. Add an address in the{" "}
                            <a href="/account" className="underline">
                              account page
                            </a>{" "}
                          </Text>
                        </div>
                      )}
                    </Stack>
                  </Radio.Group>
                </div>
              </Timeline.Item>

              <Timeline.Item title="Payment">
                <Radio.Group
                  value={selectedPayment}
                  onChange={setSelectedPayment}
                  name="payment option"
                  description="Choose a payment option"
                  withAsterisk
                >
                  <Stack spacing="xs" mt={24}>
                    <Radio value={"pay-now"} label="Pay now via M-PESA" />
                    <Radio value={"pay-later"} label="Pay on delivery" />
                  </Stack>
                </Radio.Group>
              </Timeline.Item>
            </Timeline>

            <Space h={36} />

            <Button
              color="dark"
              size="sm"
              uppercase
              fullWidth
              onClick={
                !status || status == "Error occured , Retry" ? handlePay : null
              }
              loading={loadingPay}
            >
              {status ? status : "Complete Order"}
            </Button>

            <Modal
              opened={openModal}
              centered
              overlayProps={{
                color: theme.colors.gray[9],
                opacity: 0.7,
                blur: 3,
              }}
              onClose={() => setLoadingPay(false)}
              withCloseButton={false}
              size="xs"
              transitionProps={{ transition: "fade", duration: 200 }}
            >
              {/* {txDetails && txDetails?.ResultCode == 0 && ( */}
              <div className="relative h-[50vh]">
                {Object.keys(txDetails).length === 0 ? (
                  <div className="absolute w-[50%] top-[10%] left-[50%] translate-x-[-50%]">
                    <Spinner size="128px" thickness={3} />
                  </div>
                ) : (
                  <img
                    src={
                      txDetails?.ResultCode == 0 ? "/success.jpg" : "/error.jpg"
                    }
                    className="absolute w-[50%] top-[10%] left-[50%] translate-x-[-50%]"
                  />
                )}
                <div className="space-y-8 absolute top-[50%] w-full">
                  <h1 className="font-bold text-[1.4rem] text-[#0E5AA6] w-full text-center">
                    {Object.keys(txDetails).length === 0
                      ? "Waiting"
                      : txDetails?.ResultCode == 0
                      ? "Payment Successful!"
                      : "Oops!"}
                  </h1>
                  <p className="px-4 text-center">
                    {Object.keys(txDetails).length === 0
                      ? "An STK push has been sent to you"
                      : txDetails?.ResultCode == 0
                      ? "Thank you for purchasing. Your payment was successful"
                      : txDetails?.ResultCode == 1037
                      ? "Upgrade sim card or make sure it is online"
                      : txDetails?.ResultCode == 1025
                      ? "System error"
                      : txDetails?.ResultCode == 1032
                      ? "STK push cancelled"
                      : txDetails?.ResultCode == 1
                      ? "Insufficient balance"
                      : txDetails?.ResultCode == 2001
                      ? "Wrong PIN entered"
                      : txDetails?.ResultCode == 1019
                      ? "Transaction expired. Try again"
                      : txDetails?.ResultCode == 1001
                      ? "Ongoing USSD session noticed"
                      : null}
                  </p>
                  {Object.keys(txDetails).length === 0 ? null : (
                    <Button
                      style={{ background: "#0E5AA6" }}
                      fullWidth
                      onClick={
                        txDetails && txDetails?.ResultCode == 0
                          ? router.reload
                          : handlePay
                      }
                    >
                      {txDetails && txDetails?.ResultCode == 0
                        ? "Continue shopping"
                        : "Retry payment"}
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
