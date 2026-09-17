let members = [];

function addMember() {

    const name = document.getElementById("name").value;
    const position = document.getElementById("position").value;
    const section = document.getElementById("section").value;

    if (!name || !position || !section) {
        alert("Please fill in all fields.");
        return;
    }

    const qrId = "SSLG-" + Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    const member = {
        name: name,
        position: position,
        section: section,
        qrId: qrId,
        attendance: false
    };

    members.push(member);

    displayMembers();

    document.getElementById("name").value = "";
    document.getElementById("position").value = "";
    document.getElementById("section").value = "";
}


function displayMembers() {

    const list = document.getElementById("memberList");

    list.innerHTML = "";

    members.forEach(member => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.position}</td>
            <td>${member.section}</td>
            <td>${member.qrId}</td>
            <td>
                ${member.attendance ? "Present" : "Not yet recorded"}
            </td>
        `;

        list.appendChild(row);
    });
}


function scanQR() {

    const qrId = document.getElementById("qrInput").value;
    const result = document.getElementById("scanResult");

    const member = members.find(
        member => member.qrId === qrId
    );

    if (!member) {
        result.textContent = "QR code not recognized.";
        result.style.color = "red";
        return;
    }

    if (member.attendance) {
        result.textContent =
            `${member.name} is already marked present.`;

        result.style.color = "orange";
        return;
    }

    member.attendance = true;

    result.textContent =
        `${member.name} — Attendance recorded!`;

    result.style.color = "green";

    displayMembers();

    document.getElementById("qrInput").value = "";
}
