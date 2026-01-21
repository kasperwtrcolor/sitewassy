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

// Achievement definitions
const ACHIEVEMENTS = {
    first_payment: { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯' },
    first_claim: { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎' },
    authorized: { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐' },
    big_spender: { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸' },
    collector: { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆' },
    whale: { id: 'whale', name: 'Whale', desc: 'Send over $1000', icon: '🐋' },
    veteran: { id: 'veteran', name: 'Veteran', desc: 'Complete 10 transactions', icon: '⭐' }
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
                achievements: []
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

    return {
        userProfile,
        leaderboard,
        loading,
        initializeUser,
        updateAuthorization,
        recordPaymentSent,
        recordClaim,
        fetchLeaderboard,
        updateUsername,
        ACHIEVEMENTS
    };
}
