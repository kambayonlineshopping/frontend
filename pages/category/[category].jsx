import {
  Configure,
  InstantSearch,
  useInfiniteHits,
  useStats,
} from "react-instantsearch";
import { Footer, Logoheader, ProductCard } from "../../components";

import { useRouter } from "next/router";
import { searchClient } from "../_app";
import { useRef } from "react";

const CustomStats = () => {
  const { nbHits } = useStats();

  return <p>{nbHits} products</p>;
};

export default function Saved() {
  const router = useRouter();

  const {
    query: { category },
  } = router;

  function titleCase(str) {
    if (str === null || str === "") return false;
    else str = str?.toString();

    return str?.replace(/\w\S*/g, function (txt) {
      return txt?.charAt(0)?.toUpperCase() + txt?.substr(1)?.toLowerCase();
    });
  }

  return (
    <div>
      <Logoheader />
      <InstantSearch searchClient={searchClient} indexName="products">
        <div className="mt-[80px] relative">
          <div className="flex justify-between px-8 w-full fixed top-[72px] left-0 z-40 bg-white pb-3">
            <h1 className="font-medium text-[1.2rem] mt-2">
              {titleCase(category)}
            </h1>
            <span className="block text-[#909090] mt-3">
              <CustomStats />
            </span>
          </div>
        </div>

        <div className="p-4 space-y-8 mt-[130px] relative">
          <Configure filters={`category:'${category}'`} hitsPerPage={30} />
          <ProductList />
        </div>
      </InstantSearch>
      <Footer />
    </div>
  );
}

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
      ref={scrollDiv}
      onScroll={fetchMore}
      className="gap-8 overflow-y-auto w-full px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 max-h-[1000px]"
    >
      {hits.map((_hit, i) => (
        <ProductCard key={i} hit={_hit} />
      ))}
    </div>
  );
};
