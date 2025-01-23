import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';

const Editor = ({ code, onCodeChange, theme, mode }) => {
  return (
    <CodeMirror
      value={code}
      options={{
        mode: mode,
        theme: theme,
        lineNumbers: true,
        viewportMargin: Infinity,
        lineWrapping: true,
      }}
      onBeforeChange={(editor, data, value) => {
        onCodeChange(value);
      }}
    />
  );
};

export default Editor;
