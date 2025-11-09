import { useState } from "react";

export default function LayoutPage() {
  const [layout, setLayout] = useState("text-left");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center p-8">
      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <select
          className="select select-bordered"
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
        >
          <option value="text-left">Text Left / Image Right</option>
          <option value="text-right">Image Left / Text Right</option>
          <option value="text-top">Text Top / Image Bottom</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input file-input-bordered"
        />
      </div>

      {/* Text Input */}
      <textarea
        className="textarea textarea-bordered w-full max-w-2xl mb-6 h-40"
        placeholder="Write your reflection here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Rendered Layout */}
      <div className="bg-white p-6 border border-black shadow-md max-w-4xl w-full">
        {layout === "text-left" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p className="text-justify font-serif leading-relaxed">{text}</p>
            {image && (
              <img
                src={image}
                alt="Upload"
                className="w-full h-auto object-cover"
              />
            )}
          </div>
        )}

        {layout === "text-right" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {image && (
              <img
                src={image}
                alt="Upload"
                className="w-full h-auto object-cover"
              />
            )}
            <p className="text-justify font-serif leading-relaxed">{text}</p>
          </div>
        )}

        {layout === "text-top" && (
          <div className="flex flex-col gap-6">
            <p className="text-justify font-serif leading-relaxed">{text}</p>
            {image && (
              <img
                src={image}
                alt="Upload"
                className="w-full h-auto object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
