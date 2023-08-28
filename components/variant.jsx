import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Switch,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconX } from "@tabler/icons";
import { useEffect, useState } from "react";
import { isOnSale } from "./productcard";

export default function Variant({
  variant,
  onRemove,
  updateVariantInfo,
  updateAvailable,
}) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [sale, setSale] = useState({
    startTime: "",
    endTime: "",
    salePrice: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (dateRange[1]) {
      setSale((sale) => {
        return {
          ...sale,
          startTime: new Date(dateRange[0]).getTime(),
          endTime: new Date(dateRange[1]).getTime(),
        };
      });
    }
    if (!dateRange[0] && !dateRange[1]) {
      setSale((sale) => {
        return {
          ...sale,
          startTime: null,
          endTime: null,
        };
      });
    }
  }, [dateRange]);

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Card.Section>
        {variant?.sale?.endTime && (
          <Badge className="absolute top-0 right-0" size="lg" radius={null}>
            ON SALE!
          </Badge>
        )}
      </Card.Section>
      <div className="flex space-y-4 mt-8">
        {variant?.thumbnail ? (
          <img
            className="min-w-[100px] h-[100px] rounded-md"
            src={URL.createObjectURL(variant?.thumbnail)}
            height={70}
          />
        ) : (
          <div className=" border-gray-400 border-2  min-w-[80px] max-h-[80px] relative justify-center align-middle">
            <p className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
              {variant?.label}
            </p>
          </div>
        )}

        <div className="flex justify-between w-full">
          <div className="w-full px-4  ">
            <Text>{variant?.label}</Text>
            <div>
              <p
                className={
                  isOnSale(variant)
                    ? "line-through text-red-700 font-medium inline mt-5"
                    : "text-[#0E5AA6] font-medium "
                }
              >
                Ksh. {variant?.price}
              </p>
            </div>

            {isOnSale(variant) && (
              <p className="text-[#0E5AA6] font-medium  inline ">
                Ksh. {variant?.sale?.salePrice}
              </p>
            )}
          </div>
          <div className="float-right h-full">
            <Button p={0} color="dark" h={32} w={32} mt={12} onClick={onRemove}>
              <IconX />
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Group position="apart" mt="md" mb="xs">
          <Text weight={500}>Availablity</Text>
          <Switch
            color="green"
            checked={variant?.available}
            onChange={(e) => updateAvailable(e.target.checked)}
          />
        </Group>
        <Button
          fullWidth
          variant="light"
          color="green"
          onClick={() => setModalOpen(true)}
        >
          Manage sale
        </Button>

        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
          title={
            <h1 className="py-6 px-3 font-bold text-[1.5rem]">Offer details</h1>
          }
          centered
          // transitionProps={{ transition: "fade", duration: 200 }}
        >
          <div className="min-h-[300px] space-y-6">
            <DatePickerInput
              type="range"
              placeholder="Pick dates range"
              value={dateRange}
              onChange={setDateRange}
              clearable
            />
            <NumberInput
              value={sale.salePrice}
              min={0}
              max={Number(variant?.price) - 1}
              onChange={(val) =>
                setSale((sale) => {
                  return {
                    ...sale,
                    salePrice: val,
                  };
                })
              }
            />
            <Button
              fw="lighter"
              uppercase
              color="dark"
              fullWidth
              onClick={() => {
                updateVariantInfo(sale);
                setModalOpen(false);
              }}
            >
              Save offer
            </Button>
          </div>
        </Modal>
      </div>
    </Card>
  );
}
