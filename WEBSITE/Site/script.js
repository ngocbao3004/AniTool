const translations = {
  en: {
    'nav.workflow': 'Workflow',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.cta': 'Get license',
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'hero.eyebrow': 'After Effects CEP product by AniTool',
    'hero.copy': 'Move 3D layers through camera depth and world axes while keeping the frame you already designed visually stable.',
    'hero.buy': 'Buy license',
    'hero.workflow': 'See workflow',
    'hero.stat1.label': 'Modes',
    'hero.stat1.value': 'Camera + World',
    'hero.stat2.label': 'Table',
    'hero.stat2.value': 'Layer depth',
    'hero.stat3.label': 'Editing',
    'hero.stat3.value': 'Interactive',
    'intro.copy': 'AniDeepth is built for motion designers who need fast depth layout inside After Effects without manually recalculating scale every time a layer moves.',
    'intro.use1': 'Cloud layers',
    'intro.use2': 'Parallax scenes',
    'intro.use3': '3D card stacks',
    'intro.use4': 'Late object snaps',
    'workflow.eyebrow': 'Workflow',
    'workflow.title': 'Set the frame first. Adjust depth after.',
    'workflow.step1.title': 'Select layers',
    'workflow.step1.copy': 'Auto load reads the selected layers into a compact table. Lock the table when the layout needs to stay fixed.',
    'workflow.step2.title': 'Choose movement',
    'workflow.step2.copy': 'Use Camera Depth for camera-facing moves or World X, Y, Z for stable axis-based layout.',
    'workflow.step3.title': 'Drag interactively',
    'workflow.step3.copy': 'Move layers live with sensitivity levels, modifier keys, undo, redo, and reset per layer.',
    'features.eyebrow': 'Features',
    'features.title': 'Depth tools that respect an animator\'s existing composition.',
    'features.card1.title': 'Preserve-view scale',
    'features.card1.copy': 'Depth changes compensate scale so a designed frame stays visually consistent while the layer position changes.',
    'features.card2.title': 'Layer depth table',
    'features.card2.copy': 'See current depth for selected layers, reorder the working list, and keep action controls close to each row.',
    'features.card3.title': 'Distribute modes',
    'features.card3.copy': 'Together, Spread, Random Order, Random Depth, and Random Chaos cover clean spacing through playful variation.',
    'features.card4.title': 'Snap 3D objects',
    'features.card4.copy': 'Snap one 3D layer to another at the current frame, optionally parent it, and choose below, same, or above depth.',
    'modes.eyebrow': 'Distribute',
    'modes.title': 'Five depth behaviors, named for memory.',
    'modes.together.title': 'Together',
    'modes.together.copy': 'All selected layers move by the same amount.',
    'modes.spread.title': 'Spread',
    'modes.spread.copy': 'Layers are evenly distributed by the table order.',
    'modes.randomOrder.title': 'Random Order',
    'modes.randomOrder.copy': 'Even spacing, shuffled near and far positions.',
    'modes.randomDepth.title': 'Random Depth',
    'modes.randomDepth.copy': 'Table order remains, depth rhythm becomes uneven.',
    'modes.randomChaos.title': 'Random Chaos',
    'modes.randomChaos.copy': 'Both order and depth spacing become irregular.',
    'pricing.eyebrow': 'License',
    'pricing.title': 'Early access for After Effects artists.',
    'pricing.copy': 'Use this public page to sell, collect interest, or send buyers to a manual license flow while the payment system is still being built.',
    'pricing.creator.plan': 'Creator',
    'pricing.creator.note': 'Early access license',
    'pricing.creator.item1': 'AniDeepth CEP panel',
    'pricing.creator.item2': 'License key activation',
    'pricing.creator.item3': 'Updates during beta',
    'pricing.creator.cta': 'Buy Creator',
    'pricing.studio.plan': 'Studio',
    'pricing.studio.price': 'Custom',
    'pricing.studio.note': 'For multiple seats',
    'pricing.studio.item1': 'Team license tracking',
    'pricing.studio.item2': 'Device reset support',
    'pricing.studio.item3': 'Priority fixes',
    'pricing.studio.cta': 'Contact',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Before release.',
    'faq.q1': 'Does it replace After Effects 3D?',
    'faq.a1': 'No. It works with After Effects 3D layers and gives you a faster way to place them in depth.',
    'faq.q2': 'Does it support Camera Depth and World axes?',
    'faq.a2': 'Yes. Camera Depth is for camera-relative depth. World X, Y, and Z are stable axis modes.',
    'faq.q3': 'Is the payment system connected?',
    'faq.a3': 'Not yet. This page is ready for sales copy and manual license requests first.',
    'footer.copy': 'AniTool builds practical animation tools for After Effects artists.'
  },
  vi: {
    'nav.workflow': 'Quy trình',
    'nav.features': 'Tính năng',
    'nav.pricing': 'Giá',
    'nav.faq': 'FAQ',
    'nav.cta': 'Lấy license',
    'theme.dark': 'Tối',
    'theme.light': 'Sáng',
    'hero.eyebrow': 'Sản phẩm CEP After Effects của AniTool',
    'hero.copy': 'Đẩy layer 3D theo camera depth hoặc trục world, trong khi khung hình bạn đã căn vẫn được giữ ổn định về thị giác.',
    'hero.buy': 'Mua license',
    'hero.workflow': 'Xem quy trình',
    'hero.stat1.label': 'Mode',
    'hero.stat1.value': 'Camera + World',
    'hero.stat2.label': 'Bảng',
    'hero.stat2.value': 'Độ sâu layer',
    'hero.stat3.label': 'Chỉnh sửa',
    'hero.stat3.value': 'Tương tác live',
    'intro.copy': 'AniDeepth được làm cho motion designer cần dựng chiều sâu nhanh trong After Effects mà không phải tự tính lại scale mỗi khi di chuyển layer.',
    'intro.use1': 'Layer mây',
    'intro.use2': 'Cảnh parallax',
    'intro.use3': 'Stack card 3D',
    'intro.use4': 'Snap object muộn',
    'workflow.eyebrow': 'Quy trình',
    'workflow.title': 'Căn khung trước. Chỉnh chiều sâu sau.',
    'workflow.step1.title': 'Chọn layer',
    'workflow.step1.copy': 'Auto load đưa layer đang chọn vào bảng gọn. Lock bảng khi bạn cần giữ nguyên danh sách làm việc.',
    'workflow.step2.title': 'Chọn kiểu di chuyển',
    'workflow.step2.copy': 'Dùng Camera Depth cho hướng theo camera, hoặc World X, Y, Z cho bố cục ổn định theo trục.',
    'workflow.step3.title': 'Kéo tương tác',
    'workflow.step3.copy': 'Di chuyển layer live với mức nhạy, phím bổ trợ, undo, redo và reset theo từng layer.',
    'features.eyebrow': 'Tính năng',
    'features.title': 'Công cụ chiều sâu tôn trọng bố cục animator đã dựng.',
    'features.card1.title': 'Bù scale giữ hình',
    'features.card1.copy': 'Khi đổi depth, tool bù scale để layer vẫn nhìn ổn định trong frame đã thiết kế.',
    'features.card2.title': 'Bảng độ sâu layer',
    'features.card2.copy': 'Xem depth hiện tại, đổi thứ tự danh sách làm việc và dùng action ngay trên từng dòng.',
    'features.card3.title': 'Distribute modes',
    'features.card3.copy': 'Together, Spread, Random Order, Random Depth và Random Chaos giúp rải đều hoặc tạo biến thiên nhanh.',
    'features.card4.title': 'Snap object 3D',
    'features.card4.copy': 'Snap layer 3D này vào layer khác tại frame hiện tại, có thể parent và chọn nằm dưới, bằng hoặc trên depth.',
    'modes.eyebrow': 'Distribute',
    'modes.title': 'Năm kiểu đẩy, đặt tên để dễ nhớ.',
    'modes.together.title': 'Together',
    'modes.together.copy': 'Tất cả layer được chọn đi cùng một khoảng.',
    'modes.spread.title': 'Spread',
    'modes.spread.copy': 'Rải đều theo thứ tự trong bảng.',
    'modes.randomOrder.title': 'Random Order',
    'modes.randomOrder.copy': 'Khoảng cách vẫn đều, nhưng ai gần ai xa bị xáo.',
    'modes.randomDepth.title': 'Random Depth',
    'modes.randomDepth.copy': 'Giữ thứ tự bảng, nhưng nhịp sâu không đều.',
    'modes.randomChaos.title': 'Random Chaos',
    'modes.randomChaos.copy': 'Vừa đảo thứ tự, vừa làm khoảng cách lộn xộn.',
    'pricing.eyebrow': 'License',
    'pricing.title': 'Early access cho artist dùng After Effects.',
    'pricing.copy': 'Trang này dùng để bán, gom khách quan tâm hoặc dẫn người mua vào luồng license thủ công trong lúc hệ thống thanh toán đang được xây tiếp.',
    'pricing.creator.plan': 'Creator',
    'pricing.creator.note': 'License early access',
    'pricing.creator.item1': 'Panel CEP AniDeepth',
    'pricing.creator.item2': 'Kích hoạt bằng license key',
    'pricing.creator.item3': 'Cập nhật trong beta',
    'pricing.creator.cta': 'Mua Creator',
    'pricing.studio.plan': 'Studio',
    'pricing.studio.price': 'Liên hệ',
    'pricing.studio.note': 'Cho nhiều máy/nhiều ghế',
    'pricing.studio.item1': 'Quản lý license nhóm',
    'pricing.studio.item2': 'Hỗ trợ reset thiết bị',
    'pricing.studio.item3': 'Ưu tiên sửa lỗi',
    'pricing.studio.cta': 'Liên hệ',
    'faq.eyebrow': 'FAQ',
    'faq.title': 'Trước khi release.',
    'faq.q1': 'Tool có thay thế 3D của After Effects không?',
    'faq.a1': 'Không. Tool làm việc trên layer 3D của After Effects và giúp bạn đặt chiều sâu nhanh hơn.',
    'faq.q2': 'Có hỗ trợ Camera Depth và World axes không?',
    'faq.a2': 'Có. Camera Depth dùng theo camera, còn World X, Y, Z là các mode theo trục ổn định.',
    'faq.q3': 'Đã nối hệ thống thanh toán chưa?',
    'faq.a3': 'Chưa. Trang này sẵn sàng cho sales copy và luồng xin license thủ công trước.',
    'footer.copy': 'AniTool xây các công cụ animation thực dụng cho artist After Effects.'
  }
};

const state = {
  lang: localStorage.getItem('anitool.lang') || 'en',
  currency: localStorage.getItem('anitool.currency') || 'USD',
  theme: localStorage.getItem('anitool.theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
};

const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const priceNodes = document.querySelectorAll('[data-price]');

function formatPrice(node) {
  const value = Number(node.dataset[state.currency.toLowerCase()]);
  if (!Number.isFinite(value)) return;

  const formatter = new Intl.NumberFormat(state.lang === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: state.currency,
    maximumFractionDigits: 0
  });

  node.textContent = formatter.format(value);
}

function applyLanguage() {
  const dictionary = translations[state.lang] || translations.en;
  document.documentElement.lang = state.lang;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = dictionary[node.dataset.i18n];
    if (value) node.textContent = value;
  });

  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.langOption === state.lang));
  });

  localStorage.setItem('anitool.lang', state.lang);
  applyCurrency();
  applyTheme();
}

function applyCurrency() {
  priceNodes.forEach(formatPrice);
  document.querySelectorAll('[data-currency-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.currencyOption === state.currency));
  });
  localStorage.setItem('anitool.currency', state.currency);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const labelKey = state.theme === 'dark' ? 'theme.dark' : 'theme.light';
  themeLabel.textContent = (translations[state.lang] || translations.en)[labelKey];
  localStorage.setItem('anitool.theme', state.theme);
}

function setScrolledState() {
  header.classList.toggle('scrolled', window.scrollY > 12);
}

function closeNav() {
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('navOpen');
}

setScrolledState();
applyLanguage();
window.addEventListener('scroll', setScrolledState, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('navOpen', isOpen);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNav();
});

document.querySelectorAll('[data-lang-option]').forEach((button) => {
  button.addEventListener('click', () => {
    state.lang = button.dataset.langOption;
    applyLanguage();
  });
});

document.querySelectorAll('[data-currency-option]').forEach((button) => {
  button.addEventListener('click', () => {
    state.currency = button.dataset.currencyOption;
    applyCurrency();
  });
});

themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});