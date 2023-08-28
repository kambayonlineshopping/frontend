import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Input,
  Kbd,
  Modal,
  Notification,
  NumberInput,
  PasswordInput,
  Popover,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  Icon123,
  IconBoxSeam,
  IconCheck,
  IconCheckupList,
  IconExclamationMark,
  IconHomeCog,
  IconLock,
  IconLogout,
  IconMail,
  IconPlus,
  IconSearch,
  IconTruckDelivery,
  IconWallet,
  IconX,
} from "@tabler/icons";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  Additional,
  AdminCard,
  Loader,
  OrderAdmin,
  ProductCardAdmin,
  Variant,
} from "../components";
import dynamic from "next/dynamic";
import { useClient, useMutation, useQuery } from "urql";
import { notifications } from "@mantine/notifications";

import {
  Hits,
  InstantSearch,
  useInfiniteHits,
  useSearchBox,
} from "react-instantsearch";
import {
  NovuProvider,
  PopoverNotificationCenter,
  NotificationBell,
} from "@novu/notification-center";

import logo from "../public/logo.svg";
import Image from "next/image";
import { searchClient } from "../pages/_app.js";
import moment from "moment";
import { Carousel } from "react-responsive-carousel";
import { EditText, EditTextarea } from "react-edit-text";
import { isOnSale } from "../components/productcard";

import { useRouter } from "next/router";

const DynamicBar = dynamic(() => import("../components/barchart"), {
  loading: () => <p>Loading...</p>,
});

const GET_ADMIN = `
    query GET_ADMIN(
       $id: ID
       $email: String 
       $password: String
       ){
      getAdmin(
         id: $id 
         email: $email 
         password: $password
      ){
        id
        email        
        password
        name
        phoneNumber
        levelClearance        
      }
    }
  
  `;

export default function Admin() {
  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(null);

  const graphqlClient = useClient();

  useLayoutEffect(() => {
    setLoading(true);
    if (typeof window !== "undefined") {
      let id = localStorage?.getItem("admin_key");
      if (id) {
        graphqlClient
          .query(GET_ADMIN, {
            id,
          })
          .toPromise()
          .then(({ data, error }) => {
            if (data && !error) {
              setAdmin(data?.getAdmin);
            } else {
              console.log(data, error, id);
              localStorage.clear();
            }
          })
          .then(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
        console.log("Not logged in");
        localStorage.clear();
      }
    }
  }, []);

  const handleLogOut = () => {
    localStorage.clear();
    setAdmin({});
  };

  if (loading)
    return (
      <div className="bg-[#0E5AA6] w-full h-screen">
        <Loader />
      </div>
    );

  if (!Object.keys(admin).length > 0 && !loading)
    return <Login setAdminParent={(admin) => setAdmin(admin)} />;

  return (
    <div>
      <AdminHeader admin={admin} logOut={handleLogOut} />
      <div className="px-6">
        <Page admin={admin} />
      </div>
    </div>
  );
}

const Login = ({ setAdminParent }) => {
  const graphqlClient = useClient();
  const [admin, setAdmin] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    console.log(admin);
    if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        admin?.email
      )
    ) {
      notifications.show({
        title: "Invalid email",
        color: "orange",
      });
      return;
    }

    if (!admin?.email) {
      notifications.show({
        title: "Missing email field",
        color: "orange",
      });
      return;
    }

    if (!admin?.password) {
      notifications.show({
        title: "Missing password field",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    graphqlClient
      .query(GET_ADMIN, {
        email: admin?.email,
        password: admin?.password,
      })
      .toPromise()
      .then(({ data, error }) => {
        console.log(data, error);
        if (data?.getAdmin && !error) {
          localStorage.setItem("admin_key", data?.getAdmin?.id);
          setAdminParent(data?.getAdmin);
          setLoading(false);
        } else {
          notifications.show({
            title: "Invalid credentials",
            color: "red",
          });
          setLoading(false);
        }
      });
  };

  return (
    <div className="relative w-full h-screen bg-[#0E5AA6]">
      <div className="absolute p-8 rounded-sm bg-white top-[40%] w-3/4 left-[50%] translate-x-[-50%] translate-y-[-50%] space-y-4  md:w-[50%] lg:w-[25%]">
        <Image height={40} priority src={logo} alt="logo" className="mx-auto" />
        <h1 className="font-bold text-[1.4rem] w-full text-center">
          Admin Login
        </h1>
        <Divider />
        <TextInput
          withAsterisk
          label="Email"
          value={admin.email}
          error={
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
              admin?.email
            ) || !admin?.email
              ? null
              : "Invalid email"
          }
          onChange={(e) =>
            setAdmin((admin) => {
              return {
                ...admin,
                email: e.target.value,
              };
            })
          }
        />
        <PasswordInput
          withAsterisk
          label="Password"
          value={admin.password}
          onChange={(e) =>
            setAdmin((admin) => {
              return {
                ...admin,
                password: e.target.value,
              };
            })
          }
        />
        <Button
          onClick={handleLogin}
          uppercase
          loading={loading}
          fullWidth
          style={{ background: "#0E5AA6" }}
        >
          Login
        </Button>
      </div>
    </div>
  );
};

const AdminHeader = ({ admin, logOut }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  function onNotificationClick(message) {
    // your logic to handle the notification click
    if (message?.cta?.data?.url) {
      window.location.href = message.cta.data.url;
    }
  }

  return (
    <div className="w-full flex p-4 justify-between">
      <Image height={40} priority src={logo} alt="logo" />
      <div className="flex space-x-6">
        <NovuProvider
          subscriberId={process.env.NEXT_PUBLIC_NOVU_SUBSCRIBER_ID}
          applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID}
        >
          <PopoverNotificationCenter onNotificationClick={onNotificationClick}>
            {({ unseenCount }) => (
              <NotificationBell unseenCount={unseenCount} />
            )}
          </PopoverNotificationCenter>
        </NovuProvider>
        <Avatar color="brown" size={48} onClick={() => setProfileOpen(true)}>
          {admin?.name
            ?.split(" ")
            ?.map((el) => new String(el).charAt(0).toUpperCase())}{" "}
        </Avatar>
      </div>
      <Modal
        opened={profileOpen}
        onClose={() => setProfileOpen(false)}
        centered
        withCloseButton={false}
      >
        <div className="flex justify-between">
          <h1 className="py-6 px-3 font-bold text-[1.5rem]">Profile</h1>
          <Button
            onClick={() => setProfileOpen((o) => !o)}
            color="gray"
            variant="subtle"
            mt={24}
          >
            <IconX />
          </Button>
        </div>
        <div className="space-y-6 px-2 mt-6">
          <div className="space-y-3">
            <p className="font-medium mt-3">Full Name</p>
            <div className="flex justify-between">
              <p className="font-light">{admin?.name}</p>
              <Badge color="dark" uppercase radius={null}>
                {admin?.levelClearance}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-medium mt-3">Email</p>
            <p className="font-light">{admin?.email}</p>
          </div>
          <div className="space-y-3">
            <p className="font-medium mt-3">Phone number</p>
            <p className="font-light">
              {admin?.phoneNumber ? (
                admin?.phoneNumber
              ) : (
                <Badge color="orange" uppercase radius={null}>
                  missing
                </Badge>
              )}
            </p>
          </div>
          <Divider />
          <Button
            onClick={() => logOut()}
            fullWidth
            uppercase
            color="dark"
            variant="outline"
          >
            <IconLogout size={12} style={{ marginRight: 12 }} /> log out
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Page = ({ admin }) => {
  return (
    <Tabs
      color="dark"
      unstyled
      styles={(theme) => ({
        tabsList: {
          display: "flex",
          maxWidth: "100%",
          overflowX: "auto",
          scrollbarWidth: "none",
        },
        tabPanel: {
          background: "yellow",
        },
        tab: {
          ...theme.fn.focusStyles(),
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          cursor: "pointer",
          fontSize: theme.fontSizes.sm,
          display: "flex",
          alignItems: "center",
          fontFamily: "Satoshi",
          borderBottomColor: "light-gray",
          borderBottomWidth: 0.5,
          "&[data-active]": {
            borderBottomColor: "black",
            borderBottomWidth: 2,
          },
        },
      })}
      defaultValue="dashboard"
    >
      <Tabs.List>
        <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
        <Tabs.Tab value="products">Products</Tabs.Tab>
        <Tabs.Tab value="orders">Orders</Tabs.Tab>
        <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
        <Tabs.Tab value="admins">Admins</Tabs.Tab>
        {/* <Tabs.Tab value="sections">Sections</Tabs.Tab> */}
      </Tabs.List>

      <Tabs.Panel value="dashboard" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <Dashboard admin={admin} />
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="products" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <Products admin={admin} />
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="orders" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <Orders admin={admin} />
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="admins" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <Admins _admin={admin} />
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="transactions" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <InstantSearch searchClient={searchClient} indexName="transactions">
            <Transactions admin={admin} />
          </InstantSearch>
        </div>
      </Tabs.Panel>

      {/* <Tabs.Panel value="sections" pl="xs">
        <div className="max-h-[calc(100vh-170px)] mt-[15px] overflow-y-auto">
          <Sections />
        </div>
      </Tabs.Panel> */}
    </Tabs>
  );
};

const ProductList = () => {
  const { hits, isLastPage, showMore } = useInfiniteHits();

  const scrollDiv = useRef();

  const fetchMore = () => {
    if (
      scrollDiv.current.offsetHeight + scrollDiv.current.scrollTop >=
        scrollDiv.current.scrollHeight - 100 &&
      !isLastPage
    ) {
      showMore();
    }
  };

  return (
    <div
      className="w-full space-y-6 max-h-[1000px]"
      ref={scrollDiv}
      onScroll={fetchMore}
    >
      {hits.map((hit, i) => (
        <ProductCardAdmin key={i} hit={hit} />
      ))}
    </div>
  );
};

const SearchBox = () => {
  const { refine } = useSearchBox();
  return (
    <Input
      icon={<IconSearch size={16} />}
      variant="filled"
      placeholder="Search"
      onChange={(e) => refine(e.target.value)}
    />
  );
};

const Products = ({ admin }) => {
  const ADD_PRODUCT = `
    mutation ADD_PRODUCT(
        $name: String
        $description: String
        $category: String,
        $variants: String
        $additionalInformation: String  
        $images: [String] 
    ){
      addProduct(
        name: $name
        description: $description
        category: $category
        variants: $variants
        additionalInformation: $additionalInformation
        images: $images
      ){
        id
      }
    }
  `;
  const [_, _addProduct] = useMutation(ADD_PRODUCT);

  const variantThumbnail = useRef();
  const imagePicker = useRef();

  const [addModal, setAddModal] = useState(false);
  const [variantModal, setVariantModal] = useState(false);
  const [additonalModal, setAdditionalModal] = useState(false);

  const [variants, setVariants] = useState([]);
  const [additionals, setAdditionals] = useState([]);

  const [variant, setVariant] = useState({
    label: "",
    thumbnail: null,
    price: 0,
  });

  const [additional, setAdditional] = useState({
    label: "",
    value: null,
  });

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [images, setImages] = useState([]);

  const [categories, setCategories] = useState(["vest", "shirts"]);
  const [loading, setLoading] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [loadingAdditional, setLoadingAdditional] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [permissionModal, setPermissionModal] = useState(false);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let base64;
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        base64 = reader.result;
        resolve(base64);
      };
      reader.onerror = () => {
        reject(null);
      };
    });
  };

  const handleCloseModal = () => {
    setProduct({
      name: "",
      description: "",
      category: "",
    });
    setImages([]);
    setAdditional({
      label: "",
      value: null,
    });
    setVariant({
      label: "",
      thumbnail: null,
      price: 0,
    });
    setVariants([]);
    setAdditionals([]);
    setAddModal(false);
    setPopoverOpen(false);
  };

  const saveProduct = async () => {
    setLoading(true);
    let _imgs = [];

    let _variants = [];

    for (let _i of images) {
      let i_b64 = await getBase64(_i);
      _imgs.push(i_b64);
    }

    for (let _variant of variants) {
      if (_variant?.thumbnail) {
        let i_b64 = await getBase64(_variant?.thumbnail);
        let _v = {
          thumbnail: i_b64,
          label: _variant?.label,
          price: _variant?.price,
        };
        _variants.push(_v);
      } else {
        let _v = {
          thumbnail: null,
          label: _variant?.label,
          price: _variant?.price,
        };
        _variants.push(_v);
      }
    }

    let _product = {
      name: product?.name,
      description: product?.description,
      category: product?.category,
      variants: JSON.stringify(_variants),
      additionalInformation: JSON.stringify(additionals),
      images: _imgs,
    };

    _addProduct({
      ..._product,
    })
      .then((data, error) => {
        if (data?.data?.addProduct && !error) {
          notifications.show({
            title: "Product uploaded successfully",
            icon: <IconCheck />,
            color: "green",
            message: "Your customers can now shop this product",
          });
          handleCloseModal();
        } else {
          notifications.show({
            title: "Error",
            icon: <IconExclamationMark />,
            color: "red",
            message: "Something occured. We couldn't upload your product",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveVariant = () => {
    setLoadingVariant(true);
    let isValid = (variant?.label || variant?.thumbnail) && variant?.price;

    if (isValid) {
      setVariants((variants) => {
        if (variants.some((e) => e.label === variant?.label)) {
          alert("Variant alredy exists");
          return;
        }
        return [...variants, variant];
      });
      setLoadingVariant(false);
    }

    if (!isValid) {
      alert("Missing variant label or price ");
      setLoadingVariant(false);
      return;
    }
    setVariantModal(false);
    setVariant(() => {
      return {
        label: "",
        thumbnail: null,
        price: 0,
      };
    });
  };

  const saveAdditional = () => {
    setLoadingAdditional(true);
    let isValid = additional?.label && additional?.value;

    if (isValid) {
      setAdditionals((additionals) => {
        if (additionals.some((e) => e.label === additional?.label)) {
          alert("Label already exists");
          return;
        }
        return [...additionals, additional];
      });
      setLoadingAdditional(false);
    }

    if (!isValid) {
      alert("Missing label or value ");
      setLoadingAdditional(false);
      return;
    }
    setAdditionalModal(false);
    setAdditional(() => {
      return {
        label: "",
        value: null,
      };
    });
  };

  const handleRemove = (index) => {
    setVariants((variants) => {
      let filter = variants.filter((_, i) => i !== index);
      return [...filter];
    });
  };

  const handleRemoveAdditional = (index) => {
    setAdditionals((additional) => {
      let filter = additional.filter((_, i) => i !== index);
      return [...filter];
    });
  };

  return (
    <div className="space-y-8 py-6 relative max-h-[calc(100vh-96px)] h-[calc(100vh-96px)] overflow-y-auto">
      <SearchBox />
      <ProductList />
      <Button
        h={56}
        w={56}
        p={0}
        color="dark"
        onClick={() => {
          if (admin?.levelClearance !== "super-admin") {
            setPermissionModal(true);
            return;
          }
          setAddModal(true);
        }}
        style={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <IconPlus />
      </Button>
      <Modal
        opened={permissionModal}
        onClose={() => setPermissionModal(false)}
        centered
      >
        <div className="w-full">
          <img src="/access_denied.jpg" />

          <h1 className="w-full text-center">Access denied</h1>
          <p className="mt-8 mb-8 w-full px-12 text-center">
            You need <Kbd>super-admin</Kbd> identification to add new products
          </p>
        </div>
      </Modal>
      <Modal
        opened={addModal}
        onClose={handleCloseModal}
        withCloseButton={false}
        fullScreen
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <div className="flex justify-between">
          <h1 className="py-6 px-3 font-bold text-[1.5rem]">Add product</h1>
          <Popover
            width={280}
            shadow="md"
            opened={popoverOpen}
            onChange={setPopoverOpen}
          >
            <Popover.Target>
              <Button
                onClick={() => setPopoverOpen((o) => !o)}
                color="gray"
                variant="subtle"
                mt={24}
              >
                <IconX />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" fw="bold">
                Discard inputs?{" "}
              </Text>
              <div className="flex justify-between mt-8 space-x-12">
                <Button
                  onClick={handleCloseModal}
                  color="dark"
                  fw="lighter"
                  uppercase
                  fullWidth
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setAddModal(false);
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
        </div>
        <div className="space-y-6 ">
          <div className="gap-4 grid-cols-2">
            {images && images?.length > 0 && (
              <div>
                {Array.from(images).map((image, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(image)}
                    className="col-span-1"
                  />
                ))}
              </div>
            )}
          </div>
          <input
            multiple
            onChange={(e) => {
              setImages(e.target.files);
            }}
            type="file"
            ref={imagePicker}
            className="hidden"
          />
          <div className="w-full py-12 justify-center align-middle items-center relative">
            <p className="w-full text-center mb-2">Upload images</p>
            <Button
              p={0}
              w={56}
              h={56}
              onClick={() => imagePicker.current.click()}
              color="dark"
              className="translate-x-[-50%] left-[50%] absolute"
            >
              <IconPlus />
            </Button>
          </div>
          <TextInput
            placeholder="Product name"
            label="Product name"
            withAsterisk
            value={product?.name}
            onChange={(e) => {
              setProduct((product) => {
                return {
                  ...product,
                  name: e.target.value,
                };
              });
            }}
          />
          <Textarea
            placeholder="Product description"
            label="Product description"
            value={product?.description}
            minRows={6}
            onChange={(e) => {
              setProduct((product) => {
                return {
                  ...product,
                  description: e.target.value,
                };
              });
            }}
          />
          <Select
            label="Category"
            data={categories}
            placeholder="Select category"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create '${query}'`}
            onChange={(val) => {
              setProduct((product) => {
                return {
                  ...product,
                  category: val,
                };
              });
            }}
            onCreate={(query) => {
              setCategories((current) => [...current, query]);
              setProduct((product) => {
                return {
                  ...product,
                  category: query,
                };
              });
              return query;
            }}
          />
          <Space h={20} />
          <Divider size={10} label="Variants & Price" labelPosition="center" />
          <Space h={10} />
          <div>
            {variants?.length > 0 ? (
              <div className="space-y-4">
                {variants?.map((variant, i) => (
                  <Variant
                    key={i}
                    variant={variant}
                    onRemove={() => handleRemove(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
                <Text>No variant added yet.</Text>
              </div>
            )}

            <Button
              onClick={() => setVariantModal(true)}
              mt={24}
              fullWidth
              size="xs"
              color="dark"
              variant="outline"
            >
              <IconPlus size={12} style={{ marginRight: 12 }} /> Add variant
            </Button>
          </div>

          <Modal
            opened={variantModal}
            onClose={() => {
              setVariantModal(false);
              setVariant(() => {
                return {
                  label: "",
                  thumbnail: null,
                  price: 0,
                };
              });
            }}
            title={
              <h1 className="py-6 px-3 font-bold text-[1.5rem]">Add variant</h1>
            }
            centered
            transitionProps={{ transition: "fade", duration: 200 }}
          >
            <div className="p-8 space-y-8">
              <img src="/variant.png" className="mx-auto" />
              <input
                type="file"
                ref={variantThumbnail}
                className="hidden"
                onChange={(e) => {
                  setVariant((variant) => {
                    return {
                      ...variant,
                      thumbnail: e.target.files[0],
                    };
                  });
                }}
              />
              {variant?.thumbnail && (
                <div className="p-8 relative w-[90%]">
                  <img
                    src={URL.createObjectURL(variant?.thumbnail)}
                    alt="product"
                    className="aspect-auto"
                  />
                  <button
                    onClick={() =>
                      setVariant((variant) => {
                        return {
                          ...variant,
                          thumbnail: null,
                        };
                      })
                    }
                    className="absolute top-0 right-0 h-[40px] w-[40px] bg-red-800 rounded-full text-white m-0 p-0"
                  >
                    <IconX className="mx-auto" />
                  </button>
                </div>
              )}
              <Button
                fw="lighter"
                uppercase
                color="dark"
                variant="outline"
                fullWidth
                size="xs"
                onClick={() => variantThumbnail.current.click()}
              >
                <IconPlus size={12} style={{ marginRight: 12 }} /> Upload
                thumbnail
              </Button>
              <TextInput
                placeholder="ex. L ,S"
                label="Variant label"
                value={variant?.label}
                onChange={(e) => {
                  setVariant((variant) => {
                    return {
                      ...variant,
                      label: e.target.value,
                    };
                  });
                }}
              />
              <NumberInput
                label="Variant price"
                defaultValue={0}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                value={variant?.price}
                onChange={(val) => {
                  setVariant((variant) => {
                    return {
                      ...variant,
                      price: val,
                    };
                  });
                }}
              />
              <Button
                fw="lighter"
                uppercase
                color="dark"
                fullWidth
                onClick={saveVariant}
                loading={loadingVariant}
              >
                save variant
              </Button>
            </div>
          </Modal>

          <Space h={20} />
          <Divider
            size={10}
            label="Additional Information"
            labelPosition="center"
          />
          <Space h={10} />
          <div>
            {additionals?.length > 0 ? (
              <div className="space-y-4">
                {additionals?.map((additional, i) => (
                  <Additional
                    key={i}
                    additional={additional}
                    onRemove={() => handleRemoveAdditional(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
                <Text>No additional information added yet.</Text>
              </div>
            )}

            <Button
              onClick={() => setAdditionalModal(true)}
              mt={24}
              fullWidth
              size="xs"
              color="dark"
              variant="outline"
            >
              <IconPlus size={12} style={{ marginRight: 12 }} /> Add more info
            </Button>
          </div>

          <Modal
            opened={additonalModal}
            onClose={() => {
              setAdditionalModal(false);
              setAdditional(() => {
                return {
                  label: "",
                  value: null,
                };
              });
            }}
            title={
              <h1 className="py-6 px-3 font-bold text-[1.5rem]">
                Add more information
              </h1>
            }
            centered
            transitionProps={{ transition: "fade", duration: 200 }}
          >
            <div className="p-8 space-y-8">
              <TextInput
                placeholder="ex. Weight , warranty"
                label="Label"
                value={additional?.label}
                onChange={(e) => {
                  setAdditional((additional) => {
                    return {
                      ...additional,
                      label: e.target.value,
                    };
                  });
                }}
              />
              <TextInput
                placeholder="ex. 0.3kg , 2 years"
                label="Value"
                value={additional?.value}
                onChange={(e) => {
                  setAdditional((additional) => {
                    return {
                      ...additional,
                      value: e.target.value,
                    };
                  });
                }}
              />

              <Button
                fw="lighter"
                uppercase
                color="dark"
                fullWidth
                onClick={saveAdditional}
                loading={loadingAdditional}
              >
                save additional information
              </Button>
            </div>
          </Modal>

          <Space h={20} />
          <Button
            fw="lighter"
            uppercase
            color="dark"
            fullWidth
            onClick={saveProduct}
            loading={loading}
          >
            save product
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Admins = ({ _admin }) => {
  const GET_ADMINS = `
      query GET_ADMINS{
        getAdmins{
          id
          name
          email
          levelClearance
          phoneNumber
          createdAt
        }
      }
  `;
  const CREATE_ADMIN = `
    mutation CREATE_ADMIN(
      $name: String
      $email: String
      $levelClearance : String
    ){
      createAdmin(
        name: $name
        email: $email
        levelClearance : $levelClearance
      ){
        id
        name
      }
    }
  `;

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_ADMINS,
  });
  const [_, _createAdmin] = useMutation(CREATE_ADMIN);

  const [addModal, setAddModal] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const [permissionModal, setPermissionModal] = useState(false);

  const [keyword, setKeyword] = useState("");

  const handleCloseModal = () => {
    setAdmin({
      name: "",
      email: "",
      role: "",
    });
    setPopoverOpen(false);
    setLoading(false);
    setAddModal(false);
  };

  const saveAdmin = () => {
    let { name, email, role } = admin;

    if (!name || !email || !role) {
      notifications.show({
        color: "orange",
        title: "Field required",
        message: "You must fill all the fields to create a new admin",
      });
      return;
    }

    setLoading(true);

    _createAdmin({
      name,
      email,
      levelClearance: role,
    })
      .then((data, error) => {
        if (data?.data?.createAdmin && !error) {
          notifications.show({
            title: "Admin created successfully",
            icon: <IconCheck />,
            color: "green",
            message:
              "New admin can now login with email and the default password for new admins",
          });
          handleCloseModal();
        } else {
          notifications.show({
            title: "Error",
            icon: <IconExclamationMark />,
            color: "red",
            message: "Something occured. We couldn't create new admin",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
        reexecuteQuery();
      });
  };

  return (
    <div className="space-y-6 py-6 relative overflow-y-auto">
      <div className="space-y-3">
        <Input
          icon={<IconSearch size={16} />}
          variant="filled"
          placeholder="Search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <p className="text-[0.8rem] ">
          {data?.getAdmins
            ? data?.getAdmins.filter((admin) => {
                if (keyword == "is:super-admin") {
                  return admin.levelClearance == "super-admin";
                } else if (keyword == "is:order-dispatcher") {
                  return admin.levelClearance == "order-dispatcher";
                } else if (keyword == "is:general") {
                  return admin.levelClearance == "general";
                } else {
                  return (
                    admin.name
                      ?.toLowerCase()
                      .includes(keyword?.toLowerCase()) ||
                    admin.email
                      ?.toLowerCase()
                      .includes(keyword?.toLowerCase()) ||
                    admin.phoneNumber
                      ?.toLowerCase()
                      .includes(keyword?.toLowerCase())
                  );
                }
              }).length
            : `...`}{" "}
          result (s)
        </p>
      </div>

      <div className="max-h-[calc(100vh-310px)] overflow-y-auto ">
        {fetching && <p>Loading...</p>}
        {error && <p>Error...</p>}
        <Accordion>
          {data?.getAdmins
            .filter((admin) => {
              if (keyword == "is:super-admin") {
                return admin.levelClearance == "super-admin";
              } else if (keyword == "is:order-dispatcher") {
                return admin.levelClearance == "order-dispatcher";
              } else if (keyword == "is:general") {
                return admin.levelClearance == "general";
              } else {
                return (
                  admin.name?.toLowerCase().includes(keyword?.toLowerCase()) ||
                  admin.email?.toLowerCase().includes(keyword?.toLowerCase()) ||
                  admin.phoneNumber
                    ?.toLowerCase()
                    .includes(keyword?.toLowerCase())
                );
              }
            })
            .map((admin, i) => (
              <AdminCard
                key={i}
                admin={admin}
                me={_admin}
                refresh={reexecuteQuery}
              />
            ))}
        </Accordion>
      </div>

      <Button
        h={56}
        w={56}
        p={0}
        color="dark"
        onClick={() => {
          if (_admin?.levelClearance !== "super-admin") {
            setPermissionModal(true);
            return;
          }
          setAddModal(true);
        }}
        style={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <IconPlus />
      </Button>

      <Modal
        opened={permissionModal}
        onClose={() => setPermissionModal(false)}
        centered
      >
        <div className="w-full">
          <img src="/access_denied.jpg" />

          <h1 className="w-full text-center">Access denied</h1>
          <p className="mt-8 mb-8 w-full px-12 text-center">
            You need <Kbd>super-admin</Kbd> identification to add new admins
          </p>
        </div>
      </Modal>

      <Modal
        opened={addModal}
        onClose={handleCloseModal}
        withCloseButton={false}
        fullScreen
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <div className="flex justify-between">
          <h1 className="py-6 px-3 font-bold text-[1.5rem]">Add admin</h1>
          <Popover
            width={280}
            shadow="md"
            opened={popoverOpen}
            onChange={setPopoverOpen}
          >
            <Popover.Target>
              <Button
                onClick={() => setPopoverOpen((o) => !o)}
                color="gray"
                variant="subtle"
                mt={24}
              >
                <IconX />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" fw="bold">
                Discard inputs?{" "}
              </Text>
              <div className="flex justify-between mt-8 space-x-12">
                <Button
                  onClick={handleCloseModal}
                  color="dark"
                  fw="lighter"
                  uppercase
                  fullWidth
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setAddModal(false);
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
        </div>
        <div className="space-y-6 px-2 mt-6">
          <TextInput
            placeholder="Admin name"
            label="Admin name"
            withAsterisk
            value={admin?.name}
            onChange={(e) => {
              setAdmin((admin) => {
                return {
                  ...admin,
                  name: e.target.value,
                };
              });
            }}
          />
          <TextInput
            placeholder="Admin email"
            label="Admin email"
            error={
              /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
                admin?.email
              ) || !admin?.email
                ? null
                : "Invalid email"
            }
            withAsterisk
            rightSection={<IconMail color="gray" size={16} />}
            value={admin?.email}
            onChange={(e) => {
              setAdmin((admin) => {
                return {
                  ...admin,
                  email: e.target.value,
                };
              });
            }}
          />

          <Space h={10} />
          <Divider size={10} label="Role & Access" labelPosition="center" />
          <Space h={10} />

          <Radio.Group
            onChange={(val) =>
              setAdmin((admin) => {
                return {
                  ...admin,
                  role: val,
                };
              })
            }
          >
            <div className="space-y-6">
              <Radio
                value="super-admin"
                label={
                  <div>
                    <Text fw="bold" mb={12}>
                      Super admin
                    </Text>
                    <div className="block space-y-2">
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Adding ,
                        modifying & deleting products
                      </span>
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Admin
                        addition & deleting
                      </span>
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Order
                        dispatching
                      </span>
                    </div>
                  </div>
                }
              />
              <Radio
                value="order-dispatcher"
                label={
                  <div>
                    <Text fw="bold" mb={12}>
                      Order dispatcher
                    </Text>
                    <div className="block space-y-2">
                      <span className="block">
                        <IconLock size={16} className="inline" /> Adding ,
                        modifying & deleting products
                      </span>
                      <span className="block">
                        <IconLock size={16} className="inline" /> Admin addition
                        & deleting
                      </span>
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Order
                        dispatching
                      </span>
                    </div>
                  </div>
                }
              />
              <Radio
                value="general"
                label={
                  <div>
                    <Text fw="bold" mb={12}>
                      General
                    </Text>
                    <div className="block space-y-2">
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Adding ,
                        modifying & deleting products
                      </span>
                      <span className="block">
                        <IconLock size={16} className="inline" /> Admin addition
                        & deleting
                      </span>
                      <span className="block">
                        <IconCheck size={16} className="inline" /> Order
                        dispatching
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
          </Radio.Group>

          <Button
            fw="lighter"
            uppercase
            color="dark"
            fullWidth
            onClick={saveAdmin}
            loading={loading}
          >
            save admin
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Dashboard = ({ admin }) => {
  const GET_STAT_PAGE = `
    query GET_STAT_PAGE{
      getStatPage{
        totalOrders
    totalProducts
    totalSales
    chartData {
      label
      value
    }
    fastestMoving {
      ordersPerMonth
      product {
        id
        name
        description
        category
        images
        variants{
          price
          label
          sale{
            startTime
            endTime
            salePrice
          }
          available
        }
        additionalInformation{
          label
          value
        }  
        createdAt
        deleted
      }
    }
    slowestMoving {
      ordersPerMonth
      product {
        id
        name
        description
        category
        images
        variants{
          price
          label
          sale{
            startTime
            endTime
            salePrice
          }
          available
        }
        additionalInformation{
          label
          value
        }  
        createdAt
        deleted
      }
    }
      }
    }
  `;

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_STAT_PAGE,
  });

  console.log(error);

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;

  return (
    <div className="py-6 space-y-8 no-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 space-y-2 md:space-y-0">
        <Statistic
          value={`Ksh. ${data?.getStatPage?.totalSales
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
          label="Total Sales"
          color="green"
          icon={<IconWallet size={"2rem"} />}
        />
        <Statistic
          value={data?.getStatPage?.totalOrders}
          label="Total Complete Orders"
          icon={<IconBoxSeam size={"2rem"} />}
          color="orange"
        />
        <Statistic
          value={data?.getStatPage?.totalProducts}
          label="Total Products"
          color="blue"
          icon={<Icon123 size={"2rem"} />}
        />
      </div>

      <div className="md:flex md:gap-4">
        <div className="md:w-2/3">
          <Card shadow="sm" padding="xs" radius="md" withBorder>
            <p className="text-[0.8rem] text-gray-600">Sales Statistics</p>
            <DynamicBar data={data?.getStatPage?.chartData} />
          </Card>
        </div>

        <div className="md:w-1/3">
          <Card shadow="sm" padding="xs" radius="md" withBorder>
            <p className="text-[0.8rem] text-gray-600">Visitors</p>
          </Card>
        </div>
      </div>

      <div className="md:flex md:gap-4">
        <div className="md:w-1/2">
          <Card shadow="sm" padding="xs" radius="md" withBorder>
            <p className="text-[0.8rem] text-gray-600">
              Fastest moving products
            </p>
            <div className="p-4 max-h-[400px] overflow-y-auto mt-6">
              {data?.getStatPage?.fastestMoving.map((moving, i) => (
                <MovingProduct
                  key={i}
                  opm={moving?.ordersPerMonth}
                  product={moving?.product}
                  admin={admin}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="md:w-1/2">
          <Card shadow="sm" padding="xs" radius="md" withBorder>
            <p className="text-[0.8rem] text-gray-600">
              Slowest moving products
            </p>
            <div className="p-4 max-h-[400px] overflow-y-auto mt-6">
              {data?.getStatPage?.slowestMoving.map((moving, i) => (
                <MovingProduct
                  key={i}
                  opm={moving?.ordersPerMonth}
                  product={moving?.product}
                  color="red"
                  admin={admin}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MovingProduct = ({ product, opm, color, admin }) => {
  const [productModal, setProductModal] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const UPDATE_PRODUCT = `
    mutation UPDATE_PRODUCT(
        $id: ID
        $name: String
        $description: String,
        $variants: String
        $additionalInformation: String       
        $available: Boolean
        $sale: String
        $deleted: Boolean
    ){
      updateProduct(
        id: $id
        name: $name
        description: $description        
        variants: $variants
        additionalInformation: $additionalInformation    
        available: $available
        sale: $sale
        deleted: $deleted
      ){
        id
      }
    }
  `;

  const [_, _updateProduct] = useMutation(UPDATE_PRODUCT);

  const removeProduct = () => {
    setLoadingDelete(true);
    if (password !== admin?.password) {
      notifications.show({
        color: "red",
        title: "Incorrect password",
      });
      return;
    }

    _updateProduct({
      id: product?.id,
      deleted: true,
    }).then((data, error) => {
      if (data?.data?.updateProduct && !error) {
        notifications.show({
          title: "Product deleted",
          icon: <IconCheck />,
          color: "green",
          message:
            "Your customers can no longer shop this product and all its variants",
        });
        setLoadingDelete(false);
        setProductModal(false);
      } else {
        notifications.show({
          title: "Error",
          icon: <IconExclamationMark />,
          color: "red",
          message:
            "Something occured. We couldn't delete this product at the moment",
        });
        setLoadingDelete(false);
      }
    });
  };

  const calculatePercentageDifference = (price, salePrice) => {
    return ((price - salePrice) / price) * 100;
  };

  const findLargestPercentageDifference = () => {
    let largestDifference = 0;

    product?.variants.forEach((variant) => {
      const { price, sale } = variant;

      if (isOnSale(variant)) {
        const percentageDifference = calculatePercentageDifference(
          price,
          sale?.salePrice
        );

        if (percentageDifference > largestDifference) {
          largestDifference = percentageDifference;
        }
      }
    });

    return largestDifference;
  };

  return (
    <div className="p-2 border-b-[1px] border-b-gray-300 flex justify-between relative">
      <div>
        <Text lineClamp={1}>{product?.name}</Text>
        <span className="flex space-x-2">
          <Badge color={color}>{opm} orders per month</Badge>
          {product?.deleted && <Badge color="red">Deleted</Badge>}
          {findLargestPercentageDifference() != 0 && (
            <Badge color="orange">
              On sale , -{findLargestPercentageDifference().toFixed(0)}%
            </Badge>
          )}
        </span>
      </div>
      <Button
        onClick={() => setProductModal(true)}
        style={{ color: "#0E5AA6" }}
        fw="lighter"
        variant="subtle"
      >
        View
      </Button>
      <Modal
        opened={productModal}
        onClose={() => setProductModal(false)}
        centered
        withCloseButton={false}
      >
        <div className="flex justify-between">
          <h1 className="py-6 px-3 font-bold text-[1.5rem]">Product</h1>
          <Button
            onClick={() => setProductModal((o) => !o)}
            color="gray"
            variant="subtle"
            mt={24}
          >
            <IconX />
          </Button>
        </div>
        <Tabs
          color="dark"
          unstyled
          styles={(theme) => ({
            tabsList: {
              display: "flex",
              maxWidth: "100%",
              overflowX: "auto",
              scrollbarWidth: "none",
            },
            tabPanel: {
              background: "yellow",
            },
            tab: {
              ...theme.fn.focusStyles(),
              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
              cursor: "pointer",
              fontSize: theme.fontSizes.sm,
              display: "flex",
              alignItems: "center",
              fontFamily: "Satoshi",
              borderBottomColor: "light-gray",
              borderBottomWidth: 0.5,
              "&[data-active]": {
                borderBottomColor: "black",
                borderBottomWidth: 2,
              },
            },
          })}
          defaultValue="meta"
        >
          <Tabs.List>
            <Tabs.Tab value="meta">Metadata</Tabs.Tab>
            <Tabs.Tab value="removal">Removal</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="meta">
            <div className="mt-[15px]">
              <Metadata
                data={product}
                setModalOpen={setModalOpen}
                _updateProduct={_updateProduct}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="sales">Second panel</Tabs.Panel>
          <Tabs.Panel value="availability">
            <div className="mt-[15px] space-y-6">
              <Card shadow="sm" padding="sm" radius="md" withBorder>
                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>Make product unavailable</Text>
                  <Switch
                    color="red"
                    checked={unavailable}
                    onChange={(e) => setUnavailable(e.target.checked)}
                  />
                </Group>
              </Card>

              <Text>
                When enabled , your shoppers can no longer shop this product
                until you disable it.
              </Text>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="removal">
            <div className="mt-[15px] space-y-6">
              <Text>Type your password to remove this product</Text>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                loading={loadingDelete}
                color="red"
                fullWidth
                fw="lighter"
                uppercase
                onClick={removeProduct}
              >
                Remove product
              </Button>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </div>
  );
};

const Metadata = ({ data, _updateProduct, setModalOpen }) => {
  const variantThumbnail = useRef();

  const [variantModal, setVariantModal] = useState(false);
  const [additonalModal, setAdditionalModal] = useState(false);

  const [variants, setVariants] = useState(data?.variants);
  const [additionals, setAdditionals] = useState(data?.additionalInformation);
  const [product, setProduct] = useState({
    name: data?.name,
    description: data?.description,
  });

  const [loadingVariant, setLoadingVariant] = useState(false);
  const [loadingAdditional, setLoadingAdditional] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [variant, setVariant] = useState({
    label: "",
    thumbnail: null,
    price: 0,
  });

  const [additional, setAdditional] = useState({
    label: "",
    value: null,
  });

  const handleRemoveVariant = (index) => {
    setVariants((variants) => {
      let filter = variants.filter((_, i) => i !== index);
      return [...filter];
    });
  };

  const handleRemoveAdditional = (index) => {
    setAdditionals((additional) => {
      let filter = additional.filter((_, i) => i !== index);
      return [...filter];
    });
  };

  const saveVariant = () => {
    setLoadingVariant(true);
    let isValid = (variant?.label || variant?.thumbnail) && variant?.price;

    if (isValid) {
      setVariants((variants) => {
        if (variants.some((e) => e.label === variant?.label)) {
          alert("Variant alredy exists");
          return;
        }
        return [...variants, variant];
      });
      setLoadingVariant(false);
    }

    if (!isValid) {
      alert("Missing variant label or price ");
      setLoadingVariant(false);
      return;
    }
    setVariantModal(false);
    setVariant(() => {
      return {
        label: "",
        thumbnail: null,
        price: 0,
      };
    });
  };

  const saveAdditional = () => {
    setLoadingAdditional(true);
    let isValid = additional?.label && additional?.value;

    if (isValid) {
      setAdditionals((additionals) => {
        if (additionals.some((e) => e.label === additional?.label)) {
          alert("Label already exists");
          return;
        }
        return [...additionals, additional];
      });
      setLoadingAdditional(false);
    }

    if (!isValid) {
      alert("Missing label or value ");
      setLoadingAdditional(false);
      return;
    }
    setAdditionalModal(false);
    setAdditional(() => {
      return {
        label: "",
        value: null,
      };
    });
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let base64;
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        base64 = reader.result;
        resolve(base64);
      };
      reader.onerror = () => {
        reject(null);
      };
    });
  };

  const updateProduct = async () => {
    setUpdateLoading(true);

    let _variants_ = [];

    for (let _variant of variants) {
      if (_variant?.thumbnail) {
        let i_b64 = await getBase64(_variant?.thumbnail);
        let _v = {
          thumbnail: i_b64,
          label: _variant?.label,
          price: _variant?.price,
        };
        _variants_.push(_v);
      } else {
        let _v = {
          thumbnail: null,
          label: _variant?.label,
          sale: _variant?.sale,
          available: _variant?.available,
          price: _variant?.price,
        };
        _variants_.push(_v);
      }
    }

    let _product = {
      id: data?.id,
      name: product?.name,
      description: product?.description,
      variants: JSON.stringify(_variants_),
      additionalInformation: JSON.stringify(additionals),
    };

    console.log(_product);

    _updateProduct({
      ..._product,
    })
      .then((data, error) => {
        if (data?.data?.updateProduct && !error) {
          notifications.show({
            title: "Product updated successfully",
            icon: <IconCheck />,
            color: "green",
            message:
              "Your customers can now shop this product with updated content",
          });
          handleCloseModal();
        } else {
          console.log(error);
          notifications.show({
            title: "Error",
            icon: <IconExclamationMark />,
            color: "red",
            message: "Something occured. We couldn't update this product",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const handleCloseModal = () => {
    setProduct({
      name: "",
      description: "",
    });

    setAdditional({
      label: "",
      value: null,
    });
    setVariant({
      label: "",
      thumbnail: null,
      price: 0,
    });

    setModalOpen(false);
  };

  return (
    <div>
      <div>
        <Carousel
          infiniteLoop
          showIndicators={false}
          showThumbs={false}
          showStatus={false}
          autoPlay
        >
          {data?.images?.map((image, i) => (
            <div key={i}>
              <img className="w-full h-[200px] object-contain" src={image} />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="space-y-4">
        <Space h={30} />
        <Divider size={10} label="Basic Information" labelPosition="center" />
        <div>
          <label className="font-medium">Name</label>
          <EditText
            style={{ border: "1px solid green" }}
            value={product?.name}
            onChange={(e) =>
              setProduct((product) => {
                return {
                  ...product,
                  name: e.target.value,
                };
              })
            }
          />
        </div>
        <div>
          <label className="font-medium">Description</label>
          <EditTextarea
            style={{ border: "1px solid green" }}
            value={product?.description}
            onChange={(e) =>
              setProduct((product) => {
                return {
                  ...product,
                  description: e.target.value,
                };
              })
            }
          />
        </div>

        <label className="font-medium block">Category</label>
        <Badge>{data?.category}</Badge>
      </div>

      <div>
        <Space h={50} />
        <Divider size={10} label="Variants & Price" labelPosition="center" />
        <Space h={20} />
        <div>
          {variants?.length > 0 ? (
            <div className="space-y-4">
              {variants?.map((variant, i) => (
                <Variant
                  key={i}
                  variant={variant}
                  onRemove={() => handleRemoveVariant(i)}
                  updateVariantInfo={(sale) => {
                    console.log(sale);
                    setVariants((prevVariants) =>
                      prevVariants.map((variant, index) =>
                        index === i ? { ...variant, sale } : variant
                      )
                    );
                  }}
                  updateAvailable={(val) =>
                    setVariants((prevVariants) =>
                      prevVariants.map((variant, index) =>
                        index === i ? { ...variant, available: val } : variant
                      )
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
              <Text>No variant added yet.</Text>
            </div>
          )}

          <Button
            onClick={() => setVariantModal(true)}
            mt={24}
            fullWidth
            size="xs"
            color="dark"
            variant="outline"
          >
            <IconPlus size={12} style={{ marginRight: 12 }} /> Add variant
          </Button>
        </div>

        <Modal
          opened={variantModal}
          onClose={() => {
            setVariantModal(false);
            setVariant(() => {
              return {
                label: "",
                thumbnail: null,
                price: 0,
              };
            });
          }}
          title={
            <h1 className="py-6 px-3 font-bold text-[1.5rem]">Add variant</h1>
          }
          centered
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          <div className="p-8 space-y-8">
            <img src="/variant.png" className="mx-auto" />
            <input
              type="file"
              ref={variantThumbnail}
              className="hidden"
              onChange={(e) => {
                setVariant((variant) => {
                  return {
                    ...variant,
                    thumbnail: e.target.files[0],
                  };
                });
              }}
            />
            {variant?.thumbnail && (
              <div className="p-8 relative w-[90%]">
                <img
                  src={URL.createObjectURL(variant?.thumbnail)}
                  alt="product"
                  className="aspect-auto"
                />
                <button
                  onClick={() =>
                    setVariant((variant) => {
                      return {
                        ...variant,
                        thumbnail: null,
                      };
                    })
                  }
                  className="absolute top-0 right-0 h-[40px] w-[40px] bg-red-800 rounded-full text-white m-0 p-0"
                >
                  <IconX className="mx-auto" />
                </button>
              </div>
            )}
            <Button
              fw="lighter"
              uppercase
              color="dark"
              variant="outline"
              fullWidth
              size="xs"
              onClick={() => variantThumbnail.current.click()}
            >
              <IconPlus size={12} style={{ marginRight: 12 }} /> Upload
              thumbnail
            </Button>
            <TextInput
              placeholder="ex. L ,S"
              label="Variant label"
              value={variant?.label}
              onChange={(e) => {
                setVariant((variant) => {
                  return {
                    ...variant,
                    label: e.target.value,
                  };
                });
              }}
            />
            <NumberInput
              label="Variant price"
              defaultValue={0}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              value={variant?.price}
              onChange={(val) => {
                setVariant((variant) => {
                  return {
                    ...variant,
                    price: val,
                  };
                });
              }}
            />
            <Button
              fw="lighter"
              uppercase
              color="dark"
              fullWidth
              onClick={saveVariant}
              loading={loadingVariant}
            >
              save variant
            </Button>
          </div>
        </Modal>
      </div>

      <div>
        <Space h={50} />
        <Divider
          size={10}
          label="Additional Information"
          labelPosition="center"
        />
        <Space h={20} />
        <div>
          {additionals?.length > 0 ? (
            <div className="space-y-4">
              {additionals?.map((additional, i) => (
                <Additional
                  key={i}
                  additional={additional}
                  onRemove={() => handleRemoveAdditional(i)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 border-t-2 border-[#0E5AA6]">
              <Text>No additional information added yet.</Text>
            </div>
          )}

          <Button
            onClick={() => setAdditionalModal(true)}
            mt={24}
            fullWidth
            size="xs"
            color="dark"
            variant="outline"
          >
            <IconPlus size={12} style={{ marginRight: 12 }} /> Add more info
          </Button>
        </div>

        <Modal
          opened={additonalModal}
          onClose={() => {
            setAdditionalModal(false);
            setAdditional(() => {
              return {
                label: "",
                value: null,
              };
            });
          }}
          title={
            <h1 className="py-6 px-3 font-bold text-[1.5rem]">
              Add more information
            </h1>
          }
          centered
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          <div className="p-8 space-y-8">
            <TextInput
              placeholder="ex. Weight , warranty"
              label="Label"
              value={additional?.label}
              onChange={(e) => {
                setAdditional((additional) => {
                  return {
                    ...additional,
                    label: e.target.value,
                  };
                });
              }}
            />
            <TextInput
              placeholder="ex. 0.3kg , 2 years"
              label="Value"
              value={additional?.value}
              onChange={(e) => {
                setAdditional((additional) => {
                  return {
                    ...additional,
                    value: e.target.value,
                  };
                });
              }}
            />

            <Button
              fw="lighter"
              uppercase
              color="dark"
              fullWidth
              onClick={saveAdditional}
              loading={loadingAdditional}
            >
              save additional information
            </Button>
          </div>
        </Modal>
      </div>
      <Space h={50} />
      <Button
        fw="lighter"
        uppercase
        color="dark"
        fullWidth
        onClick={updateProduct}
        loading={updateLoading}
      >
        update product
      </Button>
    </div>
  );
};

const Orders = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);

  const GET_ORDERS = `
    query GET_ORDERS{
      getAllOrders{
        id
        items{
          product{
            name
            images
            variants{
              label
              price
              thumbnail
            }
          }
          variant
          salePrice
          quantity
        }
        customer{
          name
          email
          phoneNumber
        }
        deliveryLocation  {
          lat
          lng
        }
        payment{
          code
          timestamp    
          amount
        }
        createdAt
        deliveryTimestamp
        dispatchTimestamp
        pickUpTimestamp
      }
    }
  `;

  useEffect(() => {
    if (dateRange[1]) {
      setStartTimestamp(new Date(dateRange[0]).getTime());
      setEndTimestamp(new Date(dateRange[1]).getTime());
    }
    if (!dateRange[0] && !dateRange[1]) {
      setStartTimestamp(null);
      setEndTimestamp(null);
    }
  }, [dateRange]);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_ORDERS,
  });

  if (fetching) return <p>Fetching...</p>;
  if (error) return <p>Error...</p>;

  const getInProcessing = () => {
    return data?.getAllOrders
      ?.filter(
        (order) =>
          !order?.deliveryTimestamp &&
          !order?.dispatchTimestamp &&
          !order?.pickUpTimestamp
      )
      .filter((order) => {
        if (startTimestamp && endTimestamp) {
          return (
            parseInt(order?.createdAt) >= startTimestamp &&
            parseInt(order?.createdAt) <= endTimestamp
          );
        }
        return order;
      }).length;
  };

  const getInTransit = () => {
    return data?.getAllOrders
      ?.filter(
        (order) =>
          !order?.deliveryTimestamp &&
          order?.dispatchTimestamp &&
          !order?.pickUpTimestamp
      )
      .filter((order) => {
        if (startTimestamp && endTimestamp) {
          return (
            parseInt(order?.createdAt) >= startTimestamp &&
            parseInt(order?.createdAt) <= endTimestamp
          );
        }
        return order;
      }).length;
  };

  const getDelivered = () => {
    return data?.getAllOrders
      ?.filter(
        (order) =>
          (order?.deliveryTimestamp || order?.pickUpTimestamp) &&
          order?.dispatchTimestamp
      )
      .filter((order) => {
        if (startTimestamp && endTimestamp) {
          return (
            parseInt(order?.createdAt) >= startTimestamp &&
            parseInt(order?.createdAt) <= endTimestamp
          );
        }
        return order;
      }).length;
  };

  return (
    <div className="space-y-6">
      <Group style={{ width: "100%" }} position="center">
        <DatePickerInput
          type="range"
          placeholder="Pick dates range"
          value={dateRange}
          onChange={setDateRange}
          clearable
          style={{ width: "90%" }}
        />
      </Group>
      <div className="flex max-w-full overflow-x-auto gap-6 md:grid md:grid-cols-3">
        <Statistic
          value={getInProcessing()}
          label={"In processing"}
          color="orange"
          icon={<IconHomeCog size={"2rem"} />}
        />
        <Statistic
          value={getInTransit()}
          label={"In transit"}
          color="blue"
          icon={<IconTruckDelivery size={"2rem"} />}
        />
        <Statistic
          value={getDelivered()}
          label={"Delivered"}
          color="green"
          icon={<IconCheckupList size={"2rem"} />}
        />
      </div>
      <Divider />

      <div className="space-y-3">
        {data?.getAllOrders
          .filter((order) => {
            if (startTimestamp && endTimestamp) {
              return (
                parseInt(order?.createdAt) >= startTimestamp &&
                parseInt(order?.createdAt) <= endTimestamp
              );
            }
            return order;
          })
          .sort((a, b) => Number(b?.createdAt) - Number(a?.createdAt))
          .map((order, i) => (
            <OrderAdmin key={i} order={order} refresh={reexecuteQuery} />
          ))}
      </div>
    </div>
  );
};

const Statistic = ({ value, label, icon, color }) => {
  return (
    <div className="col-span-1">
      <Card
        shadow="sm"
        padding="xs"
        radius="md"
        withBorder
        style={{ minWidth: 200 }}
      >
        <div className="flex space-x-4">
          {icon && (
            <ActionIcon color={color} variant="light" size={58}>
              {icon}
            </ActionIcon>
          )}
          <div>
            <h1 className="font-bold text-[1.5rem]">{value}</h1>
            <p className="font-light text-[0.8rem] text-gray-700">{label}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const Transactions = () => {
  const formatPhoneNumber = (phoneNumber) => {
    const digitsOnly = phoneNumber?.replace(/\D/g, "");

    const countryCode = digitsOnly?.slice(0, 3);

    const remainingDigits = digitsOnly?.slice(3);
    const groupedDigits = remainingDigits?.replace(/(\d{3})/g, "$1 ");

    const formattedNumber = `${countryCode} ${groupedDigits?.trim()}`;
    return formattedNumber;
  };

  const { query, refine, clear } = useSearchBox();

  const Hit = ({ hit }) => {
    return (
      <div className="mb-6">
        <Card shadow="sm" padding="xs" radius="md" withBorder>
          <Group position="apart" mt="md" mb="xs">
            <Badge color="green" variant="light" size="lg">
              {hit?.code}
            </Badge>
            <Text fw="lighter">
              {hit?.createdAt
                ? Date.now() - new Date(hit?.createdAt).getTime() >
                  24 * 60 * 60 * 1000
                  ? moment(new Date(hit?.createdAt)).format("Do MMMM, YYYY")
                  : (Date.now() - new Date(hit?.createdAt).getTime()) /
                      (1000 * 60) <
                    60
                  ? moment(new Date(hit?.createdAt)).startOf("minute").fromNow()
                  : (Date.now() - new Date(hit?.createdAt).getTime()) /
                      (1000 * 60 * 24) <
                      24 &&
                    moment(new Date(hit?.createdAt)).startOf("hour").fromNow()
                : null}
            </Text>
          </Group>
          <div className="flex justify-between">
            <Text fw="lighter">+{formatPhoneNumber(hit?.phoneNumber)}</Text>
            <Text weight={700} color="green" fz={"lg"}>
              + Ksh.{" "}
              {hit?.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </Text>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Group style={{ width: "100%" }} position="center">
        <Input
          style={{ width: "100%" }}
          icon={<IconSearch size="1rem" />}
          placeholder="Search phone number ex. 254..."
          onChange={(e) => refine(e.target.value)}
        />
      </Group>

      <div className="space-y-3">
        <Hits hitComponent={Hit} />
      </div>
    </div>
  );
};

// const Sections = () => {
//   return <div>sections</div>;
// };
