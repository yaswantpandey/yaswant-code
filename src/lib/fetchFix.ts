// Safeguard against environments (such as preview iframes or sandboxes)
// where `window.fetch` is configured as a getter-only property without a setter,
// which causes a TypeError when libraries or injected scripts attempt to patch it.

export function applyFetchFix(): void {
  if (typeof window === 'undefined') return;

  try {
    const originalFetch = window.fetch;
    let fetchHandler: typeof window.fetch =
      typeof originalFetch === 'function' ? originalFetch.bind(window) : originalFetch;

    const definePropertySafely = (target: any) => {
      try {
        if (!target) return false;
        const desc = Object.getOwnPropertyDescriptor(target, 'fetch');
        if (desc && (desc.set || desc.writable)) {
          return true;
        }

        Object.defineProperty(target, 'fetch', {
          get() {
            return fetchHandler;
          },
          set(val) {
            fetchHandler = val;
          },
          configurable: true,
          enumerable: true,
        });
        return true;
      } catch {
        return false;
      }
    };

    if (typeof Window !== 'undefined' && Window.prototype) {
      definePropertySafely(Window.prototype);
    }
    definePropertySafely(window);
  } catch {
    // Ignore errors during patch
  }

  // Intercept uncaught errors related to fetch setter in sandboxed contexts
  window.addEventListener(
    'error',
    (event) => {
      if (event && event.message && event.message.includes('Cannot set property fetch')) {
        event.preventDefault();
        if (event.stopImmediatePropagation) {
          event.stopImmediatePropagation();
        }
        return true;
      }
    },
    true
  );
}

// Execute immediately when module is imported
applyFetchFix();
