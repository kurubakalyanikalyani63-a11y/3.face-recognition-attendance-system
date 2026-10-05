const video = document.getElementById("video");
const canvas = document.getElementById("overlay");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const markBtn = document.getElementById("markBtn");
const clearBtn = document.getElementById("clearBtn");

const statusText = document.getElementById("status");
const statusDot = document.getElementById("statusDot");

const table = document.getElementById("attendanceTable");
const total = document.getElementById("total");
const dateElement = document.getElementById("date");

let stream = null;
let faceDetected = false;

// Example student
const student = {
    name: "Kalyani",
    id: "BTECH001"
};

// Attendance data
let attendance =
    JSON.parse(localStorage.getItem("attendance")) || [];

// Today's date
dateElement.textContent =
    new Date().toLocaleDateString();


// -----------------------------
// Load Face Recognition Models
// -----------------------------

async function loadModels() {

    statusText.textContent =
        "Loading face recognition models...";

    try {

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://justadudewhohacks.github.io/face-api.js/models"
        );

        statusText.textContent =
            "Models loaded. Start camera.";

        statusDot.style.background = "green";

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Model loading failed.";

        statusDot.style.background = "red";
    }
}

loadModels();


// -----------------------------
// Start Camera
// -----------------------------

startBtn.addEventListener("click", async () => {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        statusText.textContent =
            "Camera started. Looking for face...";

        statusDot.style.background = "green";

        detectFace();

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Camera permission denied.";

        statusDot.style.background = "red";
    }

});


// -----------------------------
// Stop Camera
// -----------------------------

stopBtn.addEventListener("click", () => {

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        video.srcObject = null;

        statusText.textContent =
            "Camera stopped.";

        statusDot.style.background = "red";

        faceDetected = false;
    }

});


// -----------------------------
// Face Detection
// -----------------------------

async function detectFace() {

    if (!video.srcObject) {
        return;
    }

    const detection =
        await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
        );

    if (detection) {

        faceDetected = true;

        statusText.textContent =
            "Face detected ✓";

        statusDot.style.background = "green";

        const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
        };

        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        const resized =
            faceapi.resizeResults(
                detection,
                displaySize
            );

        const ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        faceapi.draw.drawDetections(
            canvas,
            resized
        );

    } else {

        faceDetected = false;

        statusText.textContent =
            "No face detected";

        statusDot.style.background = "orange";

        const ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    requestAnimationFrame(detectFace);
}


// -----------------------------
// Mark Attendance
// -----------------------------

markBtn.addEventListener("click", () => {

    if (!faceDetected) {

        alert("Please show your face to the camera.");

        return;
    }

    const today =
        new Date().toLocaleDateString();

    // Prevent duplicate attendance
    const alreadyMarked = attendance.some(
        item =>
            item.id === student.id &&
            item.date === today
    );

    if (alreadyMarked) {

        alert("Attendance already marked!");

        return;
    }

    const now =
        new Date().toLocaleTimeString();

    const record = {

        name: student.name,

        id: student.id,

        time: now,

        date: today,

        status: "Present"
    };

    attendance.push(record);

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );

    displayAttendance();

    alert(
        `${student.name}'s attendance marked successfully!`
    );
});


// -----------------------------
// Display Attendance
// -----------------------------

function displayAttendance() {

    table.innerHTML = "";

    const today =
        new Date().toLocaleDateString();

    const todayAttendance =
        attendance.filter(
            item => item.date === today
        );

    todayAttendance.forEach(item => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.id}</td>
            <td>${item.time}</td>
            <td class="present">
                ${item.status}
            </td>
        `;

        table.appendChild(row);
    });

    total.textContent =
        todayAttendance.length;
}


// -----------------------------
// Clear Attendance
// -----------------------------

clearBtn.addEventListener("click", () => {

    if (
        confirm(
            "Are you sure you want to clear attendance?"
        )
    ) {

        attendance = [];

        localStorage.removeItem(
            "attendance"
        );

        displayAttendance();
    }

});


// Initial display
displayAttendance();