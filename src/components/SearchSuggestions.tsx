// components/SearchSuggestions.tsx
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SearchSuggestionsProps {
  onSelect: (product: any) => void;
  placeholder?: string;
}

const SearchSuggestions = ({ onSelect, placeholder = "Search products..." }: SearchSuggestionsProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.products.getSuggestions(query);
        setSuggestions(data || []);
        setIsOpen(data.length > 0);
      } catch (error: any) {
        toast({
          title: 'Search Error',
          description: 'Failed to fetch suggestions',
          variant: 'destructive',
        });
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: any) => {
    onSelect(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 px-5 pr-12 rounded-full border-2 border-border bg-muted/30 text-base transition-all duration-300 focus:outline-none focus:border-primary focus:bg-card"
        />
        <Search
          size={20}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((product) => (
                <li key={product._id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors flex items-center gap-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{product.category}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;