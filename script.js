const STORAGE_KEY = "studentProfiles";
const MAX_PHOTO_SIZE = 1024 * 1024;

const form = document.querySelector("#profile-form");
const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-profile-button");
const formMessage = document.querySelector("#form-message");
const recordIdInput = document.querySelector("#student-record-id");
const photoInput = document.querySelector("#profile-photo");
const photoPreview = document.querySelector("#photo-preview");
const studentCards = document.querySelector("#student-cards");
const emptyState = document.querySelector("#empty-state");

const profileFields = [
  { name: "fullName", label: "Full Name" },
  { name: "dateOfBirth", label: "Date of Birth" },
  { name: "gender", label: "Gender" },
  { name: "email", label: "Email Address" },
  { name: "mobileNumber", label: "Mobile Number" },
  { name: "fatherName", label: "Father's Name" },
  { name: "motherName", label: "Mother's Name" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pinCode", label: "PIN Code" },
  { name: "studentId", label: "Student ID / Roll Number" },
  { name: "collegeName", label: "College Name" },
  { name: "universityName", label: "University Name" },
  { name: "degree", label: "Degree / Course" },
  { name: "department", label: "Department / Branch" },
  { name: "currentSemester", label: "Current Semester" },
  { name: "academicYear", label: "Academic Year" },
  { name: "admissionYear", label: "Admission Year" },
  { name: "grade", label: "CGPA / Percentage" },
  { name: "graduationYear", label: "Graduation Year" },
  { name: "technicalSkills", label: "Technical Skills" },
  { name: "programmingLanguages", label: "Programming Languages" },
  { name: "frameworks", label: "Frameworks" },
  { name: "databaseTechnologies", label: "Database Technologies" },
  { name: "toolsTechnologies", label: "Tools and Technologies" },
  { name: "softSkills", label: "Soft Skills" },
  { name: "careerObjective", label: "Career Objective" },
  { name: "areasOfInterest", label: "Areas of Interest" },
  { name: "hobbies", label: "Hobbies" },
  { name: "certifications", label: "Certifications" },
  { name: "projects", label: "Projects" },
  { name: "internshipExperience", label: "Internship Experience" },
  { name: "achievements", label: "Achievements" },
  { name: "linkedinProfile", label: "LinkedIn Profile" },
  { name: "githubProfile", label: "GitHub Profile" },
  { name: "portfolioWebsite", label: "Portfolio Website" }
];

const linkFieldNames = ["linkedinProfile", "githubProfile", "portfolioWebsite"];
let students = [];
let selectedPhotoData = "";
let storageReady = true;

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = type ? `status--${type}` : "";
}

function loadStudents() {
  const savedProfiles = localStorage.getItem(STORAGE_KEY);

  if (!savedProfiles) {
    return [];
  }

  const parsedProfiles = JSON.parse(savedProfiles);
  const validProfiles = Array.isArray(parsedProfiles)
    && parsedProfiles.every(profile => profile && typeof profile.id === "string");

  if (!validProfiles) {
    throw new Error("Saved profile data has an unexpected format.");
  }

  return parsedProfiles;
}

function saveStudents(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  } catch (error) {
    console.error("Could not save student profiles:", error);
    showMessage(
      "The profiles could not be saved. Browser storage may be full; try using smaller photos.",
      "error"
    );
    return false;
  }
}

function createStudentId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateMobileNumber(value) {
  const allowedCharacters = /^[+()\d\s.-]+$/.test(value);
  const digitCount = value.replace(/\D/g, "").length;

  return allowedCharacters && digitCount >= 7 && digitCount <= 15;
}

function getProfileFromForm(existingProfile) {
  const profile = {
    id: recordIdInput.value || createStudentId(),
    photo: selectedPhotoData || (existingProfile ? existingProfile.photo : "") || ""
  };

  profileFields.forEach(field => {
    profile[field.name] = form.elements.namedItem(field.name).value.trim();
  });

  return profile;
}

function createAvatar(profile) {
  const avatar = document.createElement("div");
  avatar.className = "student-card__avatar";

  if (profile.photo) {
    const image = document.createElement("img");
    image.src = profile.photo;
    image.alt = `${profile.fullName || "Student"} profile photo`;
    avatar.append(image);
  } else {
    const initials = (profile.fullName || "Student")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("");
    avatar.textContent = initials;
    avatar.setAttribute("aria-hidden", "true");
  }

  return avatar;
}

function createProfileDetails(profile) {
  const detailsList = document.createElement("dl");
  detailsList.className = "student-card__details";

  profileFields.forEach(field => {
    const value = profile[field.name];

    if (!value) {
      return;
    }

    const term = document.createElement("dt");
    term.textContent = field.label;

    const description = document.createElement("dd");

    if (linkFieldNames.includes(field.name)) {
      try {
        const url = new URL(value);
        if (url.protocol === "http:" || url.protocol === "https:") {
          const link = document.createElement("a");
          link.href = url.href;
          link.textContent = value;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          description.append(link);
        } else {
          description.textContent = value;
        }
      } catch (error) {
        description.textContent = value;
      }
    } else if (field.name === "gender") {
      const genderOption = form.elements.namedItem("gender")
        .querySelector(`option[value="${CSS.escape(value)}"]`);
      description.textContent = genderOption ? genderOption.textContent : value;
    } else {
      description.textContent = value;
    }

    detailsList.append(term, description);
  });

  return detailsList;
}

function createStudentCard(profile) {
  const card = document.createElement("article");
  card.className = "student-card";

  const header = document.createElement("div");
  header.className = "student-card__header";
  header.append(createAvatar(profile));

  const heading = document.createElement("div");
  heading.className = "student-card__heading";

  const name = document.createElement("h3");
  name.textContent = profile.fullName || "Unnamed Student";

  const studentId = document.createElement("p");
  studentId.textContent = profile.studentId
    ? `ID: ${profile.studentId}`
    : "Student ID not provided";

  heading.append(name, studentId);
  header.append(heading);
  card.append(header);

  const summary = document.createElement("div");
  summary.className = "student-card__summary";

  [profile.email, profile.mobileNumber, profile.collegeName, profile.degree]
    .filter(Boolean)
    .forEach(value => {
      const line = document.createElement("p");
      line.textContent = value;
      summary.append(line);
    });

  card.append(summary);

  const details = document.createElement("details");
  const summaryLabel = document.createElement("summary");
  summaryLabel.textContent = "View full profile";
  details.append(summaryLabel, createProfileDetails(profile));
  card.append(details);

  const actions = document.createElement("div");
  actions.className = "student-card__actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "student-card__edit";
  editButton.textContent = "Edit";
  editButton.dataset.action = "edit";
  editButton.dataset.id = profile.id;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "student-card__delete";
  deleteButton.textContent = "Delete";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = profile.id;

  actions.append(editButton, deleteButton);
  card.append(actions);

  return card;
}

function renderStudents() {
  studentCards.replaceChildren();
  emptyState.hidden = students.length > 0;

  students.forEach(profile => {
    studentCards.append(createStudentCard(profile));
  });
}

function previewPhoto(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    photoInput.value = "";
    showMessage("Choose an image file for the profile photo.", "error");
    return;
  }

  if (file.size > MAX_PHOTO_SIZE) {
    photoInput.value = "";
    showMessage("Choose a photo smaller than 1 MB so it can fit in browser storage.", "error");
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    if (typeof reader.result !== "string") {
      showMessage("The selected photo could not be read.", "error");
      return;
    }

    selectedPhotoData = reader.result;
    photoPreview.src = selectedPhotoData;
    photoPreview.hidden = false;
    showMessage("Photo preview updated.", "success");
  });

  reader.addEventListener("error", () => {
    console.error("The selected profile photo could not be read.", reader.error);
    showMessage("The selected photo could not be read. Please try another image.", "error");
  });

  reader.readAsDataURL(file);
}

function startEditing(profile) {
  profileFields.forEach(field => {
    form.elements.namedItem(field.name).value = profile[field.name] || "";
  });

  recordIdInput.value = profile.id;
  selectedPhotoData = profile.photo || "";

  if (selectedPhotoData) {
    photoPreview.src = selectedPhotoData;
    photoPreview.hidden = false;
  } else {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
  }

  formTitle.textContent = "Edit Student Profile";
  saveButton.textContent = "Update Student Profile";
  showMessage(`Editing ${profile.fullName || "student profile"}.`, "success");
  document.querySelector("#student-form").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!storageReady) {
    showMessage("Profiles cannot be saved until the browser storage error is resolved.", "error");
    return;
  }

  const mobileNumber = form.elements.namedItem("mobileNumber").value.trim();
  if (!validateMobileNumber(mobileNumber)) {
    showMessage("Enter a valid mobile number with 7 to 15 digits.", "error");
    form.elements.namedItem("mobileNumber").focus();
    return;
  }

  const existingIndex = students.findIndex(profile => profile.id === recordIdInput.value);
  const existingProfile = existingIndex >= 0 ? students[existingIndex] : null;
  const profile = getProfileFromForm(existingProfile);
  const updatedStudents = [...students];

  if (existingIndex >= 0) {
    updatedStudents[existingIndex] = profile;
  } else {
    updatedStudents.push(profile);
  }

  if (!saveStudents(updatedStudents)) {
    return;
  }

  students = updatedStudents;
  renderStudents();
  showMessage(
    existingProfile ? "Student profile updated successfully." : "Student profile saved successfully.",
    "success"
  );
  form.reset();
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    selectedPhotoData = "";
    recordIdInput.value = "";
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
    formTitle.textContent = "Add a Student Profile";
    saveButton.textContent = "Save Student Profile";
  }, 0);
});

photoInput.addEventListener("change", () => {
  previewPhoto(photoInput.files[0]);
});

studentCards.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const profile = students.find(item => item.id === button.dataset.id);
  if (!profile) {
    showMessage("That student profile could not be found. Refresh the page and try again.", "error");
    return;
  }

  if (button.dataset.action === "edit") {
    startEditing(profile);
    return;
  }

  if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Delete the profile for ${profile.fullName || "this student"}?`);
    if (!confirmed) {
      return;
    }

    const updatedStudents = students.filter(item => item.id !== profile.id);
    if (!saveStudents(updatedStudents)) {
      return;
    }

    students = updatedStudents;
    renderStudents();

    if (recordIdInput.value === profile.id) {
      form.reset();
    }

    showMessage("Student profile deleted.", "success");
  }
});

try {
  students = loadStudents();
} catch (error) {
  storageReady = false;
  console.error("Could not load saved student profiles:", error);
  showMessage("Saved profiles could not be loaded. Check browser storage and refresh the page.", "error");
}

renderStudents();