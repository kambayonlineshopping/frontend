import {
  Accordion,
  Avatar,
  Badge,
  Button,
  HoverCard,
  Kbd,
  PasswordInput,
  Popover,
  Space,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import { useState } from "react";
import { useMutation } from "urql";

export default function AdminCard({ admin, me, refresh }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const UPDATE_ADMIN = `
    mutation UPDATE_ADMIN(
      $id: ID
      $name: String
      $phoneNumber: String
      $email: String
      $password: String
      $removed: Boolean
    ){
      updateAdmin(
        id: $id
        name: $name
        phoneNumber: $phoneNumber
        email: $email
        password: $password
        removed: $removed
      ){
        id
      }
    }  
  `;

  const [_, _updateAdmin] = useMutation(UPDATE_ADMIN);

  const handleRemoveUser = () => {
    if (password !== me?.password) {
      notifications.show({
        title: "Incorrect password",
        color: "orange",
      });
      return;
    }

    if (admin?.id == me?.id) {
      notifications.show({
        title: "Not permissible",
        message: "You cannot remove yourself from the system",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    _updateAdmin({
      id: admin?.id,
      removed: true,
    })
      .then((data, error) => {
        if (data?.data?.updateAdmin && !error) {
          notifications.show({
            title: "Admin removed successfully",
            color: "green",
          });
          refresh();
          return;
        }
        notifications.show({
          title: "Oops!",
          message: "Something occured in the system!",
          color: "red",
        });
        return;
      })
      .catch((err) => {
        notifications.show({
          title: "Oops!",
          message: err?.message,
          color: "red",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Accordion.Item value={(admin?.id).toString()}>
        <Accordion.Control>
          <div className="flex space-x-5">
            <Avatar color="brown" radius="xl" size={52}>
              {admin.name
                .split(" ")
                .map((el) => new String(el).charAt(0).toUpperCase())}
            </Avatar>
            <div className="space-y-2">
              <Text lineClamp={1} className="text-[#2c2c2c] font-medium">
                {admin?.name}
              </Text>
              <Badge color="dark" uppercase radius={null}>
                {admin?.levelClearance}
              </Badge>
            </div>
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <div className="space-y-4">
            <p className="font-medium">
              Email : <span className="font-light">{admin?.email}</span>
            </p>
            <p className="font-medium">
              Phone number :{" "}
              <span className="font-light text-[0.8rem]">
                {admin?.phoneNumber ? (
                  admin?.phoneNumber
                ) : (
                  <Badge color="yellow" uppercase>
                    Missing
                  </Badge>
                )}
              </span>
            </p>
            <p className="font-medium">
              Added :{" "}
              <span className="font-light text-[0.8rem]">
                {moment(new Date(Number(admin?.createdAt))).format(
                  "Do MMM, YY , hh:mm a"
                )}
              </span>
            </p>

            <p className="font-medium">
              Products added: <span className="font-light mt-2 mb-8">4</span>
            </p>
            <p className="font-medium">
              Orders dispatched :{" "}
              <span className="font-light mt-2 mb-8">4</span>
            </p>

            <Space h={20} />
            {me?.levelClearance == "super-admin" && (
              <div className="w-full flex space-x-12 justify-around">
                <Popover width="target" position="top" withArrow shadow="md">
                  <Popover.Target>
                    <Button
                      fullWidth
                      variant="outline"
                      uppercase
                      fw="lighter"
                      color="dark"
                    >
                      Remove
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <div className="p-4 space-y-3">
                      <Text size="sm">
                        To delete user , type your password below,
                      </Text>
                      <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        color="dark"
                        fullWidth
                        uppercase
                        loading={loading}
                        onClick={handleRemoveUser}
                      >
                        Remove user
                      </Button>
                    </div>
                  </Popover.Dropdown>
                </Popover>
              </div>
            )}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </div>
  );
}
