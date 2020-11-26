// this function retrieves information from scheduling.json

async function getDays() {
  const response = await fetch("scheduling.json");
  const json = await response.json();
  return json;
}

//function to load days from JSON file

async function loadDays() {
  const days = await getDays();
  const daySection = document.getElementById("day-section");
  days.map((dayObject) => {
    const button = document.createElement("button");
    button.innerHTML = dayObject.day + " " + dayObject.date;
    daySection.appendChild(button);
    button.onclick = function () {
      loadSlotsforDay(dayObject);
    };
  });
}

// reuseable function to clear html elements once another element has been selected

function clearSection(sectionIds) {
  sectionIds.forEach(
    (sectionId) => (document.getElementById(sectionId).innerHTML = "")
  );
}

// function to load the slots for the day selected

let selectDay;

function loadSlotsforDay(dayObject) {
  selectDay = dayObject;
  const slotSection = document.getElementById("slot-section");
  const slotSelect = document.getElementById("slotSelect");
  clearSection(["slotSelect", "slot-section"]);
  Object.keys(dayObject.slots).map((slotKey) => {
    const slot = dayObject.slots[slotKey];
    const option = document.createElement("option");
    option.appendChild(document.createTextNode(slot.time));
    option.value = slotKey;
    slotSelect.appendChild(option);
  });
  slotSection.appendChild(slotSelect);
}

// reuseable function to build tables. format taken from https://stackoverflow.com/questions/8302166/dynamic-creation-of-table-with-dom

function buildTable({
  columns,
  elements,
  objectKeys,
  extraElement,
  elementHtml,
  requiredKey,
  onClickFunction,
}) {
  const table = document.createElement("table");

  let td;
  const tr = document.createElement("tr");
  columns.forEach((column) => {
    tr.appendChild((td = document.createElement("td")));
    td.innerHTML = column;
  });
  if (extraElement) tr.appendChild((td = document.createElement("td")));
  table.appendChild(tr);

  elements.forEach((element) => {
    const elementValues = objectKeys.map((key) => ({
      type: key.type,
      value: key.type === "additionalInfo" ? key.value : element[key.value],
    }));
    let td;
    const tr = document.createElement("tr");
    elementValues.forEach((elementValue) => {
      tr.appendChild((td = document.createElement("td")));
      td.innerHTML =
        elementValue.type === "link"
          ? `<a href=${elementValue.value} target="blank">See More</a>`
          : elementValue.value;
    });
    if (
      extraElement &&
      element[requiredKey] &&
      element[requiredKey].length > 0
    ) {
      const newElement = document.createElement(extraElement);
      newElement.innerHTML = elementHtml;
      newElement.onclick = function () {
        onClickFunction(element);
      };
      tr.appendChild((td = document.createElement("td")));
      td.appendChild(newElement);
    }
    table.appendChild(tr);
  });
  return table;
}

// function to build tables for sessions using the buildTable function. reusable for function "filter" and "loadSessions" as they use the same format

function buildSessionTable(sessions) {
  clearSection(["session-section"]);
  const sessionTable = buildTable({
    columns: ["Title", "Start Time", "Room", "Session Type"],
    elements: sessions,
    objectKeys: [
      { value: "title" },
      { value: "time" },
      { value: "room" },
      { value: "type" },
    ],
    extraElement: "button",
    elementHtml: "More",
    requiredKey: "submissions",
    onClickFunction: loadSubmissions,
  });
  const sessionSection = document.getElementById("session-section");
  sessionSection.appendChild(sessionTable);
}

// function to retrieve sessions

function fetchSessions() {
  const e = document.getElementById("slotSelect");
  const slotKey = e.options[e.selectedIndex].value;
  const slotObject = selectDay.slots[slotKey];
  return slotObject.sessions;
}

// function load sessions using the buildSessionTable function

function loadSessions() {
  if (selectDay) {
    buildSessionTable(fetchSessions());
  } else {
    console.error("no day");
  }
}

// function loadSubmissions using the buildTable function and clearSection function

function loadSubmissions(sessionObject) {
  clearSection(["submission-section"]);
  const submissionTable = buildTable({
    columns: ["Submission Title", "Start Time", "DOIUrl"],
    elements: sessionObject.submissions,
    objectKeys: [
      { value: "title" },
      { value: sessionObject.time, type: "additionalInfo" },
      { value: "doiUrl", type: "link" },
    ],
  });
  const submissionSection = document.getElementById("submission-section");
  submissionSection.appendChild(submissionTable);
}

// this function filters the session type according to the radio buttons

function filter(type) {
  const sessions = fetchSessions();
  buildSessionTable(
    type === "paper"
      ? sessions.filter((sessionObject) => sessionObject.type === "paper")
      : sessions.filter((sessionObject) => sessionObject.type !== "paper")
  );
}

loadDays();
