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
    loginCard: document.getElementById("loginCard"),
    accessPanel: document.getElementById("accessPanel"),
    accessEmail: document.getElementById("accessEmail"),
    accessUid: document.getElementById("accessUid"),
    copyUidBtn: document.getElementById("copyUidBtn"),
    retryAdminBtn: document.getElementById("retryAdminBtn"),
    adminPanel: document.getElementById("adminPanel"),
    googleSignInBtn: document.getElementById("googleSignInBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIcon: document.getElementById("themeIcon"),
    signOutBtn: document.getElementById("signOutBtn"),
    userEmail: document.getElementById("userEmail"),
    statusText: document.getElementById("statusText"),
    licenseCount: document.getElementById("licenseCount"),
    availableCount: document.getElementById("availableCount"),
    activeCount: document.getElementById("activeCount"),
    licenseForm: document.getElementById("licenseForm"),
    licenseKey: document.getElementById("licenseKey"),
    licenseEmail: document.getElementById("licenseEmail"),
    ownerUid: document.getElementById("ownerUid"),
    productId: document.getElementById("productId"),
    licenseStatus: document.getElementById("licenseStatus"),
    licensePlan: document.getElementById("licensePlan"),
    durationDays: document.getElementById("durationDays"),
    maxDevices: document.getElementById("maxDevices"),
    licenseQuantity: document.getElementById("licenseQuantity"),
    licenseNote: document.getElementById("licenseNote"),
    generatedLicenses: document.getElementById("generatedLicenses"),
    copyLicensesBtn: document.getElementById("copyLicensesBtn"),
    newLicenseBtn: document.getElementById("newLicenseBtn"),
    generateKeyBtn: document.getElementById("generateKeyBtn"),
    resetDevicesBtn: document.getElementById("resetDevicesBtn"),
    deleteLicenseBtn: document.getElementById("deleteLicenseBtn"),
    searchInput: document.getElementById("searchInput"),
    licenseRows: document.getElementById("licenseRows")
};

let licenses = [];
let lastGeneratedKeys = [];
let selectedLicenseId = "";
let unsubscribeLicenses = null;

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

const statusLabels = {
    available: "Chưa kích hoạt",
    active: "Đang dùng",
    blocked: "Đã khóa",
    expired: "Hết hạn"
};

function getStoredTheme() {
    const stored = localStorage.getItem("anitoolCmsTheme");
    if (stored === "light" || stored === "dark") {
        return stored;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("anitoolCmsTheme", nextTheme);
    els.themeIcon.className = nextTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    els.themeToggleBtn.setAttribute("aria-label", nextTheme === "light" ? "Chuyển sang dark mode" : "Chuyển sang light mode");
    els.themeToggleBtn.title = nextTheme === "light" ? "Chuyển sang dark mode" : "Chuyển sang light mode";
}

function setStatus(message, isError = false) {
    els.statusText.textContent = message;
    els.statusText.classList.toggle("isError", isError);
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

function getStatusLabel(status) {
    const value = String(status || "available").toLowerCase();
    return statusLabels[value] || status || "Không rõ";
}

function getStatusClass(status) {
    const value = String(status || "available").toLowerCase();
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

function updateMetrics() {
    els.licenseCount.textContent = String(licenses.length);
    els.availableCount.textContent = String(licenses.filter((license) => (license.status || "available") === "available").length);
    els.activeCount.textContent = String(licenses.filter((license) => (license.status || "available") === "active").length);
}

function generateLicenseKey(productId = els.productId.value) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const prefix = productPrefixes[productId] || "ANI-LICENSE";
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

function clearForm() {
    selectedLicenseId = "";
    els.licenseKey.value = generateLicenseKey();
    els.licenseEmail.value = "";
    els.ownerUid.value = "";
    els.productId.value = "ani-deepth";
    els.licenseStatus.value = "available";
    els.licensePlan.value = "creator";
    els.durationDays.value = "365";
    els.maxDevices.value = "1";
    els.licenseQuantity.value = "1";
    els.licenseNote.value = "";
    renderLicenses();
}

function fillForm(license) {
    selectedLicenseId = license.id;
    els.licenseKey.value = license.licenseKey || license.id;
    els.licenseEmail.value = license.email || "";
    els.ownerUid.value = license.ownerUid || "";
    els.productId.value = license.productId || "ani-deepth";
    els.licenseStatus.value = license.status || "available";
    els.licensePlan.value = license.plan || "creator";
    els.durationDays.value = String(license.durationDays ?? 365);
    els.maxDevices.value = String(license.maxDevices || 1);
    els.licenseQuantity.value = "1";
    els.licenseNote.value = license.note || "";
    renderLicenses();
}

function getFormPayload() {
    const licenseKey = normalizeLicenseKey(els.licenseKey.value);
    const ownerUid = String(els.ownerUid.value || "").trim();
    const email = String(els.licenseEmail.value || "").trim().toLowerCase();

    if (!licenseKey) {
        throw new Error("License key là bắt buộc.");
    }

    return {
        id: licenseKey,
        quantity: clampNumber(els.licenseQuantity.value, 1, 50, 1),
        data: {
            licenseKey,
            email,
            ownerUid,
            productId: els.productId.value || "ani-deepth",
            status: els.licenseStatus.value || "available",
            plan: String(els.licensePlan.value || "creator").trim() || "creator",
            durationDays: clampNumber(els.durationDays.value, 0, 3650, 365),
            maxDevices: clampNumber(els.maxDevices.value, 1, 20, 1),
            note: String(els.licenseNote.value || "").trim(),
            updatedAt: serverTimestamp()
        }
    };
}

async function saveLicenseDocument(id, data) {
    const targetRef = doc(db, "licenses", id);
    const existing = await getDoc(targetRef);
    const existingData = existing.exists() ? existing.data() : {};
    const shouldStampActivation = data.status === "active" && data.ownerUid && !existingData.activatedAt;

    await setDoc(targetRef, {
        ...data,
        licenseKey: id,
        createdBy: existingData.createdBy || (auth.currentUser ? auth.currentUser.uid : ""),
        createdByEmail: existingData.createdByEmail || (auth.currentUser ? auth.currentUser.email || "" : ""),
        createdAt: existing.exists() ? existingData.createdAt || serverTimestamp() : serverTimestamp(),
        devices: Array.isArray(existingData.devices) ? existingData.devices : [],
        deviceCount: typeof existingData.deviceCount === "number" ? existingData.deviceCount : 0,
        activatedAt: shouldStampActivation ? serverTimestamp() : existingData.activatedAt || null
    }, { merge: true });
}

async function generateUniqueLicense(payload) {
    for (let attempt = 0; attempt < 20; attempt++) {
        const key = generateLicenseKey(payload.data.productId);
        const keySnap = await getDoc(doc(db, "licenses", key));
        if (!keySnap.exists()) {
            await saveLicenseDocument(key, { ...payload.data, licenseKey: key });
            return key;
        }
    }

    throw new Error("Không sinh được license key duy nhất. Hãy thử lại.");
}

function renderLicenses() {
    updateMetrics();
    const search = String(els.searchInput.value || "").trim().toLowerCase();
    const filtered = licenses.filter((license) => {
        const haystack = [
            license.id,
            license.licenseKey || "",
            license.email || "",
            license.ownerUid || "",
            license.productId || "",
            getProductName(license.productId),
            license.status || ""
        ].join(" ").toLowerCase();
        return !search || haystack.indexOf(search) !== -1;
    });

    if (filtered.length === 0) {
        els.licenseRows.innerHTML = '<tr><td colspan="6" class="empty">Chưa có license phù hợp.</td></tr>';
        return;
    }

    els.licenseRows.innerHTML = filtered.map((license) => {
        const status = license.status || "available";
        const selected = license.id === selectedLicenseId ? " class=\"isSelected\"" : "";
        const owner = license.email || license.ownerUid || "-";
        return `
            <tr data-license-id="${escapeHtml(license.id)}"${selected}>
                <td title="${escapeHtml(license.id)}">${escapeHtml(license.licenseKey || license.id)}</td>
                <td>${escapeHtml(getProductName(license.productId))}</td>
                <td><span class="statusPill ${escapeHtml(getStatusClass(status))}">${escapeHtml(getStatusLabel(status))}</span></td>
                <td>${escapeHtml(license.durationDays ?? 0)}</td>
                <td>${escapeHtml(getDeviceCount(license))} / ${escapeHtml(license.maxDevices || 1)}</td>
                <td title="${escapeHtml(owner)}">${escapeHtml(owner)}</td>
            </tr>
        `;
    }).join("");
}

function getAdminSetupMessage(user) {
    return `Đã đăng nhập nhưng tài khoản này chưa phải admin. Tạo Firestore document admins/${user.uid}.`;
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
        licenses.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        renderLicenses();
        setStatus(`Đã tải ${licenses.length} license.`);
    }, (error) => {
        setStatus(error.message, true);
    });
}

els.googleSignInBtn.addEventListener("click", async () => {
    try {
        setStatus("Đang mở Google sign-in...");
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.themeToggleBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

els.signOutBtn.addEventListener("click", () => {
    signOut(auth);
});

els.copyUidBtn.addEventListener("click", async () => {
    const uid = els.accessUid.textContent || "";
    if (!uid || uid === "-") {
        setStatus("Chưa có UID để copy.", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(uid);
        setStatus("Đã copy UID.");
    } catch (error) {
        setStatus("Không copy tự động được. Hãy bôi đen UID và copy thủ công.", true);
    }
});

els.retryAdminBtn.addEventListener("click", async () => {
    if (!auth.currentUser) {
        return;
    }

    try {
        setStatus("Đang kiểm tra quyền admin...");
        await verifyAdmin(auth.currentUser);
        showAdmin(auth.currentUser);
    } catch (error) {
        showAccessDenied(auth.currentUser, error);
    }
});

els.licenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const payload = getFormPayload();
        const createdKeys = [];

        setStatus("Đang lưu license...");
        if (payload.quantity > 1) {
            for (let i = 0; i < payload.quantity; i++) {
                createdKeys.push(await generateUniqueLicense(payload));
            }
            selectedLicenseId = "";
        } else {
            await saveLicenseDocument(payload.id, payload.data);
            createdKeys.push(payload.id);
            selectedLicenseId = payload.id;
        }

        lastGeneratedKeys = createdKeys;
        els.generatedLicenses.value = createdKeys.join("\n");
        setStatus(`Đã lưu ${createdKeys.length} license.`);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.copyLicensesBtn.addEventListener("click", async () => {
    const value = lastGeneratedKeys.length > 0 ? lastGeneratedKeys.join("\n") : els.generatedLicenses.value;
    if (!value) {
        setStatus("Chưa có license key để copy.", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setStatus("Đã copy license key.");
    } catch (error) {
        els.generatedLicenses.focus();
        els.generatedLicenses.select();
        setStatus("Hãy chọn key trong ô và copy thủ công.");
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
    selectedLicenseId = "";
});

els.productId.addEventListener("change", () => {
    if (!selectedLicenseId) {
        els.licenseKey.value = generateLicenseKey();
    }
});

els.resetDevicesBtn.addEventListener("click", async () => {
    const key = normalizeLicenseKey(els.licenseKey.value);
    if (!key) {
        setStatus("Hãy chọn license trước.", true);
        return;
    }
    await updateDoc(doc(db, "licenses", key), {
        devices: [],
        deviceCount: 0,
        updatedAt: serverTimestamp()
    });
    setStatus("Đã reset thiết bị.");
});

els.deleteLicenseBtn.addEventListener("click", async () => {
    const key = normalizeLicenseKey(els.licenseKey.value);
    if (!key) {
        setStatus("Hãy chọn license trước.", true);
        return;
    }
    if (!window.confirm(`Xóa license ${key}?`)) {
        return;
    }
    await deleteDoc(doc(db, "licenses", key));
    clearForm();
    setStatus("Đã xóa license.");
});

function showLogin() {
    els.userEmail.textContent = "Chưa đăng nhập";
    els.signOutBtn.hidden = true;
    els.loginPanel.hidden = false;
    els.loginCard.hidden = false;
    els.accessPanel.hidden = true;
    els.adminPanel.hidden = true;
}

function showAdmin(user) {
    els.userEmail.textContent = user.email || user.uid;
    els.signOutBtn.hidden = false;
    els.loginPanel.hidden = true;
    els.loginCard.hidden = true;
    els.accessPanel.hidden = true;
    els.adminPanel.hidden = false;
    clearForm();
    subscribeLicenses();
}

function showAccessDenied(user, error) {
    els.userEmail.textContent = user.email ? `${user.email} / ${user.uid}` : user.uid;
    els.accessEmail.textContent = user.email || "-";
    els.accessUid.textContent = user.uid;
    els.signOutBtn.hidden = false;
    els.loginPanel.hidden = false;
    els.loginCard.hidden = true;
    els.accessPanel.hidden = false;
    els.adminPanel.hidden = true;
    if (unsubscribeLicenses) {
        unsubscribeLicenses();
        unsubscribeLicenses = null;
    }
    const message = error.code === "permission-denied" ? getAdminSetupMessage(user) : error.message;
    setStatus(message, true);
}

applyTheme(getStoredTheme());

onAuthStateChanged(auth, async (user) => {
    if (isPlaceholderConfig()) {
        els.setupNotice.hidden = false;
        setStatus("Chưa cấu hình Firebase.", true);
        return;
    }

    if (!user) {
        showLogin();
        if (unsubscribeLicenses) {
            unsubscribeLicenses();
            unsubscribeLicenses = null;
        }
        return;
    }

    try {
        await verifyAdmin(user);
        showAdmin(user);
    } catch (error) {
        showAccessDenied(user, error);
    }
});
