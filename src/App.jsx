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
    const text = `Just claimed ${amount} USDC from ${sender} on @bot_wassy! 💸\n\nTurn your posts into payments at dev.fun 🚀`;
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
          const senderProfile = allProfiles.find(p =>
            p.xHandle && p.xHandle.toLowerCase() === claim.sender.toLowerCase()
          );

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

        const userSuccessfulClaims = claimsList.filter(c =>
          c.userId === userWallet && c.status === 'completed'
        );

        const allPaymentsForHistory = await devbaseClient.listEntities('payments', {});
        setAllPayments(allPaymentsForHistory);

        const allProfilesForHistory = await devbaseClient.listEntities('profiles', {});

        const historyWithDetails = await Promise.all(userSuccessfulClaims.map(async claim => {
          const payment = allPaymentsForHistory.find(p =>
            p.id === claim.paymentId || p.tweetId === claim.paymentId
          );
          const senderProfile = payment
            ? allProfilesForHistory.find(p => p.wallet === payment.fromUser)
            : null;

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
        const userPayments = paymentsList.filter(p =>
          p.fromUser === userWallet || p.toUser === userWallet
        ).slice(0, 5);
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
          const sentTotal = backendPaymentsForUser.reduce((sum, payment) =>
            sum + (parseFloat(payment.amount) || 0), 0
          );
          console.log(`✅ Setting totalSent to: $${sentTotal.toFixed(2)}`);
          setTotalSent(sentTotal);
        } else {
          console.log(`⚠️ No X handle connected, totalSent = $0`);
          setTotalSent(0);
        }

        const allPayments = await devbaseClient.listEntities('payments', {});
        let userPendingPayments = allPayments.filter(p =>
          p.toUser === userWallet && p.status === 'pending'
        );

        if (xHandle) {
          const allProfiles = await devbaseClient.listEntities('profiles', {});
          const userProfile = allProfiles.find(p => p.xHandle === xHandle);

          if (userProfile) {
            const handleBasedPayments = allPayments.filter(p =>
              p.toUser === userProfile.wallet &&
              p.status === 'pending' &&
              !userPendingPayments.find(existing => existing.id === p.id)
            );
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
          const userPayments = paymentsList.filter(p =>
            p.fromUser === userWallet || p.toUser === userWallet
          ).slice(0, 5);
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
            const sentTotal = backendPaymentsForUser.reduce((sum, payment) =>
              sum + (parseFloat(payment.amount) || 0), 0
            );
            console.log(`🔄 [Polling] Updated totalSent to: ${sentTotal.toFixed(2)}`);
            setTotalSent(sentTotal);
          } else {
            setTotalSent(0);
          }
        }).catch(err => {
          console.error(err);
          setTotalSent(0);
        });

        Promise.all([
          devbaseClient.listEntities('payments', {}),
          devbaseClient.listEntities('profiles', {}),
          devbaseClient.listEntities('payment_claims', {})
        ]).then(([allPayments, allProfiles, allPaymentClaimsData]) => {
          setAllPaymentClaims(allPaymentClaimsData);

          let userPendingPayments = allPayments.filter(p => {
            const isForUser = p.toUser === userWallet;
            const isPending = p.status === 'pending';
            const notClaimedInDevBase = !allPaymentClaimsData.some(pc =>
              pc.paymentId === p.id && pc.status === 'completed'
            );
            return isForUser && isPending && notClaimedInDevBase;
          });

          if (xHandle) {
            const userProfile = allProfiles.find(p => p.xHandle === xHandle);
            if (userProfile) {
              const handleBasedPayments = allPayments.filter(p => {
                const isForProfile = p.toUser === userProfile.wallet;
                const isPending = p.status === 'pending';
                const notAlreadyIncluded = !userPendingPayments.find(existing => existing.id === p.id);
                const notClaimedInDevBase = !allPaymentClaimsData.some(pc =>
                  pc.paymentId === p.id && pc.status === 'completed'
                );
                return isForProfile && isPending && notAlreadyIncluded && notClaimedInDevBase;
              });
              userPendingPayments = [...userPendingPayments, ...handleBasedPayments];
            }
          }

          setPendingClaims(userPendingPayments);
        }).catch(err => console.error(err));

        Promise.all([
          devbaseClient.listEntities('payment_claims', {}),
          devbaseClient.listEntities('payments', {}),
          devbaseClient.listEntities('profiles', {})
        ]).then(async ([claimsList, allPaymentsForHistory, allProfilesForHistory]) => {
          const allSuccessfulClaims = claimsList.filter(c => c.status === 'completed');
          setSuccessfulClaims(allSuccessfulClaims);
          setAllPaymentClaims(claimsList);

          const userSuccessfulClaims = claimsList.filter(c =>
            c.userId === userWallet && c.status === 'completed'
          );
          const userClaims = claimsList.filter(c => c.userId === userWallet);
          const claimedTotal = userClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
          setTotalClaimed(claimedTotal);

          const historyWithDetails = await Promise.all(userSuccessfulClaims.map(async claim => {
            const payment = allPaymentsForHistory.find(p =>
              p.id === claim.paymentId || p.tweetId === claim.paymentId
            );
            const senderProfile = payment
              ? allProfilesForHistory.find(p => p.wallet === payment.fromUser)
              : null;

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
            const userSentPayments = allBackendPayments.filter(p =>
              p.sender && p.sender.toLowerCase() === user.xHandle.toLowerCase()
            );
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
          const userPendingClaims = allPayments.filter(p =>
            p.toUser === profile.wallet && p.status === 'pending'
          );

          const totalDeposited = userDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
          const totalClaimed = userClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
          const completedClaims = userClaims.filter(c => c.status === 'completed');

          let totalSent = 0;
          if (profile.xHandle && profile.xHandle !== 'Not connected') {
            const userSentPayments = allBackendPayments.filter(p =>
              p.sender && p.sender.toLowerCase() === profile.xHandle.toLowerCase()
            );
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
        const payment = allPayments.find(p =>
          p.id === claim.paymentId || p.tweetId === claim.paymentId
        );
        const senderProfile = payment
          ? allProfiles.find(p => p.wallet === payment.fromUser)
          : null;

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
        const notClaimedInDevBase = !freshPaymentClaims.some(pc =>
          pc.paymentId === p.id && pc.status === 'completed'
        );
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
            const notClaimedInDevBase = !freshPaymentClaims.some(pc =>
              pc.paymentId === p.id && pc.status === 'completed'
            );
            return isForProfile && isPending && notAlreadyIncluded && notClaimedInDevBase;
          });

          console.log(`📱 Handle-based pending payments (after DevBase check): ${handleBasedPayments.length}`);
          userPendingPayments = [...userPendingPayments, ...handleBasedPayments];
        }
      }

      setPendingClaims(userPendingPayments);

      const unclaimedBackendClaims = freshBackendClaims.filter(claim => {
        return !freshPaymentClaims.some(c =>
          c.paymentId === claim.tweet_id && c.status === 'completed'
        );
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
      const alreadyClaimed = existingClaims.some(c =>
        c.paymentId === claim.tweet_id && c.userId === userWallet
      );

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
      const alreadyClaimed = existingClaims.some(c =>
        c.paymentId === paymentId && c.userId === userWallet
      );

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
          const payment = allPayments.find(p =>
            p.id === claim.paymentId || p.tweetId === claim.paymentId
          );

          if (payment && payment.tweetId) {
            const userProfile = allProfiles.find(p => p.wallet === claim.userId);
            const recipient = userProfile && userProfile.xHandle
              ? userProfile.xHandle
              : claim.userId;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 grid-bg">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                background: ['#8b5cf6', '#ec4899', '#10b981', '#fbbf24', '#3b82f6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {newAchievements.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {newAchievements.map(achievementId => {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            return (
              <div
                key={achievementId}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 border-4 border-black pixel-shadow pixel-reveal"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <div className="font-bold text-lg">{achievement.name}</div>
                    <div className="text-sm opacity-90">{achievement.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 pixel-reveal">
              WASSY PAY
            </h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              title="How it works"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <UserButton />
          </div>
        </div>

        {status.message && (
          <div
            className={`mb-6 p-4 border-4 border-black pixel-shadow pixel-reveal ${
              status.type === 'success' ? 'bg-green-400' :
              status.type === 'error' ? 'bg-red-400' :
              'bg-yellow-400'
            }`}
          >
            <p className="text-black font-bold text-sm">{status.message}</p>
          </div>
        )}

        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setShowAdminDashboard(!showAdminDashboard)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {showAdminDashboard ? '🔒 HIDE ADMIN DASHBOARD' : '🔓 SHOW ADMIN DASHBOARD'}
            </button>
          </div>
        )}

        {isAdmin && showAdminDashboard && (
          <div ref={adminDashboardRef} className="mb-8 bg-white border-4 border-black pixel-shadow p-6 pixel-reveal">
            <h2 className="text-2xl font-black mb-4 text-red-600">👑 ADMIN DASHBOARD</h2>

            <div className="mb-4 flex gap-2">
              <button
                onClick={handleSyncDatabases}
                disabled={isSyncingDatabase}
                className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-bold transition-all ${
                  isSyncingDatabase ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSyncingDatabase ? '🔄 SYNCING...' : '🔄 SYNC DATABASES'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-black">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <tr>
                    <th className="border-2 border-black p-2 text-left text-xs">WALLET</th>
                    <th className="border-2 border-black p-2 text-left text-xs">X HANDLE</th>
                    <th className="border-2 border-black p-2 text-left text-xs">DEPOSITED</th>
                    <th className="border-2 border-black p-2 text-left text-xs">SENT</th>
                    <th className="border-2 border-black p-2 text-left text-xs">CLAIMED</th>
                    <th className="border-2 border-black p-2 text-left text-xs">CONFIRMED</th>
                    <th className="border-2 border-black p-2 text-left text-xs">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <>
                      <tr key={user.wallet} className="hover:bg-purple-50">
                        <td className="border-2 border-black p-2 text-xs font-mono">
                          {user.wallet.substring(0, 4)}...{user.wallet.substring(user.wallet.length - 4)}
                        </td>
                        <td className="border-2 border-black p-2 text-xs">
                          {user.xHandle !== 'Not connected' ? `@${user.xHandle}` : user.xHandle}
                        </td>
                        <td className="border-2 border-black p-2 text-xs font-bold">
                          ${user.totalDeposited.toFixed(2)}
                        </td>
                        <td className="border-2 border-black p-2 text-xs font-bold text-orange-600">
                          ${user.totalSent.toFixed(2)}
                        </td>
                        <td className="border-2 border-black p-2 text-xs">
                          {user.claimsMade || 0} claims
                        </td>
                        <td className="border-2 border-black p-2 text-xs font-bold text-green-600">
                          {user.confirmedClaims || 0} ✓
                        </td>
                        <td className="border-2 border-black p-2 text-xs">
                          <button
                            onClick={() => handleViewUserClaims(user.wallet)}
                            className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white border-2 border-black text-xs font-bold"
                          >
                            {expandedUserClaims === user.wallet ? 'HIDE' : 'VIEW'} CLAIMS
                          </button>
                        </td>
                      </tr>
                      {expandedUserClaims === user.wallet && userClaimDetails.length > 0 && (
                        <tr>
                          <td colSpan="7" className="border-2 border-black p-4 bg-purple-50">
                            <div className="space-y-2">
                              <h4 className="font-bold text-sm mb-2">Claim History for {user.xHandle}:</h4>
                              {userClaimDetails.map(claim => (
                                <div key={claim.claimId} className="p-2 bg-white border-2 border-black text-xs">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-bold">
                                        ${claim.amount.toFixed(2)} USDC
                                      </div>
                                      <div className="text-gray-600">
                                        From: {claim.senderHandle ? `@${claim.senderHandle}` : claim.senderWallet.substring(0, 8)}...
                                      </div>
                                      <div className="text-gray-500">
                                        {new Date(claim.createdAt).toLocaleString()}
                                      </div>
                                      {claim.tweetId && (
                                        <a
                                          href={`https://twitter.com/i/status/${claim.tweetId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline text-xs"
                                        >
                                          View Tweet →
                                        </a>
                                      )}
                                    </div>
                                    <div className={`px-2 py-1 text-xs font-bold ${
                                      claim.status === 'completed' ? 'bg-green-500 text-white' :
                                      claim.status === 'pending' ? 'bg-yellow-500 text-black' :
                                      'bg-gray-500 text-white'
                                    }`}>
                                      {claim.status.toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-gray-600">VAULT BALANCE</h3>
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ${vaultBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total USDC in vault</p>
          </div>

          <div className="bg-white border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-gray-600">YOUR DEPOSITS</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              ${totalDeposited.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total deposited to vault</p>
          </div>

          <div className="bg-white border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-gray-600">POINTS</h3>
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              {(totalDeposited + totalClaimed + totalSent).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Deposits + Claims + Sent</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white">CLAIMED</h3>
              <Coins className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-white">
              ${totalClaimed.toFixed(2)}
            </p>
            <p className="text-xs text-white/80 mt-1">Total claimed from vault</p>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-red-400 border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white">SENT</h3>
              <Send className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-white">
              ${totalSent.toFixed(2)}
            </p>
            <p className="text-xs text-white/80 mt-1">Total sent via X</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-blue-400 border-4 border-black pixel-shadow p-6 pixel-reveal">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white">AVAILABLE</h3>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-white">
              ${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)}
            </p>
            <p className="text-xs text-white/80 mt-1">Available to withdraw</p>
          </div>
        </div>

        <div className="bg-white border-4 border-black pixel-shadow p-6 mb-8 pixel-reveal">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              YOUR ACCOUNT
            </h2>
            {xHandle && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-black">
                {profileImage && (
                  <img src={profileImage} alt={xHandle} className="w-6 h-6 rounded-full border-2 border-black" />
                )}
                <X className="w-4 h-4" />
                <span className="font-bold text-sm">@{xHandle}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={!xHandle}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                !xHandle ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              💰 FUND ACCOUNT
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!xHandle || (totalDeposited - totalSent - totalWithdrawn) <= 0}
              className={`bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                (!xHandle || (totalDeposited - totalSent - totalWithdrawn) <= 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              💸 WITHDRAW FUNDS
            </button>
          </div>

          {!xHandle && (
            <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-500">
              <p className="text-sm font-bold text-yellow-800">
                ⚠️ Connect your X account first to use Wassy Pay
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border-4 border-black pixel-shadow p-6 mb-8 pixel-reveal">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              💸 PENDING PAYMENTS
            </h2>
            <button
              onClick={handleCheckForPayments}
              disabled={isCheckingPayments || !xHandle}
              className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-black font-bold text-sm transition-all ${
                (isCheckingPayments || !xHandle) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCheckingPayments ? '🔍 CHECKING...' : '🔍 CHECK FOR PAYMENTS'}
            </button>
          </div>

          {!xHandle && (
            <div className="p-4 bg-yellow-100 border-2 border-yellow-500">
              <p className="text-sm font-bold text-yellow-800">
                ⚠️ Connect your X account to check for payments
              </p>
            </div>
          )}

          {xHandle && (backendClaims.filter(c => !manuallyHiddenClaims.includes(c.tweet_id)).length > 0 || pendingClaims.length > 0) && (
            <div className="space-y-3">
              {backendClaims.filter(c => !manuallyHiddenClaims.includes(c.tweet_id)).map(claim => {
                const isAlreadyClaimed = allPaymentClaims.some(pc =>
                  pc.paymentId === claim.tweet_id && pc.status === 'completed'
                );

                if (isAlreadyClaimed) return null;

                return (
                  <div key={claim.tweet_id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold border border-black">
                            FROM X POST
                          </span>
                        </div>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          ${parseFloat(claim.amount).toFixed(2)} USDC
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          From: <span className="font-bold">@{claim.sender}</span>
                        </p>
                        <a
                          href={`https://twitter.com/i/status/${claim.tweet_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View Tweet →
                        </a>
                      </div>
                    </div>

                    {!claim.canClaim && (
                      <div className="mb-2 p-2 bg-yellow-100 border border-yellow-500">
                        <p className="text-xs font-bold text-yellow-800">
                          ⚠️ {claim.reason}
                        </p>
                      </div>
                    )}

                    {claimErrors[claim.tweet_id] && (
                      <div className="mb-2 p-2 bg-red-100 border border-red-500">
                        <p className="text-xs font-bold text-red-800">
                          ❌ {claimErrors[claim.tweet_id]}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimBackendPayment(claim)}
                        disabled={loading || !claim.canClaim}
                        className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 border-2 border-black font-bold text-sm transition-all ${
                          (loading || !claim.canClaim) ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-0.5 hover:translate-y-0.5'
                        }`}
                      >
                        {loading ? '⏳ CLAIMING...' : '💰 CLAIM NOW'}
                      </button>
                      <button
                        onClick={() => handleMarkAsClaimed(claim.tweet_id)}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold text-sm"
                        title="Mark as claimed elsewhere"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingClaims.map(payment => {
                const isAlreadyClaimed = allPaymentClaims.some(pc =>
                  pc.paymentId === payment.id && pc.status === 'completed'
                );

                if (isAlreadyClaimed) return null;

                return (
                  <div key={payment.id} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold border border-black">
                            ON-CHAIN
                          </span>
                        </div>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                          ${payment.amount.toFixed(2)} USDC
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Payment ID: <span className="font-mono text-xs">{payment.id.substring(0, 8)}...</span>
                        </p>
                      </div>
                    </div>

                    {claimErrors[payment.id] && (
                      <div className="mb-2 p-2 bg-red-100 border border-red-500">
                        <p className="text-xs font-bold text-red-800">
                          ❌ {claimErrors[payment.id]}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleClaimPayment(payment.id, payment.amount)}
                      disabled={loading}
                      className={`w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-4 py-2 border-2 border-black font-bold text-sm transition-all ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-0.5 hover:translate-y-0.5'
                      }`}
                    >
                      {loading ? '⏳ CLAIMING...' : '💰 CLAIM NOW'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {xHandle && backendClaims.filter(c => !manuallyHiddenClaims.includes(c.tweet_id)).length === 0 && pendingClaims.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">No pending payments</p>
              <p className="text-xs text-gray-400 mt-2">
                Next check in: {nextFetchCountdown}
              </p>
            </div>
          )}
        </div>

        {claimHistory.length > 0 && (
          <div className="bg-white border-4 border-black pixel-shadow p-6 mb-8 pixel-reveal">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              ✅ CLAIM HISTORY
            </h2>
            <div className="space-y-3">
              {claimHistory.slice(0, 10).map(claim => (
                <div key={claim.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {claim.senderImage && (
                          <img
                            src={claim.senderImage}
                            alt={claim.senderHandle || 'Sender'}
                            className="w-8 h-8 rounded-full border-2 border-black"
                          />
                        )}
                        <div>
                          <p className="text-lg font-black text-green-600">
                            ${claim.amount.toFixed(2)} USDC
                          </p>
                          <p className="text-xs text-gray-600">
                            {claim.senderHandle ? `from @${claim.senderHandle}` : 'from on-chain payment'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(claim.createdAt).toLocaleString()}
                      </p>
                      {claim.tweetId && (
                        <a
                          href={`https://twitter.com/i/status/${claim.tweetId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View Tweet →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => shareClaimOnX(claim)}
                      className="ml-2 p-2 bg-black hover:bg-gray-800 text-white border-2 border-black transition-all"
                      title="Share on X"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            LEADERBOARD
          </button>

          <button
            onClick={() => setShowAchievementsModal(true)}
            className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none relative"
          >
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            ACHIEVEMENTS
            {userAchievements.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 border-2 border-black">
                {userAchievements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowVaultModal(true)}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Wallet className="w-6 h-6 mx-auto mb-2" />
            VAULT INFO
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-4 border-4 border-black pixel-shadow font-bold text-lg transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <X className="w-6 h-6 mx-auto mb-2" />
            PROFILE
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              💰 FUND YOUR ACCOUNT
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Deposit USDC to the Wassy vault. Your funds will be available to send payments via X.
            </p>
            <input
              type="number"
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
              placeholder="Amount (USDC)"
              className="w-full p-3 border-2 border-black mb-4 text-lg font-bold"
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                onClick={handleFundAccount}
                disabled={loading || !fundAmount}
                className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 border-2 border-black font-bold transition-all ${
                  (loading || !fundAmount) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'DEPOSITING...' : 'DEPOSIT'}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              💸 WITHDRAW FUNDS
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Withdraw USDC from your vault balance back to your wallet.
            </p>
            <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300">
              <p className="text-sm font-bold">
                Available: ${Math.max(0, totalDeposited - totalSent - totalWithdrawn).toFixed(2)} USDC
              </p>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Amount (USDC)"
              className="w-full p-3 border-2 border-black mb-4 text-lg font-bold"
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                onClick={handleWithdrawFunds}
                disabled={loading || !withdrawAmount}
                className={`flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 border-2 border-black font-bold transition-all ${
                  (loading || !withdrawAmount) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'WITHDRAWING...' : 'WITHDRAW'}
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              👤 YOUR PROFILE
            </h2>

            {xHandle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                  {profileImage && (
                    <img src={profileImage} alt={xHandle} className="w-16 h-16 rounded-full border-4 border-black" />
                  )}
                  <div>
                    <p className="text-xl font-black">@{xHandle}</p>
                    <p className="text-xs text-gray-600">Connected</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-300">
                  <h3 className="font-black text-sm mb-2">YOUR STATS</h3>
                  <div className="space-y-1 text-sm">
                    <p>💰 Deposited: <span className="font-bold">${totalDeposited.toFixed(2)}</span></p>
                    <p>📤 Sent: <span className="font-bold">${totalSent.toFixed(2)}</span></p>
                    <p>📥 Claimed: <span className="font-bold">${totalClaimed.toFixed(2)}</span></p>
                    <p>🏆 Points: <span className="font-bold">{(totalDeposited + totalClaimed + totalSent).toFixed(0)}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border-2 border-purple-300">
                  <h3 className="font-black text-sm mb-2">WALLET</h3>
                  <p className="text-xs font-mono break-all">{userWallet}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-100 border-2 border-yellow-500">
                <p className="text-sm font-bold text-yellow-800">
                  ⚠️ No X account connected. Connect your account to use Wassy Pay.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showAchievementsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAchievementsModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              🏆 ACHIEVEMENTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 border-2 border-black ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-black text-sm">{achievement.name}</h3>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                        {isUnlocked && (
                          <p className="text-xs text-green-600 font-bold mt-1">✓ UNLOCKED</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowAchievementsModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowLeaderboardModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
              🏆 LEADERBOARD
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Points = Deposited + Claimed + Sent
            </p>
            <div className="space-y-2">
              {allUsers
                .map(user => ({
                  ...user,
                  points: user.totalDeposited + user.totalClaimed + user.totalSent
                }))
                .sort((a, b) => b.points - a.points)
                .map((user, index) => (
                  <div
                    key={user.wallet}
                    className={`p-4 border-2 border-black ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100' :
                      index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-100 to-yellow-50' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-gray-400 w-8">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      {user.profileImage && (
                        <img src={user.profileImage} alt={user.xHandle} className="w-10 h-10 rounded-full border-2 border-black" />
                      )}
                      <div className="flex-1">
                        <p className="font-black text-sm">
                          {user.xHandle !== 'Not connected' ? `@${user.xHandle}` : user.wallet.substring(0, 8) + '...'}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-600 mt-1">
                          <span>💰 ${user.totalDeposited.toFixed(0)}</span>
                          <span>📥 ${user.totalClaimed.toFixed(0)}</span>
                          <span>📤 ${user.totalSent.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          {user.points.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowLeaderboardModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showVaultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowVaultModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              🏦 VAULT INFO
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-2 border-green-300">
                <p className="text-sm font-bold text-gray-600 mb-1">VAULT ADDRESS</p>
                <p className="text-xs font-mono break-all">Hu7wMzbwR5RSTXk2bF5CEDhdSAN1mzX9vTiqbQJWESxE</p>
              </div>
              <div className="p-4 bg-blue-50 border-2 border-blue-300">
                <p className="text-sm font-bold text-gray-600 mb-1">TOTAL BALANCE</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  ${vaultBalance.toFixed(2)} USDC
                </p>
              </div>
              <div className="p-4 bg-purple-50 border-2 border-purple-300">
                <p className="text-sm font-bold text-gray-600 mb-2">HOW IT WORKS</p>
                <div className="text-xs space-y-2">
                  <p>1. 💰 Deposit USDC to the vault</p>
                  <p>2. 📱 Post on X: <span className="font-bold">@BOT_WASSY SEND @USERNAME $5</span></p>
                  <p>3. 🤖 Bot monitors & validates payment</p>
                  <p>4. 💸 Recipient claims from vault</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVaultModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowInfoModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ℹ️ HOW TO SEND
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                <p className="text-sm font-bold mb-2">POST ON X:</p>
                <p className="text-lg font-black">@BOT_WASSY SEND @USERNAME $5</p>
              </div>
              <div className="text-sm space-y-2">
                <p>1. 💰 Fund your account with USDC</p>
                <p>2. 📱 Post payment command on X</p>
                <p>3. 🤖 Bot validates & processes</p>
                <p>4. ✅ Recipient can claim instantly</p>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white border-2 border-black font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {showClaimSuccessModal && successClaimData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowClaimSuccessModal(false)}>
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                CLAIM SUCCESSFUL!
              </h2>
              <p className="text-3xl font-black mb-2 text-green-600">
                +${successClaimData.amount.toFixed(2)} USDC
              </p>
              {successClaimData.sender && (
                <p className="text-sm text-gray-600 mb-4">
                  from @{successClaimData.sender}
                </p>
              )}
              <button
                onClick={() => setShowClaimSuccessModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-black font-bold"
              >
                AWESOME!
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black pixel-shadow p-8 max-w-md w-full pixel-reveal">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-bold text-gray-700">{transactionStatus}</p>
              <p className="text-xs text-gray-500 mt-2">Please wait...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LandingPage({ onEnterApp, scrollY }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div
        className="fixed inset-0 grid-bg opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            WASSY PAY
          </h1>
          <button
            onClick={onEnterApp}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 border-4 border-black pixel-shadow font-bold transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            LAUNCH APP
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 leading-tight pixel-reveal">
            TURN POSTS INTO PAYMENTS
          </h2>
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-8 pixel-reveal">
            Send money via X posts. No wallets, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pixel-reveal">
            <button
              onClick={onEnterApp}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 border-4 border-black pixel-shadow font-bold text-xl transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              GET STARTED →
            </button>
            <a
              href="https://twitter.com/bot_wassy"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 border-4 border-black pixel-shadow font-bold text-xl transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none inline-flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              @BOT_WASSY
            </a>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 border-4 border-black pixel-shadow animate-bounce" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-400 border-4 border-black pixel-shadow animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-40 right-20 w-12 h-12 bg-blue-400 border-4 border-black pixel-shadow animate-bounce" style={{ animationDelay: '1s' }} />
      </section>

      <section className="relative py-20 px-4 bg-white border-y-4 border-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            HOW IT WORKS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '💰', title: 'FUND', desc: 'Deposit USDC to vault' },
              { icon: '📱', title: 'POST', desc: '@BOT_WASSY SEND @USER $5' },
              { icon: '🤖', title: 'VALIDATE', desc: 'Bot processes payment' },
              { icon: '✅', title: 'CLAIM', desc: 'Recipient gets paid' }
            ].map((step, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-black pixel-shadow p-6 text-center pixel-reveal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h4 className="text-xl font-black mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600 font-bold">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
            THE FLOW
          </h3>
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Connect & Fund',
                desc: 'Login with X, deposit USDC to the Wassy vault',
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '02',
                title: 'Post Payment',
                desc: 'Tweet: @BOT_WASSY SEND @FRIEND $10',
                color: 'from-blue-500 to-green-500'
              },
              {
                step: '03',
                title: 'Auto-Process',
                desc: 'Bot validates & marks payment ready',
                color: 'from-orange-500 to-red-500'
              },
              {
                step: '04',
                title: 'Instant Claim',
                desc: 'Recipient claims USDC from vault',
                color: 'from-green-500 to-blue-500'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start pixel-reveal">
                <div className={`w-16 h-16 flex items-center justify-center bg-gradient-to-r ${item.color} text-white border-4 border-black pixel-shadow font-black text-2xl flex-shrink-0`}>
                  {item.step}
                </div>
                <div className="flex-1 bg-white border-4 border-black pixel-shadow p-6">
                  <h4 className="text-2xl font-black mb-2">{item.title}</h4>
                  <p className="text-gray-600 font-bold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 border-y-4 border-black">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-4xl md:text-5xl font-black mb-6">
            COMING SOON
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔔', title: 'Notifications', desc: 'Real-time alerts' },
              { icon: '📊', title: 'Analytics', desc: 'Track your activity' },
              { icon: '🎯', title: 'Rewards', desc: 'Earn for using' }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border-4 border-white/50 p-6 pixel-reveal">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-black mb-2">{feature.title}</h4>
                <p className="text-sm opacity-90 font-bold">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            FAQ
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Is this safe?',
                a: 'Yes! Funds are held in a secure Solana vault. Only you can authorize payments.'
              },
              {
                q: 'What tokens are supported?',
                a: 'Currently USDC on Solana. More tokens coming soon!'
              },
              {
                q: 'Are there fees?',
                a: 'Only minimal Solana network fees. No platform fees!'
              },
              {
                q: 'Do I need a wallet?',
                a: 'Yes, but we create an embedded wallet for you via Privy. No setup needed!'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 border-4 border-black pixel-shadow p-6 pixel-reveal">
                <h4 className="text-xl font-black mb-2">{faq.q}</h4>
                <p className="text-gray-600 font-bold">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative py-12 px-4 bg-black text-white border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            WASSY PAY
          </h2>
          <p className="text-sm opacity-80 mb-6">Turn posts into payments</p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://twitter.com/bot_wassy" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              <X className="w-6 h-6" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              <Github className="w-6 h-6" />
            </a>
          </div>
          <p className="text-xs opacity-60">© 2026 Wassy Pay. Built on Solana.</p>
        </div>
      </footer>
    </div>
  );
}

export default function Root() {
  return (
    <DevappProvider
      appId="7a8f9a1a-9ba8-4fee-af2e-af9db54e05fa"
      appName="Wassy Pay"
    >
      <App />
    </DevappProvider>
  );
}
