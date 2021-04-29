
const mongoose = require('mongoose')
const dotenv = require("dotenv")
const Document = require("./model/Document")
dotenv.config({ path: "src/config.env" })

mongoose.connect(process.env.MONGOODB_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const PORT = process.env.PORT || 3001

const io = require("socket.io")(PORT, {
    cors: {
        methods: ['GET', "POST"]
    }
})

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