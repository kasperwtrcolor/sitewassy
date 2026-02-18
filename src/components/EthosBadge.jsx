import React from 'react';
import ethosLogo from '../assets/ethos_logo.png';

const ETHOS_LEVELS = {
    'untrusted': { label: 'Untrusted', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'questionable': { label: 'Questionable', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    'neutral': { label: 'Neutral', color: '#888888', bg: 'rgba(136, 136, 136, 0.1)' },
    'known': { label: 'Known', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    'established': { label: 'Established', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    'reputable': { label: 'Reputable', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    'exemplary': { label: 'Exemplary', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
    'distinguished': { label: 'Distinguished', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    'revered': { label: 'Revered', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    'renowned': { label: 'Renowned', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', glow: true }
};

export function EthosBadge({ level, username, style = {} }) {
    if (level === undefined || level === null) return null;

    // Numeric scores are used directly, level strings are mapped to colors
    let displayLevel = level;
    let numericScore = typeof level === 'number' ? level : null;

    if (numericScore !== null) {
        // Broad color mapping for numeric scores
        if (numericScore >= 80) displayLevel = 'renowned';
        else if (numericScore >= 60) displayLevel = 'reputable';
        else if (numericScore >= 40) displayLevel = 'known';
        else if (numericScore >= 20) displayLevel = 'neutral';
        else displayLevel = 'untrusted';
    }

    const config = ETHOS_LEVELS[String(displayLevel).toLowerCase()] || ETHOS_LEVELS.neutral;

    const badge = (
        <span className={`ethos-badge ${config.glow ? 'glow-text' : ''}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.6rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.color}`,
            ...style
        }}>
            <img
                src={ethosLogo}
                alt="Ethos"
                style={{ width: '12px', height: '12px', marginRight: '4px', objectFit: 'contain' }}
            />
            {numericScore !== null ? numericScore : config.label}
        </span>
    );

    if (username) {
        // Normalize username (remove @ if present)
        const cleanUsername = String(username).replace(/^@/, '');
        return (
            <a
                href={`https://app.ethos.network/profile/x/${cleanUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
                {badge}
            </a>
        );
    }

    return badge;
}

export default EthosBadge;
