import { Carousel } from "react-responsive-carousel";
import { Footer, Logoheader, ProductCard, Review } from "../../components";
import {
  Accordion,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Radio,
  Skeleton,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronRight,
  IconExclamationCircle,
} from "@tabler/icons";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "urql";
import { notifications } from "@mantine/notifications";
import { Userdatacontext } from "../../context/userdata";

import { signIn, useSession } from "next-auth/react";
import { Configure, InstantSearch, useHits } from "react-instantsearch";
import { searchClient } from "../_app";
import { isOnSale } from "../../components/productcard";

const LoadingComponent = () => (
  <div>
    <Logoheader />
    <div className="mt-[80px] relative md:flex">
      <div className="space-y-4">
        <Skeleton height={430} mb="xl" />
        <div className="p-4 space-y-4">
          <Skeleton height={80} width={80} mb="xl" />
          <Skeleton height={18} width="40%" />
          <Skeleton height={32} mt={6} radius="md" width="80%" />
          <Skeleton height={24} mt={6} width="30%" />
          <Skeleton height={50} mt={6} width="100%" />
          <br />
          <Skeleton height={24} mt={6} width="100%" />
          <Skeleton height={16} mt={6} width="20%" radius="md" />
        </div>
      </div>
    </div>
  </div>
);

export default function Product() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: userData } = useContext(Userdatacontext);

  const GET_PRODUCT = `
      query GET_PRODUCT(
        $id: ID
      ){
        getProduct(
          id: $id
        ){
          name
          description
          category
          images
          variants{
            thumbnail
            price
            label
            sale {
              salePrice
              startTime
              endTime
            }
            available
          }
          additionalInformation{
            label
            value
          }
          reviews{
            name
            rating
            timestamp
            message
          }
          createdAt
        }
      }
  `;

  const ADD_TO_CART = `
      mutation ADD_TO_CART(
        $product : ID
        $variant: String
        $customer: String
      ){
        addToCart(
          customer: $customer
          product: $product
          variant: $variant
        ){
          id
        }
      }
  `;

  const [_, _addToCart] = useMutation(ADD_TO_CART);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_PRODUCT,
    variables: {
      id: router?.query?.id,
    },
  });

  const [lineClamp, setLineClamp] = useState(2);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState();

  if (fetching) return <LoadingComponent />;
  if (error) return <p>Error...</p>;

  let product = data?.getProduct;
  let sortedVariants = product?.variants.sort((a, b) => a.price - b.price);

  const getPriceLabel = () => {
    if (product) {
      const prices = product?.variants.map((obj) =>
        isOnSale(obj) ? obj?.sale?.salePrice : obj?.price
      );
      const allSame = prices.every((price) => price === prices[0]);

      return prices.length == 1
        ? `Ksh. ${prices[0]}`
        : prices.length > 1 && allSame
        ? `Ksh. ${prices[0]}`
        : `Ksh. ${Math.min(...prices)} - ${Math.max(...prices)}`;
    }
    return "";
  };

  const handleAddToCart = () => {
    if (product?.variants.length > 1 && !variant && !drawerOpen) {
      setDrawerOpen(true);
      return;
    }

    if (!variant && product?.variants?.length > 1 && drawerOpen) {
      notifications.show({
        title: "Select a variant to add to cart",
        color: "orange",
      });
      return;
    }

    if (variant && product?.variants.length > 1) {
      setLoading(true);
      if (session) {
        _addToCart({
          customer: session.user.email,
          product: router?.query?.id,
          variant,
        })
          .then((data, error) => {
            console.log(
              {
                customer: session.user.email,
                product: router?.query?.id,
                variant,
              },
              data,
              error
            );
            if (data?.data?.addToCart && !error) {
              notifications.show({
                title: "Product added to cart",
                icon: <IconCheck />,
                color: "green",
              });
              handleCloseDrawer();
            } else {
              notifications.show({
                title: "Something occured",
                icon: <IconExclamationCircle />,
                color: "red",
              });
              setLoading(false);
            }
          })
          .catch((err) => {
            notifications.show({
              title: "Something occured",
              icon: <IconExclamationCircle />,
              color: "red",
            });
            setLoading(false);
          });
      } else {
        signIn();
      }
    }

    if (product?.variants.length == 1) {
      setLoading(true);
      if (session) {
        _addToCart({
          customer: session.user.email,
          product: router?.query?.id,
          variant: product?.variants[0]?.label,
        })
          .then((data, error) => {
            if (data?.data?.addToCart && !error) {
              notifications.show({
                title: "Product added to cart",
                icon: <IconCheck />,
                color: "green",
              });
              handleCloseDrawer();
            } else {
              notifications.show({
                title: "Something occured",
                icon: <IconExclamationCircle />,
                color: "red",
              });
              setLoading(false);
            }
          })
          .catch((err) => {
            notifications.show({
              title: "Something occured",
              icon: <IconExclamationCircle />,
              color: "red",
            });
            setLoading(false);
          });
      } else {
        signIn();
      }
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setLoading(false);
    setVariant();
  };

  return (
    <div>
      <Logoheader />
      <div className="mt-[80px] relative md:flex">
        <div className="md:w-1/2">
          <Carousel
            showThumbs={true}
            showStatus={false}
            autoPlay
            infiniteLoop
            showIndicators={false}
          >
            {product?.images.map((image, i) => (
              <div key={i}>
                <img src={image} className="w-full" />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="p-4 space-y-8 md:w-1/2">
          <div className="space-y-3">
            <p className="opacity-70 text-gray-600 text-[0.9rem] mb-2">
              {product?.category}
            </p>
            <Text fz="lg" lineClamp={2} className="text-[#2c2c2c] font-medium">
              {product?.name}{" "}
              {product?.variants.map((variant) => (
                <Badge>{variant?.label}</Badge>
              ))}
            </Text>

            <div className="flex space-x-2">
              <p className="text-[#228B22] text-[0.9rem] font-bold">
                {getPriceLabel()}
              </p>
            </div>
          </div>

          <Button
            color="dark"
            uppercase
            fullWidth
            disabled={
              userData?.cart.some(
                (cartItem) => cartItem?.product.id == router?.query?.id
              ) && product.variants.length == 1
            }
            loading={loading}
            onClick={handleAddToCart}
          >
            <p className="font-medium">add to cart</p>
          </Button>
          {userData?.cart.some(
            (cartItem) => cartItem?.product.id == router?.query?.id
          ) &&
            product.variants.length == 1 && (
              <p className="text-orange-500 w-full text-center">
                (Already in cart)
              </p>
            )}

          <Drawer
            opened={drawerOpen}
            onClose={handleCloseDrawer}
            title={
              <h1 className="py-6 px-3 font-bold text-[1.5rem]">
                Pick a variant
              </h1>
            }
            position="bottom"
            size="70%"
            overlayProps={{ opacity: 0.5, blur: 4 }}
          >
            <Radio.Group
              value={variant}
              onChange={(val) => {
                setVariant(val);
              }}
              name="variant"
              withAsterisk
              mt={30}
            >
              <div className="space-y-12">
                {sortedVariants.map((variant, i) => (
                  <Radio
                    key={i}
                    value={variant?.label}
                    disabled={
                      userData?.cart.some(
                        (cartItem) =>
                          cartItem?.product.id == router?.query?.id &&
                          cartItem?.variant == variant?.label
                      ) || !variant?.available
                    }
                    label={
                      <div className="flex space-x-4  mt-[-30px]">
                        {variant?.thumbnail ? (
                          <img
                            className="rounded-md object-cover"
                            src={variant?.thumbnail}
                            height={70}
                            width={70}
                          />
                        ) : (
                          <div className=" border-gray-400 border-2  min-w-[80px] max-h-[80px] min-h-[80px] relative justify-center align-middle">
                            <p className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                              {variant?.label}
                            </p>
                          </div>
                        )}
                        <div className="h-full relative">
                          <div className="mt-5">
                            <p
                              className={
                                isOnSale(variant)
                                  ? "line-through text-red-700 font-medium inline mt-5"
                                  : "text-[#228B22] font-medium mt-5"
                              }
                            >
                              Ksh. {variant?.price}
                            </p>
                          </div>

                          {isOnSale(variant) && (
                            <p className="text-[#228B22] font-medium  inline ">
                              Ksh. {variant?.sale?.salePrice}
                            </p>
                          )}

                          {userData?.cart.some(
                            (cartItem) =>
                              cartItem?.product.id == router?.query?.id &&
                              cartItem?.variant == variant?.label
                          ) && (
                            <p className="text-orange-500 mt-2">
                              (Already in cart)
                            </p>
                          )}
                          {!variant?.available && (
                            <p className="text-orange-500 mt-2">
                              Product unavailable
                            </p>
                          )}
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            </Radio.Group>
            <Space h={30} />
            <Button
              fw="lighter"
              uppercase
              color="dark"
              fullWidth
              onClick={handleAddToCart}
              loading={loading}
            >
              Add to cart
            </Button>
          </Drawer>

          <div>
            <Text lineClamp={lineClamp} color="#909090">
              {product?.description}
            </Text>

            <span
              className="text-[#228B22] hover:cursor-pointer flex mt-2 mb-4"
              onClick={() =>
                lineClamp == 2 ? setLineClamp(10) : setLineClamp(2)
              }
            >
              View {lineClamp == 2 ? "more" : "less"}{" "}
              <IconChevronRight size={16} style={{ marginTop: 6 }} />
            </span>
            <Divider />
          </div>

          <div>
            <Accordion defaultValue="more">
              <Accordion.Item value="more">
                <Accordion.Control>
                  <p className="font-medium">Additional Information</p>
                </Accordion.Control>
                <Accordion.Panel>
                  <div className="space-y-2 p-2">
                    {product?.additionalInformation.length < 1 ? (
                      <div className="bg-gray-100 p-4 border-t-2 border-[#228B22] text-[#228B22]">
                        <Text>No additional Information.</Text>
                      </div>
                    ) : (
                      product?.additionalInformation.map((info, i) => (
                        <p key={i} className="font-medium">
                          {info?.label}:{" "}
                          <span className="font-light">{info?.value}</span>
                        </p>
                      ))
                    )}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="reviews">
                <Accordion.Control>
                  <p className="font-medium">
                    Reviews ({product?.reviews.length})
                  </p>
                </Accordion.Control>
                <Accordion.Panel>
                  <div className="space-y-8">
                    {product?.reviews.length < 1 ? (
                      <div className="bg-gray-100 p-4 border-t-2 border-[#228B22] text-[#228B22]">
                        <Text>No reviews yet.</Text>
                      </div>
                    ) : (
                      product?.reviews.map((review, i) => (
                        <Review key={i} review={review} />
                      ))
                    )}
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>

          <div className="mt-12 space-y-8">
            <p className="font-medium text-[1.3rem]">Similar Items</p>

            <InstantSearch searchClient={searchClient} indexName="products">
              <Configure
                filters={`category:'${product?.category}'`}
                hitsPerPage={10}
              />
              <ProductList />
            </InstantSearch>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const ProductList = () => {
  const { hits } = useHits();

  return (
    <div className="w-full flex overflow-x-auto space-x-8">
      {hits.map((_hit, i) => (
        <ProductCard key={i} hit={_hit} />
      ))}
    </div>
  );
};
