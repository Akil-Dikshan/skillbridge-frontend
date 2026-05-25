import { useState } from 'react';
import { createBooking } from '@/api/bookingApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ mentorId, mentorName, hourlyRate }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        mentorId: parseInt(mentorId),
        bookingDate: date,
        startTime: time + ':00', // API expects HH:mm:ss
        durationMinutes: parseInt(duration),
        notes: notes
      };
      
      await createBooking(payload);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-lg h-12 shadow-lg shadow-emerald-500/20">
          <Calendar className="mr-2 h-5 w-5" />
          Book Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-50 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-400">Book Session</DialogTitle>
          <DialogDescription className="text-slate-400">
            Request a 1-on-1 session with {mentorName || 'this mentor'}. 
            Rate: <span className="font-bold text-emerald-400">${hourlyRate}/hr</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-50">Booking Requested!</h3>
            <p className="text-slate-400 text-sm">
              Your request has been sent to the mentor. You will receive an email confirmation once they accept.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-200">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-emerald-500 [color-scheme:dark]"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-slate-200">Time</Label>
                <Input
                  id="time"
                  type="time"
                  required
                  className="bg-slate-950 border-slate-800 focus-visible:ring-emerald-500 [color-scheme:dark]"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-200">Duration (Minutes)</Label>
              <select
                id="duration"
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="30">30 Minutes (${(hourlyRate * 0.5).toFixed(2)})</option>
                <option value="60">60 Minutes (${hourlyRate})</option>
                <option value="90">90 Minutes (${(hourlyRate * 1.5).toFixed(2)})</option>
                <option value="120">120 Minutes (${(hourlyRate * 2).toFixed(2)})</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-200">Message to Mentor (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What would you like to focus on during this session?"
                className="bg-slate-950 border-slate-800 focus-visible:ring-emerald-500 min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-red-400 bg-red-400/10 p-3 rounded-md border border-red-400/20">
                {error}
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                ) : (
                  'Confirm Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
