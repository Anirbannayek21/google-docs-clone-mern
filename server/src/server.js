const express = require("express")
const mongoose = require('mongoose')
const dotenv = require("dotenv")
const Document = require("./model/Document")
dotenv.config({ path: "src/config.env" })

const app = express();
const server = require("http").Server(app)
mongoose.connect(process.env.MONGOODB_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const PORT = process.env.PORT || 3001

const io = require("socket.io")(server)

io.on("connection", (socket) => {
    console.log(socket);
    socket.on("get-document", async id => {
        const document = await findOrCreate(id)
        // console.log(document);
        socket.join(id);
        socket.emit("load-document", document.data)
        socket.on("send-changes", (delta) => {
            socket.broadcast.to(id).emit("recieve-changed", delta)
        })

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(id, { data })
        })
    })
})

const Ddata = "";
const findOrCreate = async (id) => {
    if (id == null) return

    const doc = await Document.findById(id)
    if (doc) return doc
    return await Document.create({ _id: id, data: Ddata })
}

if (process.env.NODE_ENV == "production") {
    app.use(express.static("client/build"));
    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", 'build', 'index.html'))
    })
}

server.listen(PORT, () => { console.log(`server running on ${PORT}`) })