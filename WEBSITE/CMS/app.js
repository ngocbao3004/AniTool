import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const els = {
    setupNotice: document.getElementById("setupNotice"),
    loginPanel: document.getElementById("loginPanel"),
    adminPanel: document.getElementById("adminPanel"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    signOutBtn: document.getElementById("signOutBtn"),
    userEmail: document.getElementById("userEmail"),
    statusText: document.getElementById("statusText"),
    licenseForm: document.getElementById("licenseForm"),
    licenseKey: document.getElementById("licenseKey"),
    licenseEmail: document.getElementById("licenseEmail"),
    productId: document.getElementById("productId"),
    licenseStatus: document.getElementById("licenseStatus"),
    licensePlan: document.getElementById("licensePlan"),
    expiresAt: document.getElementById("expiresAt"),
    maxDevices: document.getElementById("maxDevices"),
    licenseNote: document.getElementById("licenseNote"),
    newLicenseBtn: document.getElementById("newLicenseBtn"),
    generateKeyBtn: document.getElementById("generateKeyBtn"),
    resetDevicesBtn: document.getElementById("resetDevicesBtn"),
    deleteLicenseBtn: document.getElementById("deleteLicenseBtn"),
    searchInput: document.getElementById("searchInput"),
    licenseRows: document.getElementById("licenseRows")
};

let licenses = [];
let selectedLicenseId = "";
let unsubscribeLicenses = null;

function setStatus(message, isError = false) {
    els.statusText.textContent = message;
    els.statusText.style.color = isError ? "var(--danger)" : "";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isPlaceholderConfig() {
    return !firebaseConfig.projectId || firebaseConfig.projectId.indexOf("PASTE_") === 0;
}

function normalizeLicenseKey(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "");
}

function generateLicenseKey() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const parts = ["ANID"];

    for (let p = 0; p < 3; p++) {
        let part = "";
        for (let i = 0; i < 4; i++) {
            part += chars[Math.floor(Math.random() * chars.length)];
        }
        parts.push(part);
    }

    return parts.join("-");
}

function getDeviceCount(license) {
    if (Array.isArray(license.devices)) {
        return license.devices.length;
    }
    if (typeof license.deviceCount === "number") {
        return license.deviceCount;
    }
    return 0;
}

function clearForm() {
    selectedLicenseId = "";
    els.licenseKey.value = generateLicenseKey();
    els.licenseEmail.value = "";
    els.productId.value = "ani-deepth";
    els.licenseStatus.value = "active";
    els.licensePlan.value = "pro";
    els.expiresAt.value = "";
    els.maxDevices.value = "2";
    els.licenseNote.value = "";
    renderLicenses();
}

function fillForm(license) {
    selectedLicenseId = license.id;
    els.licenseKey.value = license.licenseKey || license.id;
    els.licenseEmail.value = license.email || "";
    els.productId.value = license.productId || "ani-deepth";
    els.licenseStatus.value = license.status || "active";
    els.licensePlan.value = license.plan || "pro";
    els.expiresAt.value = license.expiresAt || "";
    els.maxDevices.value = String(license.maxDevices || 2);
    els.licenseNote.value = license.note || "";
    renderLicenses();
}

function getFormPayload() {
    const licenseKey = normalizeLicenseKey(els.licenseKey.value);
    const email = String(els.licenseEmail.value || "").trim().toLowerCase();
    const maxDevices = Math.max(1, Math.min(20, parseInt(els.maxDevices.value, 10) || 1));

    if (!licenseKey) {
        throw new Error("License key is required.");
    }
    if (!email) {
        throw new Error("Email is required.");
    }

    return {
        id: licenseKey,
        data: {
            licenseKey,
            email,
            productId: els.productId.value || "ani-deepth",
            status: els.licenseStatus.value || "active",
            plan: String(els.licensePlan.value || "pro").trim(),
            expiresAt: els.expiresAt.value || "",
            maxDevices,
            note: String(els.licenseNote.value || "").trim(),
            updatedAt: serverTimestamp()
        }
    };
}

function renderLicenses() {
    const search = String(els.searchInput.value || "").trim().toLowerCase();
    const filtered = licenses.filter((license) => {
        const haystack = `${license.id} ${license.licenseKey || ""} ${license.email || ""} ${license.status || ""}`.toLowerCase();
        return !search || haystack.indexOf(search) !== -1;
    });

    if (filtered.length === 0) {
        els.licenseRows.innerHTML = '<tr><td colspan="5" class="empty">No matching licenses.</td></tr>';
        return;
    }

    els.licenseRows.innerHTML = filtered.map((license) => {
        const status = license.status || "active";
        const selected = license.id === selectedLicenseId ? " class=\"isSelected\"" : "";
        return `
            <tr data-license-id="${escapeHtml(license.id)}"${selected}>
                <td title="${escapeHtml(license.id)}">${escapeHtml(license.licenseKey || license.id)}</td>
                <td title="${escapeHtml(license.email || "")}">${escapeHtml(license.email || "")}</td>
                <td><span class="statusPill is${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}">${escapeHtml(status)}</span></td>
                <td>${escapeHtml(getDeviceCount(license))} / ${escapeHtml(license.maxDevices || 1)}</td>
                <td>${escapeHtml(license.expiresAt || "Never")}</td>
            </tr>
        `;
    }).join("");
}

async function verifyAdmin(user) {
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
        throw new Error(`Signed in, but this user is not an admin. Create Firestore doc admins/${user.uid}.`);
    }
}

function subscribeLicenses() {
    if (unsubscribeLicenses) {
        unsubscribeLicenses();
    }

    unsubscribeLicenses = onSnapshot(collection(db, "licenses"), (snapshot) => {
        licenses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        licenses.sort((a, b) => String(a.email || "").localeCompare(String(b.email || "")));
        renderLicenses();
        setStatus(`Loaded ${licenses.length} license(s).`);
    }, (error) => {
        setStatus(error.message, true);
    });
}

els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        setStatus("Signing in...");
        await signInWithEmailAndPassword(auth, els.loginEmail.value, els.loginPassword.value);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.signOutBtn.addEventListener("click", () => {
    signOut(auth);
});

els.licenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const payload = getFormPayload();
        const targetRef = doc(db, "licenses", payload.id);
        const existing = await getDoc(targetRef);
        await setDoc(targetRef, {
            ...payload.data,
            createdAt: existing.exists() ? existing.data().createdAt || serverTimestamp() : serverTimestamp(),
            devices: existing.exists() ? existing.data().devices || [] : []
        }, { merge: true });
        selectedLicenseId = payload.id;
        setStatus("License saved.");
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.licenseRows.addEventListener("click", (event) => {
    const row = event.target.closest("[data-license-id]");
    const license = row ? licenses.find((item) => item.id === row.getAttribute("data-license-id")) : null;
    if (license) {
        fillForm(license);
    }
});

els.searchInput.addEventListener("input", renderLicenses);

els.newLicenseBtn.addEventListener("click", clearForm);

els.generateKeyBtn.addEventListener("click", () => {
    els.licenseKey.value = generateLicenseKey();
});

els.resetDevicesBtn.addEventListener("click", async () => {
    const key = normalizeLicenseKey(els.licenseKey.value);
    if (!key) {
        setStatus("Choose a license first.", true);
        return;
    }
    await updateDoc(doc(db, "licenses", key), {
        devices: [],
        deviceCount: 0,
        updatedAt: serverTimestamp()
    });
    setStatus("Devices reset.");
});

els.deleteLicenseBtn.addEventListener("click", async () => {
    const key = normalizeLicenseKey(els.licenseKey.value);
    if (!key) {
        setStatus("Choose a license first.", true);
        return;
    }
    if (!window.confirm(`Delete license ${key}?`)) {
        return;
    }
    await deleteDoc(doc(db, "licenses", key));
    clearForm();
    setStatus("License deleted.");
});

onAuthStateChanged(auth, async (user) => {
    if (isPlaceholderConfig()) {
        els.setupNotice.hidden = false;
        setStatus("Firebase config is not set.", true);
        return;
    }

    if (!user) {
        els.userEmail.textContent = "Not signed in";
        els.signOutBtn.hidden = true;
        els.loginPanel.hidden = false;
        els.adminPanel.hidden = true;
        if (unsubscribeLicenses) {
            unsubscribeLicenses();
            unsubscribeLicenses = null;
        }
        return;
    }

    try {
        await verifyAdmin(user);
        els.userEmail.textContent = user.email || user.uid;
        els.signOutBtn.hidden = false;
        els.loginPanel.hidden = true;
        els.adminPanel.hidden = false;
        clearForm();
        subscribeLicenses();
    } catch (error) {
        els.userEmail.textContent = user.email || user.uid;
        els.signOutBtn.hidden = false;
        els.loginPanel.hidden = false;
        els.adminPanel.hidden = true;
        setStatus(error.message, true);
    }
});
