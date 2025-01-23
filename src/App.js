import React, { Suspense, lazy, useState, useEffect, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Header from "./components/Header";
import FileList from "./components/FileList";
import Preview from "./components/Preview";
import { formatCode } from "./utils/prettierFormatter";
import { useSocket, SocketProvider } from "./context/SocketContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "react-tabs/style/react-tabs.css";
import "./styles.css";
import "./themes.css";
import { debounce } from "./utils/debounce";

const Editor = lazy(() => import("./components/Editor"));

const App = () => {
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [theme, setTheme] = useState("material");
  const [mode, setMode] = useState("htmlmixed");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [deviceFrame, setDeviceFrame] = useState("desktop");
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "codeChange",
      debounce((newCode) => {
        const updatedFiles = files.map((file, index) =>
          index === currentFileIndex ? { ...file, code: newCode } : file
        );
        setFiles(updatedFiles);
      }, 300)
    );
  }, [socket, files, currentFileIndex]);

  const handleSelectFile = (index) => {
    setCurrentFileIndex(index);
    setMode(files[index].language);
  };

  const handleAddFile = () => {
    setIsModalOpen(true);
  };

  const handleCreateFile = () => {
    const fileType = newFileName.split(".").pop();
    const languageMap = {
      html: "htmlmixed",
      css: "css",
    };
    const language = languageMap[fileType] || "htmlmixed";
    setFiles([...files, { name: newFileName, code: "", language }]);
    setCurrentFileIndex(files.length);
    setMode(language);
    setIsModalOpen(false);
    setNewFileName("");
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setCurrentFileIndex(updatedFiles.length ? 0 : null);
  };

  const handleCodeChange = debounce((newCode) => {
    const updatedFiles = files.map((file, index) =>
      index === currentFileIndex ? { ...file, code: newCode } : file
    );
    setFiles(updatedFiles);

    if (socket) {
      socket.emit("codeChange", newCode);
    }
  }, 300);

  const handleFileDrop = (item) => {
    const file = item.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fileType = file.name.split(".").pop();
      const languageMap = {
        html: "htmlmixed",
        css: "css",
      };
      const language = languageMap[fileType] || "htmlmixed";
      setFiles([...files, { name: file.name, code: content, language }]);
      setCurrentFileIndex(files.length);
      setMode(language);
    };
    reader.readAsText(file);
  };

  const handleFormatCode = () => {
    try {
      const formattedCode = formatCode(files[currentFileIndex].code);
      handleCodeChange(formattedCode);
    } catch (error) {
      console.error("Error formatting code:", error);
    }
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
    const updatedFiles = files.map((file, index) =>
      index === currentFileIndex
        ? { ...file, language: event.target.value }
        : file
    );
    setFiles(updatedFiles);
  };

  const handleDeviceFrameChange = (event) => {
    setDeviceFrame(event.target.value);
  };

  const saveSnippet = () => {
    localStorage.setItem("codeSnippets", JSON.stringify(files));
    alert("Snippets saved!");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("codeSnippets", JSON.stringify(files));
    }, 5000);
    return () => clearInterval(interval);
  }, [files]);

  const memoizedFiles = useMemo(() => files, [files]);

  return (
    <SocketProvider>
      <DndProvider backend={HTML5Backend}>
        <div className={`App theme-${theme}`}>
          <Header />
          <div className="controls">
            <label>Theme:</label>
            <select onChange={handleThemeChange}>
              <option value="material">Material</option>
              <option value="dracula">Dracula</option>
              <option value="monokai">Monokai</option>
              <option value="light">Light</option>
            </select>
            <label>Mode:</label>
            <select onChange={handleModeChange}>
              <option value="htmlmixed">HTML Mixed</option>
              <option value="css">CSS</option>
            </select>
            <label>Device:</label>
            <select onChange={handleDeviceFrameChange}>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
            <button onClick={handleFormatCode}>Format Code</button>
            <button onClick={saveSnippet}>Save Snippet</button>
          </div>
          <FileList
            files={memoizedFiles}
            onSelectFile={handleSelectFile}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onFileDrop={handleFileDrop}
          />
          {currentFileIndex !== null && (
            <Tabs selectedIndex={currentFileIndex} onSelect={handleSelectFile}>
              <TabList>
                {memoizedFiles.map((file, index) => (
                  <Tab key={index}>{file.name}</Tab>
                ))}
              </TabList>
              {memoizedFiles.map((file, index) => (
                <TabPanel key={index}>
                  <Suspense fallback={<div>Loading Editor...</div>}>
                    <Editor
                      code={file.code}
                      onCodeChange={handleCodeChange}
                      theme={theme}
                      mode={file.language}
                    />
                  </Suspense>
                  <Preview
                    code={file.code}
                    language={file.language}
                    deviceFrame={deviceFrame}
                  />
                </TabPanel>
              ))}
            </Tabs>
          )}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Create New File</h2>
                <input
                  type="text"
                  placeholder="Enter file name (e.g., file1.html)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
                <button className="create" onClick={handleCreateFile}>
                  Create
                </button>
                <button
                  className="cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </SocketProvider>
  );
};

export default App;
