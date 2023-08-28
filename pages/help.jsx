import { Accordion, Button } from "@mantine/core";
import { Footer, Logoheader } from "../components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Help() {
  const router = useRouter();
  const { with: _with } = router.query;

  const [helpWith, setHelpWith] = useState(null);

  useEffect(() => {
    if (_with) {
      setHelpWith(_with);
    }
  }, [_with]);

  return (
    <div>
      <Logoheader />
      <div className="p-4 space-y-12 relative mt-[80px]">
        <h1 className="font-medium text-[1.2rem]">Help</h1>

        <Accordion value={helpWith} onChange={setHelpWith}>
          <Accordion.Item value="terms">
            <Accordion.Control>
              <h1 className="text-[1.2rem] font-semibold">Terms of Services</h1>
            </Accordion.Control>
            <Accordion.Panel>
              By using our website (the "Site") and services offered by Westgate
              mart (referred to as "we," "us," or "our"), you agree to comply
              with and be bound by the following Terms of Service.
              <br /> <br />
              Please read these terms carefully before using our Site.
              <br /> <br />
              1. <strong>Acceptance of Terms</strong>: By accessing or using our
              Site, you acknowledge that you have read, understood, and agree to
              abide by these Terms of Service. If you do not agree with these
              terms, please do not use our services.
              <br /> <br />
              3. <strong>Use of Services</strong>: You agree to use our services
              solely for lawful purposes and in accordance with these terms. You
              shall not engage in any activity that may disrupt or interfere
              with the proper functioning of our Site or services.
              <br /> <br />
              4. <strong>Account Creation</strong>: To access certain features,
              you may need to create an account. You are responsible for
              maintaining the confidentiality of your account information and
              agree to accept responsibility for all activities that occur under
              your account.
              <br /> <br />
              5. <strong>Product Availability</strong>: We strive to provide
              accurate and up-to-date product information. However, product
              availability may change without notice. We do not guarantee the
              availability of any specific product. <br /> <br /> 6.{" "}
              <strong>Pricing and Payment</strong>: Product prices are listed on
              our Site and are subject to change. All payments are processed
              securely through our designated payment gateway. By making a
              purchase, you agree to pay the specified amount. <br /> <br /> 7.{" "}
              <strong>Delivery and Returns</strong>: Our delivery services are
              subject to our Delivery Policy. Returns and exchanges may be
              subject to our Return Policy. <br /> <br />
              8. <strong>Intellectual Property</strong>: The content on our
              Site, including images, text, and logos, is protected by
              intellectual property laws. You may not use, reproduce,
              distribute, or modify any content without our prior written
              consent. <br /> <br /> 9. <strong>Privacy</strong>: Your privacy
              is important to us. Please refer to our Privacy Policy to
              understand how we collect, use, and protect your personal
              information. <br /> <br /> 10.
              <strong>Disclaimer of Warranties</strong>: Our services are
              provided "as is" without warranties of any kind, either expressed
              or implied. We do not warrant the accuracy, reliability, or
              availability of our Site or services. <br /> <br /> 11.
              <strong>Limitation of Liability</strong>: Westgate mart shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising from the use or inability to use our services.{" "}
              <br /> <br /> 12.
              <strong>Indemnification</strong>: You agree to indemnify and hold
              Westgate mart harmless from any claims, losses, liabilities, and
              expenses (including legal fees) arising from your use of our Site
              or violation of these terms. <br /> <br /> 13.
              <strong>Modification of Terms</strong>: We reserve the right to
              modify, update, or change these Terms of Service at any time.
              Changes will be effective upon posting to our Site. Continued use
              of our services after changes are posted constitutes your
              acceptance of the revised terms.
              <br /> <br /> If you have any questions or concerns about these
              Terms of Service, please contact us at shopwestgatejuja@gmail.com.
              <br /> <br />
              Last updated: 7th August , 2023
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="delivery">
            <Accordion.Control>
              <h1 className="text-[1.2rem] font-semibold">Delivery</h1>
            </Accordion.Control>
            <Accordion.Panel>
              <strong>Delivery Fee</strong>: A flat delivery fee of 50 Kenyan
              Shillings (KES) will apply for orders within the Juja vicinity.
              This fee is payable during the ordering process.
              <br />
              <br />
              <strong>Delivery Time</strong>: We strive to deliver your order
              promptly (usually within 20 minutes). Delivery times may vary
              based on order volume and location. Please note that while we make
              every effort to deliver within the estimated time frame,
              unforeseen circumstances may occasionally cause delays. <br />
              <br />
              <strong>Delivery Process</strong> : Our delivery team will ensure
              that your items are handled with care and delivered to the
              provided address. Please ensure that someone is available at the
              delivery location to receive the order. If no one is available, we
              will make one additional attempt before the order is returned to
              our facility.
              <br /> <br /> If you have any questions or concerns about these
              Terms of Service, please contact us at shopwestgatejuja@gmail.com.
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="pp">
            <Accordion.Control>
              <h1 className="text-[1.2rem] font-semibold">Privacy Policy</h1>
            </Accordion.Control>
            <Accordion.Panel>
              At Westgate mart, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy outlines how we collect, use, and safeguard your data when
              you use our website and services. By accessing or using our
              website, you agree to the practices described below:
              <br />
              <br />
              <strong>Information We Collect</strong>
              <br />
              <br />
              <div className="space-y-8">
                <p>
                  <strong>Personal Information</strong>: We may collect personal
                  information such as your name, email address, phone number,
                  and delivery address when you place an order on our website.
                </p>
                <p>
                  <strong>Usage Data</strong>: We collect information about how
                  you interact with our website, including your browsing
                  history, pages visited, and referring URLs. This helps us
                  improve our website and tailor our services to your needs.
                </p>
              </div>
              <br />
              <br />
              <strong>How We Use Your Information:</strong>
              <br />
              <br />
              <div className="space-y-8">
                <p>
                  <strong>Order Processing</strong>: We use your personal and
                  payment information to process and fulfill your orders,
                  provide delivery services, and communicate order status
                  updates.
                </p>
                <p>
                  <strong>Communication</strong>: We may use your contact
                  details to send you transactional emails, notifications, and
                  updates related to your orders or account.
                </p>
                <p>
                  <strong>Website Improvement</strong>: We analyze usage data to
                  enhance our website's performance, functionality, and user
                  experience.
                </p>
              </div>
              <br />
              <br />
              <strong>Data Security:</strong>
              <br />
              <br />
              <div className="space-y-8">
                <p>
                  We implement security measures to protect your personal
                  information from unauthorized access, alteration, disclosure,
                  or destruction. Our website uses encryption technology to
                  secure data transmission.
                </p>
                <p>
                  While we take reasonable steps to protect your data, please
                  note that no method of transmission over the internet or
                  electronic storage is completely secure. We cannot guarantee
                  the absolute security of your information.
                </p>
              </div>
              <br />
              <br />
              <strong>Third-Party Sharing:</strong>
              <br />
              <br />
              <p>
                We do not sell, trade, or rent your personal information to
                third parties. However, we may share your data with trusted
                partners and service providers who assist us in operating our
                website and delivering our services.
              </p>
              <br />
              <br />
              <strong>Your Rights:</strong>
              <br />
              <br />
              <p>
                You have the right to access, update, or delete your personal
                information. If you wish to exercise these rights, please
                contact us using the contact information provided below.
              </p>
              <br /> <br /> If you have any questions or concerns about these
              Terms of Service, please contact us at shopwestgatejuja@gmail.com.
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="rne">
            <Accordion.Control>
              <h1 className="text-[1.2rem] font-semibold">
                Return & Exchanges
              </h1>
            </Accordion.Control>
            <Accordion.Panel>
              At Westgate mart, we want your shopping experience to be
              satisfactory and hassle-free. To ensure that, we have established
              a clear Return and Exchange Policy. Please read the following
              carefully before making a purchase:
              <br />
              <br />
              <strong>Returns:</strong>
              <br />
              <br />
              If you are not satisfied with your purchase, you can return the
              item within a day of receiving it. To be eligible for a return:
              <br />
              <br />
              <ul className="space-y-2">
                <li>
                  1. The item must be unused and in the same condition as you
                  received it.
                </li>
                <li>2. It must be in its original packaging.</li>
                <li>
                  3. You need to provide proof of purchase, such as an order
                  confirmation or receipt.
                </li>
              </ul>
              <br />
              We offer two options for returns:
              <br />
              <br />
              <ul className="space-y-2">
                <li>
                  1. <strong>Full refund</strong>: We will issue a full refund
                  for the returned item, excluding shipping and handling
                  charges.
                </li>
                <li>
                  2 <strong>Store Credit</strong>: If you prefer, we can provide
                  store credit for the returned item's value, excluding shipping
                  and handling charges.
                </li>
              </ul>
              <br />
              <br />
              <strong>Exchanges:</strong>
              <br />
              <br />
              If you received a defective or incorrect item, we are here to help
              with exchanges. We offer:
              <ul className="space-y-2">
                <li>1. Exchange for the same item.</li>
                <li>2 Exchange for a similar product of equal value. </li>
              </ul>
              <br />
              <br />
              <strong>Return or Exchange process:</strong>
              <br />
              <br />
              <ul className="space-y-2">
                <li>
                  1. Contact our customer support team at
                  shopwestgatejuja@gmail.com or call 0726151926 to initiate the
                  return process and receive a return authorization.
                </li>
                <li>
                  2. Package the item securely, including a copy of your proof
                  of purchase and the return authorization.
                </li>
                <li>3. Bring the item to the mart.</li>
                <li>
                  4. Once we receive and inspect the returned item, we will
                  process your chosen refund option.{" "}
                </li>
              </ul>
              <br />
              <br />
              <strong>Important Notes:</strong>
              <br />
              <br />
              Returns or exchanges will be denied if the item is not returned in
              its original condition or if the process is not followed.
              <br />
              <br />
              If you have any questions or need assistance with the return or
              exchange process, please don't hesitate to contact our customer
              support team. We are here to assist you.
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Button
          color="dark"
          variant="outline"
          onClick={() => router.push("/contact")}
          uppercase
          fullWidth
        >
          <span className="font-light">Contact Us</span>
        </Button>

        <Footer />
      </div>
    </div>
  );
}
