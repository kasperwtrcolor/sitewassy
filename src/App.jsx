import { useState, useEffect, useRef } from 'react';
import { Github, X, Coins, Wallet, Send, DollarSign, Clock, Trophy, Share2, Info, ChevronDown, ArrowRight } from 'lucide-react';
import { useDevapp, UserButton, DevappProvider, openLink } from '@devfunlabs/web-sdk';
const API = "https://wassy-pay-backend.onrender.com";
function App() {
  const {
    devbaseClient,
    userWallet
  } = useDevapp();
  const [status, setStatus] = useState({
    message: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);
  const [, setUserBalance] = useState(0);
  const [xHandle, setXHandle] = useState('');
  const [recentPayments, setRecentPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [vaultBalance, setVaultBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalSent, setTotalSent] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [backendClaims, setBackendClaims] = useState([]);
  const [isCheckingPayments, setIsCheckingPayments] = useState(false);
  const [, setSuccessfulClaims] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const adminDashboardRef = useRef(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimHistory, setClaimHistory] = useState([]);
  const [isSyncingDatabase, setIsSyncingDatabase] = useState(false);
  const [, setAllPayments] = useState([]);
  const [allPaymentClaims, setAllPaymentClaims] = useState([]);
  const [expandedUserClaims, setExpandedUserClaims] = useState(null);
  const [userClaimDetails, setUserClaimDetails] = useState([]);
  const [manuallyHiddenClaims, setManuallyHiddenClaims] = useState([]);
  const [claimErrors, setClaimErrors] = useState({});
  const [, setHiddenClaimsEntities] = useState([]);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [userAchievements, setUserAchievements] = useState([]);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [nextFetchCountdown, setNextFetchCountdown] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(true);
  const scrollTimeoutRef = useRef(null);
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [successClaimData, setSuccessClaimData] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const ACHIEVEMENTS = [{
    id: 'first_claim',
    name: 'First Blood',
    description: 'Claim your first payment',
    icon: '🎯'
  }, {
    id: 'claim_5',
    name: 'Getting Started',
    description: 'Claim 5 payments',
    icon: '🔥'
  }, {
    id: 'claim_10',
    name: 'Claim Master',
    description: 'Claim 10 payments',
    icon: '💎'
  }, {
    id: 'claim_25',
    name: 'Claim Legend',
    description: 'Claim 25 payments',
    icon: '👑'
  }, {
    id: 'first_deposit',
    name: 'Funded Up',
    description: 'Make your first deposit',
    icon: '💰'
  }, {
    id: 'deposit_100',
    name: 'Big Spender',
    description: 'Deposit $100 total',
    icon: '💸'
  }, {
    id: 'deposit_500',
    name: 'Whale Alert',
    description: 'Deposit $500 total',
    icon: '🐋'
  }, {
    id: 'connect_x',
    name: 'Connected',
    description: 'Connect your X account',
    icon: '🔗'
  }, {
    id: 'first_send',
    name: 'First Send',
    description: 'Send your first payment via X',
    icon: '📤'
  }, {
    id: 'send_10',
    name: 'Payment Pro',
    description: 'Send 10 payments via X',
    icon: '🚀'
  }, {
    id: 'claim_100',
    name: 'Claim 100',
    description: 'Claim $100 total',
    icon: '💯'
  }, {
    id: 'claim_500',
    name: 'Claim 500',
    description: 'Claim $500 total',
    icon: '⭐'
  }];
  const checkAndUnlockAchievements = async () => {
    if (!userWallet || !devbaseClient) return;
    try {
      const existingAchievements = await devbaseClient.listEntities('achievements', {
        userId: userWallet
      });
      const unlockedIds = existingAchievements.map(a => a.achievementId);
      const claimsList = await devbaseClient.listEntities('payment_claims', {
        userId: userWallet
      });
      const completedClaims = claimsList.filter(c => c.status === 'completed');
      const totalClaimed = completedClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
      const depositsList = await devbaseClient.listEntities('fund_deposits', {
        userId: userWallet
      });
      const totalDeposited = depositsList.reduce((sum, d) => sum + (d.amount || 0), 0);
      let backendPaymentCount = 0;
      if (xHandle) {
        const backendPayments = await fetchBackendPayments(xHandle);
        backendPaymentCount = backendPayments.length;
      }
      const toUnlock = [];
      if (completedClaims.length >= 1 && !unlockedIds.includes('first_claim')) toUnlock.push('first_claim');
      if (completedClaims.length >= 5 && !unlockedIds.includes('claim_5')) toUnlock.push('claim_5');
      if (completedClaims.length >= 10 && !unlockedIds.includes('claim_10')) toUnlock.push('claim_10');
      if (completedClaims.length >= 25 && !unlockedIds.includes('claim_25')) toUnlock.push('claim_25');
      if (depositsList.length >= 1 && !unlockedIds.includes('first_deposit')) toUnlock.push('first_deposit');
      if (totalDeposited >= 100 && !unlockedIds.includes('deposit_100')) toUnlock.push('deposit_100');
      if (totalDeposited >= 500 && !unlockedIds.includes('deposit_500')) toUnlock.push('deposit_500');
      if (xHandle && !unlockedIds.includes('connect_x')) toUnlock.push('connect_x');
      if (backendPaymentCount >= 1 && !unlockedIds.includes('first_send')) toUnlock.push('first_send');
      if (backendPaymentCount >= 10 && !unlockedIds.includes('send_10')) toUnlock.push('send_10');
      if (totalClaimed >= 100 && !unlockedIds.includes('claim_100')) toUnlock.push('claim_100');
      if (totalClaimed >= 500 && !unlockedIds.includes('claim_500')) toUnlock.push('claim_500');
      for (const achievementId of toUnlock) {
        await devbaseClient.createEntity('achievements', {
          userId: userWallet,
          achievementId,
          unlockedAt: Date.now()
        });
      }
      if (toUnlock.length > 0) {
        setNewAchievements(toUnlock);
        setTimeout(() => setNewAchievements([]), 5000);
      }
      const updatedAchievements = await devbaseClient.listEntities('achievements', {
        userId: userWallet
      });
      setUserAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };
  const shareClaimOnX = claim => {
    const amount = claim.amount.toFixed(2);
    const sender = claim.senderHandle ? `@${claim.senderHandle}` : 'someone';
    const text = `Just claimed ${amount} USDC from ${sender} on @WASSY_BOT! 💸\n\nTurn your posts into payments at dev.fun 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    openLink(url);
  };
  const fetchBackendPayments = async handle => {
    if (!handle) return [];
    try {
      console.log(`🔍 Fetching backend payments for handle: @${handle}`);
      const response = await fetch(`https://wassy-pay-backend.onrender.com/api/payments`);
      const data = await response.json();
      console.log(`📦 Backend returned ${data.payments?.length || 0} total payments`);
      if (data.success && data.payments) {
        const userPayments = data.payments.filter(p => {
          const hasSender = p.sender && p.sender.toLowerCase() === handle.toLowerCase();
          if (hasSender) {
            console.log(`✓ Found payment from @${p.sender}: $${p.amount} to @${p.recipient} (tweet: ${p.tweet_id})`);
          }
          return hasSender;
        });
        console.log(`💰 Total payments from @${handle}: ${userPayments.length} payments`);
        const total = userPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        console.log(`💵 Total sent by @${handle}: $${total.toFixed(2)}`);
        return userPayments;
      }
      return [];
    } catch (error) {
      console.error('Error fetching backend payments:', error);
      return [];
    }
  };
  const fetchBackendClaims = async () => {
    if (!xHandle || !devbaseClient) return [];
    try {
      console.log(`🔍 Fetching backend claims for handle: ${xHandle}`);
      const response = await fetch(`https://wassy-pay-backend.onrender.com/api/claims?handle=${xHandle}`);
      const data = await response.json();
      console.log(`📦 Backend response:`, data);
      if (data.success && data.claims) {
        console.log(`✅ Fetched ${data.claims.length} total backend claims`);
        const allProfiles = await devbaseClient.listEntities('profiles', {});
        const allClaims = [];
        for (const claim of data.claims) {
          const senderProfile = allProfiles.find(p => p.xHandle && p.xHandle.toLowerCase() === claim.sender.toLowerCase());
          if (!senderProfile) {
            console.log(`🔍 Claim ${claim.tweet_id} from @${claim.sender}: ⚠️ SENDER NOT REGISTERED`);
            allClaims.push({
              ...claim,
              canClaim: false,
              reason: 'Sender not registered'
            });
            continue;
          }
          console.log(`🔍 Claim ${claim.tweet_id} from @${claim.sender}: ✅ READY TO CLAIM (funds already in vault)`);
          allClaims.push({
            ...claim,
            canClaim: true,
            reason: null
          });
        }
        console.log(`✅ Total claims displayed: ${allClaims.length}`);
        setBackendClaims(allClaims);
        return allClaims;
      } else {
        console.log(`⚠️ No claims found or unsuccessful response`);
        setBackendClaims([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching backend claims:', error);
      setBackendClaims([]);
      return [];
    }
  };
  const fetchVaultBalance = async () => {
    try {
      const vaultAddress = 'Hu7wMzbwR5RSTXk2bF5CEDhdSAN1mzX9vTiqbQJWESxE';
      const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const response = await fetch('https://rpc.dev.fun/699840f631c97306a0c4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [vaultAddress, {
            mint: usdcMint
          }, {
            encoding: 'jsonParsed'
          }]
        })
      });
      const data = await response.json();
      if (data.result && data.result.value && data.result.value.length > 0) {
        const balance = data.result.value.reduce((total, account) => {
          const tokenBalance = account.account.data.parsed.info.tokenAmount.uiAmount;
          return total + (tokenBalance || 0);
        }, 0);
        setVaultBalance(balance);
      } else {
        setVaultBalance(0);
      }
    } catch (error) {
      console.error('Error fetching vault balance:', error);
    }
  };
  useEffect(() => {
    fetchVaultBalance();
    const vaultTimer = setInterval(fetchVaultBalance, 10000);
    return () => clearInterval(vaultTimer);
  }, []);
  useEffect(() => {
    if (userWallet && devbaseClient) {
      const fetchHiddenClaims = async () => {
        try {
          const hiddenClaims = await devbaseClient.listEntities('hidden_claims', {
            userId: userWallet
          });
          setHiddenClaimsEntities(hiddenClaims);
          setManuallyHiddenClaims(hiddenClaims.map(hc => hc.tweetId));
        } catch (e) {
          console.error('Failed to load hidden claims:', e);
        }
      };
      fetchHiddenClaims();
    }
  }, [userWallet, devbaseClient]);
  useEffect(() => {
    if (xHandle && devbaseClient) {
      fetchBackendClaims();
      checkAndUnlockAchievements();
      const claimsTimer = setInterval(fetchBackendClaims, 300000);
      return () => clearInterval(claimsTimer);
    }
  }, [xHandle, devbaseClient]);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowMobileNav(false);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setShowMobileNav(true);
      }, 300);
      lastScrollY = currentScrollY;
    };
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
      window.addEventListener('scroll', handleScroll, {
        passive: true
      });
    }
    const handleMediaChange = e => {
      if (e.matches) {
        window.addEventListener('scroll', handleScroll, {
          passive: true
        });
      } else {
        window.removeEventListener('scroll', handleScroll);
        setShowMobileNav(true);
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    const calculateNextFetch = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      let nextFetchMinute;
      if (currentMinute < 30) {
        nextFetchMinute = 30;
      } else {
        nextFetchMinute = 0;
        now.setHours(now.getHours() + 1);
      }
      const nextFetch = new Date(now);
      nextFetch.setMinutes(nextFetchMinute);
      nextFetch.setSeconds(0);
      nextFetch.setMilliseconds(0);
      const diff = nextFetch - new Date();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor(diff % 60000 / 1000);
      return `${minutes}m ${seconds}s`;
    };
    const updateCountdown = () => {
      setNextFetchCountdown(calculateNextFetch());
    };
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownTimer);
  }, []);
  useEffect(() => {
    if (!userWallet || !devbaseClient) return;
    const adminWallet = '6SxLVfFovSjR2LAFcJ5wfT6RFjc8GxsscRekGnLq8BMe';
    setIsAdmin(userWallet === adminWallet);
    const fetchUserData = async () => {
      try {
        const claimsList = await devbaseClient.listEntities('payment_claims', {});
        const allSuccessfulClaims = claimsList.filter(c => c.status === 'completed');
        setSuccessfulClaims(allSuccessfulClaims);
        setAllPaymentClaims(claimsList);
        const userSuccessfulClaims = claimsList.filter(c => c.userId === userWallet && c.status === 'completed');
        const allPaymentsForHistory = await devbaseClient.listEntities('payments', {});
        setAllPayments(allPaymentsForHistory);
        const allProfilesForHistory = await devbaseClient.listEntities('profiles', {});
        const historyWithDetails = await Promise.all(userSuccessfulClaims.map(async claim => {
          const payment = allPaymentsForHistory.find(p => p.id === claim.paymentId || p.tweetId === claim.paymentId);
          const senderProfile = payment ? allProfilesForHistory.find(p => p.wallet === payment.fromUser) : null;
          return {
            ...claim,
            amount: claim.amount || payment?.amount || 0,
            senderWallet: payment?.fromUser || 'Unknown',
            senderHandle: senderProfile?.xHandle || null,
            senderImage: senderProfile?.profileImage || null,
            tweetId: payment?.tweetId || claim.paymentId
          };
        }));
        setClaimHistory(historyWithDetails.sort((a, b) => b.createdAt - a.createdAt));
        let profileList = await devbaseClient.listEntities('profiles', {
          wallet: userWallet
        });
        if (profileList.length === 0) {
          try {
            await devbaseClient.createEntity('profiles', {
              wallet: userWallet
            });
            profileList = await devbaseClient.listEntities('profiles', {
              wallet: userWallet
            });
          } catch (error) {
            console.log("Profile not yet available:", error);
          }
        } else if (!profileList[0].xHandle) {
          try {
            await devbaseClient.updateEntity('profiles', profileList[0].id, {
              wallet: userWallet
            });
            profileList = await devbaseClient.listEntities('profiles', {
              wallet: userWallet
            });
          } catch (error) {
            console.log("Profile update pending:", error);
          }
        }
        if (profileList.length > 0) {
          setXHandle(profileList[0].xHandle || '');
          setProfileImage(profileList[0].profileImage || '');
        }
        const fundsList = await devbaseClient.listEntities('funds', {
          userId: userWallet
        });
        if (fundsList.length > 0) {
          setUserBalance(fundsList[0].balanceUSDC || 0);
        }
        const paymentsList = await devbaseClient.listEntities('payments', {});
        const userPayments = paymentsList.filter(p => p.fromUser === userWallet || p.toUser === userWallet).slice(0, 5);
        setRecentPayments(userPayments);
        const depositsList = await devbaseClient.listEntities('fund_deposits', {
          userId: userWallet
        });
        const depositsTotal = depositsList.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
        setTotalDeposited(depositsTotal);
        const withdrawalsList = await devbaseClient.listEntities('withdrawals', {
          userId: userWallet
        });
        const withdrawalsTotal = withdrawalsList.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
        setTotalWithdrawn(withdrawalsTotal);
        if (xHandle) {
          console.log(`📊 Calculating total sent for @${xHandle}...`);
          const backendPaymentsForUser = await fetchBackendPayments(xHandle);
          const sentTotal = backendPaymentsForUser.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
          console.log(`✅ Setting totalSent to: $${sentTotal.toFixed(2)}`);
          setTotalSent(sentTotal);
        } else {
          console.log(`⚠️ No X handle connected, totalSent = $0`);
          setTotalSent(0);
        }
        const allPayments = await devbaseClient.listEntities('payments', {});
        let userPendingPayments = allPayments.filter(p => p.toUser === userWallet && p.status === 'pending');
        if (xHandle) {
          const allProfiles = await devbaseClient.listEntities('profiles', {});
          const userProfile = allProfiles.find(p => p.xHandle === xHandle);
          if (userProfile) {
            const handleBasedPayments = allPayments.filter(p => p.toUser === userProfile.wallet && p.status === 'pending' && !userPendingPayments.find(existing => existing.id === p.id));
            userPendingPayments = [...userPendingPayments, ...handleBasedPayments];
          }
        }
        setPendingClaims(userPendingPayments);
        const allClaimsList = await devbaseClient.listEntities('payment_claims', {});
        const userClaims = allClaimsList.filter(c => c.userId === userWallet);
        const claimedTotal = userClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
        setTotalClaimed(claimedTotal);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };
    fetchUserData();
    const paymentTimer = setInterval(() => {
      if (userWallet && devbaseClient) {
        devbaseClient.listEntities('profiles', {
          wallet: userWallet
        }).then(profileList => {
          if (profileList.length > 0) {
            setXHandle(profileList[0].xHandle || '');
            setProfileImage(profileList[0].profileImage || '');
          }
        }).catch(err => console.error(err));
        devbaseClient.listEntities('funds', {
          userId: userWallet
        }).then(fundsList => {
          if (fundsList.length > 0) {
            setUserBalance(fundsList[0].balanceUSDC || 0);
          }
        }).catch(err => console.error(err));
        devbaseClient.listEntities('payments', {}).then(paymentsList => {
          setAllPayments(paymentsList);
          const userPayments = paymentsList.filter(p => p.fromUser === userWallet || p.toUser === userWallet).slice(0, 5);
          setRecentPayments(userPayments);
        }).catch(err => console.error(err));
        devbaseClient.listEntities('fund_deposits', {
          userId: userWallet
        }).then(depositsList => {
          const depositsTotal = depositsList.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
          setTotalDeposited(depositsTotal);
        }).catch(err => console.error(err));
        devbaseClient.listEntities('withdrawals', {
          userId: userWallet
        }).then(withdrawalsList => {
          const withdrawalsTotal = withdrawalsList.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
          setTotalWithdrawn(withdrawalsTotal);
        }).catch(err => console.error(err));
        devbaseClient.listEntities('profiles', {
          wallet: userWallet
        }).then(async profiles => {
          const currentHandle = profiles.length > 0 ? profiles[0].xHandle : '';
          if (currentHandle) {
            console.log(`🔄 [Polling] Updating total sent for @${currentHandle}...`);
            const backendPaymentsForUser = await fetchBackendPayments(currentHandle);
            const sentTotal = backendPaymentsForUser.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
            console.log(`🔄 [Polling] Updated totalSent to: ${sentTotal.toFixed(2)}`);
            setTotalSent(sentTotal);
          } else {
            setTotalSent(0);
          }
        }).catch(err => {
          console.error(err);
          setTotalSent(0);
        });
        Promise.all([devbaseClient.listEntities('payments', {}), devbaseClient.listEntities('profiles', {}), devbaseClient.listEntities('payment_claims', {})]).then(([allPayments, allProfiles, allPaymentClaimsData]) => {
          setAllPaymentClaims(allPaymentClaimsData);
          let userPendingPayments = allPayments.filter(p => {
            const isForUser = p.toUser === userWallet;
            const isPending = p.status === 'pending';
            const notClaimedInDevBase = !allPaymentClaimsData.some(pc => pc.paymentId === p.id && pc.status === 'completed');
            return isForUser && isPending && notClaimedInDevBase;
          });
          if (xHandle) {
            const userProfile = allProfiles.find(p => p.xHandle === xHandle);
            if (userProfile) {
              const handleBasedPayments = allPayments.filter(p => {
                const isForProfile = p.toUser === userProfile.wallet;
                const isPending = p.status === 'pending';
                const notAlreadyIncluded = !userPendingPayments.find(existing => existing.id === p.id);
                const notClaimedInDevBase = !allPaymentClaimsData.some(pc => pc.paymentId === p.id && pc.status === 'completed');
                return isForProfile && isPending && notAlreadyIncluded && notClaimedInDevBase;
              });
              userPendingPayments = [...userPendingPayments, ...handleBasedPayments];
            }
          }
          setPendingClaims(userPendingPayments);
        }).catch(err => console.error(err));
        Promise.all([devbaseClient.listEntities('payment_claims', {}), devbaseClient.listEntities('payments', {}), devbaseClient.listEntities('profiles', {})]).then(async ([claimsList, allPaymentsForHistory, allProfilesForHistory]) => {
          const allSuccessfulClaims = claimsList.filter(c => c.status === 'completed');
          setSuccessfulClaims(allSuccessfulClaims);
          setAllPaymentClaims(claimsList);
          const userSuccessfulClaims = claimsList.filter(c => c.userId === userWallet && c.status === 'completed');
          const userClaims = claimsList.filter(c => c.userId === userWallet);
          const claimedTotal = userClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
          setTotalClaimed(claimedTotal);
          const historyWithDetails = await Promise.all(userSuccessfulClaims.map(async claim => {
            const payment = allPaymentsForHistory.find(p => p.id === claim.paymentId || p.tweetId === claim.paymentId);
            const senderProfile = payment ? allProfilesForHistory.find(p => p.wallet === payment.fromUser) : null;
            return {
              ...claim,
              amount: claim.amount || payment?.amount || 0,
              senderWallet: payment?.fromUser || 'Unknown',
              senderHandle: senderProfile?.xHandle || null,
              senderImage: senderProfile?.profileImage || null,
              tweetId: payment?.tweetId || claim.paymentId
            };
          }));
          setClaimHistory(historyWithDetails.sort((a, b) => b.createdAt - a.createdAt));
        }).catch(err => console.error(err));
      }
    }, 5000);
    return () => {
      clearInterval(paymentTimer);
    };
  }, [userWallet, devbaseClient]);
  useEffect(() => {
    if (!devbaseClient) return;
    const fetchLeaderboardData = async () => {
      try {
        const allProfiles = await devbaseClient.listEntities('profiles', {});
        const allFunds = await devbaseClient.listEntities('funds', {});
        const allDeposits = await devbaseClient.listEntities('fund_deposits', {});
        const allClaims = await devbaseClient.listEntities('payment_claims', {});
        let allBackendPayments = [];
        try {
          const response = await fetch(`${API}/api/payments`);
          const data = await response.json();
          if (data.success && data.payments) {
            allBackendPayments = data.payments;
          }
        } catch (error) {
          console.error('Error fetching backend payments:', error);
        }
        const usersData = allProfiles.map(user => {
          const userFunds = allFunds.find(f => f.userId === user.wallet);
          const userDeposits = allDeposits.filter(d => d.userId === user.wallet);
          const userClaims = allClaims.filter(c => c.userId === user.wallet);
          const totalDeposited = userDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
          const totalClaimed = userClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
          let totalSent = 0;
          if (user.xHandle && user.xHandle !== 'Not connected') {
            const userSentPayments = allBackendPayments.filter(p => p.sender && p.sender.toLowerCase() === user.xHandle.toLowerCase());
            totalSent = userSentPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
          }
          return {
            wallet: user.wallet,
            xHandle: user.xHandle || 'Not connected',
            profileImage: user.profileImage,
            balance: userFunds?.balanceUSDC || 0,
            totalDeposited,
            totalClaimed,
            totalSent
          };
        });
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };
    fetchLeaderboardData();
    const leaderboardTimer = setInterval(fetchLeaderboardData, 30000);
    return () => clearInterval(leaderboardTimer);
  }, [devbaseClient]);
  useEffect(() => {
    if (!isAdmin || !devbaseClient) return;
    const fetchAdminData = async () => {
      try {
        const allProfiles = await devbaseClient.listEntities('profiles', {});
        const allFunds = await devbaseClient.listEntities('funds', {});
        const allDeposits = await devbaseClient.listEntities('fund_deposits', {});
        const allPayments = await devbaseClient.listEntities('payments', {});
        const allClaims = await devbaseClient.listEntities('payment_claims', {});
        setAllPaymentClaims(allClaims);
        let allBackendPayments = [];
        try {
          const response = await fetch(`${API}/api/payments`);
          const data = await response.json();
          if (data.success && data.payments) {
            allBackendPayments = data.payments;
          }
        } catch (error) {
          console.error('Error fetching backend payments:', error);
        }
        const usersData = allProfiles.map(profile => {
          const userFunds = allFunds.find(f => f.userId === profile.wallet);
          const userDeposits = allDeposits.filter(d => d.userId === profile.wallet);
          const userClaims = allClaims.filter(c => c.userId === profile.wallet);
          const userPendingClaims = allPayments.filter(p => p.toUser === profile.wallet && p.status === 'pending');
          const totalDeposited = userDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
          const totalClaimed = userClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
          const completedClaims = userClaims.filter(c => c.status === 'completed');
          let totalSent = 0;
          if (profile.xHandle && profile.xHandle !== 'Not connected') {
            const userSentPayments = allBackendPayments.filter(p => p.sender && p.sender.toLowerCase() === profile.xHandle.toLowerCase());
            totalSent = userSentPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
            console.log(`👤 [Admin] @${profile.xHandle} sent: ${totalSent.toFixed(2)} (${userSentPayments.length} payments)`);
          }
          const userClaimRecords = allClaims.filter(c => c.userId === profile.wallet);
          return {
            wallet: profile.wallet,
            xHandle: profile.xHandle || 'Not connected',
            profileImage: profile.profileImage,
            balance: userFunds?.balanceUSDC || 0,
            totalDeposited,
            totalClaimed,
            totalSent,
            pendingClaims: userPendingClaims.length,
            claimsMade: userClaims.length,
            confirmedClaims: completedClaims.length,
            claimRecords: userClaimRecords
          };
        });
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };
    fetchAdminData();
    const adminTimer = setInterval(fetchAdminData, 10000);
    return () => clearInterval(adminTimer);
  }, [isAdmin, devbaseClient]);
  const handleViewUserClaims = async userWallet => {
    if (expandedUserClaims === userWallet) {
      setExpandedUserClaims(null);
      setUserClaimDetails([]);
      return;
    }
    try {
      const allClaims = await devbaseClient.listEntities('payment_claims', {});
      const userClaims = allClaims.filter(c => c.userId === userWallet && c.status === 'completed');
      const allPayments = await devbaseClient.listEntities('payments', {});
      const allProfiles = await devbaseClient.listEntities('profiles', {});
      const claimDetails = await Promise.all(userClaims.map(async claim => {
        const payment = allPayments.find(p => p.id === claim.paymentId || p.tweetId === claim.paymentId);
        const senderProfile = payment ? allProfiles.find(p => p.wallet === payment.fromUser) : null;
        return {
          claimId: claim.id,
          paymentId: claim.paymentId,
          amount: claim.amount,
          status: claim.status,
          createdAt: claim.createdAt,
          tweetId: payment?.tweetId || claim.paymentId,
          senderWallet: payment?.fromUser || 'Unknown',
          senderHandle: senderProfile?.xHandle || null,
          senderImage: senderProfile?.profileImage || null
        };
      }));
      setUserClaimDetails(claimDetails.sort((a, b) => b.createdAt - a.createdAt));
      setExpandedUserClaims(userWallet);
    } catch (error) {
      console.error('Error fetching user claim details:', error);
    }
  };
  const handleFundAccount = async () => {
    if (!userWallet || !devbaseClient) {
      setStatus({
        type: "error",
        message: "Connect wallet first"
      });
      return;
    }
    if (!xHandle) {
      setStatus({
        type: "error",
        message: "Connect X first"
      });
      return;
    }
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      setStatus({
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }
    try {
      setLoading(true);
      setShowTransactionModal(true);
      setTransactionStatus('Preparing deposit transaction...');
      await devbaseClient.createEntity('fund_deposits', {
        userId: userWallet,
        xHandle: xHandle,
        amount: amount
      });
      setTransactionStatus('Verifying deposit...');
      await new Promise(r => setTimeout(r, 2000));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setStatus({
        type: "success",
        message: `Successfully deposited ${fundAmount} USDC to vault!`
      });
      setFundAmount('');
      setShowPaymentModal(false);
      await checkAndUnlockAchievements();
    } catch (error) {
      console.error(error);
      setStatus({
        message: error.message || "Failed to fund account",
        type: "error"
      });
    } finally {
      setLoading(false);
      setShowTransactionModal(false);
      setTransactionStatus('');
    }
  };
  const handleWithdrawFunds = async () => {
    if (!userWallet || !devbaseClient) {
      setStatus({
        type: "error",
        message: "Connect wallet first"
      });
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setStatus({
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }
    const availableBalance = Math.max(0, totalDeposited - totalSent - totalWithdrawn);
    if (amount > availableBalance) {
      setStatus({
        message: `Insufficient balance. You have ${availableBalance.toFixed(2)} available.`,
        type: "error"
      });
      return;
    }
    try {
      setLoading(true);
      setShowTransactionModal(true);
      setTransactionStatus('Preparing withdrawal transaction...');
      await devbaseClient.createEntity('withdrawals', {
        userId: userWallet,
        amount: amount
      });
      setTransactionStatus('Verifying withdrawal...');
      await new Promise(r => setTimeout(r, 2000));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setStatus({
        type: "success",
        message: `Successfully withdrew ${withdrawAmount} USDC from vault!`
      });
      setWithdrawAmount('');
      setShowWithdrawModal(false);
    } catch (error) {
      console.error(error);
      setStatus({
        message: error.message || "Failed to withdraw funds",
        type: "error"
      });
    } finally {
      setLoading(false);
      setShowTransactionModal(false);
      setTransactionStatus('');
    }
  };
  const handleCheckForPayments = async () => {
    if (!xHandle || !devbaseClient) {
      setStatus({
        message: "Please connect your wallet and X account first",
        type: "error"
      });
      return;
    }
    try {
      setIsCheckingPayments(true);
      setStatus({
        message: "Scanning for payments...",
        type: "loading"
      });
      console.log(`🔍 Starting payment scan for @${xHandle}...`);
      const freshBackendClaims = await fetchBackendClaims();
      const freshPaymentClaims = await devbaseClient.listEntities('payment_claims', {});
      setAllPaymentClaims(freshPaymentClaims);
      console.log(`💎 Total payment_claims in DevBase: ${freshPaymentClaims.length}`);
      const allPayments = await devbaseClient.listEntities('payments', {});
      console.log(`📊 Total payments in system: ${allPayments.length}`);
      let userPendingPayments = allPayments.filter(p => {
        const isForUser = p.toUser === userWallet;
        const isPending = p.status === 'pending';
        const notClaimedInDevBase = !freshPaymentClaims.some(pc => pc.paymentId === p.id && pc.status === 'completed');
        return isForUser && isPending && notClaimedInDevBase;
      });
      console.log(`💰 Direct wallet pending payments (after DevBase check): ${userPendingPayments.length}`);
      if (xHandle) {
        const allProfiles = await devbaseClient.listEntities('profiles', {});
        const userProfile = allProfiles.find(p => p.xHandle === xHandle);
        console.log(`👤 User profile found:`, userProfile);
        if (userProfile) {
          const handleBasedPayments = allPayments.filter(p => {
            const isForProfile = p.toUser === userProfile.wallet;
            const isPending = p.status === 'pending';
            const notAlreadyIncluded = !userPendingPayments.find(existing => existing.id === p.id);
            const notClaimedInDevBase = !freshPaymentClaims.some(pc => pc.paymentId === p.id && pc.status === 'completed');
            return isForProfile && isPending && notAlreadyIncluded && notClaimedInDevBase;
          });
          console.log(`📱 Handle-based pending payments (after DevBase check): ${handleBasedPayments.length}`);
          userPendingPayments = [...userPendingPayments, ...handleBasedPayments];
        }
      }
      setPendingClaims(userPendingPayments);
      const unclaimedBackendClaims = freshBackendClaims.filter(claim => {
        return !freshPaymentClaims.some(c => c.paymentId === claim.tweet_id && c.status === 'completed');
      });
      const totalBackend = unclaimedBackendClaims.length;
      const totalOnChain = userPendingPayments.length;
      const totalPending = totalBackend + totalOnChain;
      console.log(`✨ Scan complete: ${totalBackend} backend + ${totalOnChain} on-chain = ${totalPending} total`);
      if (totalPending > 0) {
        setStatus({
          message: `Found ${totalPending} pending payment${totalPending > 1 ? 's' : ''}! (${totalBackend} from X posts, ${totalOnChain} on-chain)`,
          type: "success"
        });
      } else {
        setStatus({
          message: `No pending payments found for @${xHandle}. Check console for details.`,
          type: "success"
        });
      }
    } catch (error) {
      console.error('❌ Payment scan error:', error);
      setStatus({
        message: error.message || "Failed to check for payments",
        type: "error"
      });
    } finally {
      setIsCheckingPayments(false);
    }
  };
  const handleClaimBackendPayment = async claim => {
    if (!xHandle || !devbaseClient || !userWallet) {
      setClaimErrors(prev => ({
        ...prev,
        [claim.tweet_id]: "Please connect your wallet and X account first"
      }));
      return;
    }
    try {
      setClaimErrors(prev => ({
        ...prev,
        [claim.tweet_id]: null
      }));
      setLoading(true);
      setShowTransactionModal(true);
      setTransactionStatus('Checking claim eligibility...');
      console.log('🎯 Starting backend claim:', {
        tweetId: claim.tweet_id,
        amount: claim.amount,
        sender: claim.sender,
        recipient: claim.recipient,
        userWallet
      });
      const existingClaims = await devbaseClient.listEntities('payment_claims', {});
      const alreadyClaimed = existingClaims.some(c => c.paymentId === claim.tweet_id && c.userId === userWallet);
      if (alreadyClaimed) {
        console.log('⚠️ Payment already claimed, skipping');
        const updatedClaims = await devbaseClient.listEntities('payment_claims', {});
        const allSuccessfulClaims = updatedClaims.filter(c => c.status === 'completed');
        setSuccessfulClaims(allSuccessfulClaims);
        setAllPaymentClaims(updatedClaims);
        setLoading(false);
        setShowTransactionModal(false);
        setClaimErrors(prev => ({
          ...prev,
          [claim.tweet_id]: "This payment has already been claimed!"
        }));
        return;
      }
      setTransactionStatus('Processing vault transfer...');
      const claimEntity = await devbaseClient.createEntity('payment_claims', {
        userId: userWallet,
        paymentId: claim.tweet_id,
        amount: parseFloat(claim.amount),
        tweetId: claim.tweet_id,
        sender: claim.sender,
        recipient: claim.recipient
      });
      console.log('✅ Claim entity created with full details:', claimEntity);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setSuccessClaimData({
        amount: parseFloat(claim.amount),
        sender: claim.sender
      });
      setShowClaimSuccessModal(true);
      setStatus({
        message: `Successfully claimed ${parseFloat(claim.amount)} USDC from @${claim.sender}!`,
        type: "success"
      });
      const updatedClaims = await devbaseClient.listEntities('payment_claims', {});
      const allSuccessfulClaims = updatedClaims.filter(c => c.status === 'completed');
      setSuccessfulClaims(allSuccessfulClaims);
      setAllPaymentClaims(updatedClaims);
      const updatedPayments = await devbaseClient.listEntities('payments', {});
      setAllPayments(updatedPayments);
      await fetchBackendClaims();
      await checkAndUnlockAchievements();
    } catch (error) {
      console.error('❌ Backend claim error:', error.message);
      console.error('📋 Error details:', error);
      setClaimErrors(prev => ({
        ...prev,
        [claim.tweet_id]: error.message || "Failed to claim payment. You can retry."
      }));
    } finally {
      setLoading(false);
      setShowTransactionModal(false);
      setTransactionStatus('');
    }
  };
  const handleMarkAsClaimed = async tweetId => {
    if (!userWallet || !devbaseClient) return;
    try {
      await devbaseClient.createEntity('hidden_claims', {
        userId: userWallet,
        tweetId: tweetId
      });
      const updatedHidden = [...manuallyHiddenClaims, tweetId];
      setManuallyHiddenClaims(updatedHidden);
      setStatus({
        message: "Payment marked as claimed and hidden from your view",
        type: "success"
      });
    } catch (error) {
      console.error('Failed to hide claim:', error);
      setStatus({
        message: "Failed to hide payment. Please try again.",
        type: "error"
      });
    }
  };
  const handleClaimPayment = async (paymentId, amount) => {
    if (!userWallet || !devbaseClient) {
      setClaimErrors(prev => ({
        ...prev,
        [paymentId]: "Please connect your wallet first"
      }));
      return;
    }
    try {
      setClaimErrors(prev => ({
        ...prev,
        [paymentId]: null
      }));
      setLoading(true);
      setShowTransactionModal(true);
      setTransactionStatus('Checking claim eligibility...');
      console.log('🎯 Starting on-chain claim:', {
        paymentId,
        amount,
        userWallet
      });
      const existingClaims = await devbaseClient.listEntities('payment_claims', {});
      const alreadyClaimed = existingClaims.some(c => c.paymentId === paymentId && c.userId === userWallet);
      if (alreadyClaimed) {
        console.log('⚠️ Payment already claimed, skipping');
        setLoading(false);
        setShowTransactionModal(false);
        setClaimErrors(prev => ({
          ...prev,
          [paymentId]: "This payment has already been claimed!"
        }));
        return;
      }
      setTransactionStatus('Processing vault transfer...');
      const claimEntity = await devbaseClient.createEntity('payment_claims', {
        userId: userWallet,
        paymentId,
        amount
      });
      console.log('✅ Claim entity created:', claimEntity);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setSuccessClaimData({
        amount: amount,
        sender: null
      });
      setShowClaimSuccessModal(true);
      setStatus({
        message: `Successfully claimed ${amount} USDC from on-chain payment!`,
        type: "success"
      });
      const updatedClaims = await devbaseClient.listEntities('payment_claims', {});
      const allSuccessfulClaims = updatedClaims.filter(c => c.status === 'completed');
      setSuccessfulClaims(allSuccessfulClaims);
      setAllPaymentClaims(updatedClaims);
      const updatedPayments = await devbaseClient.listEntities('payments', {});
      setAllPayments(updatedPayments);
      await checkAndUnlockAchievements();
    } catch (error) {
      console.error('❌ On-chain claim error:', error.message);
      console.error('📋 Error details:', error);
      setClaimErrors(prev => ({
        ...prev,
        [paymentId]: error.message || "Failed to claim payment. You can retry."
      }));
    } finally {
      setLoading(false);
      setShowTransactionModal(false);
      setTransactionStatus('');
    }
  };
  const handleSyncDatabases = async () => {
    if (!devbaseClient) return;
    try {
      setIsSyncingDatabase(true);
      setStatus({
        message: "Syncing databases...",
        type: "loading"
      });
      const allClaims = await devbaseClient.listEntities('payment_claims', {});
      const completedClaims = allClaims.filter(c => c.status === 'completed');
      console.log(`📊 Found ${completedClaims.length} completed claims to sync`);
      const allPayments = await devbaseClient.listEntities('payments', {});
      const allProfiles = await devbaseClient.listEntities('profiles', {});
      let syncedCount = 0;
      for (const claim of completedClaims) {
        try {
          const payment = allPayments.find(p => p.id === claim.paymentId || p.tweetId === claim.paymentId);
          if (payment && payment.tweetId) {
            const userProfile = allProfiles.find(p => p.wallet === claim.userId);
            const recipient = userProfile && userProfile.xHandle ? userProfile.xHandle : claim.userId;
            await fetch('https://wassy-pay-backend.onrender.com/api/devfun-claim-success', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                tweet_id: payment.tweetId,
                recipient: recipient
              })
            });
            syncedCount++;
            console.log(`✅ Synced claim for tweet ${payment.tweetId}`);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to sync claim ${claim.id}:`, err);
        }
      }
      setStatus({
        message: `Successfully synced ${syncedCount} claims with backend!`,
        type: "success"
      });
    } catch (error) {
      console.error('❌ Database sync error:', error);
      setStatus({
        message: error.message || "Failed to sync databases",
        type: "error"
      });
    } finally {
      setIsSyncingDatabase(false);
    }
  };
  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} scrollY={scrollY} />;
  }
  return <div className="min-h-screen bg-white grid-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(50)].map((_, i) => <div key={i} className="confetti-piece" style={{
        left: `${Math.random() * 100}%`,
        background: ['#8b5cf6', '#ec4899', '#10b981', '#fbbf24', '#3b82f6'][Math.floor(Math.random() * 5)],
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }} />)}
        </div>}
      {showTransactionModal && <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-black p-8 pixel-shadow relative">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full border-8 border-black border-t-purple-500 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-black mb-4">
                PROCESSING CLAIM
              </h2>
              <p className="text-lg text-black font-bold uppercase">
                {transactionStatus}
              </p>
              <p className="text-sm text-black font-bold uppercase opacity-70 mt-4">
                Please wait, do not close this window...
              </p>
            </div>
          </div>
        </div>}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col space-y-3">
        <button onClick={() => setShowInfoModal(true)} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
          <Info size={24} />
          <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            HOW IT WORKS
          </div>
        </button>
        <button onClick={() => setShowVaultModal(true)} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
          <Wallet size={24} />
          <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            VAULT: ${vaultBalance.toFixed(2)}
          </div>
        </button>
        <button onClick={() => setShowAchievementsModal(true)} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
          <Trophy size={24} />
          <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {userAchievements.length}/{ACHIEVEMENTS.length} UNLOCKED
          </div>
        </button>
        <button onClick={() => setShowLeaderboardModal(true)} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
          <span className="text-2xl">🏆</span>
          <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            LEADERBOARD
          </div>
        </button>
        {isAdmin && <button onClick={() => {
        setShowAdminDashboard(prev => {
          const newState = !prev;
          if (newState) {
            setTimeout(() => {
              try {
                adminDashboardRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              } catch (e) {
                console.log('Scroll failed:', e);
              }
            }, 200);
          }
          return newState;
        });
      }} className={`flex items-center justify-center w-14 h-14 ${showAdminDashboard ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative`}>
            <span className="text-2xl">⚙️</span>
            <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {showAdminDashboard ? 'HIDE ADMIN' : 'SHOW ADMIN'}
            </div>
          </button>}
        {userWallet && xHandle && <button onClick={() => setShowProfileModal(true)} className="flex items-center justify-center w-14 h-14 bg-black hover:bg-purple-600 text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
            {profileImage ? <img src={profileImage} alt={xHandle} className="w-10 h-10 rounded-full border-2 border-white" /> : <X size={24} />}
            <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              @{xHandle}
            </div>
          </button>}
        {userWallet && !xHandle && <button onClick={() => setShowProfileModal(true)} className="flex items-center justify-center w-14 h-14 bg-black hover:bg-purple-600 text-white rounded-2xl border-4 border-black pixel-shadow transform hover:scale-110 active:translate-y-1 transition-all group relative">
            <X size={24} />
            <div className="absolute left-full ml-3 bg-black text-white px-3 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              CONNECT X
            </div>
          </button>}
        <div className="w-14 h-14">
          <UserButton className="w-full h-full pixel-shadow border-4 border-black bg-black hover:bg-purple-600 rounded-2xl transform hover:scale-110 active:translate-y-1 transition-all" primaryColor="#8b5cf6" textColor="#ffffff" />
        </div>
      </div>
      {newAchievements.length > 0 && <div className="fixed top-20 right-4 z-[9999] animate-bounce">
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-black rounded-2xl p-4 pixel-shadow max-w-sm">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy size={32} className="text-black" />
              <h3 className="text-xl font-bold text-black">ACHIEVEMENT UNLOCKED!</h3>
            </div>
            {newAchievements.map(achId => {
          const ach = ACHIEVEMENTS.find(a => a.id === achId);
          return ach ? <div key={achId} className="text-black font-bold">
                  <span className="text-2xl mr-2">{ach.icon}</span>
                  <span className="text-lg">{ach.name}</span>
                </div> : null;
        })}
          </div>
        </div>}
      <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 md:hidden flex flex-col space-y-2 pl-2 transition-all duration-300 ${showMobileNav ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
        <button onClick={() => setShowInfoModal(true)} className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all">
          <Info size={20} />
        </button>
        <button onClick={() => setShowVaultModal(true)} className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all">
          <Wallet size={20} />
        </button>
        <button onClick={() => setShowAchievementsModal(true)} className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all">
          <Trophy size={20} />
        </button>
        <button onClick={() => setShowLeaderboardModal(true)} className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all">
          <span className="text-xl">🏆</span>
        </button>
        {isAdmin && <button onClick={() => {
        setShowAdminDashboard(prev => {
          const newState = !prev;
          if (newState) {
            setTimeout(() => {
              try {
                adminDashboardRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              } catch (e) {
                console.log('Scroll failed:', e);
              }
            }, 200);
          }
          return newState;
        });
      }} className={`flex items-center justify-center w-12 h-12 ${showAdminDashboard ? 'bg-green-500' : 'bg-red-500'} text-white rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all`}>
            <span className="text-xl">⚙️</span>
          </button>}
        <button onClick={() => setShowProfileModal(true)} className="flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-xl border-3 border-black pixel-shadow transform active:translate-y-1 transition-all">
          {userWallet && xHandle && profileImage ? <img src={profileImage} alt={xHandle} className="w-8 h-8 rounded-full border-2 border-white" /> : <X size={20} />}
        </button>
        <div className="w-12 h-12">
          <UserButton className="w-full h-full pixel-shadow border-3 border-black bg-black hover:bg-purple-600 rounded-xl transform active:translate-y-1 transition-all" primaryColor="#8b5cf6" textColor="#ffffff" />
        </div>
      </div>
      <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 border-b-4 border-black overflow-hidden">
        <div className="scroll-container">
          <div className="scroll-text">
            {[...Array(20)].map((_, i) => <span key={i} className="inline-block mx-8 text-white font-bold text-xl uppercase whitespace-nowrap">
                ⚠️ THERE IS NO CA YET. ⚠️
              </span>)}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Luckiest+Guy&family=Rubik+Mono+One&family=Press+Start+2P&family=Bungee&display=swap');
        
        .scroll-container {
          width: 100%;
          overflow: hidden;
          padding: 12px 0;
        }
        
        .scroll-text {
          display: inline-flex;
          animation: scroll 20s linear infinite;
          white-space: nowrap;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        :root {
          --primary-bg: #ffffff;
          --primary-text: #000000;
          --accent-purple: #8b5cf6;
          --accent-pink: #ec4899;
          --accent-green: #10b981;
          --accent-yellow: #fbbf24;
          --accent-blue: #3b82f6;
          --pixel-shadow: 6px 6px 0 rgba(0,0,0,1);
          --pixel-border: 4px solid #000;
        }
        * {
          font-family: 'Rubik Mono One', monospace;
          letter-spacing: 0;
        }
        h1 {
          font-family: 'Fredoka One', cursive;
          text-transform: uppercase;
        }
        h2, h3, h4, h5, h6 {
          font-family: 'Bungee', cursive;
          text-transform: uppercase;
        }
        button, .btn-text {
          font-family: 'Rubik Mono One', monospace;
          font-size: 1rem;
          text-transform: uppercase;
        }
        .pixel-shadow {
          box-shadow: var(--pixel-shadow);
        }
        .pixel-border {
          border: var(--pixel-border);
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        @keyframes pixelReveal {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pixelPulse {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
        .pixel-reveal {
          animation: pixelReveal 0.3s forwards;
        }
        .pixel-pulse {
          animation: pixelPulse 1.5s infinite;
        }
        .explosion-particle {
          border-radius: 0;
          z-index: 100;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #000;
          border: 2px solid #000;
          z-index: 9999;
          animation: confetti-fall 3s linear forwards;
        }
      `}</style>
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-8 md:p-12 border-4 border-black pixel-shadow z-10 relative">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-black leading-none text-center pixel-reveal">
            WASSY PAY
          </h1>
        </div>
        <p className="text-black text-center mb-8 text-xs sm:text-base md:text-lg font-bold uppercase pixel-reveal tracking-tight px-2">
          THE FIRST BOT THAT LETS YOU SEND CRYPTO DIRECTLY ON X. TAG. SEND. DONE
        </p>
        {status.message && <div className={`mb-4 sm:mb-6 p-3 sm:p-5 rounded-2xl text-xs sm:text-sm flex items-start border-4 pixel-shadow ${status.type === 'error' ? 'bg-red-100 text-black border-black' : status.type === 'success' ? 'bg-green-100 text-black border-black' : 'bg-purple-100 text-black border-black'}`}>
            {status.type === 'error' ? <span className="mr-2 sm:mr-3 text-xl sm:text-2xl flex-shrink-0">⚠️</span> : status.type === 'success' ? <span className="mr-2 sm:mr-3 text-xl sm:text-2xl flex-shrink-0">✨</span> : <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-4 border-black border-t-transparent animate-spin mr-2 sm:mr-3 mt-1 flex-shrink-0" />}
            <div>
              <p className="leading-relaxed font-bold uppercase text-xs sm:text-sm">{status.message}</p>
            </div>
          </div>}
      </div>
      {showPaymentModal && <div onClick={() => setShowPaymentModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
              <X size={24} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
              FUND ACCOUNT
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-black mb-2 font-bold uppercase">
                  AMOUNT (USDC)
                </label>
                <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0.00" className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 border-4 border-black rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-black placeholder-gray-400 text-black font-bold text-lg sm:text-xl pixel-shadow" />
              </div>
              <button onClick={handleFundAccount} disabled={loading || !fundAmount} className="w-full flex items-center justify-center space-x-2 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all bg-green-400 hover:bg-green-500 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <>
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-4 border-black border-t-transparent animate-spin mr-2" />
                    <span className="text-xs sm:text-base">PROCESSING...</span>
                  </> : <>
                    <DollarSign size={20} className="sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">DEPOSIT USDC</span>
                  </>}
              </button>
            </div>
          </div>
        </div>}
      {showWithdrawModal && <div onClick={() => setShowWithdrawModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative">
            <button onClick={() => setShowWithdrawModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
              <X size={24} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
              WITHDRAW FUNDS
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-100 rounded-xl p-3 border-2 border-black mb-4">
                <p className="text-xs text-black font-bold uppercase">
                  AVAILABLE BALANCE: ${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)} USDC
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-black mb-2 font-bold uppercase">
                  AMOUNT (USDC)
                </label>
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 border-4 border-black rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-black placeholder-gray-400 text-black font-bold text-lg sm:text-xl pixel-shadow" />
              </div>
              <button onClick={handleWithdrawFunds} disabled={loading || !withdrawAmount} className="w-full flex items-center justify-center space-x-2 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all bg-red-400 hover:bg-red-500 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <>
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-4 border-black border-t-transparent animate-spin mr-2" />
                    <span className="text-xs sm:text-base">PROCESSING...</span>
                  </> : <>
                    <DollarSign size={20} className="sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">WITHDRAW USDC</span>
                  </>}
              </button>
            </div>
          </div>
        </div>}
      {showAchievementsModal && <div onClick={() => setShowAchievementsModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAchievementsModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
              <X size={24} />
            </button>
            <div className="flex items-center mb-6">
              <Trophy size={32} className="text-black mr-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                ACHIEVEMENTS
              </h2>
            </div>
            <p className="text-sm text-black font-bold uppercase opacity-70 mb-6">
              UNLOCK ALL {ACHIEVEMENTS.length} ACHIEVEMENTS!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = userAchievements.some(a => a.achievementId === achievement.id);
            return <div key={achievement.id} className={`rounded-2xl p-4 border-4 border-black pixel-shadow transition-all ${isUnlocked ? 'bg-gradient-to-br from-yellow-200 to-yellow-300' : 'bg-gray-200 opacity-60'}`}>
                    <div className="flex items-start space-x-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-black mb-1">
                          {achievement.name}
                        </h3>
                        <p className="text-xs text-black font-bold uppercase opacity-70">
                          {achievement.description}
                        </p>
                        {isUnlocked && <div className="mt-2 flex items-center space-x-2">
                            <div className="px-2 py-1 bg-green-400 rounded-lg border-2 border-black">
                              <span className="text-xs text-black font-bold uppercase">✓ UNLOCKED</span>
                            </div>
                          </div>}
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div>
        </div>}
    {showLeaderboardModal && <div onClick={() => setShowLeaderboardModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative max-h-[90vh] overflow-y-auto">
          <button onClick={() => setShowLeaderboardModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
            <X size={24} />
          </button>
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">🏆</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              LEADERBOARD
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-4 border-4 border-black pixel-shadow mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🏆</span>
              <p className="text-sm sm:text-base text-black font-bold uppercase text-center">
                POINTS = DEPOSITS + CLAIMS + SENT
              </p>
            </div>
            <p className="text-xs text-black font-bold uppercase text-center opacity-70">
              🚀 COMPETE FOR THE TOP SPOT - KEEP EARNING POINTS!
            </p>
          </div>

          <div className="space-y-3">
            {(() => {
            let sortedUsers = [...allUsers].map(user => ({
              ...user,
              totalPoints: user.totalDeposited + user.totalClaimed + user.totalSent
            }));
            sortedUsers.sort((a, b) => b.totalPoints - a.totalPoints);
            if (sortedUsers.length === 0) {
              return <div className="text-center py-8">
                  <p className="text-black font-bold uppercase">No data yet - be the first!</p>
                </div>;
            }
            return sortedUsers.map((user, index) => {
              const isCurrentUser = user.wallet === userWallet;
              const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
              return <div key={user.wallet} className={`rounded-2xl p-4 border-4 border-black pixel-shadow transition-all ${isCurrentUser ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 ring-4 ring-purple-500' : index < 3 ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white font-bold text-lg border-2 border-white flex-shrink-0">
                          {medalEmoji || `#${index + 1}`}
                        </div>
                        {user.profileImage ? <img src={user.profileImage} alt={user.xHandle} className="w-12 h-12 rounded-full border-3 border-black flex-shrink-0" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 border-3 border-black flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-black truncate">
                            {user.xHandle !== 'Not connected' ? `@${user.xHandle}` : `${user.wallet.substring(0, 8)}...`}
                          </p>
                          {isCurrentUser && <p className="text-xs text-purple-600 font-bold uppercase">YOU</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-black">
                          {user.totalPoints.toFixed(0)}
                        </p>
                        <p className="text-xs text-black font-bold uppercase opacity-70">
                          POINTS
                        </p>
                      </div>
                    </div>
                  </div>;
            });
          })()}
          </div>

          {allUsers.length === 0 && <div className="mt-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 border-4 border-black pixel-shadow text-center">
              <p className="text-sm text-black font-bold uppercase">
                🚀 Be the first to make it on the leaderboard!
              </p>
            </div>}
        </div>
      </div>}

    {showClaimSuccessModal && <div onClick={() => setShowClaimSuccessModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-gradient-to-br from-green-200 to-green-300 rounded-2xl sm:rounded-3xl border-4 border-black p-6 sm:p-8 pixel-shadow relative">
          <button onClick={() => setShowClaimSuccessModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
            <X size={24} />
          </button>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">
              CLAIM SUCCESSFUL!
            </h2>
            <p className="text-2xl font-bold text-black mb-2">
              ${successClaimData?.amount.toFixed(2)} USDC
            </p>
            {successClaimData?.sender && <p className="text-sm text-black font-bold uppercase opacity-70">
                FROM @{successClaimData.sender}
              </p>}
          </div>
          <button onClick={() => {
          const amount = successClaimData?.amount.toFixed(2);
          const sender = successClaimData?.sender ? `@${successClaimData.sender}` : 'someone';
          const text = `Just claimed ${amount} USDC from ${sender} using @bot_wassy! 💸\n\nTurn your X posts into payments:\nhttps://dev.fun/p/699840f631c97306a0c4`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          openLink(url);
          setShowClaimSuccessModal(false);
        }} className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold text-base transition-all bg-blue-400 hover:bg-blue-500 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1">
            <Share2 size={24} />
            <span>SHARE ON X</span>
          </button>
          <button onClick={() => setShowClaimSuccessModal(false)} className="w-full mt-3 py-3 rounded-2xl font-bold text-sm transition-all bg-white hover:bg-gray-100 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1">
            CLOSE
          </button>
        </div>
      </div>}
    {showInfoModal && <div onClick={() => setShowInfoModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative max-h-[90vh] overflow-y-auto">
          <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
            <X size={24} />
          </button>
          <div className="flex items-center mb-6">
            <Info size={32} className="text-black mr-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              HOW WASSY PAY WORKS
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">1️⃣</span>
                <h3 className="text-xl font-bold text-black">CONNECT YOUR WALLET</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80">
                Connect your Solana wallet using the wallet button in the sidebar. This is your personal payment account.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">2️⃣</span>
                <h3 className="text-xl font-bold text-black">LINK YOUR X ACCOUNT</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80">
                Click your profile icon and connect your X (Twitter) account. This lets you send and receive payments through posts!
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">3️⃣</span>
                <h3 className="text-xl font-bold text-black">FUND YOUR BALANCE</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80 mb-3">
                Deposit USDC to your vault balance. This money is available to send via X posts.
              </p>
              <div className="bg-white rounded-xl p-3 border-2 border-black">
                <p className="text-xs text-black font-bold uppercase">
                  💡 TIP: Your available balance = deposits - sent - withdrawn
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">4️⃣</span>
                <h3 className="text-xl font-bold text-black">SEND PAYMENTS VIA X</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80 mb-3">
                Simply post on X:
              </p>
              <div className="bg-black text-white rounded-xl p-3 border-2 border-black font-mono text-sm mb-3">
                @BOT_WASSY SEND @USERNAME $5
              </div>
            <p className="text-xs text-black font-bold uppercase opacity-70 mb-3">
                The bot will process your payment automatically!
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">5️⃣</span>
                <h3 className="text-xl font-bold text-black">CLAIM YOUR PAYMENTS</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80 mb-3">
                When someone sends you money via X posts, you'll see pending claims. Click "CHECK FOR PAYMENTS" to scan for new payments, then click "CLAIM" to receive the USDC in your vault!
              </p>
              <div className="bg-white rounded-xl p-3 border-2 border-black">
                <p className="text-xs text-black font-bold uppercase">
                  ⚡ AUTO-SCAN: The app checks for new payments every 5 minutes
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">6️⃣</span>
                <h3 className="text-xl font-bold text-black">WITHDRAW ANYTIME</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80">
                Click the "WITHDRAW" button to transfer USDC from your vault back to your wallet. You can only withdraw your available balance.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
              <div className="flex items-center mb-3">
                <Trophy size={24} className="text-black mr-2" />
                <h3 className="text-xl font-bold text-black">UNLOCK ACHIEVEMENTS</h3>
              </div>
              <p className="text-sm text-black font-bold uppercase opacity-80">
                Complete actions like making your first claim, depositing funds, or sending payments to unlock achievements. Track your progress in the achievements menu!
              </p>
            </div>
          </div>
          <div className="mt-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">⚠️</span>
              <h3 className="text-xl font-bold text-black">IMPORTANT DISCLAIMERS</h3>
            </div>
            <div className="space-y-3 text-left">
              <div className="bg-white rounded-xl p-3 border-2 border-black">
                <p className="text-sm text-black font-bold uppercase">
                  ⚡ User is fully responsible for correctness of recipient handle
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border-2 border-black">
                <p className="text-sm text-black font-bold uppercase">
                  🔧 WASSY Pay is an indexing + execution tool, not a custodian
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 border-4 border-black pixel-shadow text-center">
            <p className="text-sm text-black font-bold uppercase mb-2">
              🚀 READY TO START?
            </p>
            <p className="text-xs text-black font-bold uppercase opacity-70">
              Connect your wallet and X account to begin sending money through posts!
            </p>
          </div>
        </div>
      </div>}
    {showProfileModal && <div onClick={() => setShowProfileModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
              <X size={24} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
              YOUR PROFILE
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-3 sm:p-5 border-4 border-black pixel-shadow">
                <div className="flex items-center mb-2">
                  <Wallet size={16} className="text-black mr-2 sm:w-5 sm:h-5" />
                  <p className="text-xs sm:text-sm text-black font-bold uppercase">
                    WALLET ADDRESS
                  </p>
                </div>
                <p className="text-sm text-black break-all font-mono">
                  {userWallet?.substring(0, 8)}...{userWallet?.substring(userWallet.length - 8)}
                </p>
              </div>
          <div className="bg-gray-100 rounded-2xl p-3 sm:p-5 border-4 border-black pixel-shadow">
                <div className="flex items-center mb-2">
                  <DollarSign size={16} className="text-black mr-2 sm:w-5 sm:h-5" />
                  <p className="text-xs sm:text-sm text-black font-bold uppercase">
                    CURRENT BALANCE
                  </p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-black">
                  ${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)}
                </p>
                <p className="text-xs text-black mt-2 font-bold uppercase opacity-70">
                  READY TO SEND VIA POSTS
                </p>
            {totalDeposited - totalSent - totalWithdrawn < -0.01 && <div className="mt-3 p-2 sm:p-3 bg-red-200 border-2 border-black rounded-xl">
                  <p className="text-xs text-black font-bold uppercase">
                    ⚠️ You have ${Math.abs(totalDeposited - totalSent - totalWithdrawn).toFixed(2)} in pending payments. Fund your balance to cover this payment!
                  </p>
                </div>}
              </div>
              {xHandle ? <div>
                  <div className="bg-green-100 rounded-2xl p-3 sm:p-5 border-4 border-black pixel-shadow">
                    <div className="flex items-center mb-3">
                      {profileImage ? <img src={profileImage} alt={xHandle} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-black mr-3" /> : <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center mr-3 border-4 border-black">
                          <X size={24} className="text-white sm:w-8 sm:h-8" />
                        </div>}
                      <div>
                        <p className="text-xs text-black mb-1 font-bold uppercase">
                          CONNECTED X ACCOUNT
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-black break-all">
                          @{xHandle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-black font-bold uppercase">
                      YOU CAN NOW RECEIVE PAYMENTS VIA POSTS!
                    </p>
                  </div>
                  <div className="mt-4 bg-blue-100 rounded-xl p-3 border-4 border-black pixel-shadow text-center">
                    <p className="text-xs text-black font-bold uppercase">
                      Connected to @WASSY_BOT — payments via posts enabled!
                    </p>
                  </div>
                </div> : <div>
                  <div className="bg-red-100 rounded-2xl p-5 border-4 border-black pixel-shadow mb-4">
                    <div className="flex items-center mb-2">
                      <X size={20} className="text-black mr-2" />
                      <p className="text-sm text-black font-bold uppercase">
                        X ACCOUNT NOT CONNECTED
                      </p>
                    </div>
                    <p className="text-sm text-black font-bold uppercase">
                      CONNECT YOUR X ACCOUNT TO RECEIVE PAYMENTS THROUGH POSTS
                    </p>
                  </div>
                  <button onClick={async () => {
              try {
                setIsConnectingTwitter(true);
                setStatus({
                  message: "Opening X login...",
                  type: "loading"
                });
                const twitterLoginUrl = `https://oauth.dev.fun/twitter/login/699840f631c97306a0c4/${userWallet}`;
                openLink(twitterLoginUrl);
                setShowProfileModal(false);
                setStatus({
                  message: "Complete X login and return to this page",
                  type: "success"
                });
              } catch (error) {
                console.error(error);
                setStatus({
                  message: "Failed to open X login",
                  type: "error"
                });
              } finally {
                setIsConnectingTwitter(false);
              }
            }} disabled={isConnectingTwitter} className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold transition-all bg-blue-400 hover:bg-blue-500 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isConnectingTwitter ? <>
                        <div className="h-6 w-6 rounded-full border-4 border-black border-t-transparent animate-spin mr-2" />
                        <span>OPENING...</span>
                      </> : <>
                        <X size={24} />
                        <span>CONNECT X ACCOUNT</span>
                      </>}
                  </button>
                </div>}
              {claimHistory.length > 0 && <div className="mt-4 sm:mt-6">
                <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl p-3 sm:p-6 border-4 border-black pixel-shadow">
                  <div className="flex items-center mb-4">
                    <Clock size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
                    <h3 className="text-lg sm:text-xl text-black font-bold">
                      CLAIM HISTORY
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-black font-bold uppercase opacity-70 mb-4">
                    YOUR SUCCESSFULLY CLAIMED PAYMENTS
                  </p>
                  <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                    {claimHistory.map((claim, index) => <div key={claim.id || index} className="bg-white rounded-2xl p-3 sm:p-4 border-4 border-black pixel-shadow">
                        <div className="flex items-start justify-between flex-wrap sm:flex-nowrap gap-2">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 mb-2 sm:mb-0">
                            {claim.senderImage ? <img src={claim.senderImage} alt={claim.senderHandle || 'Sender'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black flex-shrink-0" /> : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-300 border-2 border-black flex items-center justify-center flex-shrink-0">
                                <DollarSign size={16} className="text-black" />
                              </div>}
                            <div className="flex-1 min-w-0">
                              <p className="text-base sm:text-lg text-black font-bold">
                                ${claim.amount.toFixed(2)} USDC
                              </p>
                              <p className="text-xs text-black font-bold uppercase opacity-70 truncate">
                                FROM: {claim.senderHandle ? `@${claim.senderHandle}` : `${claim.senderWallet.substring(0, 8)}...`}
                              </p>
                              {claim.tweetId && claim.tweetId.length > 10 && <p className="text-xs text-black font-bold uppercase opacity-50">
                                  VIA POST: {claim.tweetId.substring(0, 12)}...
                                </p>}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-green-400 rounded-xl border-2 border-black">
                              <span className="text-xs text-black font-bold uppercase">✓ CLAIMED</span>
                            </div>
                            <button onClick={() => shareClaimOnX(claim)} className="flex items-center space-x-1 px-3 py-1 bg-blue-400 hover:bg-blue-500 rounded-xl border-2 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all">
                              <Share2 size={14} />
                              <span className="text-xs text-black font-bold uppercase">SHARE</span>
                            </button>
                            {claim.createdAt && <p className="text-xs text-black font-bold uppercase opacity-50">
                                {new Date(claim.createdAt).toLocaleDateString()}
                              </p>}
                          </div>
                        </div>
                      </div>)}
                  </div>
                </div>
              </div>}
            </div>
          </div>
        </div>}
      {showVaultModal && <div onClick={() => setShowVaultModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowVaultModal(false)} className="absolute top-4 right-4 text-white bg-black hover:bg-purple-600 p-3 rounded-full transition-all z-50 pixel-shadow transform hover:scale-105 active:translate-y-1">
              <X size={24} />
            </button>
            <div className="flex items-center mb-4 sm:mb-6">
              <Wallet size={24} className="text-black mr-3 sm:w-8 sm:h-8" />
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                WASSY PAY VAULT
              </h2>
            </div>
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl p-4 sm:p-6 border-4 border-black mb-4 pixel-shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-black mb-2 font-bold uppercase">
                    TOTAL VAULT BALANCE
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-black">
                    ${vaultBalance.toFixed(2)}
                  </p>
                  <p className="text-xs text-black mt-1 font-bold uppercase opacity-70">
                    USDC IN WASSY PAY VAULT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>}
      <div className="w-full max-w-2xl bg-white rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow z-10 mt-6 mb-6">
        <div className="bg-pink-100 rounded-2xl p-4 sm:p-6 border-4 border-black mb-6 pixel-shadow">
          <div className="flex items-center mb-4">
            <Coins size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl text-black font-bold">
              CHECK FOR PAYMENTS
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-black font-bold uppercase opacity-70 mb-4">
            SCAN FOR PENDING PAYMENTS FROM @BOT_WASSY POSTS AND ON-CHAIN TRANSFERS
          </p>
          <button onClick={handleCheckForPayments} disabled={isCheckingPayments || !xHandle} className="w-full flex items-center justify-center space-x-2 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all bg-purple-400 hover:bg-purple-500 text-black border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {isCheckingPayments ? <>
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-4 border-black border-t-transparent animate-spin mr-2" />
                <span className="text-xs sm:text-base">SCANNING...</span>
              </> : <>
                <Coins size={20} className="sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-base">CHECK FOR PAYMENTS</span>
              </>}
          </button>
          {!xHandle && <p className="text-xs text-black font-bold uppercase text-center mt-3 opacity-70">
              Connect X account to check for payments
            </p>}
        </div>
        <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-2xl p-4 sm:p-6 border-4 border-black mb-6 pixel-shadow relative">
          <div className="absolute -top-3 -right-3 bg-purple-500 text-white px-3 py-1 rounded-xl border-3 border-black pixel-shadow animate-bounce hidden sm:block">
            <p className="text-xs font-bold uppercase whitespace-nowrap">💡 Fund to send via X!</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs sm:text-sm text-black font-bold uppercase">
                  YOUR AVAILABLE BALANCE
                </p>
                <div className="sm:hidden bg-purple-500 text-white px-2 py-1 rounded-lg border-2 border-black text-xs font-bold">
                  💡 FUND TO SEND!
                </div>
              </div>
            <p className="text-3xl sm:text-4xl font-bold text-black">
                ${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)}
              </p>
              <p className="text-xs text-black mt-1 font-bold uppercase opacity-70">
                READY TO SEND VIA POSTS
              </p>
              {totalDeposited - totalSent - totalWithdrawn < -0.01 && <div className="mt-3 p-3 bg-red-200 border-2 border-black rounded-xl">
                  <p className="text-xs text-black font-bold uppercase">
                    ⚠️ PENDING PAYMENT DETECTED: You sent ${Math.abs(totalDeposited - totalSent - totalWithdrawn).toFixed(2)} via X posts. Fund your balance to cover this payment!
                  </p>
                </div>}
              <div className="mt-3 pt-3 border-t-2 border-black/20">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-black font-bold uppercase opacity-70">TOTAL DEPOSITED:</span>
                  <span className="text-black font-bold">${totalDeposited.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-black font-bold uppercase opacity-70">TOTAL SENT:</span>
                  <span className="text-black font-bold">-${totalSent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-black font-bold uppercase opacity-70">TOTAL WITHDRAWN:</span>
                  <span className="text-black font-bold">-${totalWithdrawn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-black font-bold uppercase opacity-70">TOTAL CLAIMED:</span>
                  <span className="text-black font-bold">${totalClaimed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-black/20">
                  <span className="text-black font-bold uppercase">AVAILABLE BALANCE:</span>
                  <span className="text-black font-bold">${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowPaymentModal(true)} className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-400 hover:bg-green-500 text-black rounded-2xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-sm sm:text-base">
                <DollarSign size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">FUND</span>
              </button>
              <button onClick={() => setShowWithdrawModal(true)} disabled={Math.max(0, totalDeposited - totalSent - totalWithdrawn) <= 0} className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-400 hover:bg-red-500 text-black rounded-2xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <DollarSign size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">WITHDRAW</span>
              </button>
            </div>
          </div>
        </div>
      {backendClaims.length > 0 && <div className="bg-green-100 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow mb-6">
            <div className="flex items-center mb-4">
              <Coins size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl text-black font-bold">
                X POST CLAIMS
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-black font-bold uppercase opacity-70 mb-4">
              PAYMENTS DETECTED FROM @BOT_WASSY POSTS
            </p>
            {xHandle && <div className="bg-blue-200 rounded-xl p-3 border-2 border-black mb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-black font-bold uppercase">
                    ✓ Backend monitoring: Auto-scans @{xHandle} mentions
                  </p>
                  <div className="flex items-center space-x-2 bg-purple-500 text-white px-3 py-1 rounded-lg border-2 border-black">
                    <Clock size={14} />
                    <span className="text-xs font-bold uppercase">Next scan: {nextFetchCountdown}</span>
                  </div>
                </div>
              </div>}
            <div className="space-y-3">
          {backendClaims.filter(claim => {
            const isAlreadyClaimed = allPaymentClaims.some(pc => pc.status === 'completed' && String(pc.paymentId) === String(claim.tweet_id));
            const isManuallyHidden = manuallyHiddenClaims.includes(claim.tweet_id);
            return !isAlreadyClaimed && !isManuallyHidden;
          }).map(claim => {
            const canActuallyClaim = claim.canClaim;
            console.log(`🎯 Rendering unclaimed claim ${claim.tweet_id}: canClaim=${claim.canClaim}`);
            return <div key={claim.tweet_id} className={`flex items-center justify-between flex-wrap sm:flex-nowrap gap-2 rounded-2xl p-3 sm:p-4 border-4 border-black pixel-shadow ${!canActuallyClaim ? 'bg-gray-200 opacity-60' : 'bg-white'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base sm:text-lg font-bold ${!canActuallyClaim ? 'text-gray-600' : 'text-black'}`}>
                      ${parseFloat(claim.amount).toFixed(2)} USDC
                    </p>
                    <p className={`text-xs font-bold uppercase opacity-70 truncate ${!canActuallyClaim ? 'text-gray-600' : 'text-black'}`}>
                      FROM: @{claim.sender}
                    </p>
                    <p className={`text-xs font-bold uppercase opacity-50 truncate ${!canActuallyClaim ? 'text-gray-600' : 'text-black'}`}>
                      TWEET ID: {claim.tweet_id.substring(0, 12)}...
                    </p>
                    {claim.reason && <p className="text-xs font-bold uppercase mt-1 text-red-600">
                      ⚠️ {claim.reason}
                    </p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!canActuallyClaim ? <>
                          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-400 text-black rounded-xl border-4 border-black font-bold text-xs sm:text-sm">
                            <span>⚠️ CANNOT CLAIM</span>
                          </div>
                          <button onClick={() => handleMarkAsClaimed(claim.tweet_id)} className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-400 hover:bg-gray-500 text-black rounded-xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs sm:text-sm">
                            <span>HIDE</span>
                          </button>
                        </> : <>
                          <button onClick={() => handleClaimBackendPayment(claim)} disabled={loading} className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-400 hover:bg-green-500 text-black rounded-xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span>CLAIM</span>
                          </button>
                          <button onClick={() => handleMarkAsClaimed(claim.tweet_id)} className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-400 hover:bg-gray-500 text-black rounded-xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs sm:text-sm">
                            <span>HIDE</span>
                          </button>
                        </>}
                    </div>
                    {claimErrors[claim.tweet_id] && <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2 text-xs text-red-700 font-bold">
                      ⚠️ {claimErrors[claim.tweet_id]}
                    </div>}
                  </div>
                </div>;
          })}
            </div>
          </div>}
        {pendingClaims.length > 0 && <div className="bg-purple-100 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow mb-6">
            <div className="flex items-center mb-4">
              <Coins size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl text-black font-bold">
                ON-CHAIN CLAIMS
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-black font-bold uppercase opacity-70 mb-4">
              DIRECT BLOCKCHAIN PAYMENTS
            </p>
            {xHandle && <div className="bg-blue-200 rounded-xl p-3 border-2 border-black mb-3">
                <p className="text-xs text-black font-bold uppercase">
                  ✓ Real-time check: Monitoring payments sent to @{xHandle}
                </p>
              </div>}
            <div className="space-y-3">
              {pendingClaims.map(payment => {
            const isAlreadyClaimed = allPaymentClaims.some(pc => pc.paymentId === payment.id && pc.status === 'completed');
            return <div key={payment.id} className={`flex items-center justify-between flex-wrap sm:flex-nowrap gap-2 rounded-2xl p-3 sm:p-4 border-4 border-black pixel-shadow ${isAlreadyClaimed ? 'bg-gray-200 opacity-60' : 'bg-white'}`} style={isAlreadyClaimed ? {
              pointerEvents: 'none'
            } : {}}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base sm:text-lg font-bold ${isAlreadyClaimed ? 'text-gray-600' : 'text-black'}`}>
                      ${payment.amount.toFixed(2)} USDC
                    </p>
                    <p className={`text-xs font-bold uppercase opacity-70 truncate ${isAlreadyClaimed ? 'text-gray-600' : 'text-black'}`}>
                      FROM: {payment.fromUser?.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {isAlreadyClaimed ? <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-400 text-black rounded-xl border-4 border-black font-bold text-xs sm:text-sm" style={{
                  pointerEvents: 'none'
                }}>
                        <span>✓ CLAIMED</span>
                      </div> : <button onClick={() => handleClaimPayment(payment.id, payment.amount)} disabled={loading} className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-400 hover:bg-green-500 text-black rounded-xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>CLAIM</span>
                      </button>}
                    {claimErrors[payment.id] && <div className="bg-red-100 border-2 border-red-500 rounded-lg p-2 text-xs text-red-700 font-bold">
                      ⚠️ {claimErrors[payment.id]}
                    </div>}
                  </div>
                </div>;
          })}
            </div>
          </div>}
        <div className="bg-red-100 rounded-2xl p-4 sm:p-5 border-4 border-black pixel-shadow mb-4">
          <div className="flex items-center mb-4">
            <Send size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl text-black font-bold">
              HOW TO SEND
            </h3>
          </div>
          <p className="text-sm sm:text-lg text-black leading-relaxed font-bold uppercase mb-2 break-all">
            POST: @BOT_WASSY SEND @USERNAME $5
          </p>
          <p className="text-xs sm:text-sm text-black font-bold uppercase opacity-70">
            BOT WILL PROCESS PAYMENT
          </p>
        </div>
        {recentPayments.length > 0 && <div className="bg-purple-100 rounded-2xl p-4 sm:p-6 border-4 border-black pixel-shadow">
            <div className="flex items-center mb-4">
              <Clock size={20} className="text-black mr-2 sm:mr-3 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl text-black font-bold">
                RECENT PAYMENTS
              </h3>
            </div>
            <div className="space-y-3">
              {recentPayments.map(payment => <div key={payment.id} className="flex items-center justify-between bg-white rounded-2xl p-3 sm:p-4 border-4 border-black pixel-shadow">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 ${payment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm sm:text-base text-black font-bold uppercase">
                      {payment.fromUser === userWallet ? 'SENT' : 'RECEIVED'}
                    </span>
                  </div>
                  <span className="text-lg sm:text-xl text-black font-bold">
                    ${payment.amount}
                  </span>
                </div>)}
            </div>
          </div>}
      </div>
      {showAdminDashboard && isAdmin && <div ref={adminDashboardRef} className="w-full max-w-6xl bg-white rounded-3xl border-4 border-black p-4 sm:p-8 pixel-shadow z-10 mt-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">ADMIN DASHBOARD</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button onClick={handleSyncDatabases} disabled={isSyncingDatabase} className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-400 hover:bg-blue-500 text-black rounded-xl border-4 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isSyncingDatabase ? 'SYNCING...' : 'SYNC DATABASES'}
              </button>
              <div className="text-xs sm:text-sm text-black font-bold uppercase">
                TOTAL USERS: {allUsers.length}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
            <table className="w-full border-4 border-black text-xs sm:text-sm">
              <thead>
                <tr className="bg-purple-200 border-b-4 border-black">
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">User</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">X Handle</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Balance</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Deposited</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Sent</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Claimed</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Pending</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Confirmed</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase border-r-4 border-black whitespace-nowrap">Total Claims</th>
                  <th className="p-2 sm:p-4 text-left text-black font-bold uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user, index) => <>
                    <tr key={user.wallet} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b-2 border-black`}>
                    <td className="p-2 sm:p-4 border-r-2 border-black">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        {user.profileImage ? <img src={user.profileImage} alt={user.xHandle} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-black flex-shrink-0" /> : <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 border-2 border-black flex-shrink-0" />}
                        <span className="text-xs text-black font-mono truncate max-w-[80px] sm:max-w-none">
                          {user.wallet.substring(0, 6)}...{user.wallet.substring(user.wallet.length - 4)}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      <span className="truncate max-w-[100px] sm:max-w-none block">
                        {user.xHandle !== 'Not connected' ? `@${user.xHandle}` : user.xHandle}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      ${user.balance.toFixed(2)}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      ${user.totalDeposited.toFixed(2)}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      ${user.totalSent.toFixed(2)}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      ${user.totalClaimed.toFixed(2)}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      {user.pendingClaims}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      {user.confirmedClaims}
                    </td>
                    <td className="p-2 sm:p-4 text-black font-bold border-r-2 border-black whitespace-nowrap">
                      {user.claimsMade}
                    </td>
                    <td className="p-2 sm:p-4 whitespace-nowrap">
                      <button onClick={() => handleViewUserClaims(user.wallet)} className={`px-2 sm:px-3 py-1 ${expandedUserClaims === user.wallet ? 'bg-red-400 hover:bg-red-500' : 'bg-blue-400 hover:bg-blue-500'} text-black rounded-lg border-2 border-black pixel-shadow transform hover:scale-105 active:translate-y-1 transition-all font-bold text-xs`}>
                        {expandedUserClaims === user.wallet ? 'HIDE' : 'VIEW CLAIMS'}
                      </button>
                    </td>
                  </tr>
                  {expandedUserClaims === user.wallet && <tr key={`${user.wallet}-claims`}>
                      <td colSpan="10" className="p-4 bg-purple-50 border-b-4 border-black">
                        <div className="bg-white rounded-2xl p-4 border-4 border-black pixel-shadow">
                          <h4 className="text-lg font-bold text-black mb-4 uppercase">
                            Claim Details for {user.xHandle !== 'Not connected' ? `@${user.xHandle}` : user.wallet.substring(0, 8) + '...'}
                          </h4>
                          {userClaimDetails.length > 0 ? <div className="space-y-3 max-h-96 overflow-y-auto">
                              {userClaimDetails.map(claim => <div key={claim.claimId} className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border-3 border-black pixel-shadow">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-2">
                                        {claim.senderImage ? <img src={claim.senderImage} alt={claim.senderHandle || 'Sender'} className="w-10 h-10 rounded-full border-2 border-black" /> : <div className="w-10 h-10 rounded-full bg-purple-300 border-2 border-black flex items-center justify-center">
                                            <DollarSign size={20} className="text-black" />
                                          </div>}
                                        <div>
                                          <p className="text-xl font-bold text-black">
                                            ${claim.amount.toFixed(2)} USDC
                                          </p>
                                          <p className="text-xs text-black font-bold uppercase opacity-70">
                                            FROM: {claim.senderHandle ? `@${claim.senderHandle}` : `${claim.senderWallet.substring(0, 8)}...`}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-1 mt-3 text-xs">
                                        <p className="text-black font-bold uppercase">
                                          <span className="opacity-70">Tweet ID:</span> {claim.tweetId}
                                        </p>
                                        <p className="text-black font-bold uppercase">
                                          <span className="opacity-70">Payment ID:</span> {claim.paymentId}
                                        </p>
                                        <p className="text-black font-bold uppercase">
                                          <span className="opacity-70">Claim ID:</span> {claim.claimId}
                                        </p>
                                        <p className="text-black font-bold uppercase">
                                          <span className="opacity-70">Claimed At:</span> {new Date(claim.createdAt).toLocaleString()}
                                        </p>
                                        <p className="text-black font-bold uppercase">
                                          <span className="opacity-70">Status:</span> {claim.status}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-400 rounded-xl border-2 border-black">
                                      <span className="text-xs text-black font-bold uppercase">✓ CLAIMED</span>
                                    </div>
                                  </div>
                                </div>)}
                            </div> : <p className="text-black font-bold uppercase text-center py-4">No claims found for this user</p>}
                        </div>
                      </td>
                    </tr>}
                  </>)}
              </tbody>
            </table>
            </div>
          </div>
          {allUsers.length === 0 && <div className="text-center py-8">
              <p className="text-black font-bold uppercase">No users found</p>
            </div>}
        </div>}
      <div className="mt-8 mb-20 md:mb-8 text-center z-10 relative px-4">
        <p className="text-black text-sm sm:text-lg font-bold uppercase mb-4">© WASSY PAY — SEND MONEY THROUGH POSTS</p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6">
          <a href="https://x.com/bot_wassy" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-black hover:text-purple-600 transition-colors flex items-center justify-center bg-white border-4 border-black rounded-2xl px-4 sm:px-6 py-2 sm:py-3 pixel-shadow transform hover:scale-105 active:translate-y-1">
            <X size={18} className="mr-2 sm:w-5 sm:h-5" />
            <span className="font-bold uppercase text-sm sm:text-base">FOLLOW</span>
          </a>
          <a href="https://github.com/kasperwtrcolor/wassypay" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-black hover:text-purple-600 transition-colors flex items-center justify-center bg-white border-4 border-black rounded-2xl px-4 sm:px-6 py-2 sm:py-3 pixel-shadow transform hover:scale-105 active:translate-y-1">
            <Github size={18} className="mr-2 sm:w-5 sm:h-5" />
            <span className="font-bold uppercase text-sm sm:text-base">DOCS</span>
          </a>
        </div>
      </div>
    </div>;
}
function LandingPage({
  onEnterApp,
  scrollY
}) {
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef([]);
  const [hoveredBenefit, setHoveredBenefit] = useState(null);
  const scrollToSection = index => {
    sectionsRef.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  const navItems = [{
    label: 'HOME',
    index: 0
  }, {
    label: 'HOW IT WORKS',
    index: 1
  }, {
    label: 'THE FLOW',
    index: 2
  }, {
    label: 'COMING SOON',
    index: 3
  }, {
    label: 'FAQ',
    index: 4
  }, {
    label: 'GET STARTED',
    index: 5
  }];
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const {
            offsetTop,
            offsetHeight
          } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index);
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const benefits = [{
    title: "POST. SEND. DONE.",
    description: "Type @BOT_WASSY SEND @friend $5. That's it. Money moves.",
    color: "bg-[#FFE5B4]",
    image: "https://cdn.dev.fun/asset/699840f631c97306a0c4/POST SEND DONE_d67b93aa.png"
  }, {
    title: "VAULT SECURED",
    description: "Your funds sit in a Solana vault. Bot can't touch them. Only you can.",
    color: "bg-[#B4E5FF]",
    image: "https://cdn.dev.fun/asset/699840f631c97306a0c4/VAULT SECURED_e30c801c.png"
  }, {
    title: "BOT HANDLES IT",
    description: "No forms. No clicks. Bot sees your post. Bot moves money. You're done.",
    color: "bg-[#E5B4FF]",
    image: "https://cdn.dev.fun/asset/699840f631c97306a0c4/BOT HANDLES IT_e544f74c.png"
  }, {
    title: "CLAIM INSTANTLY",
    description: "Someone sent you money? Click claim. USDC hits your wallet. Simple.",
    color: "bg-[#B4FFE5]",
    image: "https://cdn.dev.fun/asset/699840f631c97306a0c4/CLAIM INSTANTLY_ab185103.png"
  }];
  const comingSoon = [{
    title: "MULTI-CHAIN",
    description: "ETH. POLYGON. BASE."
  }, {
    title: "AUTO-REPEAT",
    description: "SEND WEEKLY. MONTHLY."
  }];
  const faqs = [{
    q: "HOW DOES IT WORK?",
    a: "CONNECT WALLET. CONNECT X. FUND BALANCE. POST @BOT_WASSY SEND @USER $5. BOT DOES THE REST."
  }, {
    q: "IS IT SAFE?",
    a: "YES. SOLANA BLOCKCHAIN. YOUR VAULT. YOUR KEYS. BOT JUST WATCHES AND EXECUTES."
  }, {
    q: "WHAT ARE THE FEES?",
    a: "ZERO PLATFORM FEES. ONLY SOLANA NETWORK FEE. USUALLY UNDER $0.01."
  }, {
    q: "CAN I WITHDRAW?",
    a: "YES. ANYTIME. ONE CLICK. FUNDS GO TO YOUR WALLET."
  }];
  return <div className="min-h-screen bg-[#FFFEF9]">
      {}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFEF9] border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="headline-font text-2xl text-black">WASSY PAY</div>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(item => <button key={item.index} onClick={() => scrollToSection(item.index)} className={`px-4 py-2 mono-font text-xs border-3 border-black hand-drawn transition-all transform hover:scale-105 active:translate-y-1 ${activeSection === item.index ? 'bg-[#B4FFE5] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#FFE5B4] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                  {item.label}
                </button>)}
            </div>
            <button onClick={onEnterApp} className="px-6 py-2 bg-black text-white mono-font text-xs border-3 border-black hand-drawn transform hover:scale-105 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              LAUNCH APP
            </button>
          </div>
          {}
          <div className="md:hidden mt-3 flex flex-wrap gap-2">
            {navItems.map(item => <button key={item.index} onClick={() => scrollToSection(item.index)} className={`px-3 py-1 mono-font text-xs border-2 border-black hand-drawn transition-all ${activeSection === item.index ? 'bg-[#B4FFE5]' : 'bg-white hover:bg-[#FFE5B4]'}`}>
                {item.label}
              </button>)}
          </div>
        </div>
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Space+Mono:wght@400;700&display=swap');
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-border {
          0%, 100% { border-width: 4px; }
          50% { border-width: 6px; }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        .hand-drawn {
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
        }
        .grid-texture {
          background-image: 
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .headline-font {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .mono-font {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
      `}</style>

      {}
      <section ref={el => sectionsRef.current[0] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden grid-texture">
        
        <div className="text-center z-10 max-w-4xl mx-auto">
          <h1 className="headline-font text-7xl sm:text-9xl md:text-[12rem] text-black mb-6 animate-fade-in-up leading-none">
            WASSY<br />PAY
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <p className="mono-font text-lg sm:text-2xl text-black mb-3 animate-fade-in-up" style={{
            animationDelay: '0.2s'
          }}>
              POST. SEND. DONE.
            </p>
            <p className="mono-font text-sm sm:text-base text-black opacity-70 animate-fade-in-up" style={{
            animationDelay: '0.3s'
          }}>
              TURN X INTO YOUR PAYMENT PORTAL.<br />
              NO WALLET ADDRESSES. NO COMPLEXITY.<br />
              JUST POST @BOT_WASSY SEND @USER $5.
            </p>
          </div>
          
          <button onClick={onEnterApp} className="group relative px-10 sm:px-16 py-5 sm:py-7 bg-[#B4FFE5] hover:bg-[#9FEAD0] text-black border-5 border-black hand-drawn transform hover:scale-105 hover:rotate-1 active:translate-y-1 transition-all mono-font text-lg sm:text-2xl animate-fade-in-up shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" style={{
          animationDelay: '0.4s'
        }}>
            <span className="flex items-center space-x-3">
              <span>LAUNCH APP</span>
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown size={48} className="text-black opacity-30" />
        </div>
      </section>

      {}
      <section ref={el => sectionsRef.current[1] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 grid-texture">
        <div className="inline-block mb-12 px-6 py-2 bg-[#FFE5B4] border-4 border-black hand-drawn">
          <p className="mono-font text-sm text-black">HOW IT WORKS</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
          {benefits.map((benefit, index) => <div key={index} className={`${benefit.color} p-4 border-5 border-black hand-drawn transform hover:scale-105 hover:-rotate-1 transition-all cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${activeSection >= 1 ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
          animationDelay: `${index * 0.15}s`
        }} onMouseEnter={() => setHoveredBenefit(index)} onMouseLeave={() => setHoveredBenefit(null)}>
              <div className={`${hoveredBenefit === index ? 'animate-wiggle' : ''}`}>
                <img src={benefit.image} alt={benefit.title} className="w-full h-auto object-contain border-4 border-black hand-drawn" />
              </div>
            </div>)}
        </div>
      </section>

      {}
      <section ref={el => sectionsRef.current[2] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 grid-texture">
        <div className="inline-block mb-12 px-6 py-2 bg-[#E5B4FF] border-4 border-black hand-drawn">
          <p className="mono-font text-sm text-black">THE FLOW</p>
        </div>
        
        <div className="max-w-6xl w-full relative">
          {}
          <div className={`relative ${activeSection >= 2 ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="bg-white p-4 border-5 border-black hand-drawn shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-4xl">
              <img src="https://cdn.dev.fun/asset/699840f631c97306a0c4/wassypay flow_962fc993.png" alt="Wassy Pay Flow Diagram" className="w-full h-auto object-contain" />
            </div>

            {}
            <div className={`absolute -top-8 -left-4 sm:-left-12 md:-left-20 w-48 sm:w-56 md:w-64 ${activeSection >= 2 ? 'animate-slide-in-left' : 'opacity-0'}`} style={{
            animationDelay: '0.2s'
          }}>
              <div className="bg-[#B4E5FF] p-4 sm:p-6 border-4 border-black hand-drawn shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 hover:-rotate-2 transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white mono-font text-lg border-3 border-black mr-3 hand-drawn">
                    1
                  </div>
                  <h3 className="mono-font text-lg text-black">YOU</h3>
                </div>
                <div className="space-y-2 mono-font text-xs text-black">
                  <p>→ CONNECT WALLET</p>
                  <p>→ CONNECT X ACCOUNT</p>
                  <p>→ FUND YOUR VAULT</p>
                  <p>→ POST: @BOT_WASSY SEND @FRIEND $5</p>
                </div>
              </div>
            </div>

            {}
            <div className={`absolute -top-8 -right-4 sm:-right-12 md:-right-20 w-48 sm:w-56 md:w-64 ${activeSection >= 2 ? 'animate-slide-in-right' : 'opacity-0'}`} style={{
            animationDelay: '0.3s'
          }}>
              <div className="bg-[#FFE5B4] p-4 sm:p-6 border-4 border-black hand-drawn shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 hover:rotate-2 transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white mono-font text-lg border-3 border-black mr-3 hand-drawn">
                    2
                  </div>
                  <h3 className="mono-font text-lg text-black">BOT</h3>
                </div>
                <div className="space-y-2 mono-font text-xs text-black">
                  <p>→ SEES YOUR POST</p>
                  <p>→ CHECKS YOUR BALANCE</p>
                  <p>→ MOVES FUNDS TO VAULT</p>
                  <p>→ CONFIRMS WITH REPLY</p>
                </div>
              </div>
            </div>

            {}
            <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 sm:w-56 md:w-64 ${activeSection >= 2 ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
            animationDelay: '0.5s'
          }}>
              <div className="bg-[#B4FFE5] p-4 sm:p-6 border-4 border-black hand-drawn shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 hover:rotate-1 transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white mono-font text-lg border-3 border-black mr-3 hand-drawn">
                    3
                  </div>
                  <h3 className="mono-font text-lg text-black">FRIEND</h3>
                </div>
                <div className="space-y-2 mono-font text-xs text-black">
                  <p>→ OPENS WASSY PAY</p>
                  <p>→ SEES PENDING CLAIM</p>
                  <p>→ CLICKS CLAIM</p>
                  <p>→ USDC IN WALLET. DONE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section ref={el => sectionsRef.current[3] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 grid-texture">
        <div className="inline-block mb-12 px-6 py-2 bg-[#FFE5B4] border-4 border-black hand-drawn">
          <p className="mono-font text-sm text-black">COMING SOON</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
          {comingSoon.map((feature, index) => <div key={index} className={`bg-[#FFFEF9] p-6 border-4 border-black hand-drawn transform hover:scale-105 hover:rotate-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${activeSection >= 3 ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <h3 className="mono-font text-lg text-black mb-2">
                {feature.title}
              </h3>
              <p className="mono-font text-xs text-black opacity-70">
                {feature.description}
              </p>
            </div>)}
        </div>
      </section>

      {}
      <section ref={el => sectionsRef.current[4] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 grid-texture">
        <div className="inline-block mb-12 px-6 py-2 bg-[#E5B4FF] border-4 border-black hand-drawn">
          <p className="mono-font text-sm text-black">QUESTIONS</p>
        </div>
        
        <div className="max-w-3xl w-full space-y-5">
          {faqs.map((faq, index) => <div key={index} className={`bg-[#FFFEF9] p-6 border-4 border-black hand-drawn shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${activeSection >= 4 ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <h3 className="mono-font text-lg text-black mb-3">
                {faq.q}
              </h3>
              <p className="mono-font text-sm text-black opacity-80 leading-relaxed">
                {faq.a}
              </p>
            </div>)}
        </div>
      </section>

      {}
      <section ref={el => sectionsRef.current[5] = el} className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#B4FFE5] grid-texture relative overflow-hidden">
        <div className="text-center max-w-4xl z-10">
          <div className="inline-block mb-8 px-6 py-2 bg-black text-white border-4 border-black hand-drawn">
            <p className="mono-font text-sm">READY?</p>
          </div>
          
          <h2 className="headline-font text-6xl sm:text-8xl text-black mb-6 leading-none">
            START<br />SENDING
          </h2>
          
          <p className="mono-font text-lg sm:text-xl text-black mb-12 max-w-2xl mx-auto">
            NO SETUP. NO LEARNING CURVE.<br />
            JUST CONNECT AND POST.
          </p>
          
          <button onClick={onEnterApp} className="group px-14 py-7 bg-black hover:bg-gray-900 text-white border-5 border-black hand-drawn transform hover:scale-105 hover:-rotate-1 active:translate-y-1 transition-all mono-font text-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]">
            <span className="flex items-center space-x-3">
              <span>LAUNCH NOW</span>
              <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="https://x.com/bot_wassy" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-black hover:text-gray-800 transition-colors mono-font bg-white px-6 py-3 border-4 border-black hand-drawn transform hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <X size={24} />
              <span>FOLLOW</span>
            </a>
            <a href="https://github.com/kasperwtrcolor/wassypay" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-black hover:text-gray-800 transition-colors mono-font bg-white px-6 py-3 border-4 border-black hand-drawn transform hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Github size={24} />
              <span>DOCS</span>
            </a>
          </div>
        </div>
      </section>
    </div>;
}
export default function AppWithProvider() {
  return <DevappProvider rpcEndpoint="https://rpc.dev.fun/699840f631c97306a0c4" devbaseEndpoint="https://devbase.dev.fun" appId="699840f631c97306a0c4">
      <App />
    </DevappProvider>;
}
