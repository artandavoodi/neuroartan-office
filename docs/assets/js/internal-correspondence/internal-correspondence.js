(function () {
  'use strict';

  const OFFICE_MENU_FRAGMENT_PATH = '/office/assets/fragments/office-menu/office-menu.html';
  const OFFICE_MENU_CSS_PATH = '/office/assets/css/office-menu/office-menu.css';
  const OFFICE_MENU_JS_PATH = '/office/assets/js/office-menu/office-menu.js';
  const OFFICE_SIDEBAR_FRAGMENT_PATH = '/office/assets/fragments/office-sidebar/office-sidebar.html';
  const OFFICE_SIDEBAR_CSS_PATH = '/office/assets/css/office-sidebar/office-sidebar.css';
  const OFFICE_SIDEBAR_JS_PATH = '/office/assets/js/office-sidebar/office-sidebar.js';
  const OFFICE_FOOTER_FRAGMENT_PATH = '/office/assets/fragments/office-footer/office-footer.html';
  const OFFICE_FOOTER_CSS_PATH = '/office/assets/css/office-footer/office-footer.css';
  const OFFICE_FOOTER_JS_PATH = '/office/assets/js/office-footer/office-footer.js';

  async function fetchFragment(path) {
    const response = await fetch(path, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Failed to fetch fragment: ${path}`);
    }
    return response.text();
  }

  function ensureStylesheet(path, id) {
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }

  function ensureScript(path, id) {
    if (document.getElementById(id)) return;

    const script = document.createElement('script');
    script.id = id;
    script.src = path;
    script.defer = true;
    document.body.appendChild(script);
  }

  async function mountFragment({ mountId, path, name }) {
    const mount = document.getElementById(mountId);
    if (!mount) return null;
    if (mount.dataset.icMounted === 'true') return mount;

    try {
      const markup = await fetchFragment(path);
      mount.innerHTML = markup;
      mount.dataset.icMounted = 'true';

      mount.dispatchEvent(new CustomEvent('fragment:mounted', {
        bubbles: true,
        detail: { name, root: mount, mount }
      }));

      return mount;
    } catch (error) {
      console.error(`[Internal Correspondence] Unable to mount ${name}.`, error);
      return null;
    }
  }

  function setActiveLinks() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const links = Array.from(document.querySelectorAll('.internal-correspondence-link-list a, .internal-correspondence-subcard a'));

    links.forEach((link) => {
      try {
        const url = new URL(link.getAttribute('href'), window.location.origin);
        const linkPath = url.pathname.replace(/\/$/, '') || '/';
        const isExactMatch = linkPath === currentPath;
        link.classList.toggle('is-active', isExactMatch);
        if (isExactMatch) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      } catch (error) {
        console.error('[Internal Correspondence] Invalid link path.', error);
      }
    });
  }

  function markDepartmentContext() {
    const currentPath = window.location.pathname.toLowerCase();
    const departmentMap = [
      ['governance', 'governance'],
      ['operations', 'operations'],
      ['knowledge', 'knowledge-research'],
      ['research', 'knowledge-research'],
      ['infrastructure', 'infrastructure'],
      ['brand', 'brand'],
      ['communication', 'communication']
    ];

    const matchedDepartment = departmentMap.find(([segment]) => currentPath.includes(segment));
    const department = matchedDepartment ? matchedDepartment[1] : 'operations';

    document.documentElement.dataset.officeDepartment = department;
    document.body.dataset.officeDepartment = department;
  }

  function markOfficeContext() {
    document.documentElement.classList.add('office-platform');
    document.body.classList.add('office-platform');
  }

  async function initInternalCorrespondence() {
    markOfficeContext();
    markDepartmentContext();
    ensureStylesheet(OFFICE_MENU_CSS_PATH, 'office-menu-css');
    ensureScript(OFFICE_MENU_JS_PATH, 'office-menu-js');
    ensureStylesheet(OFFICE_SIDEBAR_CSS_PATH, 'office-sidebar-css');
    ensureScript(OFFICE_SIDEBAR_JS_PATH, 'office-sidebar-js');
    ensureStylesheet(OFFICE_FOOTER_CSS_PATH, 'office-footer-css');
    ensureScript(OFFICE_FOOTER_JS_PATH, 'office-footer-js');

    await Promise.all([
      mountFragment({
        mountId: 'menu-mount',
        path: OFFICE_MENU_FRAGMENT_PATH,
        name: 'office-menu'
      }),
      mountFragment({
        mountId: 'sidebar-mount',
        path: OFFICE_SIDEBAR_FRAGMENT_PATH,
        name: 'office-sidebar'
      }),
      mountFragment({
        mountId: 'footer-mount',
        path: OFFICE_FOOTER_FRAGMENT_PATH,
        name: 'office-footer'
      })
    ]);

    setActiveLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInternalCorrespondence, { once: true });
  } else {
    initInternalCorrespondence();
  }
})();