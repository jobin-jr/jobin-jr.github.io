(() => {
  const statusEl = document.getElementById('copy-status');
  const buttons = document.querySelectorAll('.copy-btn[data-copy]');
  const timers = new WeakMap();
  const tokens = new WeakMap();

  function fallbackCopy(value) {
    const prevFocus = document.activeElement;
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.setAttribute('aria-hidden', 'true');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '1px';
    ta.style.height = '1px';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);

    let ok = false;
    try {
      if (typeof ta.focus === 'function') {
        try {
          ta.focus({ preventScroll: true });
        } catch {
          ta.focus();
        }
      }
      ta.select();
      if (typeof ta.setSelectionRange === 'function') {
        ta.setSelectionRange(0, value.length);
      }
      ok = Boolean(document.execCommand && document.execCommand('copy'));
    } catch {
      ok = false;
    } finally {
      document.body.removeChild(ta);
      if (prevFocus && typeof prevFocus.focus === 'function') {
        try {
          prevFocus.focus({ preventScroll: true });
        } catch {
          prevFocus.focus();
        }
      }
    }
    return ok;
  }

  async function copyText(value) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext
    ) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // Fall through to execCommand fallback if Clipboard API permission is denied.
      }
    }
    return fallbackCopy(value);
  }

  buttons.forEach((btn) => {
    const defaultLabel = btn.dataset.label || btn.textContent.trim() || 'Copy';
    btn.dataset.label = defaultLabel;

    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy');
      if (!value) return;

      const clickToken = (tokens.get(btn) || 0) + 1;
      tokens.set(btn, clickToken);

      const existingTimer = timers.get(btn);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
        timers.delete(btn);
      }

      const ok = await copyText(value);
      if (tokens.get(btn) !== clickToken) return;

      if (ok) {
        btn.textContent = 'Copied';
        btn.classList.remove('copy-failed');
        btn.classList.add('copied');
        if (statusEl) {
          statusEl.textContent = `Copied ${value} to clipboard.`;
        }
      } else {
        btn.textContent = 'Failed';
        btn.classList.remove('copied');
        btn.classList.add('copy-failed');
        if (statusEl) {
          statusEl.textContent = `Copy failed. Value: ${value}`;
        }
      }

      const timerId = window.setTimeout(() => {
        if (tokens.get(btn) !== clickToken) return;
        btn.textContent = defaultLabel;
        btn.classList.remove('copied', 'copy-failed');
        timers.delete(btn);
      }, 1800);
      timers.set(btn, timerId);
    });
  });
})();
