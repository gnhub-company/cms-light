import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Code } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = "Start typing..." }) {
  const [showHtmlMode, setShowHtmlMode] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !showHtmlMode) {
      editorRef.current.innerHTML = value || '';
    }
  }, [showHtmlMode]);

  const executeCommand = (command, commandValue = null) => {
    document.execCommand(command, false, commandValue);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHtmlChange = (e) => {
    onChange(e.target.value);
  };

  const toggleHtmlMode = () => {
    if (!showHtmlMode && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setShowHtmlMode(!showHtmlMode);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const ToolbarButton = ({ onClick, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 hover:bg-gray-200 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Toolbar */}
      <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-2 items-center">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => executeCommand('bold')} icon={Bold} title="Bold" />
          <ToolbarButton onClick={() => executeCommand('italic')} icon={Italic} title="Italic" />
          <ToolbarButton onClick={() => executeCommand('underline')} icon={Underline} title="Underline" />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => executeCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
          <ToolbarButton onClick={() => executeCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
          <ToolbarButton onClick={() => executeCommand('justifyRight')} icon={AlignRight} title="Align Right" />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} icon={List} title="Bullet List" />
          <ToolbarButton onClick={() => executeCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={insertLink} icon={Link} title="Insert Link" />
          <ToolbarButton onClick={() => executeCommand('formatBlock', '<pre>')} icon={Code} title="Code Block" />
        </div>

        {/* HTML Mode Toggle */}
        <button
          type="button"
          onClick={toggleHtmlMode}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            showHtmlMode 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showHtmlMode ? 'Visual' : 'HTML'}
        </button>
      </div>

      {/* Editor Area */}
      <div className="p-3">
        {showHtmlMode ? (
          <textarea
            value={value}
            onChange={handleHtmlChange}
            className="w-full h-48 p-3 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Edit HTML code here..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            className="min-h-48 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ minHeight: '12rem' }}
            suppressContentEditableWarning
          />
        )}
      </div>
    </div>
  );
}
