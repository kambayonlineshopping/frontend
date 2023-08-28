import { Chip, Select, Skeleton, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons";

import { SpotlightProvider, spotlight } from "@mantine/spotlight";
import { Carousel } from "react-responsive-carousel";
import { Footer, Logoheader, ProductCard, ProductSearch } from "../components";

import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useInfiniteHits, useSearchBox } from "react-instantsearch";

export default function Home() {
  const [value, setValue] = useState(["earrings"]);

  const { refine } = useSearchBox();
  const router = useRouter();
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
    <div>
      <Logoheader />

      <div className="mt-[80px] relative">
        <div className="p-4 py-2">
          <SpotlightProvider
            actions={hits}
            actionComponent={ProductSearch}
            onQueryChange={refine}
            searchIcon={<IconSearch size="1.2rem" />}
            searchPlaceholder="Search..."
            shortcut="mod + shift + 1"
            nothingFoundMessage="Nothing found..."
          >
            <div
              onClick={spotlight.open}
              className="cursor-pointer flex space-x-2 border-[0.5px] p-2"
            >
              <IconSearch color="#909090" size={20} style={{ marginTop: 2 }} />
              <span className="text-[#909090]">Search</span>
            </div>
          </SpotlightProvider>
        </div>

        {/* <div className="p-4 py-0">
          <Carousel
            style={{ zIndex: -9 }}
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay
            showArrows={false}
          >
            {["/slider3.jpg", "slider2.jpg", "slider1.jpg"].map((image) => (
              <div>
                <img src={image} className="w-full" />
              </div>
            ))}
          </Carousel>
        </div> */}

        <div className="mt-8 space-y-1">
          <div className="flex justify-between px-4 text-[0.8rem] font-medium items-baseline">
            <h1 className="font-medium text-[1.2rem]">All products</h1>
          </div>

          <div
            className="gap-8 overflow-y-auto w-full p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 max-h-[1000px]"
            ref={scrollDiv}
            onScroll={fetchMore}
          >
            {hits.length == 0 &&
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((el) => <LoadingComponent />)}
            {hits.map((_hit, i) => (
              <ProductCard key={i} hit={_hit} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

const LoadingComponent = () => (
  <div className="col-span-1 space-y-2 min-w-[40vw] md:min-w-[23vw] lg:min-w-[18vw]">
    <Skeleton height={200} mb="xl" />
    <Skeleton height={14} radius="md" />
    <Skeleton height={24} mt={6} radius="md" />
    <Skeleton height={16} mt={6} width="70%" radius="md" />
  </div>
);
