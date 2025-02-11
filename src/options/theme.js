document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('themeSelect');
    const darkThemeStylesheet = document.getElementById('darkThemeStylesheet');

    // Load the saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });
});

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkThemeStylesheet.media = 'all';
    } else if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        darkThemeStylesheet.media = 'not all';
    } else {
        document.documentElement.removeAttribute('data-theme');
        darkThemeStylesheet.media = '(prefers-color-scheme: dark)';
    }
}
