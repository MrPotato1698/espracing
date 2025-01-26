type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const id = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div id="${id}" class="fixed bottom-4 right-4 p-4 rounded-md text-light-primary bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500 opacity-0 transition-opacity duration-300 ease-in-out">
      ${message}
    </div>
  `;
  document.body.appendChild(toast.firstElementChild!);

  setTimeout(() => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.style.opacity = '1';
    }
  }, 100);

  setTimeout(() => {
    const toastElement = document.getElementById(id);
    if (toastElement) {
      toastElement.style.opacity = '0';
      setTimeout(() => toastElement.remove(), 300);
    }
  }, duration);
}

export function checkAndShowSavedToast() {
  const savedToast = localStorage.getItem('toastMessage');
  if (savedToast) {
    const { message, type } = JSON.parse(savedToast);
    showToast(message, type as 'success' | 'error' | 'warning' | 'info');
    localStorage.removeItem('toastMessage');
  }
}