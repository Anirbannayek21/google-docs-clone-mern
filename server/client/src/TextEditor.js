import React, { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from 'react-router';

var toolbarOptions = [
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme

    [{ 'align': [] }],
    ['link', 'image', 'video'],

    ['clean']                                         // remove formatting button
];

const TextEditor = () => {
    const { id: documentId } = useParams();
    const [socket, setsocket] = useState()
    const [quill, setquill] = useState()

    useEffect((id) => {
        if (socket == null | quill == null) return

        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable();
        })

        socket.emit("get-document", documentId)
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null | quill == null) return

        const interVal = setInterval(() => {
            socket.emit("save-document", quill.getContents())
        }, 2000)
        return () => {
            clearInterval(interVal)
        }
    }, [socket, quill])

    useEffect(() => {
        const s = io("/")
        setsocket(s);

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on("recieve-changed", handler)

        return () => {
            socket.off("recieve-changed", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }
    }, [socket, quill])

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return
        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        })
        q.disable();
        q.setText("loading....")
        setquill(q);
    }, [])
    return (
        <div className="container" ref={wrapperRef}>

        </div>
    )
}

export default TextEditor
