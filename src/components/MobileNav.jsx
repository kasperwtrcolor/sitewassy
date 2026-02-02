import { useState, useRef, useEffect } from 'react';
import { Home, User, Trophy, Crown, Ticket } from 'lucide-react';
import '../index.css';

const baseNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'lottery', icon: Ticket, label: 'Lottery' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'leaders', icon: Trophy, label: 'Leaders' }
];

const adminNavItem = { id: 'admin', icon: Crown, label: 'Admin' };


export function MobileNav({
    activeItem = 'home',
    onNavigate,
    accentColor = 'var(--glow)',
    isAdmin = false
}) {
    // Build nav items based on admin status
    const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

    const [active, setActive] = useState(activeItem);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const [bouncing, setBouncing] = useState(null);
    const navRef = useRef(null);
    const itemRefs = useRef({});

    // Calculate underline position based on active item
    useEffect(() => {
        const activeEl = itemRefs.current[active];
        if (activeEl && navRef.current) {
            const navRect = navRef.current.getBoundingClientRect();
            const itemRect = activeEl.getBoundingClientRect();
            const labelEl = activeEl.querySelector('.mobile-nav-label');
            const labelWidth = labelEl ? labelEl.offsetWidth : 40;

            setUnderlineStyle({
                left: itemRect.left - navRect.left + (itemRect.width - labelWidth) / 2,
                width: labelWidth
            });
        }
    }, [active]);

    const handleClick = (id) => {
        // Trigger bounce animation
        setBouncing(id);
        setTimeout(() => setBouncing(null), 300);

        setActive(id);
        if (onNavigate) {
            onNavigate(id);
        }
    };

    return (
        <nav
            ref={navRef}
            className="mobile-nav"
            role="navigation"
            aria-label="Mobile navigation"
        >
            {/* Animated underline */}
            <div
                className="mobile-nav-underline"
                style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                    backgroundColor: accentColor
                }}
            />

            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                const isBouncing = bouncing === item.id;

                return (
                    <button
                        key={item.id}
                        ref={(el) => itemRefs.current[item.id] = el}
                        className={`mobile-nav-item ${isActive ? 'active' : ''} ${isBouncing ? 'bounce' : ''}`}
                        onClick={() => handleClick(item.id)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        style={{ '--accent': accentColor }}
                    >
                        <Icon
                            size={22}
                            className="mobile-nav-icon"
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="mobile-nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

export default MobileNav;
