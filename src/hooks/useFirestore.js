import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
} from 'firebase/firestore';

// Achievement definitions - 15 total achievements
const ACHIEVEMENTS = {
    // Core progression
    first_payment: { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯', points: 10 },
    first_claim: { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎', points: 10 },
    authorized: { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐', points: 5 },

    // Volume milestones
    big_spender: { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸', points: 25 },
    collector: { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆', points: 25 },
    whale: { id: 'whale', name: 'Whale', desc: 'Send over $1000', icon: '🐋', points: 100 },
    mega_whale: { id: 'mega_whale', name: 'Mega Whale', desc: 'Send over $10,000', icon: '🐳', points: 500 },

    // Activity milestones
    veteran: { id: 'veteran', name: 'Veteran', desc: 'Complete 10 transactions', icon: '⭐', points: 50 },
    multi_sender: { id: 'multi_sender', name: 'Generous', desc: 'Send to 5 different users', icon: '🎁', points: 30 },

    // Daily login & streaks
    daily_login: { id: 'daily_login', name: 'Dedicated', desc: 'Log in today', icon: '📅', points: 1 },
    streak_7: { id: 'streak_7', name: 'Weekly Warrior', desc: '7-day login streak', icon: '🔥', points: 20 },
    streak_30: { id: 'streak_30', name: 'Monthly Master', desc: '30-day login streak', icon: '💫', points: 100 },

    // Social & special
    social_sharer: { id: 'social_sharer', name: 'Influencer', desc: 'Share a payment on X', icon: '📣', points: 15 },
    early_adopter: { id: 'early_adopter', name: 'Pioneer', desc: 'Join in first 1000 users', icon: '🚀', points: 50 },
    lottery_winner: { id: 'lottery_winner', name: 'Lucky', desc: 'Win the weekly lottery', icon: '🎰', points: 100 }
};


export function useFirestore(walletAddress, xUsername) {
    const [userProfile, setUserProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState({ topSenders: [], topClaimers: [] });
    const [loading, setLoading] = useState(true);

    // Initialize or get user profile
    const initializeUser = useCallback(async () => {
        if (!walletAddress) return null;

        const userRef = doc(db, 'users', walletAddress);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new user profile
            const newProfile = {
                walletAddress,
                xUsername: xUsername || '',
                createdAt: serverTimestamp(),
                stats: {
                    totalDeposited: 0,
                    totalSent: 0,
                    totalClaimed: 0,
                    points: 0
                },
                authorization: {
                    isDelegated: false,
                    delegationAmount: 0,
                    lastAuthorizedAt: null
                },
                achievements: [],
                // Login streak tracking
                loginStreak: {
                    current: 0,
                    lastLoginDate: null,
                    longestStreak: 0
                },
                // Track unique recipients for multi_sender achievement
                uniqueRecipients: []
            };
            await setDoc(userRef, newProfile);
            return newProfile;
        }

        return userSnap.data();
    }, [walletAddress, xUsername]);


    // Listen to user profile changes (real-time)
    useEffect(() => {
        if (!walletAddress) {
            setUserProfile(null);
            setLoading(false);
            return;
        }

        const userRef = doc(db, 'users', walletAddress);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserProfile(snapshot.data());
            } else {
                // User doesn't exist, create them
                initializeUser().then(profile => setUserProfile(profile));
            }
            setLoading(false);
        }, (error) => {
            console.error('Firestore user listener error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [walletAddress, initializeUser]);

    // Update authorization status
    const updateAuthorization = useCallback(async (amount) => {
        if (!walletAddress) return false;

        try {
            const userRef = doc(db, 'users', walletAddress);
            await updateDoc(userRef, {
                'authorization.isDelegated': true,
                'authorization.delegationAmount': amount,
                'authorization.lastAuthorizedAt': serverTimestamp()
            });

            // Check for authorized achievement
            await checkAndUnlockAchievement('authorized');

            return true;
        } catch (error) {
            console.error('Error updating authorization:', error);
            return false;
        }
    }, [walletAddress]);

    // Record a payment sent
    const recordPaymentSent = useCallback(async (amount, recipientUsername, tweetId) => {
        if (!walletAddress) return false;

        try {
            const userRef = doc(db, 'users', walletAddress);
            await updateDoc(userRef, {
                'stats.totalSent': increment(amount),
                'stats.points': increment(Math.floor(amount * 10)) // 10 points per dollar sent
            });

            // Check for achievements
            const profile = await getDoc(userRef);
            const stats = profile.data()?.stats || {};

            if (stats.totalSent >= 1 && stats.totalSent < amount + 1) {
                await checkAndUnlockAchievement('first_payment');
            }
            if (stats.totalSent >= 100) {
                await checkAndUnlockAchievement('big_spender');
            }
            if (stats.totalSent >= 1000) {
                await checkAndUnlockAchievement('whale');
            }
            if (stats.totalSent >= 10000) {
                await checkAndUnlockAchievement('mega_whale');
            }

            if ((stats.totalSent || 0) + (stats.totalClaimed || 0) >= 10) {
                await checkAndUnlockAchievement('veteran');
            }

            // Update leaderboard
            await updateLeaderboard();

            return true;
        } catch (error) {
            console.error('Error recording payment sent:', error);
            return false;
        }
    }, [walletAddress]);

    // Record a claim
    const recordClaim = useCallback(async (amount, senderUsername) => {
        if (!walletAddress) return false;

        try {
            const userRef = doc(db, 'users', walletAddress);
            await updateDoc(userRef, {
                'stats.totalClaimed': increment(amount),
                'stats.points': increment(Math.floor(amount * 5)) // 5 points per dollar claimed
            });

            // Check for achievements
            const profile = await getDoc(userRef);
            const stats = profile.data()?.stats || {};

            if (stats.totalClaimed >= 1 && stats.totalClaimed < amount + 1) {
                await checkAndUnlockAchievement('first_claim');
            }
            if (stats.totalClaimed >= 100) {
                await checkAndUnlockAchievement('collector');
            }
            if ((stats.totalSent || 0) + (stats.totalClaimed || 0) >= 10) {
                await checkAndUnlockAchievement('veteran');
            }

            // Update leaderboard
            await updateLeaderboard();

            return true;
        } catch (error) {
            console.error('Error recording claim:', error);
            return false;
        }
    }, [walletAddress]);

    // Check and unlock achievement
    const checkAndUnlockAchievement = useCallback(async (achievementId) => {
        if (!walletAddress) return;

        const userRef = doc(db, 'users', walletAddress);
        const userSnap = await getDoc(userRef);
        const currentAchievements = userSnap.data()?.achievements || [];

        // Check if already unlocked
        if (currentAchievements.some(a => a.id === achievementId)) {
            return;
        }

        // Unlock the achievement
        const achievement = ACHIEVEMENTS[achievementId];
        if (achievement) {
            await updateDoc(userRef, {
                achievements: [...currentAchievements, {
                    ...achievement,
                    unlockedAt: new Date().toISOString()
                }],
                'stats.points': increment(50) // Bonus points for achievements
            });
            console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        }
    }, [walletAddress]);

    // Update leaderboard
    const updateLeaderboard = useCallback(async () => {
        try {
            // Get top senders
            const sendersQuery = query(
                collection(db, 'users'),
                orderBy('stats.totalSent', 'desc'),
                limit(10)
            );
            const sendersSnap = await getDocs(sendersQuery);
            const topSenders = sendersSnap.docs.map(doc => ({
                wallet: doc.id,
                username: doc.data().xUsername,
                amount: doc.data().stats?.totalSent || 0
            })).filter(u => u.amount > 0);

            // Get top claimers
            const claimersQuery = query(
                collection(db, 'users'),
                orderBy('stats.totalClaimed', 'desc'),
                limit(10)
            );
            const claimersSnap = await getDocs(claimersQuery);
            const topClaimers = claimersSnap.docs.map(doc => ({
                wallet: doc.id,
                username: doc.data().xUsername,
                amount: doc.data().stats?.totalClaimed || 0
            })).filter(u => u.amount > 0);

            // Save to leaderboard collection
            const leaderboardRef = doc(db, 'leaderboard', 'alltime');
            await setDoc(leaderboardRef, {
                topSenders,
                topClaimers,
                lastUpdated: serverTimestamp()
            });

            setLeaderboard({ topSenders, topClaimers });
        } catch (error) {
            console.error('Error updating leaderboard:', error);
        }
    }, []);

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async () => {
        try {
            const leaderboardRef = doc(db, 'leaderboard', 'alltime');
            const leaderboardSnap = await getDoc(leaderboardRef);

            if (leaderboardSnap.exists()) {
                const data = leaderboardSnap.data();
                setLeaderboard({
                    topSenders: data.topSenders || [],
                    topClaimers: data.topClaimers || []
                });
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }, []);

    // Update username if changed
    const updateUsername = useCallback(async (newUsername) => {
        if (!walletAddress || !newUsername) return;

        try {
            const userRef = doc(db, 'users', walletAddress);
            await updateDoc(userRef, { xUsername: newUsername });
        } catch (error) {
            console.error('Error updating username:', error);
        }
    }, [walletAddress]);

    // Record daily login and update streak
    const recordDailyLogin = useCallback(async () => {
        if (!walletAddress) return false;

        try {
            const userRef = doc(db, 'users', walletAddress);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return false;

            const data = userSnap.data();
            const today = new Date().toDateString();
            const lastLoginDate = data.loginStreak?.lastLoginDate;
            const currentStreak = data.loginStreak?.current || 0;
            const longestStreak = data.loginStreak?.longestStreak || 0;

            // Already logged in today
            if (lastLoginDate === today) {
                return true;
            }

            // Calculate new streak
            let newStreak = 1;
            if (lastLoginDate) {
                const lastDate = new Date(lastLoginDate);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                // If last login was yesterday, continue streak
                if (lastDate.toDateString() === yesterday.toDateString()) {
                    newStreak = currentStreak + 1;
                }
            }

            // Update streak data
            await updateDoc(userRef, {
                'loginStreak.current': newStreak,
                'loginStreak.lastLoginDate': today,
                'loginStreak.longestStreak': Math.max(longestStreak, newStreak),
                'stats.points': increment(1) // 1 point for daily login
            });

            // Check for daily login achievement
            await checkAndUnlockAchievement('daily_login');

            // Check streak achievements
            if (newStreak >= 7) {
                await checkAndUnlockAchievement('streak_7');
            }
            if (newStreak >= 30) {
                await checkAndUnlockAchievement('streak_30');
            }

            return true;
        } catch (error) {
            console.error('Error recording daily login:', error);
            return false;
        }
    }, [walletAddress]);

    // Record a share to X
    const recordShare = useCallback(async () => {
        if (!walletAddress) return false;

        try {
            await checkAndUnlockAchievement('social_sharer');
            return true;
        } catch (error) {
            console.error('Error recording share:', error);
            return false;
        }
    }, [walletAddress]);

    // ==================
    // LOTTERY FUNCTIONS
    // ==================

    // State for current lottery
    const [currentLottery, setCurrentLottery] = useState(null);

    // Get current week's lottery ID
    const getCurrentLotteryId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const weekNum = Math.ceil((now - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        return `lottery_${year}_${weekNum}`;
    };

    // Fetch or create current lottery
    const fetchCurrentLottery = useCallback(async () => {
        try {
            const lotteryId = getCurrentLotteryId();
            const lotteryRef = doc(db, 'lotteries', lotteryId);
            const lotterySnap = await getDoc(lotteryRef);

            if (lotterySnap.exists()) {
                setCurrentLottery({ id: lotteryId, ...lotterySnap.data() });
            } else {
                // Create new lottery for this week
                const newLottery = {
                    weekStart: serverTimestamp(),
                    weekEnd: null,
                    prizeAmount: 50, // Default prize
                    status: 'active',
                    entries: [],
                    winner: null,
                    claimStatus: 'pending',
                    claimTxId: null
                };
                await setDoc(lotteryRef, newLottery);
                setCurrentLottery({ id: lotteryId, ...newLottery });
            }
        } catch (error) {
            console.error('Error fetching lottery:', error);
        }
    }, []);

    // Set lottery prize (admin only)
    const setLotteryPrize = useCallback(async (amount) => {
        try {
            const lotteryId = getCurrentLotteryId();
            const lotteryRef = doc(db, 'lotteries', lotteryId);
            await updateDoc(lotteryRef, { prizeAmount: amount });
            await fetchCurrentLottery();
            return true;
        } catch (error) {
            console.error('Error setting lottery prize:', error);
            return false;
        }
    }, [fetchCurrentLottery]);

    // Draw lottery winner (admin only)
    const drawLotteryWinner = useCallback(async (eligibleUsers) => {
        try {
            const lotteryId = getCurrentLotteryId();
            const lotteryRef = doc(db, 'lotteries', lotteryId);

            // Filter users who have sent payments
            const sendersWithEntries = eligibleUsers
                .filter(u => (u.total_sent || 0) > 0)
                .map(u => ({
                    username: u.x_username,
                    walletAddress: u.wallet_address,
                    entries: Math.floor((u.total_sent || 0) / 10) + 1 // 1 entry + 1 per $10 sent
                }));

            if (sendersWithEntries.length === 0) {
                return { success: false, error: 'No eligible users found' };
            }

            // Build weighted entry pool
            const entryPool = [];
            sendersWithEntries.forEach(user => {
                for (let i = 0; i < user.entries; i++) {
                    entryPool.push(user);
                }
            });

            // Random selection
            const winnerIndex = Math.floor(Math.random() * entryPool.length);
            const winner = entryPool[winnerIndex];

            // Update lottery with winner
            await updateDoc(lotteryRef, {
                status: 'completed',
                winner: {
                    username: winner.username,
                    walletAddress: winner.walletAddress
                },
                entries: sendersWithEntries,
                weekEnd: serverTimestamp()
            });

            // Award lottery_winner achievement
            if (winner.walletAddress) {
                const winnerRef = doc(db, 'users', winner.walletAddress);
                const winnerSnap = await getDoc(winnerRef);
                if (winnerSnap.exists()) {
                    const achievements = winnerSnap.data()?.achievements || [];
                    if (!achievements.includes('lottery_winner')) {
                        await updateDoc(winnerRef, {
                            achievements: [...achievements, 'lottery_winner']
                        });
                    }
                }
            }

            await fetchCurrentLottery();
            return { success: true, winner };
        } catch (error) {
            console.error('Error drawing lottery winner:', error);
            return { success: false, error: error.message };
        }
    }, [fetchCurrentLottery]);

    // Load lottery on mount
    useEffect(() => {
        fetchCurrentLottery();
    }, [fetchCurrentLottery]);

    return {
        userProfile,
        leaderboard,
        loading,
        initializeUser,
        updateAuthorization,
        recordPaymentSent,
        recordClaim,
        recordDailyLogin,
        recordShare,
        fetchLeaderboard,
        updateUsername,
        ACHIEVEMENTS,
        // Lottery
        currentLottery,
        fetchCurrentLottery,
        setLotteryPrize,
        drawLotteryWinner
    };

}
