import React, { useState } from 'react';
import { useDrop } from 'react-dnd';

const FileList = ({ files, onSelectFile, onAddFile, onDeleteFile, onFileDrop }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'FILE',
    drop: (item) => onFileDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleFileSelect = (index) => {
    setSelectedFile(index);
    onSelectFile(index);
  };

  const handleFileDelete = (index) => {
    onDeleteFile(index);
  };

  return (
    <div ref={drop} className={`file-list ${isOver ? 'drag-over' : ''}`}>
      <button onClick={onAddFile} style={{ padding: '8px', fontSize: '14px' }}>Add New File</button>
      <ul>
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => handleFileSelect(index)}
            className={selectedFile === index ? 'selected' : ''}
          >
            {file.name}
            <button onClick={() => handleFileDelete(index)} style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
