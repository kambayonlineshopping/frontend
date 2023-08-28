import { Button, TextInput, Textarea } from "@mantine/core";
import { Footer, Logoheader } from "../components";
import { useState } from "react";

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div>
      <Logoheader />
      <div className="p-4 space-y-8 relative mt-[80px]">
        <h1 className="font-medium text-[1.2rem]">Contact Us</h1>

        <TextInput
          placeholder="ex. Returns Enquiry"
          label="Subject"
          withAsterisk
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Textarea
          placeholder="Your message"
          label="Your message"
          minRows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          withAsterisk
        />

        <a
          href={`mailto:shopwestgatejuja@gmail.com?body=${encodeURIComponent(
            body
          )}&subject=${encodeURIComponent(subject)}`}
          className="text-white bg-black w-full py-2 text-center uppercase block"
        >
          send
        </a>
      </div>
      <Footer />
    </div>
  );
}
