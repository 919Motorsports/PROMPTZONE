
import React, { useState, useCallback, useEffect } from 'react';
import { Prompt, ProfilesData } from './types';
import PromptInput from './components/PromptInput';
import PromptVaultDisplay from './components/PromptVaultDisplay';
import ProfileManager from './components/ProfileManager';
import LogoutIcon from './components/icons/LogoutIcon';
import ImageUploadIcon from './components/icons/ImageUploadIcon';
import XCircleIcon from './components/icons/XCircleIcon';


const PROFILES_KEY = 'promptVaultProfiles';
const LEGACY_PROMPTS_KEY = 'promptVaultPrompts';
const PREDEFINED_CATEGORIES = ["Design", "Social Media Strategy", "Content Creation"];

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'vault'>('home');
  const [mainCategory, setMainCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [promptInstructions, setPromptInstructions] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [profilesData, setProfilesData] = useState<ProfilesData>({ currentUser: null, profiles: {} });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem(PROFILES_KEY);
      if (storedData) {
        setProfilesData(JSON.parse(storedData));
      } else {
        const legacyData = window.localStorage.getItem(LEGACY_PROMPTS_KEY);
        if (legacyData) {
          const legacyPrompts: Prompt[] = JSON.parse(legacyData);
          if (legacyPrompts.length > 0) {
            const migratedData: ProfilesData = {
              currentUser: 'Default Profile',
              profiles: {
                'Default Profile': { prompts: legacyPrompts },
              },
            };
            setProfilesData(migratedData);
            window.localStorage.setItem(PROFILES_KEY, JSON.stringify(migratedData));
            window.localStorage.removeItem(LEGACY_PROMPTS_KEY);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setError("Could not load your profile data.");
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profilesData));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
        setError("Could not save your profile data.");
      }
    }
  }, [profilesData, isLoaded]);

  const handleClearForm = () => {
    setMainCategory('');
    setCustomCategory('');
    setSubCategory('');
    setPromptInstructions('');
    setReferenceImage(null);
    setError(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleSavePrompt = useCallback(async () => {
    const { currentUser } = profilesData;
    const finalMainCategory = mainCategory === 'Other' ? customCategory.trim() : mainCategory;
    const finalPrompt = promptInstructions.trim();
    
    if (!currentUser || isSaving || !finalMainCategory || !finalPrompt) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    // Simulate a short delay for better UX, since localStorage is nearly instant
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        const newPrompt: Prompt = {
          id: Date.now(),
          mainCategory: finalMainCategory,
          subCategory: subCategory.trim(),
          referenceImage: referenceImage ?? undefined,
          category: finalMainCategory,
          fullPrompt: finalPrompt,
        };

        setProfilesData(prevData => {
            if (!prevData.currentUser) return prevData;
            return {
                ...prevData,
                profiles: {
                    ...prevData.profiles,
                    [prevData.currentUser]: {
                        prompts: [newPrompt, ...(prevData.profiles[prevData.currentUser]?.prompts || [])]
                    }
                }
            }
        });
        handleClearForm();
        setPage('vault');
    } catch (err) {
        console.error("Error saving prompt:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
    } finally {
        setIsSaving(false);
    }
  }, [mainCategory, customCategory, subCategory, promptInstructions, referenceImage, isSaving, profilesData]);


  const handleDeletePrompt = useCallback((id: number) => {
    const { currentUser } = profilesData;
    if (!currentUser) return;
    setProfilesData(prevData => ({
        ...prevData,
        profiles: {
            ...prevData.profiles,
            [currentUser]: {
                prompts: prevData.profiles[currentUser].prompts.filter(p => p.id !== id)
            }
        }
    }));
  }, [profilesData]);

  const handleSelectProfile = (name: string) => {
    setProfilesData(prev => ({ ...prev, currentUser: name }));
  };

  const handleCreateProfile = (name: string) => {
    setProfilesData(prev => ({
        ...prev,
        currentUser: name,
        profiles: {
            ...prev.profiles,
            [name]: { prompts: [] }
        }
    }));
  };
  
  const handleSwitchProfile = () => {
    setProfilesData(prev => ({ ...prev, currentUser: null }));
    setPage('home');
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const NavButton: React.FC<{pageName: 'home' | 'vault', children: React.ReactNode}> = ({ pageName, children }) => (
    <button onClick={() => setPage(pageName)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${page === pageName ? 'bg-blue-600/50 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700/50'}`}>
      {children}
    </button>
  );
  
  const currentUser = profilesData.currentUser;
  const currentPrompts = currentUser ? profilesData.profiles[currentUser]?.prompts || [] : [];
  
  const finalMainCategory = mainCategory === 'Other' ? customCategory.trim() : mainCategory;
  const isFormEmpty = !finalMainCategory || !promptInstructions.trim();

  if (!isLoaded) {
    return <div className="min-h-screen bg-transparent" />; // Loading state
  }

  if (!currentUser) {
    return <ProfileManager 
              existingProfiles={Object.keys(profilesData.profiles)} 
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
           />;
  }
  
  return (
    <div className="min-h-screen bg-transparent text-white p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <header className="text-center w-full">
            <div className="inline-block my-8 py-5 px-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg" style={{boxShadow: '0 0 25px rgba(59, 130, 246, 0.6), inset 0 2px 4px rgba(255,255,255,0.2)'}}>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-widest uppercase select-none" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4)'}}>
                Prompt Vault
              </h1>
            </div>
            <div className="w-full flex justify-center items-center gap-4 -mt-4 mb-8">
                <div className="absolute left-4 sm:left-8 top-4 sm:top-8 flex flex-col items-start gap-2">
                    <span className="text-xs text-slate-400">PROFILE</span>
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-slate-200">{currentUser}</span>
                         <button onClick={handleSwitchProfile} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white" aria-label="Switch Profile">
                             <LogoutIcon className="w-5 h-5"/>
                         </button>
                    </div>
                </div>
                <nav className="flex justify-center gap-4">
                    <NavButton pageName="home">Create</NavButton>
                    <NavButton pageName="vault">Vault</NavButton>
                </nav>
            </div>
        </header>

        {page === 'home' && (
             <main className="w-full max-w-xl mx-auto transition-opacity duration-500 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
                    {error && (<div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-center"><p><strong>Error:</strong> {error}</p></div>)}
                    
                    <select 
                        id="mainCategory" 
                        value={mainCategory} 
                        onChange={(e) => setMainCategory(e.target.value)}
                        className="w-full p-4 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-no-repeat bg-right-4"
                        style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em'}}
                    >
                        <option value="" disabled>Select a Main Category</option>
                        {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Other">Other (Please specify)</option>
                    </select>

                    {mainCategory === 'Other' && (
                        <PromptInput id="customCategory" type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Enter Custom Category" />
                    )}

                    <PromptInput id="subCategory" type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} placeholder="Subcategory (optional)" />
                    
                    <PromptInput 
                        id="promptInstructions"
                        value={promptInstructions}
                        onChange={(e) => setPromptInstructions(e.target.value)}
                        placeholder="Enter your prompt instructions here..."
                        rows={5}
                    />

                    <div>
                        <label htmlFor="image-upload" className="w-full cursor-pointer flex flex-col items-center justify-center p-4 bg-slate-800/80 border-2 border-dashed border-slate-700/80 rounded-lg text-slate-400 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200">
                            <ImageUploadIcon className="w-8 h-8 mb-2" />
                            <span className="font-semibold">Reference Image (optional)</span>
                            <span className="text-sm">Click to upload</span>
                            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                        {referenceImage && (
                            <div className="mt-4 relative group">
                                <img src={referenceImage} alt="Reference preview" className="w-full max-h-60 object-contain rounded-lg" />
                                <button onClick={() => setReferenceImage(null)} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={handleSavePrompt} disabled={isFormEmpty || isSaving} className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 flex items-center justify-center">
                         {isSaving ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>) : 'Save Prompt'}
                    </button>
                    <button onClick={handleClearForm} disabled={isSaving} className="w-full sm:w-auto px-6 bg-transparent border-2 border-slate-600 text-slate-300 font-bold py-3 rounded-lg shadow-lg hover:bg-slate-800 hover:border-slate-500 disabled:opacity-50 transition-all duration-300">
                        Clear
                    </button>
                    </div>
                </div>
            </main>
        )}
       
        {page === 'vault' && (
             <section className="w-full mt-2 transition-opacity duration-500 animate-[fadeIn_0.5s_ease-in-out]">
                <PromptVaultDisplay prompts={currentPrompts} onDelete={handleDeletePrompt} onNavigateHome={() => setPage('home')} />
             </section>
        )}
      </div>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
