// prettier-ignore

const consumerKey = "wphSFYHgzSw3E1PtwkGrOVuTMCIYpG2U";
const consumerSecret = "yoY6ufJ8aDgDjRLg";

export default function handler(req, res) {
  let response = {
    status: null,
    message: null,
  };

  if (req.method === "POST") {
    const base64Key = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64"
    );

    fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${base64Key}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.log("Failed to fetch access token");

          return res.status(500).json(" Failed to fetch access token");
        }

        console.log("AT", data.access_token);

        fetch(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
            body: JSON.stringify({
              BusinessShortCode: 174379,
              Password:
                "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwODIzMTMzODE2",
              Timestamp: "20230823133816",
              TransactionType: "CustomerPayBillOnline",
              Amount: 1,
              PartyA: 254748920306,
              PartyB: 174379,
              PhoneNumber: 254748920306,
              CallBackURL: process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL,
              // CallBackURL: "https://mydomain.com/path",
              AccountReference: "CompanyXLTD",
              TransactionDesc: "Payment of X",
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.log("Failed to inititate STK");

              return res.status(500).json("Failed to inititate STK");
            }
            console.log("STK initiated");
            return res.status(200).json("STK initiated");
          });
      })
      .catch((error) => {
        console.log("Failed to inititate STK");

        return res.status(500).json("Failed to inititate STK");
      });
  } else {
    console.log("Method not allowed");

    return res.status(400).json("Method not allowed");
  }
}
