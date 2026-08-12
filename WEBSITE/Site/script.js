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
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseApp = initializeApp(firebaseConfig);
const siteAuth = getAuth(firebaseApp);
const siteDb = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
const translations = {
  en: {
    "nav.products": "Products",
    "nav.platforms": "Platforms",
    "nav.roadmap": "Roadmap",
    "nav.pricing": "Pricing",
    "nav.cta": "Early access",
    "nav.account": "Account",
    "theme.dark": "Dark mode",
    "theme.light": "Light mode",
    "hero.eyebrow": "Animation product hub",
    "hero.title": "AniTool builds focused tools for motion designers.",
    "hero.copy": "A growing product family for After Effects and production workflow. Small tools, clear jobs, faster animation days.",
    "hero.primary": "Browse products",
    "hero.secondary": "View roadmap",
    "shelf.label": "Product shelf",
    "shelf.count": "3 products planned",
    "shelf.deepth": "Depth layout for After Effects",
    "shelf.motion": "Animation helpers coming later",
    "shelf.scene": "Scene utility slot",
    "intro.copy": "AniTool is structured as a company/product hub first. Each product can have its own license, docs, support path, and release cycle.",
    "intro.use1": "Multi-product",
    "intro.use2": "License-ready",
    "intro.use3": "AE first",
    "intro.use4": "Expandable",
    "products.eyebrow": "Products",
    "products.title": "A product family, not a single-tool page.",
    "products.copy": "AniDeepth is the first release. The layout leaves room for future tools without rebuilding the site later.",
    "products.deepth.meta": "After Effects / Available",
    "products.deepth.copy": "Interactive 3D depth layout with preserve-view scale, distribute modes, and object snap tools.",
    "products.deepth.cta": "Open product",
    "products.motion.meta": "Planned",
    "products.motion.copy": "A future product slot for animation helpers, presets, timing tools, or motion workflow automation.",
    "products.scene.meta": "Planned",
    "products.scene.copy": "A future product slot for scene layout, object management, cleanup, or production utilities.",
    "products.render.meta": "Research",
    "products.render.copy": "A possible product lane for render prep, delivery checks, or output workflow support.",
    "platforms.eyebrow": "Platforms",
    "platforms.title": "Organized for more software later.",
    "platforms.ae": "Current product lane.",
    "platforms.pr": "Future lane.",
    "platforms.ai": "Future lane.",
    "detail.eyebrow": "Featured product",
    "detail.copy": "The first AniTool product focuses on depth layout for After Effects. It helps animators move 3D layers while preserving the visual size they already composed.",
    "detail.priceLabel": "Early access",
    "detail.platformLabel": "Platform",
    "detail.buy": "Buy AniDeepth",
    "detail.contact": "Ask about products",
    "roadmap.eyebrow": "Roadmap",
    "roadmap.title": "The site can grow product by product.",
    "roadmap.step1.title": "Release AniDeepth",
    "roadmap.step1.copy": "Stabilize license, docs, installer, and sales flow for the first product.",
    "roadmap.step2.title": "Add product pages",
    "roadmap.step2.copy": "Each new product gets its own card, detail page, pricing, and download path.",
    "roadmap.step3.title": "Connect CMS",
    "roadmap.step3.copy": "Use the CMS for license control, product status, customers, and release notes.",
    "footer.copy": "AniTool builds practical animation products for production artists.",
    "account.eyebrow": "Account",
    "account.title": "Register once, unlock AniTool products.",
    "account.copy": "Use Google sign-in to create your AniTool account. Licenses linked by the admin will appear here with product status and remaining days.",
    "account.guestTitle": "Sign in or register",
    "account.guestCopy": "Your first Google sign-in creates the account. No separate password is needed.",
    "account.google": "Continue with Google",
    "account.signedIn": "Signed in",
    "account.signOut": "Sign out",
    "account.uid": "UID",
    "account.loading": "Loading licenses...",
    "account.empty": "No product license is linked to this account yet.",
    "account.product": "Product",
    "account.status": "Status",
    "account.expires": "Expires",
    "account.daysLeft": "Days left",
    "account.neverExpires": "No expiry",
    "account.expired": "Expired"
  },
  vi: {
    "nav.products": "S\u1ea3n ph\u1ea9m",
    "nav.platforms": "N\u1ec1n t\u1ea3ng",
    "nav.roadmap": "L\u1ed9 tr\u00ecnh",
    "nav.pricing": "Gi\u00e1",
    "nav.cta": "Early access",
    "nav.account": "T\u00e0i kho\u1ea3n",
    "theme.dark": "Ch\u1ebf \u0111\u1ed9 t\u1ed1i",
    "theme.light": "Ch\u1ebf \u0111\u1ed9 s\u00e1ng",
    "hero.eyebrow": "Hub s\u1ea3n ph\u1ea9m animation",
    "hero.title": "AniTool x\u00e2y c\u00e1c c\u00f4ng c\u1ee5 t\u1eadp trung cho motion designer.",
    "hero.copy": "M\u1ed9t d\u00f2ng s\u1ea3n ph\u1ea9m \u0111ang ph\u00e1t tri\u1ec3n cho After Effects v\u00e0 production workflow. C\u00f4ng c\u1ee5 nh\u1ecf, vi\u1ec7c r\u00f5, ng\u00e0y l\u00e0m animation nhanh h\u01a1n.",
    "hero.primary": "Xem s\u1ea3n ph\u1ea9m",
    "hero.secondary": "Xem l\u1ed9 tr\u00ecnh",
    "shelf.label": "K\u1ec7 s\u1ea3n ph\u1ea9m",
    "shelf.count": "3 s\u1ea3n ph\u1ea9m d\u1ef1 ki\u1ebfn",
    "shelf.deepth": "D\u1ef1ng depth cho After Effects",
    "shelf.motion": "C\u00f4ng c\u1ee5 animation s\u1ebd c\u00f3 sau",
    "shelf.scene": "Slot ti\u1ec7n \u00edch scene",
    "intro.copy": "AniTool \u0111\u01b0\u1ee3c t\u1ed5 ch\u1ee9c nh\u01b0 hub c\u00f4ng ty/s\u1ea3n ph\u1ea9m tr\u01b0\u1edbc. M\u1ed7i s\u1ea3n ph\u1ea9m c\u00f3 th\u1ec3 c\u00f3 license, docs, support path v\u00e0 v\u00f2ng release ri\u00eang.",
    "intro.use1": "Nhi\u1ec1u s\u1ea3n ph\u1ea9m",
    "intro.use2": "S\u1eb5n s\u00e0ng license",
    "intro.use3": "AE tr\u01b0\u1edbc",
    "intro.use4": "D\u1ec5 m\u1edf r\u1ed9ng",
    "products.eyebrow": "S\u1ea3n ph\u1ea9m",
    "products.title": "M\u1ed9t d\u00f2ng s\u1ea3n ph\u1ea9m, kh\u00f4ng ph\u1ea3i trang cho m\u1ed9t tool.",
    "products.copy": "AniDeepth l\u00e0 b\u1ea3n ph\u00e1t h\u00e0nh \u0111\u1ea7u ti\u00ean. Layout n\u00e0y ch\u1eeba ch\u1ed7 cho c\u00e1c tool sau m\u00e0 kh\u00f4ng ph\u1ea3i l\u00e0m l\u1ea1i site.",
    "products.deepth.meta": "After Effects / \u0110\u00e3 c\u00f3",
    "products.deepth.copy": "D\u1ef1ng depth 3D t\u01b0\u01a1ng t\u00e1c, c\u00f3 b\u00f9 scale gi\u1eef h\u00ecnh, distribute modes v\u00e0 object snap.",
    "products.deepth.cta": "M\u1edf s\u1ea3n ph\u1ea9m",
    "products.motion.meta": "D\u1ef1 ki\u1ebfn",
    "products.motion.copy": "Slot s\u1ea3n ph\u1ea9m sau n\u00e0y cho animation helpers, preset, timing tools ho\u1eb7c t\u1ef1 \u0111\u1ed9ng h\u00f3a motion workflow.",
    "products.scene.meta": "D\u1ef1 ki\u1ebfn",
    "products.scene.copy": "Slot s\u1ea3n ph\u1ea9m sau n\u00e0y cho scene layout, qu\u1ea3n l\u00fd object, cleanup ho\u1eb7c ti\u1ec7n \u00edch production.",
    "products.render.meta": "Nghi\u00ean c\u1ee9u",
    "products.render.copy": "M\u1ed9t nh\u00e1nh s\u1ea3n ph\u1ea9m c\u00f3 th\u1ec3 d\u00e0nh cho render prep, ki\u1ec3m tra delivery ho\u1eb7c h\u1ed7 tr\u1ee3 output workflow.",
    "platforms.eyebrow": "N\u1ec1n t\u1ea3ng",
    "platforms.title": "C\u1ea5u tr\u00fac s\u1eb5n cho nhi\u1ec1u ph\u1ea7n m\u1ec1m sau n\u00e0y.",
    "platforms.ae": "Nh\u00e1nh s\u1ea3n ph\u1ea9m hi\u1ec7n t\u1ea1i.",
    "platforms.pr": "Nh\u00e1nh t\u01b0\u01a1ng lai.",
    "platforms.ai": "Nh\u00e1nh t\u01b0\u01a1ng lai.",
    "detail.eyebrow": "S\u1ea3n ph\u1ea9m n\u1ed5i b\u1eadt",
    "detail.copy": "S\u1ea3n ph\u1ea9m \u0111\u1ea7u ti\u00ean c\u1ee7a AniTool t\u1eadp trung v\u00e0o depth layout cho After Effects. N\u00f3 gi\u00fap animator \u0111\u1ea9y layer 3D m\u00e0 v\u1eabn gi\u1eef k\u00edch th\u01b0\u1edbc th\u1ecb gi\u00e1c \u0111\u00e3 c\u0103n.",
    "detail.priceLabel": "Early access",
    "detail.platformLabel": "N\u1ec1n t\u1ea3ng",
    "detail.buy": "Mua AniDeepth",
    "detail.contact": "H\u1ecfi v\u1ec1 s\u1ea3n ph\u1ea9m",
    "roadmap.eyebrow": "L\u1ed9 tr\u00ecnh",
    "roadmap.title": "Site c\u00f3 th\u1ec3 l\u1edbn l\u00ean theo t\u1eebng s\u1ea3n ph\u1ea9m.",
    "roadmap.step1.title": "Release AniDeepth",
    "roadmap.step1.copy": "\u1ed4n \u0111\u1ecbnh license, docs, installer v\u00e0 sales flow cho s\u1ea3n ph\u1ea9m \u0111\u1ea7u ti\u00ean.",
    "roadmap.step2.title": "Th\u00eam trang s\u1ea3n ph\u1ea9m",
    "roadmap.step2.copy": "M\u1ed7i s\u1ea3n ph\u1ea9m m\u1edbi c\u00f3 card, trang chi ti\u1ebft, gi\u00e1 v\u00e0 lu\u1ed3ng t\u1ea3i ri\u00eang.",
    "roadmap.step3.title": "N\u1ed1i CMS",
    "roadmap.step3.copy": "D\u00f9ng CMS cho license control, tr\u1ea1ng th\u00e1i s\u1ea3n ph\u1ea9m, kh\u00e1ch h\u00e0ng v\u00e0 release notes.",
    "footer.copy": "AniTool x\u00e2y c\u00e1c s\u1ea3n ph\u1ea9m animation th\u1ef1c d\u1ee5ng cho production artist.",
    "account.eyebrow": "T\u00e0i kho\u1ea3n",
    "account.title": "\u0110\u0103ng k\u00fd m\u1ed9t l\u1ea7n, m\u1edf kh\u00f3a c\u00e1c s\u1ea3n ph\u1ea9m AniTool.",
    "account.copy": "D\u00f9ng Google sign-in \u0111\u1ec3 t\u1ea1o t\u00e0i kho\u1ea3n AniTool. License admin g\u1eafn v\u00e0o t\u00e0i kho\u1ea3n s\u1ebd hi\u1ec7n \u1edf \u0111\u00e2y k\u00e8m tr\u1ea1ng th\u00e1i v\u00e0 s\u1ed1 ng\u00e0y c\u00f2n l\u1ea1i.",
    "account.guestTitle": "\u0110\u0103ng nh\u1eadp ho\u1eb7c \u0111\u0103ng k\u00fd",
    "account.guestCopy": "L\u1ea7n \u0111\u0103ng nh\u1eadp Google \u0111\u1ea7u ti\u00ean s\u1ebd t\u1ea1o t\u00e0i kho\u1ea3n. Kh\u00f4ng c\u1ea7n m\u1eadt kh\u1ea9u ri\u00eang.",
    "account.google": "Ti\u1ebfp t\u1ee5c v\u1edbi Google",
    "account.signedIn": "\u0110\u00e3 \u0111\u0103ng nh\u1eadp",
    "account.signOut": "\u0110\u0103ng xu\u1ea5t",
    "account.uid": "UID",
    "account.loading": "\u0110ang t\u1ea3i license...",
    "account.empty": "Ch\u01b0a c\u00f3 license s\u1ea3n ph\u1ea9m n\u00e0o g\u1eafn v\u1edbi t\u00e0i kho\u1ea3n n\u00e0y.",
    "account.product": "S\u1ea3n ph\u1ea9m",
    "account.status": "Tr\u1ea1ng th\u00e1i",
    "account.expires": "H\u1ebft h\u1ea1n",
    "account.daysLeft": "C\u00f2n l\u1ea1i",
    "account.neverExpires": "Kh\u00f4ng h\u1ebft h\u1ea1n",
    "account.expired": "\u0110\u00e3 h\u1ebft h\u1ea1n"
  }
};

const currencyByLang = { en: "USD", vi: "VND" };
const state = {
  lang: localStorage.getItem("anitool.lang") || "en",
  theme: localStorage.getItem("anitool.theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
};

localStorage.removeItem("anitool.currency");

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeIcon = document.querySelector("[data-theme-icon]");
const priceNodes = document.querySelectorAll("[data-price]");
const accountGuest = document.querySelector("[data-account-guest]");
const accountUser = document.querySelector("[data-account-user]");
const accountEmail = document.querySelector("[data-account-email]");
const accountUid = document.querySelector("[data-account-uid]");
const accountLicenseList = document.querySelector("[data-license-list]");
const siteGoogleButton = document.querySelector("[data-site-google]");
const siteSignOutButton = document.querySelector("[data-site-signout]");
let customerLicenses = [];
let customerLicenseUnsubscribe = null;
let currentUser = null;

function t(key) {
  const dictionary = translations[state.lang] || translations.en;
  return dictionary[key] || translations.en[key] || key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function currentCurrency() {
  return currencyByLang[state.lang] || "USD";
}

function formatPrice(node) {
  const currency = currentCurrency();
  const value = Number(node.dataset[currency.toLowerCase()]);
  if (!Number.isFinite(value)) return;
  const formatter = new Intl.NumberFormat(state.lang === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  });
  node.textContent = formatter.format(value);
}

function applyLanguage() {
  const dictionary = translations[state.lang] || translations.en;
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = dictionary[node.dataset.i18n];
    if (value) node.textContent = value;
  });
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.langOption === state.lang));
  });
  localStorage.setItem("anitool.lang", state.lang);
  applyPrices();
  applyTheme();
}

function applyPrices() {
  priceNodes.forEach(formatPrice);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const dictionary = translations[state.lang] || translations.en;
  const labelKey = state.theme === "dark" ? "theme.dark" : "theme.light";
  const iconClass = state.theme === "dark" ? "fa-moon" : "fa-sun";
  themeLabel.textContent = dictionary[labelKey];
  themeToggle.setAttribute("aria-label", dictionary[labelKey]);
  themeToggle.setAttribute("title", dictionary[labelKey]);
  themeIcon.className = `fa-solid ${iconClass}`;
  localStorage.setItem("anitool.theme", state.theme);
}

function getProductName(productId) {
  const names = {
    "ani-deepth": "AniDeepth",
    "ani-layout": "Ani Layout",
    "ani-anim": "Ani Anim",
    "ani-voice-check": "Ani Voice Check"
  };
  return names[productId] || productId || "AniTool";
}

function getDaysLeftLabel(expiresAt) {
  if (!expiresAt) return t("account.neverExpires");
  const end = new Date(`${expiresAt}T23:59:59`);
  if (Number.isNaN(end.getTime())) return escapeHtml(expiresAt);
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (days < 0) return t("account.expired");
  return state.lang === "vi" ? `${days} ngày` : `${days} days`;
}

function renderCustomerLicenses() {
  if (!accountLicenseList || !currentUser) return;
  if (customerLicenses.length === 0) {
    accountLicenseList.innerHTML = `<p class="emptyAccount">${escapeHtml(t("account.empty"))}</p>`;
    return;
  }
  accountLicenseList.innerHTML = customerLicenses.map((license) => {
    const status = license.status || "active";
    return `
      <article class="licenseCard">
        <div>
          <span>${escapeHtml(t("account.product"))}</span>
          <strong>${escapeHtml(getProductName(license.productId))}</strong>
        </div>
        <div>
          <span>${escapeHtml(t("account.status"))}</span>
          <strong>${escapeHtml(status)}</strong>
        </div>
        <div>
          <span>${escapeHtml(t("account.expires"))}</span>
          <strong>${escapeHtml(license.expiresAt || t("account.neverExpires"))}</strong>
        </div>
        <div>
          <span>${escapeHtml(t("account.daysLeft"))}</span>
          <strong>${escapeHtml(getDaysLeftLabel(license.expiresAt))}</strong>
        </div>
      </article>
    `;
  }).join("");
}

async function syncCustomerProfile(user) {
  await setDoc(doc(siteDb, "users", user.uid), {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    provider: "google",
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  }, { merge: true });
}

function showGuestAccount() {
  currentUser = null;
  customerLicenses = [];
  if (customerLicenseUnsubscribe) {
    customerLicenseUnsubscribe();
    customerLicenseUnsubscribe = null;
  }
  if (accountGuest) accountGuest.hidden = false;
  if (accountUser) accountUser.hidden = true;
}

function showUserAccount(user) {
  currentUser = user;
  if (accountGuest) accountGuest.hidden = true;
  if (accountUser) accountUser.hidden = false;
  if (accountEmail) accountEmail.textContent = user.email || user.displayName || user.uid;
  if (accountUid) accountUid.textContent = user.uid;
  if (accountLicenseList) accountLicenseList.innerHTML = `<p class="emptyAccount">${escapeHtml(t("account.loading"))}</p>`;
  if (customerLicenseUnsubscribe) customerLicenseUnsubscribe();
  const licenseQuery = query(collection(siteDb, "licenses"), where("ownerUid", "==", user.uid));
  customerLicenseUnsubscribe = onSnapshot(licenseQuery, (snapshot) => {
    customerLicenses = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    customerLicenses.sort((a, b) => String(a.productId || "").localeCompare(String(b.productId || "")));
    renderCustomerLicenses();
  }, (error) => {
    if (accountLicenseList) accountLicenseList.innerHTML = `<p class="emptyAccount">${escapeHtml(error.message)}</p>`;
  });
}
function setScrolledState() {
  header.classList.toggle("scrolled", window.scrollY > 12);
}

function closeNav() {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("navOpen");
}

setScrolledState();
applyLanguage();
window.addEventListener("scroll", setScrolledState, { passive: true });
navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("navOpen", isOpen);
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNav();
});
document.querySelectorAll("[data-lang-option]").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.langOption;
    applyLanguage();
  });
});
siteGoogleButton?.addEventListener("click", async () => {
  try {
    await signInWithPopup(siteAuth, googleProvider);
  } catch (error) {
    if (accountLicenseList) accountLicenseList.innerHTML = `<p class="emptyAccount">${escapeHtml(error.message)}</p>`;
  }
});
siteSignOutButton?.addEventListener("click", () => {
  signOut(siteAuth);
});
onAuthStateChanged(siteAuth, async (user) => {
  if (!user) {
    showGuestAccount();
    return;
  }
  try {
    await syncCustomerProfile(user);
  } catch (error) {
    console.warn(error);
  }
  showUserAccount(user);
});themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
});