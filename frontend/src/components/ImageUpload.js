import React, { useState } from "react";
import api from "../api/axiosClient";

export default function ImageUpload({ folder = "profiles", onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await api.post("/upload-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // res.data.url is the correct public URL
      onUpload(res.data.url);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
