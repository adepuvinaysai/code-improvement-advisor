'use client';
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function GithubInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="glass-panel p-8 max-w-2xl w-full mx-auto text-center mt-12">
      <h2 className="text-3xl mb-2">Analyze any GitHub Repository</h2>
      <p className="text-secondary mb-8">
        Get AI-powered code reviews, refactoring advice, and performance insights for any public repository.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="input-field"
            disabled={loading}
            required
            pattern="https:\/\/github\.com\/.*"
            title="Please enter a valid GitHub URL"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary mt-4"
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing Repository...
            </>
          ) : (
            <>
              <Search size={20} />
              Analyze Code
            </>
          )}
        </button>
      </form>
    </div>
  );
}
