const TOAST_CONTAINER_ID = 'app-toast-container';

const ensureContainer = () => {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.position = 'fixed';
    container.style.right = '1rem';
    container.style.top = '1rem';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0.5rem';
    document.body.appendChild(container);
  }
  return container;
};

const createToast = (message, { type = 'info', duration = 4000 } = {}) => {
  const container = ensureContainer();
  const el = document.createElement('div');
  el.textContent = message;
  el.role = 'status';
  el.style.padding = '0.6rem 0.9rem';
  el.style.borderRadius = '0.5rem';
  el.style.color = type === 'error' ? '#fff' : '#072';
  el.style.background = type === 'error' ? 'linear-gradient(90deg,#ef4444,#dc2626)' : type === 'success' ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#0ea5e9,#0369a1)';
  el.style.boxShadow = '0 6px 20px rgba(2,6,23,0.3)';
  el.style.fontSize = '0.95rem';
  el.style.fontWeight = '600';

  container.appendChild(el);

  const id = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(12px)';
    setTimeout(() => container.removeChild(el), 300);
  }, duration);

  // allow click to dismiss
  el.addEventListener('click', () => {
    clearTimeout(id);
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  return () => {
    clearTimeout(id);
    if (el.parentNode) el.parentNode.removeChild(el);
  };
};

export const toast = {
  success: (msg, opts) => createToast(msg, { ...opts, type: 'success' }),
  error: (msg, opts) => createToast(msg, { ...opts, type: 'error' }),
  info: (msg, opts) => createToast(msg, { ...opts, type: 'info' }),
};
