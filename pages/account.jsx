import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Address, Footer, Logoheader } from "../components";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  Space,
  Tabs,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useContext, useState } from "react";
import { Userdatacontext } from "../context/userdata";
import { useMutation } from "urql";
import { notifications } from "@mantine/notifications";

export default function Login() {
  const { data: session } = useSession();

  const { data } = useContext(Userdatacontext);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loadingAddress, setLoadingAddress] = useState(false);

  const [user, setUser] = useState({
    name: session?.user?.name,
    phoneNumber: data?.phoneNumber,
  });

  const [address, setAddress] = useState({
    label: "",
  });

  const UPDATE_PROFILE = `
    mutation UPDATE_PROFILE(
      $email: String
      $name: String
      $phoneNumber: String
    ){
      updateProfile(
        email: $email
        name: $name
        phoneNumber: $phoneNumber
      ){
        id
      }
    }
  `;

  const ADD_ADDRESS = `
    mutation ADD_ADDRESS(
      $label: String
      $lat: Float
      $lng: Float
      $email: String
    ){
      addAddress(
        label: $label
        lat: $lat
        lng: $lng
        email: $email
      ){
        id
      }
    }
  `;

  const [_, _updateProfile] = useMutation(UPDATE_PROFILE);
  const [__, _addAddress] = useMutation(ADD_ADDRESS);

  const handleUpdateProfile = () => {
    setLoading(true);
    _updateProfile({
      name: user?.name,
      email: session?.user?.email,
      phoneNumber: user?.phoneNumber,
    })
      .then((data, error) => {
        if (data?.data?.updateProfile && !error) {
          notifications.show({
            title: "Profile updated successfully",
            color: "green",
          });
          return;
        }
        notifications.show({
          title: "Oops!, something occured",
          color: "red",
        });
      })
      .catch((err) => {
        notifications.show({
          title: "Oops!, something occured",
          color: "red",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSaveAddress = () => {
    if (!address?.label) {
      notifications.show({
        title: "No address label entered",
        message: "Address label help you remember the saved location",
        color: "orange",
      });
      return;
    }
    setLoadingAddress(true);
    const successCallback = (position) => {
      _addAddress({
        label: address?.label,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        email: session?.user?.email,
      })
        .then((data, error) => {
          if (data?.data?.addAddress && !error) {
            notifications.show({
              title: "Address added!",
              color: "green",
            });
            setAddress({
              label: "",
            });
            return;
          }
          notifications.show({
            title: "Oops! Something occured",
            color: "red",
          });
        })
        .catch((err) => {
          notifications.show({
            title: "Oops! Something occured",
            color: "red",
          });
        })
        .finally(() => setLoadingAddress(false));
    };

    const errorCallback = (error) => {
      console.log(error);
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  };

  if (typeof session !== "undefined" && session) {
    return (
      <div>
        <Logoheader />
        <div className="p-4 space-y-8 mt-[80px] relative">
          <h1 className="font-medium text-[1.5rem]">My account</h1>
          <div>
            <Tabs value={activeTab} onTabChange={setActiveTab} color="dark">
              <Tabs.List>
                <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
                <Tabs.Tab value="addresses">Addresses</Tabs.Tab>
                <Tabs.Tab value="account_details">Account details</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="dashboard" pt="xs">
                <div className="space-y-6 py-12 px-4">
                  <Text className="font-medium">
                    Hello {data?.name} (not {data?.name}?{" "}
                    <span className="hover:cursor-pointer text-[#0E5AA6]">
                      <UnstyledButton
                        onClick={signOut}
                        style={{ color: "#0E5AA6" }}
                      >
                        Log out
                      </UnstyledButton>
                    </span>
                    )
                  </Text>
                  <Text className="font-medium">
                    From your account dashboard you can manage your{" "}
                    <span
                      onClick={() => setActiveTab("addresses")}
                      className="hover:cursor-pointer text-[#0E5AA6]"
                    >
                      shipping addresses
                    </span>{" "}
                    and edit your{" "}
                    <span
                      onClick={() => setActiveTab("account_details")}
                      className="hover:cursor-pointer text-[#0E5AA6]"
                    >
                      account details
                    </span>
                    .
                  </Text>
                  <Space h={20} />
                </div>
              </Tabs.Panel>

              <Tabs.Panel value="addresses" pt="xs">
                <div className="md:flex md:justify-between">
                  <div className="space-y-8 py-8 md:w-[40%]">
                    {data?.addresses.length > 0 ? (
                      <>
                        <Text fw="lighter">
                          The following addresses will be used on the checkout
                          page.
                        </Text>
                        <div className="space-y-2">
                          {data?.addresses.map((address, i) => (
                            <Address key={i} address={address} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
                        <Text>No addresses found.</Text>
                      </div>
                    )}
                  </div>

                  <div className="md:w-[50%] md:py-8">
                    <h1 className="font-medium text-[1.5rem]">
                      Add a new address
                    </h1>

                    <div className="space-y-3">
                      <TextInput
                        placeholder="ex. Home"
                        label="Address label"
                        withAsterisk
                        value={address?.label}
                        onChange={(e) => {
                          setAddress((address) => {
                            return {
                              ...address,
                              label: e.target.value,
                            };
                          });
                        }}
                      />

                      <p className="font-light">
                        We'll show you pickup stations near you when you
                        checkout an order.
                      </p>
                      <Button
                        fullWidth
                        fw="lighter"
                        uppercase
                        color="dark"
                        loading={loadingAddress}
                        onClick={handleSaveAddress}
                      >
                        save address
                      </Button>
                    </div>
                  </div>
                </div>
              </Tabs.Panel>

              <Tabs.Panel value="account_details" pt="xs">
                <div className="py-8 space-y-8">
                  <TextInput
                    placeholder="Your name"
                    label="Full name"
                    value={user?.name ? user?.name : session?.user?.name}
                    onChange={(e) => {
                      setUser((user) => {
                        return {
                          ...user,
                          name: e.target.value,
                        };
                      });
                    }}
                  />
                  <TextInput
                    placeholder="Your email"
                    label="Email"
                    value={session?.user?.email}
                    disabled
                  />
                  <TextInput
                    placeholder="Your phone number"
                    label="Phone number"
                    value={
                      user?.phoneNumber ? user?.phoneNumber : data?.phoneNumber
                    }
                    onChange={(e) => {
                      setUser((user) => {
                        return {
                          ...user,
                          phoneNumber: e.target.value,
                        };
                      });
                    }}
                  />

                  <Button
                    loading={loading}
                    fullWidth
                    disabled={!user?.name && !user?.phoneNumber}
                    fw="lighter"
                    uppercase
                    color="dark"
                    onClick={handleUpdateProfile}
                  >
                    save changes
                  </Button>
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (typeof session !== "undefined" && !session) {
    return (
      <div className="mt-[20%] relative  w-full">
        <img
          src={`/signin.jpg`}
          className="h-[250px] mb-6 absolute left-[50%] translate-x-[-50%]"
        />
        <div className="absolute top-[270px] w-[90%] left-[50%] translate-x-[-50%]">
          <h1 className="w-full text-center text-[1.3rem] font-semibold mb-6">
            You are not signed in
          </h1>
          <Text className="w-full text-center">
            Looks like you haven&apos;t signed in yet.
          </Text>
          <Button
            color="dark"
            size="sm"
            fw="lighter"
            radius={null}
            uppercase
            fullWidth
            onClick={signIn}
            mt={32}
          >
            sign in / create account
          </Button>
        </div>
      </div>
    );
  }

  return <p>Loading</p>;
}
