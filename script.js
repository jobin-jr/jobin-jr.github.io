(() => {
  const statusEl = document.getElementById('copy-status');
  const buttons = document.querySelectorAll('.copy-btn[data-copy]');
  const timers = new WeakMap();

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
    return ok;
  }

  buttons.forEach((btn) => {
    const defaultLabel = btn.dataset.label || btn.textContent.trim() || 'Copy';
    btn.dataset.label = defaultLabel;

    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy');
      if (!value) return;

      const existingTimer = timers.get(btn);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }

      try {
        const ok = await copyText(value);
        if (ok) {
          btn.textContent = 'Copied';
          btn.classList.add('copied');
          if (statusEl) {
            statusEl.textContent = `Copied ${value} to clipboard.`;
          }
          const timerId = window.setTimeout(() => {
            btn.textContent = defaultLabel;
            btn.classList.remove('copied');
            timers.delete(btn);
          }, 1800);
          timers.set(btn, timerId);
        }
      } catch {
        if (statusEl) {
          statusEl.textContent = `Copy failed. Value: ${value}`;
        }
      }
    });
  });
})();
