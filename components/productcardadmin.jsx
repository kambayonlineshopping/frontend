import {
  Accordion,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  HoverCard,
  Kbd,
  Modal,
  NumberInput,
  PasswordInput,
  Popover,
  Space,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";

import Editable from "./editable";

import { IconCheck, IconExclamationMark, IconPlus, IconX } from "@tabler/icons";

import moment from "moment";
import { useRef, useState } from "react";
import Variant from "./variant";
import Additional from "./additional";
import { Carousel } from "react-responsive-carousel";
import { EditText, EditTextarea } from "react-edit-text";
import "react-edit-text/dist/index.css";
import { useMutation } from "urql";
import { notifications } from "@mantine/notifications";
import { isOnSale } from "./productcard";

export default function ProductCardAdmin({ hit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");

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
  const getPriceLabel = () => {
    if (hit) {
      const prices = hit?.variants.map((obj) =>
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

  const calculatePercentageDifference = (price, salePrice) => {
    return ((price - salePrice) / price) * 100;
  };

  const findLargestPercentageDifference = () => {
    let largestDifference = 0;

    hit?.variants.forEach((variant) => {
      const { price, sale } = variant;

      if (sale?.endTime) {
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

  const [_, _updateProduct] = useMutation(UPDATE_PRODUCT);

  return (
    <div className="relative">
      {findLargestPercentageDifference() != 0 && (
        <Badge
          radius={null}
          size="lg"
          color="orange"
          className="absolute top-0 left-0 z-20"
        >
          -{findLargestPercentageDifference().toFixed(0)}%
        </Badge>
      )}
      <div className="flex justify-between pb-3 border-b-slate-300 border-b-[0.5px] ml-4">
        <div className="flex space-x-5">
          <img
            src={hit?.images[0]}
            className="h-[60px] min-w-[60px] object-contain"
          />

          <div className="space-y-2">
            <Text lineClamp={2} className="text-[#2c2c2c] font-medium">
              {hit?.name}
            </Text>

            <p className="text-[#0E5AA6] text-[0.9rem]">{getPriceLabel()}</p>
            <Badge color="green" uppercase radius={null}>
              {hit?.category}
            </Badge>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          color="green"
          variant="subtle"
          fw="lighter"
        >
          Edit
        </Button>
      </div>

      <Modal centered opened={modalOpen} withCloseButton={false}>
        <div className="flex justify-between">
          <h1 className="py-6 px-3 font-bold text-[1.5rem]">Edit product</h1>

          <Button
            onClick={() => setModalOpen(false)}
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
                data={hit}
                setModalOpen={setModalOpen}
                _updateProduct={_updateProduct}
              />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="removal">
            <div className="mt-[15px] space-y-6">
              <Text>Type your password to remove this product</Text>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button color="red" fullWidth fw="lighter" uppercase>
                Remove product
              </Button>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </div>
  );
}

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
          {data?.images.map((image, i) => (
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
