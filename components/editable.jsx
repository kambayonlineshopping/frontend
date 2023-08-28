import { useState } from "react";
import { EditText, EditTextarea } from "react-edit-text";

import "react-edit-text/dist/index.css";

export default function Editable({ label, textarea, onSave, initialValue }) {
  const [content, setContent] = useState("");

  return (
    <div>
      <label className="font-medium">{label}</label>
      {textarea ? (
        <EditTextarea
          name="description"
          rows={4}
          placeholder="Enter a description"
          value={initialValue || content}
          style={{ border: "1px solid green" }}
          onChange={(e) => setContent(e.target.value)}
          onSave={(x) => {
            onSave(x);
          }}
        />
      ) : (
        <EditText
          className="p-2"
          name={label}
          style={{ border: "1px solid green" }}
          value={initialValue || content}
          editButtonProps={{ style: { marginLeft: "5px", width: 4 } }}
          onChange={(e) => setContent(e.target.value)}
          onSave={(x) => {
            onSave(x);
          }}
        />
      )}
    </div>
  );
}
