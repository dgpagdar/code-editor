// Editor.js
import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const textareaRef = useRef(null);
    const editorRef = useRef(null);

    // Initialize CodeMirror once
    useEffect(() => {
        if (editorRef.current || !textareaRef.current) return;

        const cm = CodeMirror.fromTextArea(textareaRef.current, {
            mode: { name: 'javascript', json: true },
            theme: 'dracula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
        });
        editorRef.current = cm;

        cm.on('change', (instance, changes) => {
            const { origin } = changes || {};
            const code = instance.getValue();
            onCodeChange?.(code);
            if (origin !== 'setValue' && socketRef?.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
            }
        });

        // Optional: clean up on unmount
        return () => {
            // detach listeners
            cm.toTextArea();
            editorRef.current = null;
        };
    }, []); // <- run once

    useEffect(() => {
        const socket = socketRef?.current;      // <-- capture the live socket
        if (!socket || !editorRef.current) return;

        const handler = ({ code }) => {
            if (code != null) {
                const current = editorRef.current.getValue();
                if (current !== code) editorRef.current.setValue(code);
            }
        };

        socket.on(ACTIONS.CODE_CHANGE, handler);
        return () => socket.off(ACTIONS.CODE_CHANGE, handler);
        //       ↓ depend on the actual socket instance (and room if you like)
    }, [socketRef?.current, roomId]);

    return <textarea ref={textareaRef} id="realtimeEditor" />;
};

export default Editor;
