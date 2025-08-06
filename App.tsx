
import React, { useState, useCallback } from 'react';
import { PROMPTS, GENRES } from './constants';
import { Prompt } from './types';
import { generateStoryIdeas } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptCard from './components/PromptCard';
import IdeaCard from './components/IdeaCard';
import SparkleIcon from './components/icons/SparkleIcon';

const App: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [storyIdeas, setStoryIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const hasApiKey = !!process.env.API_KEY;

  const handleGeneratePrompt = useCallback(() => {
    setError(null);
    const filteredPrompts = selectedGenre === 'All'
      ? PROMPTS
      : PROMPTS.filter(p => p.genre === selectedGenre);

    if (filteredPrompts.length === 0) {
      setError(`No prompts found for the "${selectedGenre}" genre. Please select another.`);
      return; 
    }

    const randomIndex = Math.floor(Math.random() * filteredPrompts.length);
    setCurrentPrompt(filteredPrompts[randomIndex]);
    setStoryIdeas([]);
  }, [selectedGenre]);

  const handleGenerateIdeas = async () => {
    if (!currentPrompt) return;
    if (!hasApiKey) {
      setError("AI features are disabled. Please configure your API key.");
      return;
    }

    setIsLoadingIdeas(true);
    setError(null);
    setStoryIdeas([]);

    try {
      const ideas = await generateStoryIdeas(currentPrompt);
      setStoryIdeas(ideas);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const GenreSelector = () => (
    <div className="mb-8 w-full max-w-xs mx-auto">
      <label htmlFor="genre-select" className="block text-sm font-medium text-slate-400 mb-2 text-center">
        Select a Genre
      </label>
      <select
        id="genre-select"
        value={selectedGenre}
        onChange={(e) => {
          setSelectedGenre(e.target.value);
          setCurrentPrompt(null);
          setStoryIdeas([]);
          setError(null);
        }}
        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5 transition-colors"
        aria-label="Select writing prompt genre"
      >
        {GENRES.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 selection:bg-sky-300/20">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-8 space-y-8">
        
        {!currentPrompt ? (
          <div className="text-center animate-fade-in">
             <GenreSelector />
            <h2 className="text-xl text-slate-300 mb-6">Ready to start your next story?</h2>
            <button
              onClick={handleGeneratePrompt}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Generate a Prompt
            </button>
          </div>
        ) : (
          <div className="animate-fade-in w-full flex flex-col items-center space-y-8">
            <PromptCard prompt={currentPrompt} />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setCurrentPrompt(null);
                  setStoryIdeas([]);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded-full transition-colors duration-200"
              >
                Change Genre
              </button>
              <button
                onClick={handleGenerateIdeas}
                disabled={isLoadingIdeas || !hasApiKey}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <SparkleIcon className="h-5 w-5" />
                {isLoadingIdeas ? 'Generating Ideas...' : 'Spark Creativity'}
              </button>
            </div>
          </div>
        )}

        {error && (
            <div className="animate-fade-in mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center max-w-2xl">
                <p><strong>Error:</strong> {error}</p>
                {!hasApiKey && <p className="text-sm mt-1">Make sure the API_KEY environment variable is set to use AI features.</p>}
            </div>
        )}

        {isLoadingIdeas && (
            <div className="flex items-center justify-center space-x-2 text-slate-400">
                <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>The muse is thinking...</span>
            </div>
        )}

        {storyIdeas.length > 0 && (
          <div className="w-full max-w-3xl space-y-4 pt-4">
            <h3 className="text-center text-2xl font-bold text-slate-200" style={{fontFamily: 'Lora, serif'}}>Story Concepts</h3>
            {storyIdeas.map((idea, index) => (
              <IdeaCard key={index} idea={idea} index={index} />
            ))}
          </div>
        )}
      </main>
      
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.7s ease-in-out forwards;
            opacity: 0;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default App;
