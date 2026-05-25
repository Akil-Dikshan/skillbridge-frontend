import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMentorProfile } from '@/api/userApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Star, MapPin, Award } from 'lucide-react';
import BookingModal from '@/components/booking/BookingModal';

const MentorProfilePage = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getMentorProfile(id);
        setMentor(data);
      } catch (err) {
        setError('Failed to load mentor profile. They may not have created one yet.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link to="/mentors" className="inline-flex items-center text-emerald-400 hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mentors
          </Link>
          <div className="text-red-400 bg-red-400/10 p-6 rounded-lg border border-red-400/20">
            {error || 'Mentor not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/mentors" className="inline-flex items-center text-emerald-400 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mentors
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Basic Info & Booking CTA */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-center">
              <CardHeader>
                <div className="mx-auto h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl text-slate-400 font-bold border-2 border-emerald-500 mb-4 shadow-lg shadow-emerald-500/20">
                  {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <CardTitle className="text-2xl text-slate-50">{mentor.name || `Mentor #${mentor.userId}`}</CardTitle>
                <CardDescription className="text-slate-400">{mentor.roleType || 'Industry Expert'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-lg">{mentor.rating ? mentor.rating.toFixed(1) : 'New'}</span>
                  <span className="text-slate-500">({mentor.totalSessions || 0} sessions)</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xl">
                  ${mentor.hourlyRate}<span className="text-sm font-normal text-slate-500">/hr</span>
                </div>
                <BookingModal 
                  mentorId={id} 
                  mentorName={mentor.name} 
                  hourlyRate={mentor.hourlyRate} 
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-slate-50 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" /> Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{mentor.yearsOfExperience} Years of Experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Remote / Online</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Bio & Skills */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-slate-50">About Me</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                  {mentor.bio || "This mentor hasn't written a bio yet. Book a session to get to know them!"}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills ? mentor.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-800 text-emerald-400 font-medium text-sm rounded-md border border-emerald-500/20">
                        {skill.trim()}
                      </span>
                    )) : (
                      <span className="text-slate-500 italic">No skills listed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
