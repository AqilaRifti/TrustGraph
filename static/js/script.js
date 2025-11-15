// Utility functions for Wikipedia vs Grokipedia Analysis

/**
 * Make API call with error handling
 */
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showToast('Error: ' + error.message, 'danger');
        throw error;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.role = 'alert';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Format timestamp to readable date
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

/**
 * Format LLM response with markdown-style formatting to HTML
 * Converts ** to bold, adds line breaks before dashes, etc.
 */
function formatLLMResponse(text) {
    if (!text) return text;

    // Convert **text** to <strong>text</strong>
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Add line breaks before list items (lines starting with -)
    text = text.replace(/\s*-\s+/g, '<br>• ');

    // Add line breaks before numbered items
    text = text.replace(/(\d+)\.\s+/g, '<br>$1. ');

    // Convert double line breaks to paragraph breaks
    text = text.replace(/\n\n/g, '</p><p>');

    // Convert single line breaks to <br>
    text = text.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!text.startsWith('<p>')) {
        text = '<p>' + text + '</p>';
    }

    return text;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Export functions for use in other scripts
window.apiCall = apiCall;
window.showToast = showToast;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.calculatePercentage = calculatePercentage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
