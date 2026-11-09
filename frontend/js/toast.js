/* ================================================================
   SHARED TOAST NOTIFICATIONS
   Usage:  showToast('Saved successfully', 'success', 'Saved');
   Requires an element with id="toastContainer" in the page.
   ================================================================ */
(function (global) {
    'use strict';

    const ICONS = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const TITLES = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Notice'
    };

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function dismissToast(toast) {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.remove();
        }, { once: true });
        // Fallback in case no transition fires
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 500);
    }

    function showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toastContainer');
        if (!container) return null;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.setAttribute('role', 'alert');

        toast.innerHTML = `
            <div class="toast-icon" aria-hidden="true"><i class="fas ${ICONS[type] || ICONS.info}"></i></div>
            <div class="toast-body">
                <div class="toast-title">${escapeHtml(title || TITLES[type] || 'Info')}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Dismiss"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        let timeout = setTimeout(() => dismissToast(toast), 4500);
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            dismissToast(toast);
        });
        toast.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearTimeout(timeout);
                dismissToast(toast);
            }
        });
        toast.addEventListener('mouseenter', () => clearTimeout(timeout));
        toast.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => dismissToast(toast), 3500);
        });

        return toast;
    }

    global.showToast = showToast;
    global.dismissToast = dismissToast;
})(window);
