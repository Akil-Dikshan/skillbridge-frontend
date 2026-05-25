import { useState } from 'react';
import { createReview } from '@/api/reviewApi';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star } from 'lucide-react';

const ReviewModal = ({ bookingId, mentorId, mentorName, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await createReview({
        bookingId: parseInt(bookingId),
        mentorId: parseInt(mentorId),
        rating: rating,
        comment: comment
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
          <Star className="mr-2 h-4 w-4" /> Leave Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-50 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-400">Review Session</DialogTitle>
          <DialogDescription className="text-slate-400">
            How was your session with {mentorName || `Mentor #${mentorId}`}?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  className={`h-10 w-10 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} 
                />
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-slate-200">
              Share your feedback (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="What did you learn? How did the mentor help you?"
              className="bg-slate-950 border-slate-800 focus-visible:ring-emerald-500 min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-red-400 bg-red-400/10 p-3 rounded-md border border-red-400/20">
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-slate-700 hover:bg-slate-800 text-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting</>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
