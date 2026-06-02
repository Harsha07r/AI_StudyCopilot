import axios from "axios";
import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();

    formData.append("pdf", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload",
        formData
      );

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button onClick={handleUpload}>
        Upload
      </button>
    </>
  );
}

export default App;