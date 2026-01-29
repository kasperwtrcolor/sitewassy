import '../index.css';

export function ThemeToggle({ theme, onToggle }) {
    const isDark = theme === 'dark';

    return (
        <button
            className={`theme-toggle-pill ${isDark ? 'dark' : 'light'}`}
            onClick={onToggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            role="switch"
            aria-checked={isDark}
        >
            {/* Background icons */}
            <span className="theme-toggle-icon sun" aria-hidden="true">
                ☀️
            </span>
            <span className="theme-toggle-icon moon" aria-hidden="true">
                🌙
            </span>

            {/* Sliding knob */}
            <span className="theme-toggle-knob" />
        </button>
    );
}

export default ThemeToggle;
