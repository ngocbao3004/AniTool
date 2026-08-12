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
    addDoc,
    collection,
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
    expiringCount: document.getElementById("expiringCount"),
    expiredCount: document.getElementById("expiredCount"),
    pausedCount: document.getElementById("pausedCount"),
    blockedCount: document.getElementById("blockedCount"),
    voidedCount: document.getElementById("voidedCount"),
    licenseForm: document.getElementById("licenseForm"),
    licenseKey: document.getElementById("licenseKey"),
    licenseEmail: document.getElementById("licenseEmail"),
    contactInfo: document.getElementById("contactInfo"),
    productId: document.getElementById("productId"),
    productSelectBtn: document.getElementById("productSelectBtn"),
    productSelectText: document.getElementById("productSelectText"),
    productSelectMenu: document.getElementById("productSelectMenu"),
    productSearchInput: document.getElementById("productSearchInput"),
    productOptionList: document.getElementById("productOptionList"),
    durationDays: document.getElementById("durationDays"),
    maxDevices: document.getElementById("maxDevices"),
    copyLicensesBtn: document.getElementById("copyLicensesBtn"),
    generateKeyBtn: document.getElementById("generateKeyBtn"),
    createLicenseBtn: document.getElementById("createLicenseBtn"),
    searchInput: document.getElementById("searchInput"),
    softwareFilter: document.getElementById("softwareFilter"),
    softwareSelectBtn: document.getElementById("softwareSelectBtn"),
    softwareSelectText: document.getElementById("softwareSelectText"),
    softwareSelectMenu: document.getElementById("softwareSelectMenu"),
    softwareOptionList: document.getElementById("softwareOptionList"),
    statusFilter: document.getElementById("statusFilter"),
    statusSelectBtn: document.getElementById("statusSelectBtn"),
    statusSelectText: document.getElementById("statusSelectText"),
    statusSelectMenu: document.getElementById("statusSelectMenu"),
    statusOptionList: document.getElementById("statusOptionList"),
    licenseRows: document.getElementById("licenseRows"),
    bulkTools: document.getElementById("bulkTools"),
    bulkPanelToggleBtn: document.getElementById("bulkPanelToggleBtn"),
    selectAllVisible: document.getElementById("selectAllVisible"),
    bulkStatusValue: document.getElementById("bulkStatusValue"),
    bulkStatusSelectBtn: document.getElementById("bulkStatusSelectBtn"),
    bulkStatusSelectText: document.getElementById("bulkStatusSelectText"),
    bulkStatusSelectMenu: document.getElementById("bulkStatusSelectMenu"),
    bulkStatusOptionList: document.getElementById("bulkStatusOptionList"),
    bulkDayAmount: document.getElementById("bulkDayAmount"),
    bulkSubtractDays: document.getElementById("bulkSubtractDays"),
    bulkAddDays: document.getElementById("bulkAddDays"),
    createTabBtn: document.getElementById("createTabBtn"),
    listTabBtn: document.getElementById("listTabBtn"),
    createTabPanel: document.getElementById("createTabPanel"),
    listTabPanel: document.getElementById("listTabPanel")
};

let licenses = [];
let lastGeneratedKeys = [];
let selectedLicenseId = "";
let selectedLicenseIds = new Set();
let visibleLicenseIds = [];
let unsubscribeLicenses = null;
let activeDropdown = null;
let sortState = {
    key: "createdAt",
    direction: "desc"
};

const MIN_DURATION_DAYS = 1;
const MAX_DURATION_DAYS = 36500;

const products = {
    "ani-deepth": {
        name: "AniDeepth",
        software: "After Effects",
        softwareKey: "after-effects",
        prefix: "AD"
    },
    "ani-layout": {
        name: "Ani Layout",
        software: "Illustrator",
        softwareKey: "illustrator",
        prefix: "AL"
    },
    "ani-anim": {
        name: "Ani Anim",
        software: "Autodesk Maya",
        softwareKey: "maya",
        prefix: "AA"
    },
    "ani-voice-check": {
        name: "Ani Voice Check",
        software: "Windows",
        softwareKey: "windows",
        prefix: "AVC"
    }
};

const statusLabels = {
    available: "Chưa kích hoạt",
    active: "Đang dùng",
    paused: "Bảo lưu",
    blocked: "Đã khóa",
    expired: "Hết hạn",
    voided: "Đã hủy"
};

const editableStatusOptions = [
    { value: "available", label: "Chưa kích hoạt" },
    { value: "active", label: "Đang dùng" },
    { value: "paused", label: "Bảo lưu" },
    { value: "expired", label: "Hết hạn" },
    { value: "blocked", label: "Ban / khóa" },
    { value: "voided", label: "Hủy key" }
];

const softwareFilterOptions = [
    { value: "all", label: "Tất cả phần mềm" },
    { value: "after-effects", label: "After Effects" },
    { value: "illustrator", label: "Illustrator" },
    { value: "maya", label: "Autodesk Maya" },
    { value: "windows", label: "Windows" }
];

const statusFilterOptions = [
    { value: "all", label: "Tất cả tình trạng" },
    { value: "available", label: "Chưa kích hoạt" },
    { value: "active", label: "Đang dùng" },
    { value: "expiring", label: "Sắp hết hạn" },
    { value: "expired", label: "Đã quá hạn" },
    { value: "paused", label: "Bảo lưu" },
    { value: "blocked", label: "Đã khóa" },
    { value: "voided", label: "Đã hủy" }
];

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

function copyText(value) {
    if (!navigator.clipboard) {
        return Promise.reject(new Error("Clipboard API is not available."));
    }
    return navigator.clipboard.writeText(value);
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

function getProductMeta(productId) {
    return products[productId] || {
        name: productId || "AniTool",
        software: "Không rõ",
        softwareKey: "unknown",
        prefix: "ANI"
    };
}

function getProductName(productId) {
    return getProductMeta(productId).name;
}

function getProductSoftware(productId) {
    return getProductMeta(productId).software;
}

function getProductEntries(query = "") {
    const normalizedQuery = query.trim().toLowerCase();

    return Object.entries(products)
        .map(([id, meta]) => ({ id, ...meta }))
        .filter((product) => {
            const haystack = [product.name, product.software, product.prefix, product.id].join(" ").toLowerCase();
            return !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

function renderProductOptions() {
    const selectedProductId = els.productId.value || "ani-deepth";
    const query = String(els.productSearchInput.value || "");
    const productEntries = getProductEntries(query);

    if (productEntries.length === 0) {
        els.productOptionList.innerHTML = '<div class="smartEmpty">Không có sản phẩm phù hợp.</div>';
        return;
    }

    els.productOptionList.innerHTML = productEntries.map((product) => `
            <button class="smartOption${product.id === selectedProductId ? " isSelected" : ""}" type="button" data-product-id="${escapeHtml(product.id)}">
                <span>${escapeHtml(product.name)}</span>
                ${product.id === selectedProductId ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ""}
            </button>
    `).join("");
}

function renderFilterOptions(target, options, selectedValue) {
    target.innerHTML = `
        <div class="smartSectionTitle">Chọn bộ lọc</div>
        ${options.map((option) => `
            <button class="smartOption${option.value === selectedValue ? " isSelected" : ""}" type="button" data-filter-value="${escapeHtml(option.value)}">
                <span>${escapeHtml(option.label)}</span>
                ${option.value === selectedValue ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ""}
            </button>
        `).join("")}
    `;
}

function renderBulkStatusOptions() {
    const selectedValue = els.bulkStatusValue.value || "";

    els.bulkStatusOptionList.innerHTML = editableStatusOptions.map((option) => `
        <button class="smartOption${option.value === selectedValue ? " isSelected" : ""}" type="button" data-bulk-status-value="${escapeHtml(option.value)}">
            <span>${escapeHtml(option.label)}</span>
            ${option.value === selectedValue ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ""}
        </button>
    `).join("");
}

function closeDropdown() {
    if (!activeDropdown) {
        return;
    }

    activeDropdown.menu.hidden = true;
    activeDropdown.button.setAttribute("aria-expanded", "false");
    activeDropdown = null;
}

function openDropdown(config) {
    if (activeDropdown && activeDropdown.menu !== config.menu) {
        closeDropdown();
    }

    activeDropdown = config;
    config.menu.hidden = false;
    config.button.setAttribute("aria-expanded", "true");

    if (config.searchInput) {
        config.searchInput.focus();
        config.searchInput.select();
    }
}

function toggleDropdown(config) {
    if (!config.menu.hidden) {
        closeDropdown();
        return;
    }

    openDropdown(config);
}

function updateProductSelectText() {
    els.productSelectText.textContent = getProductName(els.productId.value);
}

function setFilterValue(input, textEl, optionListEl, options, value) {
    const option = options.find((item) => item.value === value) || options[0];
    input.value = option.value;
    textEl.textContent = option.label;
    renderFilterOptions(optionListEl, options, option.value);
    renderLicenses();
}

function getStatusLabel(status) {
    const value = String(status || "available").toLowerCase();
    return statusLabels[value] || status || "Không rõ";
}

function getTimestampDate(value) {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    if (typeof value.toDate === "function") {
        return value.toDate();
    }
    if (typeof value.seconds === "number") {
        return new Date(value.seconds * 1000);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDaysRemaining(license) {
    const activatedAt = getTimestampDate(license.activatedAt);
    const durationDays = Number(license.durationDays);

    if (!activatedAt || !Number.isFinite(durationDays) || durationDays <= 0) {
        return null;
    }

    const expiresAt = activatedAt.getTime() + durationDays * 24 * 60 * 60 * 1000;
    return Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
}

function getEffectiveStatus(license) {
    const status = String(license.status || "available").toLowerCase();
    const daysRemaining = getDaysRemaining(license);

    if (status === "voided") {
        return "voided";
    }
    if (status === "blocked") {
        return "blocked";
    }
    if (status === "paused") {
        return "paused";
    }
    if (daysRemaining !== null && daysRemaining <= 0) {
        return "expired";
    }
    if (status === "active" || license.ownerUid || license.activatedAt) {
        return "active";
    }

    return status;
}

function getStatusText(license) {
    const effectiveStatus = getEffectiveStatus(license);
    const daysRemaining = getDaysRemaining(license);

    if (effectiveStatus === "active" && daysRemaining !== null) {
        return `Đang dùng · còn ${daysRemaining} ngày`;
    }
    if (effectiveStatus === "paused") {
        const pausedDays = Number.isFinite(Number(license.pausedRemainingDays))
            ? Number(license.pausedRemainingDays)
            : daysRemaining;
        return Number.isFinite(pausedDays) ? `Bảo lưu · còn ${pausedDays} ngày` : "Bảo lưu";
    }

    return getStatusLabel(effectiveStatus);
}

function getStatusClass(status) {
    const value = String(status || "available").toLowerCase();
    return `is${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function parseRequiredInteger(input, label, min, max) {
    const raw = String(input.value || "").trim();
    const parsed = Number(raw);

    if (!raw) {
        throw new Error(`${label} là bắt buộc.`);
    }
    if (!Number.isInteger(parsed)) {
        throw new Error(`${label} phải là số nguyên.`);
    }
    if (parsed < min || parsed > max) {
        throw new Error(`${label} phải từ ${min} đến ${max}.`);
    }

    return parsed;
}

function clampDurationDays(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return MIN_DURATION_DAYS;
    }

    return Math.max(MIN_DURATION_DAYS, Math.min(MAX_DURATION_DAYS, Math.round(parsed)));
}

function getElapsedDaysSinceActivation(license) {
    const activatedAt = getTimestampDate(license.activatedAt);
    if (!activatedAt) {
        return 0;
    }

    return Math.max(0, Math.ceil((Date.now() - activatedAt.getTime()) / (24 * 60 * 60 * 1000)));
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
    const counts = {
        available: 0,
        active: 0,
        expiring: 0,
        expired: 0,
        paused: 0,
        blocked: 0,
        voided: 0
    };

    licenses.forEach((license) => {
        const effectiveStatus = getEffectiveStatus(license);
        const daysRemaining = getDaysRemaining(license);

        if (Object.prototype.hasOwnProperty.call(counts, effectiveStatus)) {
            counts[effectiveStatus] += 1;
        }
        if (effectiveStatus === "active" && daysRemaining !== null && daysRemaining <= 14) {
            counts.expiring += 1;
        }
    });

    els.licenseCount.textContent = String(licenses.length);
    els.availableCount.textContent = String(counts.available);
    els.activeCount.textContent = String(counts.active);
    els.expiringCount.textContent = String(counts.expiring);
    els.expiredCount.textContent = String(counts.expired);
    els.pausedCount.textContent = String(counts.paused);
    els.blockedCount.textContent = String(counts.blocked);
    els.voidedCount.textContent = String(counts.voided);
}

function generateLicenseKey(productId = els.productId.value) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const prefix = getProductMeta(productId).prefix;
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

function setProduct(productId, shouldGenerateKey = false) {
    if (!products[productId]) {
        return;
    }

    els.productId.value = productId;
    updateProductSelectText();
    renderProductOptions();

    if (shouldGenerateKey) {
        selectedLicenseId = "";
        lastGeneratedKeys = [];
        els.licenseKey.value = generateLicenseKey(productId);
        renderLicenses();
    }
}

function clearForm() {
    selectedLicenseId = "";
    lastGeneratedKeys = [];
    els.licenseEmail.value = "";
    els.contactInfo.value = "";
    setProduct("ani-deepth");
    els.licenseKey.value = generateLicenseKey("ani-deepth");
    els.durationDays.value = "365";
    els.maxDevices.value = "1";
    renderLicenses();
}

function getFormPayload() {
    const email = String(els.licenseEmail.value || "").trim().toLowerCase();
    const contactInfo = String(els.contactInfo.value || "").trim();
    const licenseKey = normalizeLicenseKey(els.licenseKey.value);

    if (!email) {
        throw new Error("Gmail là bắt buộc.");
    }
    if (!els.licenseEmail.checkValidity()) {
        throw new Error("Gmail không hợp lệ.");
    }
    if (!licenseKey) {
        throw new Error("License key là bắt buộc. Bấm Sinh key hoặc nhập key trước.");
    }

    return {
        id: licenseKey,
        data: {
            email,
            ownerUid: "",
            productId: els.productId.value || "ani-deepth",
            status: "available",
            plan: "creator",
            durationDays: parseRequiredInteger(els.durationDays, "Số ngày", MIN_DURATION_DAYS, MAX_DURATION_DAYS),
            maxDevices: parseRequiredInteger(els.maxDevices, "Số máy", 1, 20),
            contactInfo,
            note: "",
            updatedAt: serverTimestamp()
        }
    };
}

async function saveNewLicenseDocument(id, data) {
    const targetRef = doc(db, "licenses", id);
    const existing = await getDoc(targetRef);

    if (existing.exists()) {
        throw new Error("License key này đã tồn tại. Hãy sinh key khác.");
    }

    await setDoc(targetRef, {
        ...data,
        licenseKey: id,
        createdBy: auth.currentUser ? auth.currentUser.uid : "",
        createdByEmail: auth.currentUser ? auth.currentUser.email || "" : "",
        createdAt: serverTimestamp(),
        devices: [],
        deviceCount: 0,
        activatedAt: null
    });
}

async function writeLicenseEvent(license, action, detail = {}) {
    await addDoc(collection(db, "licenseEvents"), {
        licenseId: license.id,
        licenseKey: license.licenseKey || license.id,
        productId: license.productId || "",
        action,
        detail,
        actorUid: auth.currentUser ? auth.currentUser.uid : "",
        actorEmail: auth.currentUser ? auth.currentUser.email || "" : "",
        createdAt: serverTimestamp()
    });
}

async function updateLicenseFields(license, fields, action, detail = {}) {
    await updateDoc(doc(db, "licenses", license.id), {
        ...fields,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser ? auth.currentUser.uid : "",
        updatedByEmail: auth.currentUser ? auth.currentUser.email || "" : ""
    });
    await writeLicenseEvent(license, action, detail);
}

function buildStatusFields(license, nextStatus) {
    const fields = { status: nextStatus };
    const previousStatus = String(license.status || "available").toLowerCase();

    if (nextStatus === "blocked") {
        fields.blockedAt = serverTimestamp();
        fields.blockedBy = auth.currentUser ? auth.currentUser.uid : "";
    }
    if (nextStatus === "voided") {
        fields.voidedAt = serverTimestamp();
        fields.voidedBy = auth.currentUser ? auth.currentUser.uid : "";
    }
    if (nextStatus === "paused") {
        const remaining = getDaysRemaining(license);
        fields.pausedAt = serverTimestamp();
        fields.pausedBy = auth.currentUser ? auth.currentUser.uid : "";
        fields.pausedRemainingDays = Number.isFinite(remaining)
            ? Math.max(0, remaining)
            : clampDurationDays(license.durationDays || 1);
    }
    if (previousStatus === "paused" && nextStatus === "active") {
        const pausedRemainingDays = Number(license.pausedRemainingDays);
        if (Number.isFinite(pausedRemainingDays) && license.activatedAt) {
            fields.durationDays = clampDurationDays(getElapsedDaysSinceActivation(license) + pausedRemainingDays);
        }
        fields.resumedAt = serverTimestamp();
    }

    return fields;
}

async function updateLicenseStatus(license, nextStatus) {
    const normalizedStatus = String(nextStatus || "").toLowerCase();
    const currentStatus = String(license.status || "available").toLowerCase();

    if (!editableStatusOptions.some((option) => option.value === normalizedStatus) || normalizedStatus === currentStatus) {
        return;
    }

    if (normalizedStatus === "voided" && !window.confirm("Hủy key này? Document vẫn được giữ để tra lịch sử, nhưng key sẽ không dùng được nữa.")) {
        renderLicenses();
        return;
    }
    if (normalizedStatus === "blocked" && !window.confirm("Ban/khóa key này? Người dùng sẽ không thể dùng license này.")) {
        renderLicenses();
        return;
    }

    await updateLicenseFields(
        license,
        buildStatusFields(license, normalizedStatus),
        "status-change",
        { from: currentStatus, to: normalizedStatus }
    );
    setStatus(`Đã đổi trạng thái ${license.licenseKey || license.id}.`);
}

async function setLicenseDuration(license, nextDurationDays, action = "duration-set") {
    const previousDays = clampDurationDays(license.durationDays || 1);
    const nextDays = clampDurationDays(nextDurationDays);

    if (nextDays === previousDays) {
        return;
    }
    const fields = { durationDays: nextDays };
    if (String(license.status || "").toLowerCase() === "paused" && Number.isFinite(Number(license.pausedRemainingDays))) {
        fields.pausedRemainingDays = Math.max(0, Number(license.pausedRemainingDays) + (nextDays - previousDays));
    }

    await updateLicenseFields(
        license,
        fields,
        action,
        { from: previousDays, to: nextDays, delta: nextDays - previousDays }
    );
}

async function applyLicenseDayDelta(license, delta) {
    const previousDays = clampDurationDays(license.durationDays || 1);
    await setLicenseDuration(license, previousDays + delta, "duration-delta");
}

function getSortValue(license, key) {
    switch (key) {
        case "key":
            return license.licenseKey || license.id || "";
        case "product":
            return getProductName(license.productId);
        case "status":
            return getStatusText(license);
        case "days":
            return Number(license.durationDays) || 0;
        case "devices":
            return getDeviceCount(license);
        case "email":
            return license.email || "";
        case "contact":
            return license.contactInfo || "";
        case "createdAt":
        default:
            return license.createdAt?.seconds || 0;
    }
}

function compareSortValues(a, b) {
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }

    return String(a).localeCompare(String(b), "vi", {
        numeric: true,
        sensitivity: "base"
    });
}

function sortLicenses(items) {
    const direction = sortState.direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
        const result = compareSortValues(getSortValue(a, sortState.key), getSortValue(b, sortState.key));
        if (result !== 0) {
            return result * direction;
        }

        return compareSortValues(getSortValue(b, "createdAt"), getSortValue(a, "createdAt"));
    });
}

function updateSortHeaders() {
    document.querySelectorAll(".sortHeader").forEach((button) => {
        const key = button.getAttribute("data-sort-key");
        const icon = button.querySelector("i");
        const isActive = key === sortState.key;

        button.classList.toggle("isActive", isActive);
        button.setAttribute("aria-sort", isActive ? (sortState.direction === "asc" ? "ascending" : "descending") : "none");
        if (icon) {
            icon.className = isActive
                ? `fa-solid fa-sort-${sortState.direction === "asc" ? "up" : "down"}`
                : "fa-solid fa-sort";
        }
    });
}

function getEditableStatusOptions(license) {
    const hasOwner = Boolean(license.ownerUid || license.activatedAt);

    return editableStatusOptions.filter((option) => {
        if (option.value === "active") {
            return hasOwner;
        }
        if (option.value === "paused") {
            return hasOwner;
        }
        if (option.value === "available") {
            return !hasOwner || String(license.status || "").toLowerCase() === "available";
        }
        return true;
    });
}

function renderStatusSelect(license, effectiveStatus) {
    const rawStatus = String(license.status || "available").toLowerCase();
    const currentStatus = rawStatus === "active" && effectiveStatus === "expired" ? "active" : rawStatus;

    return `
        <div class="statusControl">
            <select class="statusSelect ${escapeHtml(getStatusClass(effectiveStatus))}" data-license-status="${escapeHtml(license.id)}" aria-label="Đổi trạng thái license">
                ${getEditableStatusOptions(license).map((option) => `
                    <option value="${escapeHtml(option.value)}"${option.value === currentStatus ? " selected" : ""}>${escapeHtml(option.label)}</option>
                `).join("")}
            </select>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </div>
    `;
}

function renderDurationControl(license) {
    return `
        <div class="durationControl">
            <button class="durationButton" type="button" data-license-day-delta="-1" data-license-id="${escapeHtml(license.id)}" title="Trừ 1 ngày" aria-label="Trừ 1 ngày">
                <i class="fa-solid fa-minus" aria-hidden="true"></i>
            </button>
            <input class="durationInput" type="number" min="${MIN_DURATION_DAYS}" max="${MAX_DURATION_DAYS}" value="${escapeHtml(clampDurationDays(license.durationDays || 1))}" data-license-duration="${escapeHtml(license.id)}" aria-label="Số ngày license">
            <button class="durationButton" type="button" data-license-day-delta="1" data-license-id="${escapeHtml(license.id)}" title="Cộng 1 ngày" aria-label="Cộng 1 ngày">
                <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
        </div>
    `;
}

function updateSelectionUI() {
    const selectedCount = selectedLicenseIds.size;
    const visibleSelectedCount = visibleLicenseIds.filter((id) => selectedLicenseIds.has(id)).length;

    els.selectAllVisible.checked = visibleLicenseIds.length > 0 && visibleSelectedCount === visibleLicenseIds.length;
    els.selectAllVisible.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleLicenseIds.length;
    const hasSelection = selectedCount > 0;
    els.bulkAddDays.disabled = !hasSelection;
    els.bulkSubtractDays.disabled = !hasSelection;
    els.bulkDayAmount.disabled = !hasSelection;
    els.bulkStatusSelectBtn.disabled = !hasSelection;
    els.bulkStatusSelectBtn.classList.toggle("isDisabled", !hasSelection);
}

function getSelectedLicenses() {
    return licenses.filter((license) => selectedLicenseIds.has(license.id));
}

async function applyBulkDayDelta(direction) {
    const amount = parseRequiredInteger(els.bulkDayAmount, "Số ngày hàng loạt", 1, MAX_DURATION_DAYS);
    const delta = direction * amount;
    const targets = getSelectedLicenses();

    if (targets.length === 0) {
        setStatus("Chưa chọn license nào để chỉnh ngày.", true);
        return;
    }
    if (targets.length > 10 && !window.confirm(`Áp dụng ${delta > 0 ? "cộng" : "trừ"} ${Math.abs(delta)} ngày cho ${targets.length} license?`)) {
        return;
    }

    setStatus(`Đang cập nhật ${targets.length} license...`);
    await Promise.all(targets.map((license) => applyLicenseDayDelta(license, delta)));
    setStatus(`Đã cập nhật ${targets.length} license.`);
}

function setBulkStatusValue(value = "") {
    const option = editableStatusOptions.find((item) => item.value === value);
    els.bulkStatusValue.value = option ? option.value : "";
    els.bulkStatusSelectText.textContent = option ? option.label : "Trạng thái";
    renderBulkStatusOptions();
}

async function applyBulkStatus(nextStatus) {
    const normalizedStatus = String(nextStatus || "").toLowerCase();
    const option = editableStatusOptions.find((item) => item.value === normalizedStatus);
    const targets = getSelectedLicenses();

    if (!option) {
        return;
    }
    if (targets.length === 0) {
        setStatus("Chưa chọn license nào để đổi trạng thái.", true);
        return;
    }

    const editableTargets = targets.filter((license) => {
        const currentStatus = String(license.status || "available").toLowerCase();
        return currentStatus !== normalizedStatus
            && getEditableStatusOptions(license).some((item) => item.value === normalizedStatus);
    });

    if (editableTargets.length === 0) {
        setStatus("Không có license phù hợp để đổi trạng thái.");
        return;
    }
    if ((normalizedStatus === "voided" || normalizedStatus === "blocked")
        && !window.confirm(`Áp dụng "${option.label}" cho ${editableTargets.length} license?`)) {
        return;
    }

    setStatus(`Đang đổi trạng thái ${editableTargets.length} license...`);
    await Promise.all(editableTargets.map((license) => updateLicenseFields(
        license,
        buildStatusFields(license, normalizedStatus),
        "bulk-status-change",
        { from: String(license.status || "available").toLowerCase(), to: normalizedStatus }
    )));
    setStatus(`Đã đổi trạng thái ${editableTargets.length} license.`);
}

function renderLicenses() {
    updateMetrics();
    updateSortHeaders();
    selectedLicenseIds = new Set([...selectedLicenseIds].filter((id) => licenses.some((license) => license.id === id)));
    const search = String(els.searchInput.value || "").trim().toLowerCase();
    const softwareFilter = els.softwareFilter.value || "all";
    const statusFilter = els.statusFilter.value || "all";
    const filtered = licenses.filter((license) => {
        const meta = getProductMeta(license.productId);
        const effectiveStatus = getEffectiveStatus(license);
        const daysRemaining = getDaysRemaining(license);
        const matchesSoftware = softwareFilter === "all" || meta.softwareKey === softwareFilter;
        const matchesStatus = statusFilter === "all"
            ? effectiveStatus !== "voided"
            : effectiveStatus === statusFilter
            || (statusFilter === "expiring" && effectiveStatus === "active" && daysRemaining !== null && daysRemaining <= 14);
        const haystack = [
            license.id,
            license.licenseKey || "",
            license.email || "",
            license.contactInfo || "",
            license.ownerUid || "",
            license.productId || "",
            meta.name,
            meta.software,
            getStatusText(license),
            effectiveStatus,
            license.status || ""
        ].join(" ").toLowerCase();
        return matchesSoftware && matchesStatus && (!search || haystack.indexOf(search) !== -1);
    });
    const sortedLicenses = sortLicenses(filtered);
    visibleLicenseIds = sortedLicenses.map((license) => license.id);
    updateSelectionUI();

    if (sortedLicenses.length === 0) {
        els.licenseRows.innerHTML = '<tr><td colspan="8" class="empty">Chưa có license phù hợp.</td></tr>';
        return;
    }

    els.licenseRows.innerHTML = sortedLicenses.map((license) => {
        const status = getEffectiveStatus(license);
        const selected = selectedLicenseIds.has(license.id) || license.id === selectedLicenseId ? " class=\"isSelected\"" : "";
        const email = license.email || "-";
        const contactInfo = license.contactInfo || "-";
        return `
            <tr data-license-id="${escapeHtml(license.id)}"${selected}>
                <td data-label="Chọn" class="selectColumn"><input class="rowSelect" type="checkbox" data-license-select="${escapeHtml(license.id)}"${selectedLicenseIds.has(license.id) ? " checked" : ""} aria-label="Chọn license"></td>
                <td data-label="Key" title="${escapeHtml(license.id)}"><button class="tableCopyKey" type="button" data-copy-license-key="${escapeHtml(license.licenseKey || license.id)}">${escapeHtml(license.licenseKey || license.id)}</button></td>
                <td data-label="Sản phẩm"><span class="productCell"><strong>${escapeHtml(getProductName(license.productId))}</strong><small>${escapeHtml(getProductSoftware(license.productId))}</small></span></td>
                <td data-label="Trạng thái">${renderStatusSelect(license, status)}</td>
                <td data-label="Ngày">${renderDurationControl(license)}</td>
                <td data-label="Máy">${escapeHtml(getDeviceCount(license))} / ${escapeHtml(license.maxDevices || 1)}</td>
                <td data-label="Gmail" title="${escapeHtml(email)}">${escapeHtml(email)}</td>
                <td data-label="Liên hệ" title="${escapeHtml(contactInfo)}">${escapeHtml(contactInfo)}</td>
            </tr>
        `;
    }).join("");
}

function setActiveWorkspaceTab(name) {
    const showCreate = name !== "list";

    els.createTabBtn.classList.toggle("isActive", showCreate);
    els.listTabBtn.classList.toggle("isActive", !showCreate);
    els.createTabBtn.setAttribute("aria-selected", showCreate ? "true" : "false");
    els.listTabBtn.setAttribute("aria-selected", showCreate ? "false" : "true");
    els.createTabPanel.hidden = !showCreate;
    els.listTabPanel.hidden = showCreate;
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

        setStatus("Đang tạo license...");
        els.licenseKey.value = payload.id;
        await saveNewLicenseDocument(payload.id, payload.data);
        selectedLicenseId = payload.id;
        lastGeneratedKeys = [payload.id];
        setStatus("Đã tạo license.");
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.generateKeyBtn.addEventListener("click", () => {
    selectedLicenseId = "";
    lastGeneratedKeys = [];
    els.licenseKey.value = generateLicenseKey();
    renderLicenses();
    setStatus("Đã sinh license key. Kiểm tra thông tin rồi bấm Tạo.");
});

els.licenseKey.addEventListener("input", () => {
    selectedLicenseId = "";
    lastGeneratedKeys = [];
    els.licenseKey.value = normalizeLicenseKey(els.licenseKey.value);
    renderLicenses();
});

els.copyLicensesBtn.addEventListener("click", async () => {
    const value = lastGeneratedKeys.length > 0 ? lastGeneratedKeys.join("\n") : normalizeLicenseKey(els.licenseKey.value);
    if (!value) {
        setStatus("Chưa có license key để copy.", true);
        return;
    }

    try {
        await copyText(value);
        setStatus("Đã copy license key.");
    } catch (error) {
        els.licenseKey.focus();
        els.licenseKey.select();
        setStatus("Hãy chọn key trong ô và copy thủ công.");
    }
});

els.licenseRows.addEventListener("click", async (event) => {
    const dayButton = event.target.closest("[data-license-day-delta]");
    if (dayButton) {
        const license = licenses.find((item) => item.id === dayButton.getAttribute("data-license-id"));
        if (!license) {
            return;
        }
        try {
            await applyLicenseDayDelta(license, Number(dayButton.getAttribute("data-license-day-delta")));
            setStatus(`Đã cập nhật ngày cho ${license.licenseKey || license.id}.`);
        } catch (error) {
            setStatus(error.message, true);
        }
        return;
    }

    if (event.target.closest(".rowSelect, .statusSelect, .durationInput, .durationControl")) {
        return;
    }

    const copyTarget = event.target.closest("[data-copy-license-key]");
    const row = event.target.closest("[data-license-id]");
    const license = row ? licenses.find((item) => item.id === row.getAttribute("data-license-id")) : null;

    if (copyTarget) {
        const key = copyTarget.getAttribute("data-copy-license-key");
        if (license) {
            selectedLicenseId = license.id;
            renderLicenses();
        }
        try {
            await copyText(key);
            setStatus("Đã copy license key.");
        } catch (error) {
            setStatus("Không copy tự động được. Hãy copy thủ công.", true);
        }
        return;
    }

    if (license) {
        selectedLicenseId = license.id;
        lastGeneratedKeys = [];
        renderLicenses();
    }
});

els.licenseRows.addEventListener("change", async (event) => {
    const selectTarget = event.target.closest("[data-license-select]");
    if (selectTarget) {
        const id = selectTarget.getAttribute("data-license-select");
        if (selectTarget.checked) {
            selectedLicenseIds.add(id);
        } else {
            selectedLicenseIds.delete(id);
        }
        selectedLicenseId = id;
        renderLicenses();
        return;
    }

    const statusTarget = event.target.closest("[data-license-status]");
    if (statusTarget) {
        const license = licenses.find((item) => item.id === statusTarget.getAttribute("data-license-status"));
        if (!license) {
            return;
        }
        try {
            await updateLicenseStatus(license, statusTarget.value);
        } catch (error) {
            setStatus(error.message, true);
            renderLicenses();
        }
        return;
    }

    const durationTarget = event.target.closest("[data-license-duration]");
    if (durationTarget) {
        const license = licenses.find((item) => item.id === durationTarget.getAttribute("data-license-duration"));
        if (!license) {
            return;
        }
        try {
            await setLicenseDuration(license, durationTarget.value);
            setStatus(`Đã cập nhật ngày cho ${license.licenseKey || license.id}.`);
        } catch (error) {
            setStatus(error.message, true);
            renderLicenses();
        }
    }
});

els.licenseRows.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.closest("[data-license-duration]")) {
        event.target.blur();
    }
});

els.searchInput.addEventListener("input", renderLicenses);

els.selectAllVisible.addEventListener("change", () => {
    if (els.selectAllVisible.checked) {
        visibleLicenseIds.forEach((id) => selectedLicenseIds.add(id));
    } else {
        selectedLicenseIds.clear();
    }
    renderLicenses();
});

els.bulkPanelToggleBtn.addEventListener("click", () => {
    const shouldShow = els.bulkTools.hidden;
    els.bulkTools.hidden = !shouldShow;
    els.bulkPanelToggleBtn.classList.toggle("isActive", shouldShow);
    els.bulkPanelToggleBtn.classList.add("isSpinning");
    els.bulkPanelToggleBtn.setAttribute("aria-expanded", shouldShow ? "true" : "false");
    els.bulkPanelToggleBtn.setAttribute("aria-label", shouldShow ? "Ẩn công cụ hàng loạt" : "Mở công cụ hàng loạt");
});

els.bulkPanelToggleBtn.addEventListener("animationend", () => {
    els.bulkPanelToggleBtn.classList.remove("isSpinning");
});

els.bulkAddDays.addEventListener("click", async () => {
    try {
        await applyBulkDayDelta(1);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.bulkSubtractDays.addEventListener("click", async () => {
    try {
        await applyBulkDayDelta(-1);
    } catch (error) {
        setStatus(error.message, true);
    }
});

els.bulkStatusSelectBtn.addEventListener("click", () => {
    if (els.bulkStatusSelectBtn.disabled) {
        return;
    }

    toggleDropdown({
        button: els.bulkStatusSelectBtn,
        menu: els.bulkStatusSelectMenu
    });
});

els.bulkStatusOptionList.addEventListener("click", async (event) => {
    const option = event.target.closest("[data-bulk-status-value]");
    if (!option) {
        return;
    }

    const statusValue = option.getAttribute("data-bulk-status-value");
    setBulkStatusValue(statusValue);
    closeDropdown();
    try {
        await applyBulkStatus(statusValue);
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        setBulkStatusValue("");
    }
});

els.bulkDayAmount.addEventListener("input", () => {
    els.bulkDayAmount.value = String(Math.max(1, Math.min(MAX_DURATION_DAYS, Number(els.bulkDayAmount.value || 1))));
});

els.productSelectBtn.addEventListener("click", () => {
    if (els.productSelectMenu.hidden) {
        els.productSearchInput.value = "";
        renderProductOptions();
    }

    toggleDropdown({
        button: els.productSelectBtn,
        menu: els.productSelectMenu,
        searchInput: els.productSearchInput
    });
});

els.productSearchInput.addEventListener("input", renderProductOptions);

els.productOptionList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-product-id]");
    if (!option) {
        return;
    }

    setProduct(option.getAttribute("data-product-id"), true);
    closeDropdown();
});

els.softwareSelectBtn.addEventListener("click", () => {
    toggleDropdown({
        button: els.softwareSelectBtn,
        menu: els.softwareSelectMenu
    });
});

els.softwareOptionList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-filter-value]");
    if (!option) {
        return;
    }

    setFilterValue(els.softwareFilter, els.softwareSelectText, els.softwareOptionList, softwareFilterOptions, option.getAttribute("data-filter-value"));
    closeDropdown();
});

els.statusSelectBtn.addEventListener("click", () => {
    toggleDropdown({
        button: els.statusSelectBtn,
        menu: els.statusSelectMenu
    });
});

els.statusOptionList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-filter-value]");
    if (!option) {
        return;
    }

    setFilterValue(els.statusFilter, els.statusSelectText, els.statusOptionList, statusFilterOptions, option.getAttribute("data-filter-value"));
    closeDropdown();
});

els.listTabPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort-key]");
    if (!button) {
        return;
    }

    const key = button.getAttribute("data-sort-key");
    if (sortState.key === key) {
        sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    } else {
        sortState = {
            key,
            direction: "asc"
        };
    }

    renderLicenses();
});

els.createTabBtn.addEventListener("click", () => {
    setActiveWorkspaceTab("create");
});

els.listTabBtn.addEventListener("click", () => {
    setActiveWorkspaceTab("list");
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".smartSelect")) {
        closeDropdown();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeDropdown();
    }
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
    setActiveWorkspaceTab("create");
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

updateProductSelectText();
renderProductOptions();
renderFilterOptions(els.softwareOptionList, softwareFilterOptions, els.softwareFilter.value);
renderFilterOptions(els.statusOptionList, statusFilterOptions, els.statusFilter.value);
renderBulkStatusOptions();
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
