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
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    serverTimestamp,
    setDoc
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
    createTabBtn: document.getElementById("createTabBtn"),
    listTabBtn: document.getElementById("listTabBtn"),
    createTabPanel: document.getElementById("createTabPanel"),
    listTabPanel: document.getElementById("listTabPanel")
};

let licenses = [];
let lastGeneratedKeys = [];
let selectedLicenseId = "";
let unsubscribeLicenses = null;
let activeDropdown = null;
let sortState = {
    key: "createdAt",
    direction: "desc"
};

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
    blocked: "Đã khóa",
    expired: "Hết hạn"
};

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
    { value: "blocked", label: "Đã khóa" }
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
    const productsBySoftware = new Map();

    getProductEntries(query).forEach((product) => {
        if (!productsBySoftware.has(product.software)) {
            productsBySoftware.set(product.software, []);
        }
        productsBySoftware.get(product.software).push(product);
    });

    if (productsBySoftware.size === 0) {
        els.productOptionList.innerHTML = '<div class="smartEmpty">Không có sản phẩm phù hợp.</div>';
        return;
    }

    els.productOptionList.innerHTML = Array.from(productsBySoftware.entries()).map(([software, items]) => `
        <div class="smartSectionTitle">${escapeHtml(software)}</div>
        ${items.map((product) => `
            <button class="smartOption${product.id === selectedProductId ? " isSelected" : ""}" type="button" data-product-id="${escapeHtml(product.id)}">
                <span>${escapeHtml(product.name)}</span>
                <small>${escapeHtml(product.prefix)}</small>
            </button>
        `).join("")}
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

    if (status === "blocked") {
        return "blocked";
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
    els.availableCount.textContent = String(licenses.filter((license) => getEffectiveStatus(license) === "available").length);
    els.activeCount.textContent = String(licenses.filter((license) => getEffectiveStatus(license) === "active").length);
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
            durationDays: parseRequiredInteger(els.durationDays, "Số ngày", 1, 3650),
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

function renderLicenses() {
    updateMetrics();
    updateSortHeaders();
    const search = String(els.searchInput.value || "").trim().toLowerCase();
    const softwareFilter = els.softwareFilter.value || "all";
    const statusFilter = els.statusFilter.value || "all";
    const filtered = licenses.filter((license) => {
        const meta = getProductMeta(license.productId);
        const effectiveStatus = getEffectiveStatus(license);
        const daysRemaining = getDaysRemaining(license);
        const matchesSoftware = softwareFilter === "all" || meta.softwareKey === softwareFilter;
        const matchesStatus = statusFilter === "all"
            || effectiveStatus === statusFilter
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

    if (sortedLicenses.length === 0) {
        els.licenseRows.innerHTML = '<tr><td colspan="7" class="empty">Chưa có license phù hợp.</td></tr>';
        return;
    }

    els.licenseRows.innerHTML = sortedLicenses.map((license) => {
        const status = getEffectiveStatus(license);
        const statusText = getStatusText(license);
        const selected = license.id === selectedLicenseId ? " class=\"isSelected\"" : "";
        const email = license.email || "-";
        const contactInfo = license.contactInfo || "-";
        return `
            <tr data-license-id="${escapeHtml(license.id)}"${selected}>
                <td data-label="Key" title="${escapeHtml(license.id)}"><button class="tableCopyKey" type="button" data-copy-license-key="${escapeHtml(license.licenseKey || license.id)}">${escapeHtml(license.licenseKey || license.id)}</button></td>
                <td data-label="Sản phẩm"><span class="productCell"><strong>${escapeHtml(getProductName(license.productId))}</strong><small>${escapeHtml(getProductSoftware(license.productId))}</small></span></td>
                <td data-label="Trạng thái"><span class="statusPill ${escapeHtml(getStatusClass(status))}">${escapeHtml(statusText)}</span></td>
                <td data-label="Ngày">${escapeHtml(license.durationDays ?? 0)}</td>
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

els.searchInput.addEventListener("input", renderLicenses);

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
