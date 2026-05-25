import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMentors } from '@/api/userApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Clock } from 'lucide-react';

const MentorListPage = () => {
  const [mentors, setMentors] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMentors = async (skill) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMentors(skill);
      setMentors(data);
    } catch (err) {
      setError('Failed to load mentors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchSkill);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Find a Mentor</h1>
            <p className="text-slate-400 mt-2">Connect with industry experts to accelerate your career.</p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by skill (e.g. Java, React)..."
                className="pl-9 bg-slate-900 border-slate-800 focus-visible:ring-emerald-500 text-slate-100"
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold">
              Search
            </Button>
          </form>
        </div>

        {/* Mentor Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading mentors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-400/10 p-6 rounded-lg border border-red-400/20">
            {error}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            No mentors found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.userId} className="bg-slate-900 border-slate-800 flex flex-col h-full hover:border-emerald-500/50 transition-colors shadow-lg shadow-black/20">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-100">{mentor.name || `Mentor #${mentor.userId}`}</CardTitle>
                      <CardDescription className="text-emerald-400 mt-1 font-medium">
                        ${mentor.hourlyRate}/hr
                      </CardDescription>
                    </div>
                    {/* Placeholder for avatar */}
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                      {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {mentor.bio || 'Experienced professional ready to help you grow your career.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mentor.yearsOfExperience} YOE
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {mentor.rating ? mentor.rating.toFixed(1) : 'New'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {mentor.skills && mentor.skills.split(',').slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                        {skill.trim()}
                      </span>
                    ))}
                    {mentor.skills && mentor.skills.split(',').length > 3 && (
                      <span className="px-2 py-1 bg-slate-800 text-slate-500 text-xs rounded-full border border-slate-700">
                        +{mentor.skills.split(',').length - 3}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-slate-800/50 mt-auto">
                  <Link to={`/mentors/${mentor.userId}`} className="w-full">
                    <Button variant="outline" className="w-full bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white">
                      View Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorListPage;
