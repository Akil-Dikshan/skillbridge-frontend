import { useState } from 'react';
import { createReview } from '@/api/reviewApi';
import { Star, X, Loader2 } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

const ReviewModal = ({ bookingId, mentorId, mentorName, onSuccess }) => {
  const [open, setOpen]         = useState(false);
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      await createReview({
        bookingId: parseInt(bookingId),
        mentorId:  parseInt(mentorId),
        rating,
        feedback: comment,
      });
      setDone(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (done) { setDone(false); setRating(0); setComment(''); setError(null); }
  };

  const activeRating = hovered || rating;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        Rate session
      </button>

      {/* Overlay + modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={sg}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-5"
              style={{ background: 'linear-gradient(135deg, #1a1756 0%, #312e81 60%, #4338ca 100%)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Rate your session</h2>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    with {mentorName || `Mentor #${mentorId}`}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {done ? (
              /* Success state */
              <div className="px-6 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 fill-emerald-400 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Review submitted!</h3>
                <p className="text-sm text-gray-500 mb-6">Thanks for your feedback. It helps other students find the right mentor.</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

                {/* Star picker */}
                <div className="text-center">
                  <div
                    className="flex items-center justify-center gap-2 mb-2"
                    onMouseLeave={() => setHovered(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className="w-10 h-10 transition-colors"
                          style={{
                            fill:   star <= activeRating ? '#F59E0B' : 'transparent',
                            color:  star <= activeRating ? '#F59E0B' : '#D1D5DB',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-500 h-5">
                    {activeRating > 0 ? LABELS[activeRating] : 'Select a rating'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your feedback <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you learn? How did the mentor help you grow?"
                    rows={3}
                    className="w-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || rating === 0}
                    className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:shadow-indigo-200"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting
                      </span>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewModal;
