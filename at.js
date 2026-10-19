/*
  CODE INDEX
  DOM elements        - const add
  Load                - function loadMembers
  Add member          - function addMember
  Generate ID         - function generateID
  Generate QR         - function generateQR
  Scan result element - const result
  Scanner functions   - function onScanSuccess
  Scanner Config      - const scanner
  Start scanner       - scanner.render
*/



const SUPABASE_URL = 'https://qwazjyhgmygwrhllksso.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XnKSJ7AX97sNy00y0tK52Q_TWuPbpqC';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const add = document.getElementById('addBtn');
const attnd = document.getElementById('members-table');
const attendanceTable = document.getElementById('attendance-table');
const input = document.getElementById('addMember');

function LocalStoreMembers(Name, Qrcode) {
    const members = JSON.parse(localStorage.getItem("members")) || [];
    members.push({ name: Name, qrcode: Qrcode });
    localStorage.setItem("members", JSON.stringify(members));
}



function formatTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value || "";
    }

    return date.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}





function LocalStoreAttendance(Name, timestamp) {
    const attendance =
        JSON.parse(localStorage.getItem("attendance")) || [];

    attendance.push({
        name: Name,
        time: timestamp
    });

    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );
}




async function syncMembers() {
    console.log("===== SYNC DIAGNOSTIC START =====");

    // Check local attendance
    const localAttendance = JSON.parse(
        localStorage.getItem("attendance") || "[]"
    );

    console.log("LOCAL ATTENDANCE:", localAttendance);
    console.log("LOCAL COUNT:", localAttendance.length);

    // Check Supabase members
    const { data: members, error: membersError } = await supabaseClient
        .from('members')
        .select('*');

    if (membersError) {
        console.error("Failed to fetch members:", membersError);
        return;
    }

    console.log("SUPABASE MEMBERS:", members);

    // Check Supabase attendance
    const { data: attendanceData, error: attendanceError } =
        await supabaseClient
            .from('attendance')
            .select('*');

    if (attendanceError) {
        console.error("Failed to fetch attendance:", attendanceError);
        return;
    }

    console.log("SUPABASE ATTENDANCE:", attendanceData);
    console.log("SUPABASE COUNT:", attendanceData.length);

    // Compare local records against Supabase
    for (const record of localAttendance) {
        const exists = attendanceData.some(
            savedRecord =>
                savedRecord.name === record.name &&
                savedRecord.time === record.time
        );

        console.log(
            "LOCAL RECORD:",
            record,
            "| EXISTS IN SUPABASE:",
            exists
        );
    }

    console.log("===== SYNC DIAGNOSTIC END =====");
}

async function loadMembers() {
    let { data, error } = await supabaseClient
        .from('members')
        .select('*');

    if (error) {
        console.error('Failed to load members:', error.message);
        data = JSON.parse(localStorage.getItem("members") || "[]");
    }


    data.forEach(member => {
        const newRow = document.createElement('tr');
        const memberId = member.qrcode;
        const img = document.createElement('img');
        img.classList.add('qrimg');
        img.style.display = 'none';

        const nameCell = document.createElement('td');
        const qrcode = document.createElement('td');

        generateQR(memberId, img);

        nameCell.textContent = member.name;

        const showBtn = document.createElement('button');
        showBtn.textContent = 'Show QR';

        qrcode.appendChild(img);
        qrcode.appendChild(showBtn);

        newRow.dataset.qrcode = memberId;

        showBtn.onclick = function () {
            if (img.style.display === 'none') {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        };
        newRow.appendChild(nameCell);
        newRow.appendChild(qrcode);
        attnd.querySelector('tbody').appendChild(newRow);
    });
}




async function loadAttendance() {
    const { data, error } = await supabaseClient
        .from('attendance')
        .select('*');

    let records;

    if (error) {
        console.error("Failed to load attendance:", error.message);
        records = JSON.parse(
            localStorage.getItem("attendance") || "[]"
        );
    } else {
        records = data;
    }

    const tbody = attendanceTable.querySelector('tbody');
    tbody.replaceChildren();

    records.forEach(record => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const timeCell = document.createElement('td');

        nameCell.textContent = record.name;
        timeCell.textContent = formatTime(record.time);

        row.appendChild(nameCell);
        row.appendChild(timeCell);
        tbody.appendChild(row);
    });
}








async function initializeApp() {
    try {
        await loadMembers();
        await loadAttendance();
    } catch (error) {
        console.error("Failed to initialize app:", error);
    }
}

initializeApp();

function addbutton() {
    const memberName = input.value.trim();

    if (memberName === '') {
        alert('Please fill in the member name!');
        return;
    }

    addMember(memberName);
    input.value = '';
}

// Press Enter
input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addbutton();
    }
});

// Click the Add button
add.addEventListener('click', function () {
    addbutton();
});

// add member
async function addMember(member) {
    const newRow = document.createElement('tr');
    const memberId = generateID();
    const img = document.createElement('img');
    img.classList.add('qrimg');
    img.style.display = 'none';

    const nameCell = document.createElement('td');
    const qrcode = document.createElement('td');

    generateQR(memberId, img);

    nameCell.textContent = member;

    const showBtn = document.createElement('button');
    showBtn.textContent = 'Show QR';

    qrcode.appendChild(img);
    qrcode.appendChild(showBtn);
    newRow.dataset.qrcode = memberId;
    showBtn.onclick = function () {
        if (img.style.display === 'none') {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    };
    newRow.appendChild(nameCell);
    newRow.appendChild(qrcode);
    attnd.querySelector('tbody').appendChild(newRow);

    const { data, error } = await supabaseClient
        .from('members')
        .insert({
            name: nameCell.textContent,
            qrcode: memberId
        })

    if (error) {
        console.error('Failed to save member:', error.message);
    } else {
        console.log('Member saved!');
    };

    LocalStoreMembers(nameCell.textContent, memberId);
}



async function deleteattendance(name) {
    const { error } = await supabaseClient
        .from('attendance')
        .delete()
        .eq('name', name)

    if (error) {
        console.log("Failed to delete");
        return
    }


    let attendance = JSON.parse(
        localStorage.getItem("attendance") || "[]"
    );

    attendance = attendance.filter(
        record => record.name !== name
    );

    localStorage.setItem("attendance", JSON.stringify(attendance));

    loadAttendance();
    console.log(name + "Deleted!")
}

async function searchMembers(name) {
    const { data, error } = await supabaseClient
        .from('attendance')
        .select('*')
        .ilike('name', `%${name}%`);

    if (error) {
        console.error('Failed to search attendance:', error.message);
        return;
    }

    console.log(data);

    const tbody = attendanceTable.querySelector('tbody');
    tbody.replaceChildren();

    data.forEach(record => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const timeCell = document.createElement('td');

        nameCell.textContent = record.name;
        timeCell.textContent = formatTime(record.time);
        row.appendChild(nameCell);
        row.appendChild(timeCell);

        tbody.appendChild(row);
    });
}



async function recordAttendance(name) {
    const timestamp = new Date().toISOString();

    const { error } = await supabaseClient
        .from('attendance')
        .insert({
            name: name,
            time: timestamp
        });

    if (error) {
        console.error("Failed to record attendance:", error.message);
        return;
    }

    console.log("Attendance recorded!");

    const newRow = document.createElement('tr');
    const nameCell = document.createElement('td');
    const timeCell = document.createElement('td');

    newRow.classList.add('attendance-row');
    nameCell.textContent = name;
    timeCell.textContent = formatTime(timestamp);

    newRow.appendChild(nameCell);
    newRow.appendChild(timeCell);

    attendanceTable.querySelector('tbody').appendChild(newRow);

    LocalStoreAttendance(name, timestamp);
}


function checkRecord(name) {
    const attendance = JSON.parse(localStorage.getItem("attendance")) || [];
    return attendance.some(record => record.name === name);
}
function generateID() {
    return "SSLG" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function generateQR(memberId, img) {

    img.src = "https://quickchart.io/qr?text="
        + encodeURIComponent(memberId)
        + "&size=200";

    img.alt = "QR Code for " + memberId;

}

const result = document.getElementById('result');


let lastScanTime = 0;

//scanning function
function onScanSuccess(decodedText) {
    const now = Date.now();

    if (now - lastScanTime < 3000) return;
    lastScanTime = now;

    const rows = document.querySelectorAll(
        "#members-table tbody tr"
    );

    rows.forEach(row => {
        if (row.dataset.qrcode === decodedText) {
            const name = row.cells[0].textContent;

            if (!checkRecord(name)) {
                recordAttendance(name);
            }
        }
    });
}
const scanner = new Html5QrcodeScanner(
    "reader",
    {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    },
    false
);

scanner.render(onScanSuccess);

async function clearAttendance() {
    const { error } = await supabaseClient
        .from('attendance')
        .delete()
        .not('name', 'is', null);

    if (error) {
        console.error('Failed to clear attendance:', error.message);
        return;
    }

    localStorage.setItem("attendance", JSON.stringify([]));

    attendanceTable.querySelector('tbody').replaceChildren();

    console.log("Attendance cleared!");
}
