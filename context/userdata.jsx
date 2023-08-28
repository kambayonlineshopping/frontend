import { useSession } from "next-auth/react";
import { createContext } from "react";
import { useQuery } from "urql";

export const Userdatacontext = createContext(null);

export default function UserData({ children }) {
  const { data: session } = useSession();

  const GET_USER_DATA = `
        query GET_USER_DATA($email: String) {
        getUser(email: $email) {
            name
            phoneNumber
            id
            cart {
              id
              product {
                id
                name
                images
                variants {
                    thumbnail
                    price
                    label
                    sale {
                      salePrice
                      startTime
                      endTime
                    }
                    available
                }
              }
              quantity
              variant
            }
            saved {
            id
            name
            images
            variants {
                thumbnail
                price
                label
                sale {
                  salePrice
                  startTime
                  endTime
                }
                available
              }
            }
            addresses {
                id
                label
                lat
                lng
                default
            }
          }
        }
    `;

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: GET_USER_DATA,
    variables: {
      email: session?.user?.email,
    },
  });

  return (
    <Userdatacontext.Provider value={{ data: data?.getUser, reexecuteQuery }}>
      {children}
    </Userdatacontext.Provider>
  );
}
