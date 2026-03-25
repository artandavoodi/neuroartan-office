(function () {
  'use strict';

  function normalizePath(path) {
    return (path || '/').replace(/\/$/, '') || '/';
  }

  function setActiveOfficeFooterLinks(root = document) {
    const currentPath = normalizePath(window.location.pathname);
    const links = Array.from(root.querySelectorAll('.office-footer__link-list a'));

    links.forEach((link) => {
      try {
        const href = link.getAttribute('href') || '/';
        const linkUrl = new URL(href, window.location.origin);
        const linkPath = normalizePath(linkUrl.pathname);
        const isActive = linkPath === currentPath;

        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      } catch (error) {
        console.error('[Office Footer] Invalid navigation link.', error);
      }
    });
  }

  function bindOfficeFooter(root = document) {
    const footer = root.querySelector('.office-footer');
    if (!footer || footer.dataset.officeFooterBound === 'true') return;

    footer.dataset.officeFooterBound = 'true';
    setActiveOfficeFooterLinks(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindOfficeFooter(document);
    }, { once: true });
  } else {
    bindOfficeFooter(document);
  }

  document.addEventListener('fragment:mounted', (event) => {
    const detailRoot = event?.detail?.root;
    if (!(detailRoot instanceof Element)) return;
    if (!detailRoot.querySelector('.office-footer')) return;
    bindOfficeFooter(detailRoot);
  });
})();