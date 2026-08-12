import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
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
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const els = {
    setupNotice: document.getElementById("setupNotice"),
    loginPanel: document.getElementById("loginPanel"),
    adminPanel: document.getElementById("adminPanel"),
    googleSignInBtn: document.getElementById("googleSignInBtn"),
    signOutBtn: document.getElementById("signOutBtn"),
    userEmail: document.getElementById("userEmail"),
    statusText: document.getElementById("statusText"),
    licenseForm: document.getElementById("licenseForm"),
    licenseKey: document.getElementById("licenseKey"),
    licenseEmail: document.getElementById("licenseEmail"),
    ownerUid: document.getElementById("ownerUid"),
    productId: document.getElementById("productId"),
    licenseStatus: document.getElementById("licenseStatus"),
    licensePlan: document.getElementById("licensePlan"),
    expiresAt: document.getElementById("expiresAt"),
    maxDevices: document.getElementById("maxDevices"),
    licenseNote: document.getElementById("licenseNote"),
    redeemForm: document.getElementById("redeemForm"),
    redeemProductId: document.getElementById("redeemProductId"),
    redeemPlan: document.getElementById("redeemPlan"),
    redeemDays: document.getElementById("redeemDays"),
    redeemMaxDevices: document.getElementById("redeemMaxDevices"),
    redeemQuantity: document.getElementById("redeemQuantity"),
    redeemNote: document.getElementById("redeemNote"),
    generatedCodes: document.getElementById("generatedCodes"),
    copyCodesBtn: document.getElementById("copyCodesBtn"),
    codeSearchInput: document.getElementById("codeSearchInput"),
    codeRows: document.getElementById("codeRows"),
    newLicenseBtn: document.getElementById("newLicenseBtn"),
    generateKeyBtn: document.getElementById("generateKeyBtn"),
    resetDevicesBtn: document.getElementById("resetDevicesBtn"),
    deleteLicenseBtn: document.getElementById("deleteLicenseBtn"),
    searchInput: document.getElementById("searchInput"),
    licenseRows: document.getElementById("licenseRows")
};

let licenses = [];
let redeemCodes = [];
let lastGeneratedCodes = [];
let selectedLicenseId = "";
let unsubscribeLicenses = null;
let unsubscribeRedeemCodes = null;

const productNames = {
    "ani-deepth": "AniDeepth",
    "ani-layout": "Ani Layout",
    "ani-anim": "Ani Anim",
    "ani-voice-check": "Ani Voice Check"
};

const productPrefixes = {
    "ani-deepth": "ANI-DEEPTH",
    "ani-layout": "ANI-LAYOUT",
    "ani-anim": "ANI-ANIM",
    "ani-voice-check": "ANI-VOICE"
};

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

function getProductName(productId) {
    return productNames[productId] || productId || "AniTool";
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

function generateRedeemKey(productId) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const prefix = productPrefixes[productId] || "ANI-TOOL";
    const parts = [prefix];

    for (let p = 0; p < 2; p++) {
        let part = "";
        for (let i = 0; i < 4; i++) {
            part += chars[Math.floor(Math.random() * chars.length)];
        }
        parts.push(part);
    }

    return parts.join("-");
}

function getStatusClass(status) {
    const value = String(status || "active").toLowerCase();
    return `is${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function clampNumber(value, min, max, fallback) {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
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
    els.ownerUid.value = "";
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
    els.ownerUid.value = license.ownerUid || "";
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
    const ownerUid = String(els.ownerUid.value || "").trim();

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
            ownerUid,
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

function getRedeemPayload() {
    return {
        productId: els.redeemProductId.value || "ani-deepth",
        plan: String(els.redeemPlan.value || "creator").trim() || "creator",
        durationDays: clampNumber(els.redeemDays.value, 0, 3650, 365),
        maxDevices: clampNumber(els.redeemMaxDevices.value, 1, 20, 1),
        quantity: clampNumber(els.redeemQuantity.value, 1, 50, 1),
        note: String(els.redeemNote.value || "").trim()
    };
}

async function createRedeemCodeDocument(code, payload) {
    await setDoc(doc(db, "redeemCodes", code), {
        code,
        productId: payload.productId,
        plan: payload.plan,
        durationDays: payload.durationDays,
        maxDevices: payload.maxDevices,
        status: "available",
        note: payload.note,
        createdBy: auth.currentUser ? auth.currentUser.uid : "",
        createdByEmail: auth.currentUser ? auth.currentUser.email || "" : "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
}

async function generateUniqueRedeemCode(payload) {
    for (let attempt = 0; attempt < 20; attempt++) {
        const code = generateRedeemKey(payload.productId);
        const codeSnap = await getDoc(doc(db, "redeemCodes", code));
        if (!codeSnap.exists()) {
            await createRedeemCodeDocument(code, payload);
            return code;
        }
    }

    throw new Error("Could not generate a unique redeem key. Try again.");
}

function renderRedeemCodes() {
    const search = String(els.codeSearchInput.value || "").trim().toLowerCase();
    const filtered = redeemCodes.filter((code) => {
        const haystack = `${code.id} ${code.code || ""} ${code.productId || ""} ${getProductName(code.productId)} ${code.status || ""} ${code.redeemedByEmail || ""}`.toLowerCase();
        return !search || haystack.indexOf(search) !== -1;
    });

    if (filtered.length === 0) {
        els.codeRows.innerHTML = '<tr><td colspan="6" class="empty">No matching redeem codes.</td></tr>';
        return;
    }

    els.codeRows.innerHTML = filtered.map((code) => {
        const status = code.status || "available";
        return `
            <tr>
                <td title="${escapeHtml(code.id)}">${escapeHtml(code.code || code.id)}</td>
                <td>${escapeHtml(getProductName(code.productId))}</td>
                <td><span class="statusPill ${escapeHtml(getStatusClass(status))}">${escapeHtml(status)}</span></td>
                <td>${escapeHtml(code.plan || "creator")}</td>
                <td>${escapeHtml(code.durationDays ?? 0)}</td>
                <td title="${escapeHtml(code.redeemedBy || "")}">${escapeHtml(code.redeemedByEmail || code.redeemedBy || "-")}</td>
            </tr>
        `;
    }).join("");
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
                <td><span class="statusPill ${escapeHtml(getStatusClass(status))}">${escapeHtml(status)}</span></td>
                <td>${escapeHtml(getDeviceCount(license))} / ${escapeHtml(license.maxDevices || 1)}</td>
                <td>${escapeHtml(license.expiresAt || "Never")}</td>
            </tr>
        `;
    }).join("");
}

function getAdminSetupMessage(user) {
    return `Signed in, but this user is not an admin. Create Firestore doc admins/${user.uid}.`;
}

async function verifyAdmin(user) {
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
        throw new Error(getAdminSetupMessage(user));
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

function subscribeRedeemCodes() {
    if (unsubscribeRedeemCodes) {
        unsubscribeRedeemCodes();
    }

    unsubscribeRedeemCodes = onSnapshot(collection(db, "redeemCodes"), (snapshot) => {
        redeemCodes = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        redeemCodes.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        renderRedeemCodes();
    }, (error) => {
        setStatus(error.message, true);
    });
}

els.googleSignInBtn.addEventListener("click", async () => {
    try {
        setStatus("Opening Google sign-in...");
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.signOutBtn.addEventListener("click", () => {
    signOut(auth);
});

els.redeemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const payload = getRedeemPayload();
        const createdCodes = [];

        setStatus("Generating redeem key(s)...");
        for (let i = 0; i < payload.quantity; i++) {
            createdCodes.push(await generateUniqueRedeemCode(payload));
        }

        lastGeneratedCodes = createdCodes;
        els.generatedCodes.value = createdCodes.join("\n");
        setStatus(`Generated ${createdCodes.length} redeem key(s).`);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.copyCodesBtn.addEventListener("click", async () => {
    const value = lastGeneratedCodes.length > 0 ? lastGeneratedCodes.join("\n") : els.generatedCodes.value;
    if (!value) {
        setStatus("No generated redeem key to copy.", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setStatus("Redeem key copied.");
    } catch (error) {
        els.generatedCodes.focus();
        els.generatedCodes.select();
        setStatus("Select the generated key and copy it manually.");
    }
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
els.codeSearchInput.addEventListener("input", renderRedeemCodes);

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
        if (unsubscribeRedeemCodes) {
            unsubscribeRedeemCodes();
            unsubscribeRedeemCodes = null;
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
        subscribeRedeemCodes();
    } catch (error) {
        els.userEmail.textContent = user.email ? `${user.email} / ${user.uid}` : user.uid;
        els.signOutBtn.hidden = false;
        els.loginPanel.hidden = false;
        els.adminPanel.hidden = true;
        if (unsubscribeLicenses) {
            unsubscribeLicenses();
            unsubscribeLicenses = null;
        }
        if (unsubscribeRedeemCodes) {
            unsubscribeRedeemCodes();
            unsubscribeRedeemCodes = null;
        }
        const message = error.code === "permission-denied" ? getAdminSetupMessage(user) : error.message;
        setStatus(message, true);
    }
});
