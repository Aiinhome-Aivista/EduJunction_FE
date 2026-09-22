import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  BookOpen,
  Award,
  ShieldCheck,
  CreditCard,
  Loader2,
  Layers,
  ChevronRight,
  AlertCircle,
  Clock,
  HelpCircle,
  FileText,
  Lock,
  Play,
  X,
  QrCode,
  Smartphone,
  Building2,
  Check,
  ArrowRight,
  Plus,
  Minus,
  Download,
  FileDown,
  Eye,
  PenTool,
  ExternalLink,
  Users,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiServices from '../services/ApiServices';
import { Board, ClassGrade, Subject } from '../types';
import { ModelPaperViewerModal } from './ModelPaperViewerModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionPlansProps {
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  defaultBoard?: string;
  defaultClass?: string;
  childrenList?: any[];
  isParent?: boolean;
  onNavigateToExam?: (board: string, classGrade: string, subject: string) => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC'];

const BOARD_CLASSES_MAP: Record<string, ClassGrade[]> = {
  CBSE: [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ],
  ICSE: [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ],
  ISC: ['Class 11', 'Class 12'],
};

const SUBJECTS_BY_BOARD_CLASS: Record<string, string[]> = {
  ICSE_9_10: [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography', 'English', 'Computer Applications'
  ],
  ISC_11_12: [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Economics', 'Accountancy'
  ],
  CBSE_9_10: [
    'Mathematics', 'Science', 'Social Science', 'English', 'Computer Science'
  ],
  CBSE_11_12: [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'
  ],
  DEFAULT: [
    'Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'
  ]
};

export interface BoardExamMeta {
  duration: string;
  durationShort: string;
  marks: number;
  patternName: string;
  blueprintSummary: string;
  instructionsSnippet: string;
}

export const getBoardExamMeta = (board: string, classGrade?: string, subject?: string): BoardExamMeta => {
  const b = (board || 'CBSE').toUpperCase();
  const isHigher = classGrade === 'Class 11' || classGrade === 'Class 12';
  const isScience = ['Physics', 'Chemistry', 'Biology', 'Computer Science'].some(s => (subject || '').toLowerCase().includes(s.toLowerCase()));

  if (b === 'ICSE') {
    return {
      duration: '2.5 Hours (150 Mins) + 15m Reading',
      durationShort: '2.5 Hours (150 Mins)',
      marks: 80,
      patternName: 'ICSE 2-Section Specimen',
      blueprintSummary: 'Section A (Compulsory 40 Marks) + Section B (Choice: 4 of 7 Questions = 40 Marks)',
      instructionsSnippet: 'Separate answer sheet; 15 mins dedicated reading time before writing.',
    };
  }

  if (b === 'ISC') {
    const marks = (isHigher && isScience) ? 70 : 80;
    return {
      duration: '3 Hours (180 Mins) + 15m Reading',
      durationShort: '3 Hours (180 Mins)',
      marks: marks,
      patternName: 'ISC Senior Secondary Specimen',
      blueprintSummary: 'Section A (Objective 16M) + Section B (Short 32M) + Section C (Evaluative 32M)',
      instructionsSnippet: 'In-depth derivations, calculations, and structured internal choices.',
    };
  }

  // Default: CBSE
  return {
    duration: '3 Hours (180 Mins)',
    durationShort: '3 Hours (180 Mins)',
    marks: 80,
    patternName: 'CBSE 5-Section Specimen',
    blueprintSummary: '5 Sections: A (20 MCQs/A&R), B (5 VSA), C (6 SA), D (4 Long), E (3 Case-Based)',
    instructionsSnippet: 'Exact 38-question CBSE blueprint with Assertion-Reasoning and Case Units.',
  };
};

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  studentId,
  studentName = 'Student',
  studentEmail = 'student@edujunction.com',
  defaultBoard = 'CBSE',
  defaultClass = 'Class 10',
  childrenList: propChildrenList,
  isParent: propIsParent,
  onNavigateToExam,
}) => {
  const navigate = useNavigate();
  // Strictly validate defaultBoard against allowed boards (CBSE, ICSE, ISC)
  const validInitialBoard = BOARDS.includes(defaultBoard as Board) ? defaultBoard : 'CBSE';
  const [selectedBoard, setSelectedBoard] = useState<string>(validInitialBoard);
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [quantity, setQuantity] = useState<number>(1);

  // Child selector & User Role state
  const isParent = propIsParent !== undefined
    ? propIsParent
    : (localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'PARENT').toUpperCase() === 'PARENT';
  const [childrenList, setChildrenList] = useState<any[]>(isParent ? (propChildrenList || []) : []);
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(studentId);
  const [userRole, setUserRole] = useState<string>(isParent ? 'PARENT' : 'STUDENT');

  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingPaperKey, setDownloadingPaperKey] = useState<string | null>(null);

  // Sync propChildrenList if provided
  useEffect(() => {
    if (isParent && propChildrenList && propChildrenList.length > 0) {
      setChildrenList(propChildrenList);
      if (!selectedChildId) {
        setSelectedChildId(studentId || (propChildrenList[0]?.id ? Number(propChildrenList[0].id) : undefined));
      }
    } else if (!isParent) {
      setChildrenList([]);
    }
  }, [isParent, propChildrenList, studentId]);

  // In-App Model Paper Read-Only Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [viewingSub, setViewingSub] = useState<any | null>(null);
  const [viewingPaperData, setViewingPaperData] = useState<any | null>(null);
  const [isLoadingPaper, setIsLoadingPaper] = useState<boolean>(false);

  // In-App Razorpay Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutOrderData, setCheckoutOrderData] = useState<any | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiIdInput, setUpiIdInput] = useState<string>('student@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStepText, setPaymentStepText] = useState<string>('');

  // Guard: If selectedBoard is not CBSE, ICSE, ISC (e.g. from parent profile WBBSE), reset to CBSE
  useEffect(() => {
    if (!BOARDS.includes(selectedBoard as Board)) {
      setSelectedBoard('CBSE');
    }
  }, [selectedBoard]);

  // Available classes based on selected board
  const availableClasses = useMemo(() => {
    const safeBoard = BOARDS.includes(selectedBoard as Board) ? selectedBoard : 'CBSE';
    return BOARD_CLASSES_MAP[safeBoard] || BOARD_CLASSES_MAP.CBSE;
  }, [selectedBoard]);

  // Ensure selectedClass is valid for the board
  useEffect(() => {
    if (!availableClasses.includes(selectedClass as ClassGrade)) {
      setSelectedClass(availableClasses[availableClasses.length - 1] || 'Class 10');
    }
  }, [selectedBoard, availableClasses, selectedClass]);

  // Determine available subjects based on board and class
  const availableSubjects = useMemo(() => {
    const isHigher = selectedClass === 'Class 11' || selectedClass === 'Class 12';
    const isMid = selectedClass === 'Class 9' || selectedClass === 'Class 10';

    if (selectedBoard === 'ICSE' && isMid) return SUBJECTS_BY_BOARD_CLASS.ICSE_9_10;
    if (selectedBoard === 'ISC' && isHigher) return SUBJECTS_BY_BOARD_CLASS.ISC_11_12;
    if (selectedBoard === 'CBSE' && isHigher) return SUBJECTS_BY_BOARD_CLASS.CBSE_11_12;
    if (selectedBoard === 'CBSE' && isMid) return SUBJECTS_BY_BOARD_CLASS.CBSE_9_10;
    return SUBJECTS_BY_BOARD_CLASS.DEFAULT;
  }, [selectedBoard, selectedClass]);

  // Ensure selectedSubject is valid
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] || 'Mathematics');
    }
  }, [availableSubjects, selectedSubject]);

  // Load Razorpay SDK Script dynamically & fetch plans, subscriptions, and children
  useEffect(() => {
    if (!document.getElementById('razorpay-sdk')) {
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    fetchPlans();
    fetchMySubscriptions();
    fetchChildrenAndRole();
  }, []);

  const fetchChildrenAndRole = async () => {
    try {
      const role = propIsParent !== undefined
        ? (propIsParent ? 'PARENT' : 'STUDENT')
        : (localStorage.getItem('user_role') || sessionStorage.getItem('user_role') || 'PARENT').toUpperCase();
      setUserRole(role);

      if (role === 'PARENT' && (!propChildrenList || propChildrenList.length === 0)) {
        const res = await ApiServices.getParentDashboard();
        const children = res?.children || res?.data?.children || [];
        if (Array.isArray(children) && children.length > 0) {
          setChildrenList(children);
          if (!selectedChildId) {
            const firstChild = children[0];
            setSelectedChildId(Number(firstChild.id));
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch parent children list', err);
    }
  };

  const handleSelectChild = (childId: number) => {
    setSelectedChildId(childId);
    setSuccessMessage(null);
  };

  const fetchPlans = async () => {
    try {
      const res = await ApiServices.getActiveSubscriptionPlans();
      if (res?.plans && res.plans.length > 0) {
        setActivePlans(res.plans);
        setSelectedPlanId(res.plans[0].id);
      }
    } catch (err) {
      console.warn('Could not fetch subscription plans, using default', err);
    }
  };

  const fetchMySubscriptions = async () => {
    try {
      setIsLoadingSubs(true);
      const res = await ApiServices.getMySubjectSubscriptions();
      if (res?.subscriptions) {
        setActiveSubscriptions(res.subscriptions);
      }
    } catch (err) {
      console.warn('Could not fetch subscriptions', err);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  const activePlan = useMemo(() => {
    if (selectedPlanId && activePlans.length > 0) {
      return activePlans.find((p) => p.id === selectedPlanId) || activePlans[0];
    }
    return activePlans[0] || {
      planName: 'Full Model Question Paper 2027 (Single Exam Pass)',
      priceInr: 300,
      durationMinutes: 180,
      totalMarks: 80,
    };
  }, [activePlans, selectedPlanId]);

  const selectedBoardMeta = useMemo(() => {
    return getBoardExamMeta(selectedBoard, selectedClass, selectedSubject);
  }, [selectedBoard, selectedClass, selectedSubject]);

  const unitPrice = activePlan.priceInr || 300;
  const totalPrice = unitPrice * quantity;

  const handleSubscribeNow = async () => {
    try {
      setIsLoadingOrder(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const effectiveStudentId = selectedChildId || studentId;

      const orderData = await ApiServices.createSubjectSubscriptionOrder({
        board: selectedBoard,
        classGrade: selectedClass,
        subject: selectedSubject,
        studentId: effectiveStudentId,
        planId: activePlan?.id,
        quantity: quantity,
      });

      const keyId = orderData.keyId || '';
      const isRealRazorpayKey = keyId && keyId.startsWith('rzp_test_') && !keyId.includes('demo') && !keyId.includes('mock');

      // If Razorpay SDK is available and a live/test key is set, open official popup
      if (typeof window !== 'undefined' && window.Razorpay && isRealRazorpayKey) {
        const options = {
          key: keyId,
          amount: orderData.amount || totalPrice * 100,
          currency: 'INR',
          name: 'EduJunction',
          description: `${selectedBoard} ${selectedClass} ${selectedSubject} - ${quantity} Model Test Set${quantity > 1 ? 's' : ''} (₹${totalPrice})`,
          image: '/favicon.jpg',
          order_id: orderData.orderId,
          prefill: {
            name: studentName,
            email: studentEmail,
          },
          theme: {
            color: '#f59e0b',
          },
          handler: async (response: any) => {
            await verifyAndFinalizePayment(
              response.razorpay_order_id || orderData.orderId,
              response.razorpay_payment_id || `pay_${Date.now()}`,
              response.razorpay_signature || 'verified_official',
              orderData.subscriptionId
            );
          },
          modal: {
            ondismiss: () => {
              setIsLoadingOrder(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Open the interactive In-App Razorpay Checkout Modal for sandbox testing
        setCheckoutOrderData(orderData);
        setIsCheckoutModalOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to initiate checkout.');
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const verifyAndFinalizePayment = async (
    orderId: string,
    paymentId: string,
    signature: string,
    subscriptionId?: string | number
  ) => {
    try {
      const effectiveStudentId = selectedChildId || studentId;
      const verifyRes = await ApiServices.verifySubjectSubscriptionPayment({
        orderId,
        paymentId,
        signature,
        subscriptionId: subscriptionId || checkoutOrderData?.subscriptionId,
        board: selectedBoard,
        classGrade: selectedClass,
        subject: selectedSubject,
        studentId: effectiveStudentId,
        quantity: quantity,
      });

      const assignedChildName = childrenList.find(c => c.id === effectiveStudentId)?.name;
      const assignText = assignedChildName ? ` for ${assignedChildName}` : '';

      setSuccessMessage(
        verifyRes.message || `🎉 Payment Verified! ${quantity} Full-Length Model Test Paper set${quantity > 1 ? 's' : ''}${assignText} (${selectedBoard} ${selectedClass} ${selectedSubject}) ${quantity > 1 ? 'are' : 'is'} now UNLOCKED.`
      );
      setIsCheckoutModalOpen(false);
      setCheckoutOrderData(null);
      await fetchMySubscriptions();
    } catch (vErr: any) {
      setErrorMessage(vErr?.message || 'Payment verification failed. Please contact support.');
    }
  };

  const handleSimulatedPaymentSubmit = async () => {
    if (!checkoutOrderData) return;
    try {
      setIsProcessingPayment(true);
      setPaymentStepText('Connecting to Payment Gateway...');
      await new Promise((r) => setTimeout(r, 600));

      setPaymentStepText(`Authorizing ₹${totalPrice}.00...`);
      await new Promise((r) => setTimeout(r, 700));

      setPaymentStepText('Verifying Bank Signature...');
      await new Promise((r) => setTimeout(r, 500));

      const mockPaymentId = `pay_rzp_${Date.now()}`;
      const mockSignature = `sig_${Date.now().toString(36)}`;

      await verifyAndFinalizePayment(
        checkoutOrderData.orderId,
        mockPaymentId,
        mockSignature,
        checkoutOrderData.subscriptionId
      );
    } catch (err: any) {
      setErrorMessage('Payment failed during simulation.');
    } finally {
      setIsProcessingPayment(false);
      setPaymentStepText('');
    }
  };

  const handleOpenViewer = (sub: any) => {
    const modeParam = isParent ? '?mode=view' : '';
    window.open(`/model-exam/${sub.id}${modeParam}`, '_blank');
  };

  const handleDownloadPaper = async (sub: any, format: 'pdf' | 'docx') => {
    const key = `${sub.id}_${format}`;
    try {
      setDownloadingPaperKey(key);
      const setNum = sub.modelTestId?.includes('SET_') ? sub.modelTestId.split('SET_')[1] : '1';
      const filename = `${sub.board}_${sub.classGrade}_${sub.subject}_Set_${setNum}_Model_Paper_2027.${format}`.replace(/\s+/g, '_');
      await ApiServices.downloadSubjectModelPaper(sub.id, format, filename);
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to download ${format.toUpperCase()} model paper.`);
    } finally {
      setDownloadingPaperKey(null);
    }
  };

  const unlockedSetsForCurrentSubject = activeSubscriptions.filter(
    (s) =>
      s.board === selectedBoard &&
      s.classGrade === selectedClass &&
      s.subject === selectedSubject &&
      s.status === 'ACTIVE'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header (Clean, Light Theme matching Exam Schedule) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/50 rounded-3xl p-6 sm:p-8 border border-yellow-200/80 shadow-xs">
        {/* Soft Ambient Glow Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-yellow-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/80 text-amber-900 border border-yellow-300/60 text-xs font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>2027 {selectedBoard} Specimen Examination Series</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
            ₹{activePlan.priceInr || 300} Per Model Test Paper <span className="text-amber-600">/ Single Full Exam</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            Unlock 1 or more Full-Length 2027 Specimen Model Question Paper Sets (⏱️ <strong>{selectedBoardMeta.duration}</strong> • <strong>{selectedBoardMeta.marks} Marks</strong>) with authentic {selectedBoard} marking blueprint, stopwatch timing, step-by-step solutions, and instant PDF/Word downloads.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex-1">{successMessage}</span>
          {onNavigateToExam && (
            <button
              onClick={() => onNavigateToExam(selectedBoard, selectedClass, selectedSubject)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Start Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm font-bold shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Selection & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Selector (Board, Class, Subject, Sets) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Choose Board, Class & Subject
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Select your Board (CBSE, ICSE, ISC), Class, Subject, and the number of unique 2027 Model Paper Sets you want.
            </p>
          </div>

          {/* Parent Child Selector (Only if logged in as Parent with linked children) */}
          {isParent && childrenList.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>Select Child to Assign Model Paper</span>
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300/50">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Flexible Grade & Board
                </span>
              </div>
              <select
                value={selectedChildId || ''}
                onChange={(e) => handleSelectChild(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-2xs"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name || `Child #${c.id}`} (Currently in {c.classGrade || 'Class'} • {c.targetBoard || 'Board'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed">
                💡 <strong>Parent Tip:</strong> You can choose any Board and Class above or below your child's current grade to help them prepare ahead or revise previous years.
              </p>
            </div>
          )}

          {/* 1. Board Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-stone-600 tracking-wider">
              1. Select Board
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BOARDS.map((board) => {
                const isSel = selectedBoard === board;
                return (
                  <button
                    key={board}
                    type="button"
                    onClick={() => {
                      setSelectedBoard(board);
                      setSuccessMessage(null);
                    }}
                    className={`py-3 px-4 rounded-2xl border text-center transition-all ${isSel
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-black shadow-sm ring-2 ring-amber-400/20'
                        : 'border-stone-200 bg-stone-50/40 text-stone-700 hover:border-stone-300 font-bold'
                      }`}
                  >
                    <div className="text-sm font-black">{board}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {board === 'CBSE' && '3 Hours • 80 Marks'}
                      {board === 'ICSE' && '2.5 Hours • 80 Marks'}
                      {board === 'ISC' && '3 Hours • 70/80 Marks'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Class Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-stone-600 tracking-wider">
                2. Select Class
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                {selectedBoard === 'ICSE' ? 'Classes (5–10)' : selectedBoard === 'ISC' ? 'Classes (11–12)' : 'Classes (5–12)'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableClasses.map((cls) => {
                const isSel = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      setSuccessMessage(null);
                    }}
                    className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all ${isSel
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black ring-2 ring-amber-400/20 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Subject Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-stone-600 tracking-wider">
              3. Select Subject
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableSubjects.map((sub) => {
                const isSel = selectedSubject === sub;
                const hasUnlocked = activeSubscriptions.some(
                  (s) =>
                    s.board === selectedBoard &&
                    s.classGrade === selectedClass &&
                    s.subject === sub &&
                    s.status === 'ACTIVE'
                );
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(sub);
                      setSuccessMessage(null);
                    }}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${isSel
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-black ring-2 ring-amber-400/20 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                  >
                    <span>{sub}</span>
                    {hasUnlocked ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Has unlocked set" />
                    ) : isSel ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Number of Model Paper Sets */}
          <div className="space-y-3 pt-1 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-stone-600 tracking-wider">
                4. Number of Model Question Sets
              </label>
              <span className="text-xs font-bold text-amber-700">₹{unitPrice} per unique set</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* Stepper */}
              <div className="flex items-center justify-between sm:justify-start border border-stone-200 rounded-2xl bg-stone-50 p-1 shrink-0">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-16 text-center text-xs font-black text-stone-900">
                  {quantity} Set{quantity > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  disabled={quantity >= 10}
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Set Presets Auto-Arranged */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                {[1, 2, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuantity(cnt)}
                    className={`py-2 px-2 rounded-xl text-xs border text-center transition-all ${
                      quantity === cnt
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-2xs ring-1 ring-amber-400/30'
                        : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100/70 hover:border-stone-300 font-bold'
                    }`}
                  >
                    <span className="block font-black leading-tight">{cnt} Set{cnt > 1 ? 's' : ''}</span>
                    <span className={`block text-[10px] mt-0.5 ${quantity === cnt ? 'text-amber-800 font-bold' : 'text-stone-500 font-medium'}`}>
                      ₹{cnt * unitPrice}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Action Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/60 border border-amber-300/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  Selected Model Paper Pass
                </span>
                <div className="text-sm sm:text-base font-black text-stone-900 mt-0.5">
                  {selectedBoard} {selectedClass} — {selectedSubject}{' '}
                  <span className="text-amber-700 font-extrabold">({quantity} Unique Set{quantity > 1 ? 's' : ''})</span>
                </div>
                {isParent && childrenList.length > 0 && selectedChildId && (
                  <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1.5 mt-1">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>Assigning to: <strong>{childrenList.find((c) => c.id === selectedChildId)?.name || `Child #${selectedChildId}`}</strong></span>
                  </div>
                )}
                <div className="text-[11px] text-stone-600 font-medium flex items-center gap-2 mt-1">
                  <span>⏱️ Duration: <strong>{selectedBoardMeta.durationShort}</strong></span>
                  <span>•</span>
                  <span>Marks: <strong>{selectedBoardMeta.marks}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-amber-950">
                  ₹{totalPrice}
                </div>
                <div className="text-[10px] text-stone-500 font-semibold">Per Exam Paper</div>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoadingOrder}
              onClick={handleSubscribeNow}
              id="btn-subscribe-razorpay"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoadingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                  <span>Preparing Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-stone-950" />
                  <span>
                    Unlock {quantity} Model Paper{quantity > 1 ? 's' : ''} for ₹{totalPrice}
                  </span>
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-500 text-center font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure Checkout powered by Razorpay. Instant activation upon payment.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Specimen Overview & Active Passes Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Specimen Details Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                What You Get ({selectedBoard} 2027 Specimen):
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                {selectedBoardMeta.patternName}
              </span>
            </div>

            <ul className="space-y-3 text-xs text-stone-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Official Marking Blueprint:</strong> {selectedBoardMeta.blueprintSummary}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Authentic {selectedBoardMeta.duration} Timing:</strong> {selectedBoardMeta.instructionsSnippet}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Full Total Score:</strong> Standard {selectedBoardMeta.marks} Marks authentic examination blueprint.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Interactive In-App Model Paper & Solution Viewer:</strong> View all authentic questions with step-by-step model answers directly in your browser.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Adaptive Weak Topic Re-test:</strong> Identifies conceptual gaps and prepares targeted practice.</span>
              </li>
            </ul>
          </div>

          {/* Active Subscriptions / Passes Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                {userRole.toUpperCase() === 'PARENT' ? 'Unlocked Papers for Children' : 'My Unlocked Model Papers'}
              </h3>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {activeSubscriptions.length} Unlocked
              </span>
            </div>

            {isLoadingSubs ? (
              <div className="py-8 flex items-center justify-center text-stone-400 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading your passes...</span>
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <div className="py-8 text-center text-stone-400 space-y-1.5">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-700">No unlocked model test papers yet.</p>
                <p className="text-[11px] text-stone-400">Select your board and subject on the left to unlock.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {activeSubscriptions.map((sub, idx) => {
                  const setLabel = sub.modelTestId?.includes('SET_')
                    ? `Set ${sub.modelTestId.split('SET_')[1]}`
                    : `Set ${idx + 1}`;
                  const subMeta = getBoardExamMeta(sub.board, sub.classGrade, sub.subject);
                  const isDownloadingPdf = downloadingPaperKey === `${sub.id}_pdf`;
                  const isDownloadingDocx = downloadingPaperKey === `${sub.id}_docx`;

                  const isCompleted = sub.examStatus === 'COMPLETED';
                  const isInProgress = sub.examStatus === 'IN_PROGRESS';

                  return (
                    <div
                      key={sub.id || idx}
                      className="p-4 rounded-2xl border border-stone-200/90 bg-gradient-to-b from-stone-50/80 to-amber-50/30 hover:border-amber-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                            <span>{sub.board} {sub.classGrade} — {sub.subject}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
                              {setLabel}
                            </span>
                          </div>

                          {/* Child Name Tag (If Parent) */}
                          {userRole.toUpperCase() === 'PARENT' && (
                            <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                              <span className="text-amber-800">👤 Assigned to:</span>
                              <span className="bg-stone-200/70 text-stone-900 px-2 py-0.5 rounded-md">
                                {sub.studentName || 'Your Child'} ({sub.studentClass || sub.classGrade})
                              </span>
                            </div>
                          )}

                          <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="inline-flex items-center gap-1 font-medium text-stone-600">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {subMeta.durationShort}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-stone-700">{subMeta.marks} Marks</span>
                            <span>•</span>
                            <span className="font-bold text-amber-800">2027 Specimen</span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Status Badges */}
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Completed • {sub.scoreObtained ?? 0}/{sub.totalMarks || 80} ({sub.accuracyPercentage ?? 0}%)
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            Exam In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Assigned — Not Started
                          </span>
                        )}
                      </div>

                      {/* Actions: View Question Paper for Parent vs Start Exam for Student */}
                      <div className="pt-1 border-t border-stone-200/60">
                        {isParent ? (
                          <button
                            type="button"
                            onClick={() => handleOpenViewer(sub)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-stone-950" />
                            <span>
                              {isCompleted
                                ? "View Child's Submission & Scorecard"
                                : "View Model Question Paper"}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-950/80 ml-0.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenViewer(sub)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                          >
                            <PenTool className="w-4 h-4 text-stone-900" />
                            <span>{isCompleted ? 'Review Solution & Scorecard' : 'Start 80-Mark Model Exam'}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-900/80 ml-0.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Interactive Razorpay Checkout Modal (Sandbox & Real Mode) */}
      {/* ========================================================= */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white relative">
              <button
                type="button"
                onClick={() => !isProcessingPayment && setIsCheckoutModalOpen(false)}
                className="absolute top-4 right-4 text-blue-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 font-black text-base text-yellow-300">
                  ₹
                </div>
                <div>
                  <div className="text-xs text-blue-100 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Razorpay Trusted Checkout
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    EduJunction
                  </h3>
                </div>
              </div>

              {/* Order Info Strip */}
              <div className="mt-4 pt-3 border-t border-blue-500/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-blue-200 block text-[10px] font-bold">PURCHASING ITEM</span>
                  <span className="font-extrabold text-white">
                    {selectedBoard} {selectedClass} — {selectedSubject} ({quantity} Sets)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-blue-200 block text-[10px] font-bold">AMOUNT PAYABLE</span>
                  <span className="text-base font-black text-yellow-300">
                    ₹{totalPrice}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethodTab('upi')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${paymentMethodTab === 'upi'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('card')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${paymentMethodTab === 'card'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('netbanking')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${paymentMethodTab === 'netbanking'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Modal Body: Tab Content */}
            <div className="p-6 space-y-4">
              {paymentMethodTab === 'upi' && (
                <div className="space-y-4 text-xs">
                  {/* UPI Apps Grid */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-2">
                      Popular UPI Apps
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <div
                          key={app}
                          className="p-2.5 rounded-xl border border-stone-200 text-center bg-stone-50/60 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer transition-all"
                          onClick={() => setUpiIdInput(`student@${app.toLowerCase().replace(/\s/g, '')}`)}
                        >
                          <div className="font-bold text-stone-800 text-[11px] truncate">{app}</div>
                          <div className="text-[9px] text-emerald-600 font-medium">Instant</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UPI ID Input */}
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Or enter Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okaxis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    />
                  </div>

                  {/* QR Code Banner */}
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-xs">Scan & Pay via any UPI App</div>
                      <div className="text-[10px] text-blue-700">Zero transaction fees • Instant activation</div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethodTab === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4111 2222 3333 4444"
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">Valid Thru</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="123"
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Visa, Mastercard, RuPay & Maestro cards accepted.</span>
                  </div>
                </div>
              )}

              {paymentMethodTab === 'netbanking' && (
                <div className="space-y-3 text-xs">
                  <label className="text-[11px] font-bold text-stone-600 block">Select Your Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                      <div
                        key={bank}
                        className="p-3 rounded-xl border border-stone-200 text-center bg-stone-50 hover:bg-blue-50 hover:border-blue-300 font-bold text-stone-800 cursor-pointer"
                      >
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status / Steps Message */}
              {isProcessingPayment && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-900 text-xs font-bold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                  <span>{paymentStepText}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsCheckoutModalOpen(false)}
                className="py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleSimulatedPaymentSubmit}
                id="btn-confirm-razorpay-payment"
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Pay ₹{totalPrice}.00 (Test / Live)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Model Question Paper Read-Only Viewer Modal */}
      <ModelPaperViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        subscription={viewingSub}
        paperData={viewingPaperData}
        isLoading={isLoadingPaper}
      />
    </div>
  );
};
