import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
} from "@tabler/icons";

export default function Footer() {
  return (
    <div className="pt-12 pb-4 px-4 space-y-12">
      <div className="md:flex w-full justify-between space-y-12">
        <div className="space-y-3">
          <a href="/contact" className="text-[#909090] block">
            CONTACT
          </a>
          <a href="/help?with=terms" className="text-[#909090] block">
            TERMS OF SERVICES
          </a>
          <a href="/help?with=delivery" className="text-[#909090] block">
            DELIVERY
          </a>
          <a href="/help?with=pp" className="text-[#909090] block">
            PRIVACY POLICY
          </a>
          <a href="/help?with=rne" className="text-[#909090] block">
            RETURNS & EXCHANGES
          </a>
        </div>
        <div className="flex space-x-6 items-baseline md:w-[50%]">
          <p>Follow us</p>
          <div className="border-b-2 w-1/4 border-black" />
          <div className="flex space-x-5">
            <a href="#">
              <IconBrandInstagram />
            </a>
            <a href="#">
              <IconBrandTwitter />
            </a>
            <a href="#">
              <IconBrandFacebook />
            </a>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[#909090] block">
          © {new Date().getFullYear()} Copyright. Terms of use & privacy policy
        </p>
      </div>
    </div>
  );
}
