import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getStudentBookings, cancelBooking } from '@/api/bookingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle, Search, Star } from 'lucide-react';
import ReviewModal from '@/components/booking/ReviewModal';

const StudentDashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getStudentBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userId) {
      fetchBookings();
    }
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId, 'Student requested cancellation');
        fetchBookings(); // Refresh the list
      } catch (err) {
        alert('Failed to cancel booking.');
      }
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'ACCEPTED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'REJECTED' || b.status === 'CANCELLED');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 bg-emerald-500/10">Accepted</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Completed</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10">{status === 'REJECTED' ? 'Rejected' : 'Cancelled'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Dashboard</h1>
            <p className="text-slate-400 mt-2">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-4">
            <Link to="/mentors">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold">
                <Search className="mr-2 h-4 w-4" /> Find Mentors
              </Button>
            </Link>
            <Button variant="outline" onClick={logoutContext} className="border-slate-700 hover:bg-slate-800 text-slate-200">
              Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading your sessions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-400/10 p-6 rounded-lg border border-red-400/20">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-slate-900 border-slate-800 border p-1 rounded-lg">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                Upcoming Sessions ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                History ({pastBookings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                  You don't have any upcoming sessions.
                  <div className="mt-4">
                    <Link to="/mentors" className="text-emerald-400 hover:underline">Browse mentors</Link> to book a session.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="bg-slate-900 border-slate-800 flex flex-col">
                      <CardHeader className="pb-4 border-b border-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-slate-100">Session with Mentor #{booking.mentorId}</CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                              Booking #{booking.id}
                            </CardDescription>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 space-y-4 flex-1">
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Calendar className="h-4 w-4 text-emerald-400" /></div>
                          <span>{new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Clock className="h-4 w-4 text-emerald-400" /></div>
                          <span>{booking.startTime} ({booking.durationMinutes} mins)</span>
                        </div>
                        {booking.status === 'ACCEPTED' && (
                          <div className="flex items-center gap-3 text-slate-300">
                            <div className="bg-slate-800 p-2 rounded-md"><Video className="h-4 w-4 text-blue-400" /></div>
                            <span className="text-sm">Link will be provided via email</span>
                          </div>
                        )}
                        {booking.notes && (
                          <div className="mt-4 p-3 bg-slate-950 rounded-md border border-slate-800 text-sm text-slate-400 italic">
                            "{booking.notes}"
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-800/50">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleCancel(booking.id)}
                          className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              {pastBookings.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                  No session history found.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="bg-slate-900 border-slate-800">
                      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-100">Session with Mentor #{booking.mentorId}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.bookingDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.durationMinutes} mins</span>
                          </div>
                        </div>
                        {booking.status === 'COMPLETED' && (
                          <ReviewModal 
                            bookingId={booking.id}
                            mentorId={booking.mentorId}
                            mentorName={`Mentor #${booking.mentorId}`}
                            onSuccess={() => alert('Review submitted successfully!')}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
