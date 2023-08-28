import { Button, Card, Text } from "@mantine/core";
import { IconX } from "@tabler/icons";

export default function Additional({ additional, onRemove }) {
  return (
    <div className="p-2 flex justify-between">
      <p className="font-medium mt-3">
        {additional?.label}:{" "}
        <span className="font-light">{additional?.value}</span>
      </p>
      <div className="float-right h-full">
        <Button p={0} color="dark" h={32} w={32} mt={12} onClick={onRemove}>
          <IconX />
        </Button>
      </div>
    </div>
  );
}
