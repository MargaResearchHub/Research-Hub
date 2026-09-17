/* Owns static application configuration only; must not access the DOM or browser storage. */
export const CONTACT_EMAIL = "admin@margasrilanka.org";
export const STOREHOUSE_URL = "https://margastorehouse.org";
export const DATA_URL = "data/paper.json";
export function computePageSize() {
  const width = window.innerWidth;
  if (width >= config.breakpoints.large) return 10;
  if (width >= config.breakpoints.medium) return 8;
  return 5;
}
export const PAGE_SIZE = computePageSize();
export const ABSTRACT_TRUNCATE = 190;
export const TICKER_LIMIT = 20;
export const TOUR_STORAGE_KEY = "margaSiteTourSeen";
export const SAVED_STORAGE_KEY = "margaSavedPapers";
export const THEME_STORAGE_KEY = "margaThemePref";
export const VISITOR_API_BASE = "https://abacus.jasoncameron.dev";
export const VISITOR_NAMESPACE = "margasrilanka.org";
export const VISITOR_KEY = "research-hub-visits";
export const VISITOR_SESSION_KEY = "margaVisitorCounted";
export const VISITOR_CACHE_KEY = "margaVisitorCountCache";
export const TOUR_STEPS = [
  { title: "Search the catalogue", description: "Enter keywords, author names, or paper IDs in the search bar. Use the advanced filters to narrow by year, partner, field, or publication type." },
  { title: "View and request papers", description: "Open a paper record to read details. If the PDF URL is missing, use the Request Access button to ask for the paper." },
  { title: "Contact support", description: "Use the Contact Us button to email the team directly, or open the chat assistant for fast help with research, paper requests, or locating relevant work." },
  { title: "Save papers for later", description: " Click the Save button on any paper to add it to your personal collection. Access your saved papers from the Saved Papers section." },
  { title: "Marga Papers", description: "Marga Papers will have the Marga Logo on the top left corner of the paper card." }
];
export const PARTNER_LABELS = { cso: "Civil Society Organization", intl: "International Organization", gov: "Government Body", mcc: "Program Partner", org: "Partner Organization", "think-tank": "Think Tank" };
export const LITTYPE_LABELS = { published: "Published", unpublished: "Unpublished", presentation: "Presentation", report: "Report" };
export const config = { breakpoints: { small: 0, medium: 500, large: 900 } };
