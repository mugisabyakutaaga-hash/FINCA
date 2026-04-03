import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Chat from './components/Chat';
import Wallet from './components/Wallet';
import Products from './components/Products';
import MyPolicies from './components/MyPolicies';
import Auth from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { sendMessage, analyzeDocument } from './services/gemini';
import { Transaction, UserProfile, Claim, Policy } from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  handleFirestoreError,
  OperationType
} from './firebase';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // Create new user profile
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Guest User',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'client',
              walletBalance: 0,
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;

    // Listen to user profile for balance updates
    const userUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as UserProfile;
        setBalance(userData.walletBalance);
        setUser(userData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // Listen to transactions
    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const txUnsubscribe = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    // Listen to claims
    const claimsQuery = query(
      collection(db, 'claims'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const claimsUnsubscribe = onSnapshot(claimsQuery, (snapshot) => {
      const cls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Claim[];
      setClaims(cls);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'claims');
    });

    // Listen to policies
    const policiesQuery = query(
      collection(db, 'policies'),
      where('userId', '==', user.uid),
      orderBy('startDate', 'desc')
    );
    const policiesUnsubscribe = onSnapshot(policiesQuery, (snapshot) => {
      const pls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Policy[];
      setPolicies(pls);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'policies');
    });

    return () => {
      userUnsubscribe();
      txUnsubscribe();
      claimsUnsubscribe();
      policiesUnsubscribe();
    };
  }, [user?.uid]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      const result = await sendMessage(message, chatHistory);
      const responseText = result.text;
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: responseText }] },
      ]);

      // Check for function calls
      const functionCalls = result.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'initiateClaim') {
            const args = call.args as any;
            await handleInitiateClaim(args.description, args.policyId || 'default');
          } else if (call.name === 'performKYC') {
            const args = call.args as any;
            await handlePerformKYC(args.idNumber);
          } else if (call.name === 'get_loan_limit') {
            return `Based on your credit history, your current mobile loan limit is UGX 500,000. Would you like to apply now?`;
          } else if (call.name === 'check_eligibility') {
            const args = call.args as any;
            return `Good news! You are eligible for the ${args.productType}. It offers competitive rates and flexible repayment. Shall we proceed?`;
          } else if (call.name === 'get_nearest_agent') {
            return `The nearest FINCA agent is located at Centeagency Point, Wandegeya (200m away). Open until 6:00 PM.`;
          } else if (call.name === 'manageWallet') {
            const args = call.args as any;
            if (args.action === 'check-balance') {
              return `Your current FINCA wallet balance is ${new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(balance)}.`;
            }
          }
        }
      }

      return responseText;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  };

  const handleInitiateClaim = async (description: string, policyId: string) => {
    if (!user) return;
    const claimRef = doc(collection(db, 'claims'));
    const newClaim: Omit<Claim, 'id'> = {
      userId: user.uid,
      policyId,
      status: 'pending',
      description,
      evidenceUrls: [],
      timestamp: Timestamp.now(),
    };

    try {
      await setDoc(claimRef, newClaim);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'claims');
    }
  };

  const handlePerformKYC = async (idNumber: string) => {
    if (!user) return;
    try {
      // Simulate KYC update
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { kycVerified: true, idNumber }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/kyc');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const analysis = await analyzeDocument(base64, file.type);
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: `[Uploaded Document: ${file.name}]` }] },
        { role: 'model', parts: [{ text: analysis }] },
      ]);

      return analysis;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleDeposit = async (amount: number, method: 'momo' | 'ecobank') => {
    if (!user) return;
    const txRef = doc(collection(db, 'transactions'));
    const newTx: Omit<Transaction, 'id'> = {
      userId: user.uid,
      amount,
      type: 'deposit',
      status: 'completed',
      method,
      timestamp: Timestamp.now(),
      description: `Wallet Top-up via ${method === 'momo' ? 'MoMo' : 'Eco Bank'}`,
    };

    try {
      await setDoc(txRef, newTx);
      // Update balance in user doc
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { walletBalance: balance + amount }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions/users');
    }
  };

  const handleWithdraw = async (amount: number, method: 'momo' | 'ecobank') => {
    if (!user || balance < amount) return;
    const txRef = doc(collection(db, 'transactions'));
    const newTx: Omit<Transaction, 'id'> = {
      userId: user.uid,
      amount,
      type: 'withdrawal',
      status: 'completed',
      method,
      timestamp: Timestamp.now(),
      description: `Withdrawal to ${method === 'momo' ? 'MoMo' : 'Eco Bank'}`,
    };

    try {
      await setDoc(txRef, newTx);
      // Update balance in user doc
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { walletBalance: balance - amount }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions/users');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#005696] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Securing FINCA Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
      >
        <div className="h-full">
          {activeTab === 'chat' && (
            <Chat onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
          )}
          {activeTab === 'wallet' && (
            <Wallet 
              balance={balance} 
              transactions={transactions} 
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          )}
          {activeTab === 'products' && (
            <Products />
          )}
          {activeTab === 'policies' && (
            <MyPolicies policies={policies} />
          )}
          {activeTab === 'business' && (
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center">
              <h2 className="text-2xl font-black text-slate-800 mb-4">Business Asset Protection</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                FINCA Uganda is ready to secure your commercial assets. 
                For fleets, group accounts, or large-scale business operations, please schedule a session with our lead consultant.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#005696] rounded-full text-xs font-bold border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-[#005696] animate-pulse" />
                Strategic Financial Autonomy
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
}
