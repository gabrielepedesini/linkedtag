// gets the preferred theme
function getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    } else {
        return 'light';
    }
}

// sets the theme
const userPreferredTheme = getPreferredTheme();
document.documentElement.setAttribute('data-theme', userPreferredTheme);

// updates in case of a change while using the website
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    const newTheme = event.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
});