import { Rating, Text } from "@mantine/core";
import moment from "moment/moment";

export default function Review({ review }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline space-x-6">
        <p className="font-medium">{review?.name}</p>
        <span className="font-light text-[0.8rem]">
          {moment(new Date(Number(review?.timestamp))).format("DD MMM, YYYY")}
        </span>
      </div>
      <Rating value={review?.rating} fractions={2} readOnly />
      <Text>{review?.message}</Text>
    </div>
  );
}
