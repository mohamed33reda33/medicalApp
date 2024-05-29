const express = require("express");
const app = express();
const path = require("path");
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.json());
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const morgan = require("morgan");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddlewares");

const DBConnection = require("./config/database");
DBConnection();

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    console.log(`mode: ${process.env.NODE_ENV}`);
}

const doctorRoute = require("./routes/doctorRoute");
app.use('/api/doctors', doctorRoute);

const patientRoute = require("./routes/patientRoute");
app.use('/api/patients', patientRoute);

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, "view/chat.html"))
})

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('joinDoctorRoom', (doctorId) => {
        socket.join(`doctor_${doctorId}`);
        console.log(`Doctor ${doctorId} joined room doctor_${doctorId}`);
    });

    socket.on('joinPatientRoom', (patientId) => {
        socket.join(`patient_${patientId}`);
        console.log(`Patient ${patientId} joined room patient_${patientId}`);
    });

    socket.on('messageToDoctor', (data) => {
        const { recipientId, message } = data;
        io.to(`doctor_${recipientId}`).emit('messageFromPatient', message);
        console.log(`Message from patient to doctor_${recipientId}: ${message}`);
    });

    socket.on('messageToPatient', (data) => {
        const { recipientId, message } = data;
        io.to(`patient_${recipientId}`).emit('messageFromDoctor', message);
        console.log(`Message from doctor to patient_${recipientId}: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
});

app.all('*', (req, res, next) => {
    next(new ApiError(`can't find this route ${req.originalUrl}`, 404));
});
app.use(globalError)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`connected on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`unhandledRejection Error: ${err.name} | ${err.message}`);
    server.close(() => {
        console.log("server shutting down...");
        process.exit(1);
    })
})