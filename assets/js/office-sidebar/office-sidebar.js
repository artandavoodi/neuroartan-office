(function () {
  'use strict';

  function normalizePath(path) {
    return (path || '/').replace(/\/$/, '') || '/';
  }

  function bindOfficeSidebar(root = document) {
    const sidebar = root.querySelector('.office-sidebar');
    if (!sidebar || sidebar.dataset.officeSidebarBound === 'true') return;

    const toggle = sidebar.querySelector('.office-sidebar__toggle');
    const panel = sidebar.querySelector('.office-sidebar__panel');
    const links = Array.from(sidebar.querySelectorAll('.office-sidebar__link'));

    sidebar.dataset.officeSidebarBound = 'true';

    const closeSidebar = () => {
      sidebar.classList.add('is-collapsed');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Expand';
      }
      if (panel) {
        panel.setAttribute('aria-hidden', 'true');
      }
    };

    const openSidebar = () => {
      sidebar.classList.remove('is-collapsed');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = 'Collapse';
      }
      if (panel) {
        panel.setAttribute('aria-hidden', 'false');
      }
    };

    const currentPath = normalizePath(window.location.pathname);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      try {
        const url = new URL(href, window.location.origin);
        const linkPath = normalizePath(url.pathname);
        const isActive = linkPath === currentPath;
        link.classList.toggle('is-active', isActive);

        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      } catch (error) {
        console.error('[Office Sidebar] Invalid link.', error);
      }
    });

    if (toggle) {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        openSidebar();
      }
    });

    openSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindOfficeSidebar(document);
    }, { once: true });
  } else {
    bindOfficeSidebar(document);
  }

  document.addEventListener('fragment:mounted', (event) => {
    const detailRoot = event?.detail?.root;
    if (!(detailRoot instanceof Element)) return;
    if (!detailRoot.querySelector('.office-sidebar')) return;
    bindOfficeSidebar(detailRoot);
  });
})();
