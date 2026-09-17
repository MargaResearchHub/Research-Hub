/* Owns cached DOM references only; must not contain feature behavior. */
export const dom = {};
var dom = {};
export function cacheDom() {
    // Keep all page-element references together so the HTML and JavaScript are easy to compare.
    dom.preloader = document.getElementById("preloader");
    dom.themeToggles = document.querySelectorAll(".theme-toggle");

    dom.searchToggle = document.getElementById("searchToggle");
    dom.mobileSearchBtn = document.getElementById("mobileSearchBtn");
    dom.searchPanel = document.getElementById("searchPanel");
    dom.searchInput = document.getElementById("searchInput");
    dom.scopeSelect = document.getElementById("scopeSelect");
    dom.btnSearch = document.getElementById("btnSearch");

    dom.mobileMenuBtn = document.getElementById("mobileMenuBtn");
    dom.mobileMenuPanel = document.getElementById("mobileMenuPanel");

    dom.advToggle = document.getElementById("advancedToggle");
    dom.advPanel = document.getElementById("advancedPanel");
    dom.rangeMin = document.getElementById("rangeMin");
    dom.rangeMax = document.getElementById("rangeMax");
    dom.rangeFill = document.getElementById("rangeFill");
    dom.rangeMinVal = document.getElementById("rangeMinVal");
    dom.rangeMaxVal = document.getElementById("rangeMaxVal");
    dom.institutionSelect = document.getElementById("institutionSelect");
    dom.fieldSelect = document.getElementById("fieldSelect");
    dom.litTypeSelect = document.getElementById("litTypeSelect");
    dom.btnApplyAdvanced = document.getElementById("btnApplyAdvanced");
    dom.btnResetAdvanced = document.getElementById("btnResetAdvanced");

    dom.spotlightDesktop = document.getElementById("spotlightDesktop");
    dom.rollingSlides = document.getElementById("rollingSlides");
    dom.rollingDots = document.getElementById("rollingDots");

    dom.statPapers = document.getElementById("statPapers");
    dom.statInstitutions = document.getElementById("statInstitutions");
    dom.statAreas = document.getElementById("statAreas");
    dom.visitorCount = document.getElementById("visitorCount");
    dom.statSince = document.getElementById("statSince");

    dom.resultsCount = document.getElementById("resultsCount");
    dom.sortSelect = document.getElementById("sortSelect");
    dom.activeFilters = document.getElementById("activeFilters");
    dom.paperGrid = document.getElementById("paperGrid");
    dom.loadMoreWrap = document.getElementById("loadMoreWrap");
    dom.loadMoreBtn = document.getElementById("loadMoreBtn");

    dom.detailOverlay = document.getElementById("detailOverlay");
    dom.detailModalScroll = document.getElementById("detailModalScroll");
    dom.detailCloseBtn = document.getElementById("detailCloseBtn");

    dom.requestOverlay = document.getElementById("requestOverlay");
    dom.reqPaperTitle = document.getElementById("reqPaperTitle");
    dom.reqPaperAuthors = document.getElementById("reqPaperAuthors");
    dom.reqName = document.getElementById("reqName");
    dom.reqEmail = document.getElementById("reqEmail");
    dom.reqNotes = document.getElementById("reqNotes");
    dom.reqNameError = document.getElementById("reqNameError");
    dom.reqEmailError = document.getElementById("reqEmailError");
    dom.reqSend = document.getElementById("reqSend");
    dom.requestClose = document.getElementById("requestClose");

    dom.a11yOverlay = document.getElementById("a11yOverlay");
    dom.a11yClose = document.getElementById("a11yClose");
    dom.a11yTourBtn = document.getElementById("a11yTourBtn");

    dom.newsletterForm = document.getElementById("newsletterForm");
    dom.newsletterEmail = document.getElementById("newsletterEmail");
    dom.newsletterError = document.getElementById("newsletterError");

    dom.backToTopBtn = document.getElementById("backToTopBtn");

    dom.chatFabBtn = document.getElementById("chatFabBtn");
    dom.chatCloseBtn = document.getElementById("chatCloseBtn");
    dom.chatPanel = document.getElementById("chatPanel");
    dom.chatBody = document.getElementById("chatBody");
    dom.chatForm = document.getElementById("chatForm");
    dom.chatInput = document.getElementById("chatInput");
    dom.chatQuickReplies = document.getElementById("chatQuickReplies");

    dom.storehouseLink = document.getElementById("storehouseLink");
    dom.footerYear = document.getElementById("footerYear");
    dom.toastRegion = document.getElementById("toastRegion");
    dom.tourOverlay = document.getElementById("tourOverlay");
    dom.tourCloseBtn = document.getElementById("tourCloseBtn");
    dom.tourPrevBtn = document.getElementById("tourPrevBtn");
    dom.tourNextBtn = document.getElementById("tourNextBtn");
    dom.tourStepText = document.getElementById("tourStepText");
    dom.tourProgress = document.getElementById("tourProgress");
  }
