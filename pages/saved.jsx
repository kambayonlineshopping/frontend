import { useContext } from "react";
import { Footer, Logoheader, ProductCard } from "../components";

import { Userdatacontext } from "../context/userdata";

export default function Saved() {
  const { data } = useContext(Userdatacontext);

  return (
    <div>
      <Logoheader />

      <div className="space-y-8 mt-[80px] relative">
        <div className="flex justify-between w-full fixed top-[72px] left-0 z-40 bg-white pb-3 px-8">
          <h1 className="font-medium text-[1.2rem] mt-2">Saved products</h1>
          <span className="block text-[#909090] mt-3">
            {data?.saved.length} items
          </span>
        </div>
      </div>

      <div className="gap-8 mt-[130px] relative overflow-y-auto w-full p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 max-h-[1000px]">
        {data?.saved.map((el, i) => (
          <ProductCard key={i} hit={el} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
