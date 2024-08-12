const BASE_URL =
  "https://join-4da86-default-rtdb.europe-west1.firebasedatabase.app/";

let loadedUserArray = {};
let colors = [];
let userColors = {};

/**
 * Loading data from DB and moves it to an local object for display
 */
async function loadData() {
  let response = await fetch(BASE_URL + ".json");
  const data = await response.json();
  if (data && typeof data === "object" && data.users) {
    loadedUserArray = data.users;
    displayContacts(loadedUserArray);
  }
}

/**
 * Sorting and displaying the contactlist
 * @param {*} users
 */
async function displayContacts(users) {
  let container = document.getElementById("contact-list");
  container.innerHTML = "";
  let sortedUsers = Object.values(users).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let lastInitial = "";
  for (let i = 0; i < sortedUsers.length; i++) {
    let user = sortedUsers[i];
    let color = user.color || generateRandomColor();
    userColors[user.username] = color;
    colors.push(color);
    let initial = user.username[0].toUpperCase();
    if (initial !== lastInitial) {
      container.innerHTML += `<div class="contact-list-letter"><h3>${initial}</h3></div><hr>`;
      lastInitial = initial;
    }
    container.innerHTML += /*html*/ `
      <div onclick="renderContactDetails(${i}), contactCardClick(this, ${i})" id="contact-info${i}" class="contact">
        <div class="initials" style="background-color: ${color};">${getInitials(
      user.username
    )}</div>
          <div class="contact-info">
            <p id="name${i}" class="name"><span>${user.username}</span></p>
            <p class="email">${user.email}</p>
          </div>
        </div>
    `;
  }
}

/**
 * Highlighting selected contactcard
 * @param {*} contactCard
 * @param {*} i
 */
function contactCardClick(contactCard, i) {
  let nameElement = document.getElementById(`name${i}`);
  if (contactCard.classList.contains("contact-card-click")) {
    contactCard.classList.remove("contact-card-click");
    nameElement.classList.remove("contact-name");
  } else {
    closeAllContactClicks();
    contactCard.classList.add("contact-card-click");
    nameElement.classList.add("contact-name");
  }
}

/**
 * Unhighlighting non selected contactcards
 */
function closeAllContactClicks() {
  let contactCards = document.getElementsByClassName("contact");
  for (let contactCard of contactCards) {
    contactCard.classList.remove("contact-card-click");
  }
  let nameElements = document.getElementsByClassName("contact-name");
  for (let nameElement of nameElements) {
    nameElement.classList.remove("contact-name");
  }
}

/**
 * Generating a random CSS Color for the contactlist
 * @returns
 */
function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Adds a new contact, generates color, saves it, user feedback, updates DB and Display
 * @param {*} path
 * @returns
 */
async function addContactS(path = "users") {
  let userNameInput = document.getElementById("addInputNameA");
  let emailInput = document.getElementById("addInputEmailB");
  let phoneInput = document.getElementById("addInputPhoneC");
  let color = generateRandomColor();
  let data = {
    username: userNameInput.value,
    email: emailInput.value,
    contactNumber: phoneInput.value,
    color: color,
  };
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  cleanInputFields();
  showSuccessPopUp();
  return await response.json();
}

function showSuccessPopUp() {
  if (window.innerWidth < 1350) {
    document.getElementById("contact-success").style = `left: 30px;`;
  } else {
    document.getElementById("contact-success").style = `left: 64px;`;
  }
  setTimeout(closeSuccessPopUp, 1200);
}

function closeSuccessPopUp() {
  document.getElementById("contact-success").style = `left: 100%;`;
}

/**
 * Deletes the selected user from the contactlist
 * @param {*} i
 * @returns
 */
async function deleteContact(i) {
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let userId = Object.keys(loadedUserArray).find(
    (key) => loadedUserArray[key] === sortedUsers[i]
  );
  let response = await fetch(BASE_URL + "users/" + userId + ".json", {
    method: "DELETE",
  });
  await loadData();
  document.getElementById("render-contact-details").innerHTML = "";
  closeContactDetailsMobile();
  return await response.json();
}

/**
 * Cleaning the Inputfields for Add new contact form
 */
function cleanInputFields() {
  let userNameInput = document.getElementById("addInputNameA");
  let emailInput = document.getElementById("addInputEmailB");
  let phoneInput = document.getElementById("addInputPhoneC");
  if (userNameInput) userNameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (phoneInput) phoneInput.value = "";
}

/**
 * HTML Rendering the Detail of a contact
 * @param {*} i
 */
function renderContactDetails(i) {
  let contactDetail = document.getElementById("render-contact-details");
  let contactDetailsMobile = document.getElementById(
    "render-contact-details-mobile"
  );
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let user = sortedUsers[i];
  let color = userColors[user.username] || user.color || generateRandomColor(); // Stelle sicher, dass die Farbe entweder aus userColors oder aus dem Benutzerobjekt verwendet wird
  userColors[user.username] = color;
  if (window.innerWidth < 1170) {
    contactDetailsMobile.innerHTML = /*html*/ `
        <div class="render-details-head-mobile">
          <div id="initials-detail" class="profile-initials-mobile">${getInitials(
            user.username
          )}</div>
          <div class="profile-name-mobile">${user.username}</div>
        </div>
        </div>
        <div class="render-details-info">
            <div class="contact-info-headline-mobile">Contact Information</div>
            <div>
                <div class="single-info">
                    <span><b>Email</b></span>
                    <span><a href="mailto:${user.email}">${
      user.email
    }</a></span>
                </div>
                <div class="single-info">
                    <span><b>Phone</b></span>
                    <span>${user.contactNumber}</span>
                </div>
            </div>
        </div>
        <div onclick="openMobileEditMenu(); stop(event)" id="details-mobile-round-btn" class="details-mobile-round-btn">
          <img src="../assets/img/kebab-menu.svg" alt="more options">
        </div>
        <div id="mobile-edit-menu">
            <div class="edit-delete-child-mobile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_207322_3882" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_207322_3882)">
                        <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                    </g>
                </svg>
                <span onclick="openEditContact(); renderEdit(${i})">Edit</span>
            </div>
            <div onclick="deleteContact(${i})" class="edit-delete-child-mobile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_207322_4146" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_207322_4146)">
                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                    </g>
                </svg>
                <span>Delete</span>
            </div>
          </div>
    `;
    document
      .getElementById("contact-details-mobile")
      .classList.remove("d-none");
    document.getElementById("details-mobile-add-btn").classList.add("d-none");
  } else {
    contactDetail.innerHTML = /*html*/ `
      <div class="render-details-head">
      <div id="initials-detail" class="profile-initials" style="background-color: ${color};">${getInitials(
      user.username
    )}</div>
              <div>
                  <div class="profile-name">${user.username}</div>
                  <div class="edit-delete-cont">
                      <div class="edit-delete-child">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <mask id="mask0_207322_3882" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                  <rect width="24" height="24" fill="#D9D9D9"/>
                              </mask>
                              <g mask="url(#mask0_207322_3882)">
                                  <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                              </g>
                          </svg>
                          <span onclick="openEditContact(); renderEdit(${i})">Edit</span>
                      </div>
                      <div onclick="deleteContact(${i})" class="edit-delete-child">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <mask id="mask0_207322_4146" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                  <rect width="24" height="24" fill="#D9D9D9"/>
                              </mask>
                              <g mask="url(#mask0_207322_4146)">
                                  <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                              </g>
                          </svg>
                          <span>Delete</span>
                      </div>
              </div>
          </div>
      </div>
      <div class="render-details-info">
          <div class="contact-info-headline">Contact Information</div>
          <div>
              <div class="single-info">
                  <span><b>Email</b></span>
                  <span><a href="mailto:${user.email}">${user.email}</a></span>
              </div>
              <div class="single-info">
                  <span><b>Phone</b></span>
                  <span>${user.contactNumber}</span>
              </div>
          </div>
      </div>
  `;
    contactDetail.style = `width: 100%; left: 0;`;
    document.getElementById(
      "initials-detail"
    ).style.background = `${colors[i]}`;
  }
}

/**
 * Getting the first character from the names
 * @param {*} name
 * @returns
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
}

/**
 * Saving changes after a contact is edited from indexed user and handles the color
 * @returns
 */
async function saveContact() {
  let editNameInput = document.getElementById("editInputName");
  let editEmailInput = document.getElementById("editInputEmail");
  let editPhoneInput = document.getElementById("editInputPhone");
  let updatedData = {
    username: editNameInput.value,
    email: editEmailInput.value,
    contactNumber: editPhoneInput.value,
  };
  let userIndex = window.currentlyEditingUserIndex;
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  if (userIndex < 0 || userIndex >= sortedUsers.length) {
    return;
  }
  let userId = Object.keys(loadedUserArray).find(
    (key) => loadedUserArray[key] === sortedUsers[userIndex]
  );
  let color =
    userColors[sortedUsers[userIndex].username] || generateRandomColor();
  userColors[updatedData.username] = color;
  updatedData.color = color;
  let response = await fetch(BASE_URL + "users/" + userId + ".json", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  closeEditContactPopup();
  closeContactDetailsMobile();
  document.getElementById("render-contact-details").innerHTML = "";
  await loadData();
  displayContacts(loadedUserArray);
}

/**
 * Rendering the contactedit popup
 * @param {*} i
 */
function renderEdit(i) {
  window.currentlyEditingUserIndex = i;
  let sortedUsers = Object.values(loadedUserArray).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  if (i >= 0 && i < sortedUsers.length) {
    let user = sortedUsers[i];
    let editContainer = document.getElementById("editContact");
    editContainer.innerHTML = "";
    editContainer.innerHTML = /*html*/ `
    <div class="edit-contact-top-left-section">
      <img class="edit-contact-logo" src="../assets/img/join_logo_white.png" alt="">
      <h1 class="edit-contact-headline">Edit contact</h1>
      <div class="edit-contact-separator"></div>
    </div>
    <div class="edit-contact-bottom-right-section">
      <span class="edit-contact-avatar"></span>
      <div class="edit-contact-bottom-rightmost-section">
        <div type="reset" onclick="closeEditContactPopup()" id="contactCloseButton" class="edit-contact-close"></div>
        <form onsubmit="editValidateName(); return false" class="edit-contact-form" name="editForm">
          <div class="input-edit-container">
            <input onkeyup="clearEditFields()" name="editName" class="edit-imput edit-imput-name" id="editInputName" type="text" placeholder="Name" value="${user.username}"><br> 
            <span class="validSpanField" id="editValidSpanFieldName"></span>
          </div>
          <div class="input-edit-container">
            <input onkeyup="clearEditFields()" name="editEmail" class="edit-imput edit-imput-email" id="editInputEmail" type="text" placeholder="Email" value="${user.email}"><br> 
            <span class="validSpanField" id="editValidSpanFieldEmail"></span>
          </div>
          <div class="input-edit-container">
            <input onkeyup="clearEditFields()" name="editPhone" class="edit-imput edit-imput-phone" id="editInputPhone" type="number" placeholder="Phone" value="${user.contactNumber}"><br> 
            <span class="validSpanField" id="editValidSpanFieldPhone"></span>
          </div>
        <div class="button-edit-container">
          <button onclick="deleteContact(${i})" class="btn-cancel">
            Delete
          </button>
          <button type="submit" class="btn-create btn-create:hover ::root">Save<img src="../assets/img/check.svg"></button>
          </form>
        </div> 
      </div>
    </div>
    `;
  }
}

function closeContactDetailsMobile() {
  document.getElementById("contact-details-mobile").classList.add("d-none");
  document.getElementById("details-mobile-add-btn").classList.remove("d-none");
}

function openMobileEditMenu() {
  document.getElementById(
    "details-mobile-round-btn"
  ).style = `background-color: var(--darkLightBlue)`;
  document.getElementById(
    "mobile-edit-menu"
  ).style = `right: 12px; width: 116px`;
}

function closeMobileEditMenu() {
  document.getElementById("mobile-edit-menu").style = `right: 0; width: 0`;
}

function stop(event) {
  event.stopPropagation();
}

/**
 * Clears the Errorfields on contact forms
 */
function clearValidateFields() {
  let xName = document.getElementById("validSpanFieldName");
  let xEmail = document.getElementById("validSpanFieldEmail");
  let xPhone = document.getElementById("validSpanFieldPhone");
  xName.innerHTML = "";
  xEmail.innerHTML = "";
  xPhone.innerHTML = "";
}

/**
 * Clears the Errorfields on contact forms
 */
function clearEditFields() {
  let yName = document.getElementById("editValidSpanFieldName");
  let yEmail = document.getElementById("editValidSpanFieldEmail");
  let yPhone = document.getElementById("editValidSpanFieldPhone");
  yName.innerHTML = "";
  yEmail.innerHTML = "";
  yPhone.innerHTML = "";
}

/**
 * Checking regex for the name and points to the email if correct
 * @returns
 */
function validateName() {
  let x = document.forms["addContactForm"]["addName"].value;
  let xName = document.getElementById("validSpanFieldName");
  if (x == "") {
    xName.innerHTML = "Please fill your name";
    return false;
  } else {
    return validateEmail();
  }
}

/**
 * Checking regex for the email and points to the phonenumber
 * @returns
 */
function validateEmail() {
  let x = document.forms["addContactForm"]["addEmail"].value;
  let xEmail = document.getElementById("validSpanFieldEmail");
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (x == "") {
    xEmail.innerHTML = "Please fill your email";
    return false;
  } else if (!emailPattern.test(x)) {
    xEmail.innerHTML = "Please enter a valid email address";
    return false;
  } else {
    return validatePhone();
  }
}

/**
 * checking regex for the phone and if correct adds the new contact
 * @returns
 */
function validatePhone() {
  let x = document.forms["addContactForm"]["addPhone"].value;
  let xPhone = document.getElementById("validSpanFieldPhone");
  if (x == "") {
    xPhone.innerHTML = "Please fill your phone";
    return false;
  } else {
    addContactS();
    closeContactPopup();
    setTimeout(() => {
      loadData();
    }, 500);
    return false;
  }
}

/**
 * Checking regex for the name and points to the email if correct
 * @returns
 */
function editValidateName() {
  let x = document.forms["editForm"]["editName"].value;
  let xName = document.getElementById("editValidSpanFieldName");
  if (x == "") {
    xName.innerHTML = "Please fill your name";
    return false;
  } else {
    return editValidateEmail();
  }
}

/**
 * Checking regex for the email and points to the phone if correct
 * @returns
 */
function editValidateEmail() {
  let x = document.forms["editForm"]["editEmail"].value;
  let xEmail = document.getElementById("editValidSpanFieldEmail");
  let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (x == "") {
    xEmail.innerHTML = "Please fill your email";
    return false;
  } else if (!emailPattern.test(x)) {
    xEmail.innerHTML = "Please enter a valid email address";
    return false;
  } else {
    return editValidatePhone();
  }
}

/**
 * Checking regex for the phone and saves the contact if correct
 * @returns
 */
function editValidatePhone() {
  let x = document.forms["editForm"]["editPhone"].value;
  let xPhone = document.getElementById("editValidSpanFieldPhone");
  if (x == "") {
    xPhone.innerHTML = "Please fill your phone";
    return false;
  } else {
    saveContact();
    return false;
  }
}
