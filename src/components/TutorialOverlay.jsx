import { useState, useEffect, useCallback } from 'react';

const TUTORIAL_STEPS = [
    {
        id: 'wallet',
        selector: '.wallet-card',
        title: '💳 Your Wallet',
        description: 'This is your Solana wallet. It shows your USDC balance and SOL for gas fees. Fund it with USDC to start sending payments!',
        position: 'right'
    },
    {
        id: 'authorize',
        selector: '.wallet-card .btn',
        title: '🔐 Authorize Vault',
        description: 'Before sending payments, authorize the vault to move USDC on your behalf. Set a spending limit that matches how much you plan to send.',
        position: 'right'
    },
    {
        id: 'howto',
        selector: '.howto-card',
        title: '🐦 How to Pay',
        description: 'Send payments by tweeting! Mention @bot_wassy with the recipient and amount. Example: "@bot_wassy send @friend $5"',
        position: 'left'
    },
    {
        id: 'claims',
        selector: '.claims-card',
        fallbackSelector: '.grid-2 > div:last-child',
        title: '💰 Pending Claims',
        description: 'When someone sends you USDC via X, it appears here. Click "Claim" to receive the funds directly to your wallet!',
        position: 'left'
    },
    {
        id: 'scan',
        selector: '.scan-countdown',
        title: '⏱️ Payment Scanner',
        description: 'Our bot scans X for payment mentions every 30 minutes. The countdown shows when the next scan happens.',
        position: 'bottom'
    }
];

export function TutorialOverlay({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    // Find and highlight the target element
    const updateTarget = useCallback(() => {
        if (!step) return;

        let element = document.querySelector(step.selector);
        if (!element && step.fallbackSelector) {
            element = document.querySelector(step.fallbackSelector);
        }

        if (element) {
            // Scroll element into view smoothly
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

            // Wait for scroll to complete, then update rect
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                setTargetRect({
                    top: rect.top - 10,
                    left: rect.left - 10,
                    width: rect.width + 20,
                    height: rect.height + 20
                });
            }, 500);
        }
    }, [step]);

    // Scroll to top on first render to ensure elements are visible
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Delay initial target update to ensure page is rendered
        const timer = setTimeout(updateTarget, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        updateTarget();
        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget);
        return () => {
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget);
        };
    }, [updateTarget, currentStep]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
            return;
        }

        setIsAnimating(true);
        setTargetRect(null);

        setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setIsAnimating(false);
        }, 400);
    };

    const handleSkip = () => {
        onComplete();
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTargetRect(null);

            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 400);
        }
    };

    // Calculate floater position based on target and preference
    const getFloaterStyle = () => {
        if (!targetRect) return { opacity: 0 };

        const floaterWidth = 320;
        const floaterHeight = 180;
        const padding = 20;

        let top, left;

        switch (step.position) {
            case 'right':
                top = targetRect.top + targetRect.height / 2 - floaterHeight / 2;
                left = targetRect.left + targetRect.width + padding;
                if (left + floaterWidth > window.innerWidth - 20) {
                    left = targetRect.left - floaterWidth - padding;
                }
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2 - floaterHeight / 2;
                left = targetRect.left - floaterWidth - padding;
                if (left < 20) {
                    left = targetRect.left + targetRect.width + padding;
                }
                break;
            case 'top':
                top = targetRect.top - floaterHeight - padding;
                left = targetRect.left + targetRect.width / 2 - floaterWidth / 2;
                break;
            case 'bottom':
            default:
                top = targetRect.top + targetRect.height + padding;
                left = targetRect.left + targetRect.width / 2 - floaterWidth / 2;
                break;
        }

        // Keep floater on screen
        top = Math.max(20, Math.min(top, window.innerHeight - floaterHeight - 20));
        left = Math.max(20, Math.min(left, window.innerWidth - floaterWidth - 20));

        return {
            top: `${top}px`,
            left: `${left}px`,
            opacity: isAnimating ? 0 : 1
        };
    };

    return (
        <div className="tutorial-overlay">
            {/* Dark overlay with spotlight cutout */}
            <svg className="tutorial-backdrop" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left}
                                y={targetRect.top}
                                width={targetRect.width}
                                height={targetRect.height}
                                rx="12"
                                fill="black"
                                className="spotlight-cutout"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.85)"
                    mask="url(#spotlight-mask)"
                />
            </svg>

            {/* Spotlight border glow */}
            {targetRect && (
                <div
                    className="spotlight-border"
                    style={{
                        position: 'fixed',
                        top: targetRect.top,
                        left: targetRect.left,
                        width: targetRect.width,
                        height: targetRect.height,
                        borderRadius: '12px',
                        border: '2px solid #31d7ff',
                        boxShadow: '0 0 20px rgba(49, 215, 255, 0.5), inset 0 0 20px rgba(49, 215, 255, 0.1)',
                        pointerEvents: 'none',
                        transition: 'all 0.4s ease-out'
                    }}
                />
            )}

            {/* Explainer floater */}
            <div className="tutorial-floater" style={getFloaterStyle()}>
                <div className="tutorial-step-indicator">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <h3 className="tutorial-title">{step?.title}</h3>
                <p className="tutorial-description">{step?.description}</p>

                <div className="tutorial-actions">
                    <button onClick={handleSkip} className="tutorial-skip-btn">
                        Skip Tour
                    </button>
                    <div className="tutorial-nav">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="tutorial-prev-btn">
                                ← Back
                            </button>
                        )}
                        <button onClick={handleNext} className="tutorial-next-btn">
                            {isLastStep ? '✓ Got it!' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook to manage tutorial state
export function useTutorial() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Check localStorage after component mounts
        const hasSeenTutorial = localStorage.getItem('wassypay_tutorial_completed');
        if (!hasSeenTutorial) {
            // Small delay to let the app render first
            setTimeout(() => setShowTutorial(true), 1000);
        }
        setHasChecked(true);
    }, []);

    const completeTutorial = useCallback(() => {
        localStorage.setItem('wassypay_tutorial_completed', 'true');
        setShowTutorial(false);
    }, []);

    const resetTutorial = useCallback(() => {
        localStorage.removeItem('wassypay_tutorial_completed');
        setShowTutorial(true);
    }, []);

    return {
        showTutorial,
        hasChecked,
        completeTutorial,
        resetTutorial
    };
}
