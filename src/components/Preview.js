import React, { useEffect, useRef } from "react";

const deviceFrames = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "667px" },
};

const Preview = ({ code, language, deviceFrame }) => {
  const iframeRef = useRef();

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;
    doc.open();
    if (language === "htmlmixed") {
      doc.write(code);
    } else if (language === "css") {
      doc.write(`<style>${code}</style>`);
    }
    doc.close();
  }, [code, language]);

  return (
    <div className="preview" style={deviceFrames[deviceFrame]}>
      <iframe
        ref={iframeRef}
        title="Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
};

export default Preview;
