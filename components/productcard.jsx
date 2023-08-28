import { Badge, Loader, Text, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBookmark, IconStar } from "@tabler/icons";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useMutation } from "urql";
import { Userdatacontext } from "../context/userdata";
import { Carousel } from "react-responsive-carousel";
import { isAfter, isBefore } from "date-fns";

export const isOnSale = (variant) => {
  if (variant?.sale?.startTime && variant?.sale?.endTime) {
    const currentTime = Date.now();
    const startTimestamp = parseInt(variant?.sale?.startTime);
    const endTimestamp = parseInt(variant?.sale?.endTime);
    if (
      isAfter(currentTime, startTimestamp) &&
      isBefore(currentTime, endTimestamp)
    ) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export default function ProductCard({ hit }) {
  const [loading, setLoading] = useState(false);

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

  const router = useRouter();

  const { data: session } = useSession();
  const { data } = useContext(Userdatacontext);

  const SAVE_UNSAVE = `
    mutation SAVE_UNSAVE(
      $customer: String
      $product: ID
    ){
      saveUnsave(customer: $customer , product: $product){
        id
      }
    }
  `;

  const [_, _saveUnsave] = useMutation(SAVE_UNSAVE);

  const handleSave = () => {
    if (!session) {
      signIn();
      return;
    }
    setLoading(true);
    _saveUnsave({
      product: hit?.id,
      customer: session.user.email,
    })
      .then(({ data, error }) => {
        return;
      })
      .catch((err) => {
        notifications.show({
          color: "red",
          title: "An error occured",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="col-span-1 space-y-2 relative hover:cursor-pointer min-w-[40vw] md:min-w-[23vw] lg:min-w-[18vw]">
      {data?.saved.filter((item) => item.id == hit?.id).length > 0 ? (
        <UnstyledButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            width: 35,
            height: 35,
            borderRadius: "50%",
          }}
          onClick={handleSave}
        >
          {loading ? (
            <Loader color="red" size={20} />
          ) : (
            <svg
              className="ml-[8px]"
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-heart-filled"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#2c3e50"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"
                stroke-width="0"
                fill="red"
              />
            </svg>
          )}
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 10,
            width: 35,
            height: 35,
            borderRadius: "50%",
          }}
          onClick={handleSave}
        >
          {loading ? (
            <Loader color="red" size={20} />
          ) : (
            <svg
              className="ml-[8px]"
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-heart"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#2c3e50"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            </svg>
          )}
        </UnstyledButton>
      )}

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

      <Carousel
        infiniteLoop
        showIndicators={false}
        showThumbs={false}
        showStatus={false}
        autoPlay
      >
        {hit?.images.map((image, i) => (
          <div key={i} onClick={() => router.push(`/product/${hit?.id}`)}>
            <img className="w-full h-[200px] object-contain" src={image} />
          </div>
        ))}
      </Carousel>

      <div onClick={() => router.push(`/product/${hit?.id}`)}>
        <p className="opacity-70 text-gray-600 text-[0.9rem] mb-2">
          {hit?.category}
        </p>
        <Text lineClamp={2} className="text-[#2c2c2c] font-medium">
          {hit?.name}
        </Text>
        <div className="flex space-x-2">
          {hit?.was && (
            <p className="text-red-600 line-through text-[0.9rem]">
              Ksh. {hit?.was}
            </p>
          )}
          <p className="text-[#0E5AA6] text-[0.9rem] font-medium">
            {getPriceLabel()}
          </p>
        </div>
      </div>
    </div>
  );
}
