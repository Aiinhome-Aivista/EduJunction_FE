import React, { useState, useEffect } from 'react';
import { ChildAccount, BOARD_CLASSES_MAP } from '../types';
import ApiServices from '../services/ApiServices';
import { Plus, User, Loader2, ChevronDown, Search, Eye, EyeOff, X } from 'lucide-react';

interface MasterOption {
  id: number;
  name: string;
  description?: string;
}

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (childData: {
    name: string;
    username: string;
    avatar?: string;
    classGrade: string;
    targetBoard: string;
    schoolName?: string;
    schoolEmail?: string;
    password?: string;
  }) => void | Promise<void>;
  parentEmail?: string;
}

const AVATARS = ['👦', '👧', '🧑‍🎓', '🚀', '🌟', '📚', '⚡', '🎯'];

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm flex justify-between items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed bg-stone-50' : 'bg-white'} ${hasError ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
      >
        <span className={selectedOption ? 'text-stone-900' : 'text-stone-500'}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-stone-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-yellow-400"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-stone-500 text-center">No results found</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.value ? 'bg-yellow-50 text-yellow-900 font-medium' : 'hover:bg-stone-50 text-stone-700'}`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAddChild,
  parentEmail,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('👦');
  const [classGrade, setClassGrade] = useState<string>('');
  const [targetBoard, setTargetBoard] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [boards, setBoards] = useState<MasterOption[]>([]);
  const [classes, setClasses] = useState<MasterOption[]>([]);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP as any);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);

  // Fetch Master Data directly from Database on Modal Open
  useEffect(() => {
    if (!isOpen) return;

    // Reset form fields on open to ensure no sticky autofill
    setName('');
    setUsername('');
    setSchoolName('');
    setSchoolEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});

    let isMounted = true;
    setIsLoadingMasters(true);

    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedBoards: MasterOption[] = res?.boards || res?.data?.boards || [];
        const fetchedClasses: MasterOption[] = res?.classes || res?.classGrades || res?.data?.classes || res?.data?.classGrades || [];
        const fetchedMap = res?.boardClassesMap || res?.data?.boardClassesMap || BOARD_CLASSES_MAP;

        setBoards(fetchedBoards);
        if (fetchedMap) {
          setBoardClassesMap(fetchedMap);
        }
        if (fetchedBoards.length > 0) {
          setTargetBoard((prev) => {
            const exists = fetchedBoards.some((b) => b.name === prev);
            return exists && prev ? prev : '';
          });
        } else {
          setTargetBoard('');
        }

        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0) {
          setClassGrade((prev) => {
            const exists = fetchedClasses.some((c) => c.name === prev);
            return exists && prev ? prev : '';
          });
        } else {
          setClassGrade('');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch master data from database:', err);
        if (isMounted) {
          setBoards([]);
          setClasses([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingMasters(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      newErrors.username = "Username is required";
    } else if (trimmedUsername.includes('.')) {
      newErrors.username = "Username cannot contain dots ('.')";
    } else if (trimmedUsername.includes(' ')) {
      newErrors.username = "Username cannot contain spaces";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      newErrors.username = "Username must be between 3 and 30 characters";
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]$/.test(trimmedUsername)) {
      newErrors.username = "Username can only contain letters, numbers, underscores and hyphens";
    }

    if (schoolEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail.trim())) {
      newErrors.schoolEmail = "Please enter a valid school email address";
    }

    if (!targetBoard) newErrors.targetBoard = "Curriculum board is required";
    if (!classGrade) newErrors.classGrade = "Class/grade is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onAddChild({
        name: name.trim(),
        username: trimmedUsername,
        avatar,
        classGrade,
        targetBoard,
        schoolName: schoolName.trim() || undefined,
        schoolEmail: schoolEmail.trim() || undefined,
        password: password.trim(),
      });

      // Reset & close only on success
      setName('');
      setUsername('');
      setSchoolName('');
      setSchoolEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to add child:', err);
      const msg = err?.message || 'Something went wrong. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter classes based on selected board
  const allowedClassNames = targetBoard
    ? (boardClassesMap?.[targetBoard] || (BOARD_CLASSES_MAP as any)[targetBoard] || null)
    : null;

  const availableClasses = allowedClassNames
    ? classes.filter(c => allowedClassNames.includes(c.name))
    : classes;

  const handleBoardChange = (newBoard: string) => {
    setTargetBoard(newBoard);
    if (errors.targetBoard) setErrors({ ...errors, targetBoard: '' });

    const allowed = (boardClassesMap && boardClassesMap[newBoard]) || (BOARD_CLASSES_MAP as any)[newBoard];
    if (allowed && classGrade && !allowed.includes(classGrade)) {
      setClassGrade('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Create Child Sub-Account</h3>
            <p className="text-xs text-stone-500 mt-0.5">Each child gets their unique username and password to log in and take exams independently</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.general && (
          <div className="p-3 mb-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate autoComplete="off">
          {/* Prevent browser credential managers from autofilling parent login info */}
          <input type="text" name="prevent_autofill_username" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />
          <input type="password" name="prevent_autofill_password" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

          {/* Row 1: Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Child / Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Aarav Sharma"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Create Username (for Student Login) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
                placeholder="e.g. Aarav_2026"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.username ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
              />
              {errors.username ? (
                <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.username}</p>
              ) : (
                <p className="text-[10px] text-stone-400 mt-1 font-medium">No dots (.), no spaces. Child will use this to log in.</p>
              )}
            </div>
          </div>

          {/* Row 2: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Create Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.password ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.confirmPassword ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-0.5"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Row 3: Target Board & Class / Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Curriculum Board <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={targetBoard}
                onChange={handleBoardChange}
                placeholder="Please Select"
                disabled={isLoadingMasters || boards.length === 0}
                options={boards.map(b => ({ value: b.name, label: b.name }))}
                hasError={!!errors.targetBoard}
              />
              {errors.targetBoard && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.targetBoard}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Class / Grade <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={classGrade}
                onChange={(value) => {
                  setClassGrade(value);
                  if (errors.classGrade) setErrors({ ...errors, classGrade: '' });
                }}
                placeholder={!targetBoard ? "Select Board First" : "Please Select"}
                disabled={isLoadingMasters || !targetBoard || availableClasses.length === 0}
                options={availableClasses.map(g => ({ value: g.name, label: g.name }))}
                hasError={!!errors.classGrade}
              />
              {errors.classGrade && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.classGrade}</p>}
            </div>
          </div>

          {/* Row 4: School Name & School Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">School Name (Optional)</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Delhi Public School"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">School Email (Optional)</label>
              <input
                type="email"
                value={schoolEmail}
                onChange={(e) => {
                  setSchoolEmail(e.target.value);
                  if (errors.schoolEmail) setErrors({ ...errors, schoolEmail: '' });
                }}
                placeholder="e.g. principal@dpsdelhi.edu.in"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden ${errors.schoolEmail ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
              />
              {errors.schoolEmail && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.schoolEmail}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-stone-100 flex-shrink-0 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border-2 border-yellow-400 text-xs font-bold text-stone-700 hover:bg-yellow-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-yellow-400 border-2 border-yellow-500 text-stone-900 text-xs font-bold hover:bg-yellow-500 shadow-xs transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Child Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
