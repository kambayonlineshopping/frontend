import { Text } from "@mantine/core";
import { useRouter } from "next/router";

export default function ProductSearch({
  action,
  styles,
  classNames,
  hovered,
  onTrigger,
  ...others
}) {
  const getPriceLabel = () => {
    if (action) {
      const prices = action?.variants.map((obj) => obj.price);
      const allSame = prices.every((price) => price === prices[0]);

      return prices.length == 1
        ? `Ksh. ${prices[0]}`
        : prices.length > 1 && allSame
        ? `Ksh. ${prices[0]}`
        : `Ksh. ${Math.min(...prices)} - ${Math.max(...prices)}`;
    }
    return "";
  };
  const router = useRouter();
  return (
    <div className="flex space-x-3 w-full p-3">
      <div className="w-1/3 max-w-[70px]">
        <img
          onClick={() => router.push(`/product/${action?.id}`)}
          className="w-full"
          src={action?.images[0]}
        />
      </div>
      <div>
        <Text lineClamp={2} className="text-[#2c2c2c] font-medium">
          {action?.name}
          {/* <Highlight attribute="name" hit={action} /> */}
        </Text>
        <div className="flex space-x-2">
          {action?.was && (
            <p className="text-red-600 line-through text-[0.9rem]">
              Ksh. {action?.was}
            </p>
          )}
          <p className="text-[#0E5AA6] text-[0.9rem]"> {getPriceLabel()}</p>
        </div>
      </div>
    </div>
  );
}
