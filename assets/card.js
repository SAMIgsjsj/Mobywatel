var confirmElement = document.querySelector(".confirm");

function closePage() {
  clearClassList();
}

function openPage(page) {
  clearClassList();
  if (!confirmElement) return;
  var classList = confirmElement.classList;
  classList.add("page_open");
  classList.add("page_" + page + "_open");
}

function clearClassList() {
  if (!confirmElement) return;
  var classList = confirmElement.classList;
  classList.remove("page_open");
  classList.remove("page_1_open");
  classList.remove("page_2_open");
  classList.remove("page_3_open");
}

var time = document.getElementById("time");
var options = { year: 'numeric', month: 'numeric', day: 'numeric' };

if (localStorage.getItem("update") == null) {
  localStorage.setItem("update", "24.12.2024");
}

var date = new Date();

var updateText = document.querySelector(".bottom_update_value");
if (updateText) {
  updateText.innerHTML = localStorage.getItem("update");
}

var update = document.querySelector(".update");
if (update) {
  update.addEventListener('click', () => {
    var now = new Date();
    var newDate = now.toLocaleDateString("pl-PL", options);
    localStorage.setItem("update", newDate);
    if (updateText) {
      updateText.innerHTML = newDate;
    }
    scroll(0, 0);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

setClock();
function setClock() {
  date = new Date();
  if (time) {
    time.innerHTML = "Czas: " + date.toLocaleTimeString() + " " + date.toLocaleDateString("pl-PL", options);
  }
  delay(1000).then(() => {
    setClock();
  });
}

var unfold = document.querySelector(".info_holder");
if (unfold) {
  unfold.addEventListener('click', () => {
    if (unfold.classList.contains("unfolded")) {
      unfold.classList.remove("unfolded");
    } else {
      unfold.classList.add("unfolded");
    }
  });
}

var data = {};

try {
  var savedProfileRaw = localStorage.getItem("mobywatel_profile_data");
  if (savedProfileRaw) {
    var parsedProfile = JSON.parse(savedProfileRaw);
    if (parsedProfile && typeof parsedProfile === "object") {
      data = Object.assign({}, parsedProfile);
    }
  }
} catch (e) {
  console.warn("Błąd odczytu profilu z localStorage:", e);
}

var params = new URLSearchParams(window.location.search);
for (var key of params.keys()) {
  var paramVal = params.get(key);
  if (paramVal !== null && paramVal !== "") {
    data[key] = paramVal;
  }
}

if (!data.birthday && data.birthDate && typeof data.birthDate === "object") {
  var bDay = String(data.birthDate.day || "").trim();
  var bMonth = String(data.birthDate.month || "").trim();
  var bYear = String(data.birthDate.year || "").trim();
  if (bDay && bMonth && bYear) {
    data.birthday = `${bDay.padStart(2, "0")}.${bMonth.padStart(2, "0")}.${bYear}`;
  }
}

var ownImageEl = document.querySelector(".id_own_image");
if (ownImageEl && data["image"]) {
  var safeImg = String(data["image"]).replace(/"/g, "&quot;");
  ownImageEl.style.backgroundImage = `url("${safeImg}")`;
}

var rawBirthday = typeof data["birthday"] === "string" && data["birthday"].includes(".")
  ? data["birthday"]
  : "01.01.2000";
var birthdaySplit = rawBirthday.split(".");
var day = parseInt(birthdaySplit[0], 10) || 1;
var month = parseInt(birthdaySplit[1], 10) || 1;
var year = parseInt(birthdaySplit[2], 10) || 2000;

var birthdayDate = new Date();
birthdayDate.setDate(day);
birthdayDate.setMonth(month - 1);
birthdayDate.setFullYear(year);

var birthdayFormatted = birthdayDate.toLocaleDateString("pl-PL", options);

var sexRaw = (data["sex"] || "m").toString().toLowerCase();
var sexLabel = sexRaw === "k" || sexRaw === "kobieta" ? "Kobieta" : "Mężczyzna";

setData("name", (data["name"] || "").toString().toUpperCase());
setData("surname", (data["surname"] || "").toString().toUpperCase());
setData("nationality", (data["nationality"] || "").toString().toUpperCase());
setData("birthday", birthdayFormatted);
setData("familyName", data["familyName"] || "");
setData("sex", sexLabel);

if (!localStorage.getItem("seriesAndNumber")) {
  var generatedSeries = generateSeriesAndNumber();
  localStorage.setItem("seriesAndNumber", generatedSeries);
}
var seriesAndNumber = localStorage.getItem("seriesAndNumber");

data["seriesAndNumber"] = seriesAndNumber;
setData("seriesAndNumber", data["seriesAndNumber"]);

setData("fathersFamilyName", data["fathersFamilyName"] || "");
setData("mothersFamilyName", data["mothersFamilyName"] || "");
setData("fathersName", (data["fathersName"] || "").toString().toUpperCase());
setData("mothersName", (data["mothersName"] || "").toString().toUpperCase());
setData("birthPlace", data["birthPlace"] || "");
setData("expiryDate", data["expiryDate"] || "");
setData("givenDate", data["givenDate"] || "");
setData("countryOfBirth", data["countryOfBirth"] || "");

var streetPart = data["adress1"] ? "ul. " + data["adress1"] : "ul.";
var cityPart = [data["adress2"], data["city"]].filter(Boolean).join(" ");
setData("adress", streetPart + (cityPart ? "<br>" + cityPart : "<br> "));

if (!localStorage.getItem("homeDate")) {
  var homeDay = getRandom(1, 25);
  var homeMonth = getRandom(0, 12);
  var homeYear = getRandom(2012, 2019);

  var homeDate = new Date();
  homeDate.setDate(homeDay);
  homeDate.setMonth(homeMonth);
  homeDate.setFullYear(homeYear);

  localStorage.setItem("homeDate", homeDate.toLocaleDateString("pl-PL", options));
}

var homeDateEl = document.querySelector(".home_date");
if (homeDateEl) {
  homeDateEl.innerHTML = localStorage.getItem("homeDate");
}

var peselMonth = month;
if (year >= 2000) {
  peselMonth = 20 + peselMonth;
}

var later = sexLabel.toLowerCase() === "mężczyzna" ? "0295" : "0382";
var dayStr = day < 10 ? "0" + day : String(day);
var monthStr = peselMonth < 10 ? "0" + peselMonth : String(peselMonth);

var pesel = year.toString().slice(-2) + monthStr + dayStr + later + "7";
setData("pesel", pesel);

function setData(id, value) {
  var el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.innerHTML = value;
  }
}

function getRandom(min, max) {
  return parseInt(Math.random() * (max - min) + min, 10);
}

function generateSeriesAndNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const series = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const number = String(Math.floor(10000 + Math.random() * 90000));
  return `${series} ${number}`;
}