import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getMentorBookings, acceptBooking, rejectBooking, completeSession } from '@/api/bookingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Check, X, CheckCircle2, User } from 'lucide-react';

const MentorDashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getMentorBookings();
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

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert('Failed to accept booking.');
    }
  };

  const handleReject = async (bookingId) => {
    if (window.confirm('Are you sure you want to decline this request?')) {
      try {
        await rejectBooking(bookingId);
        fetchBookings();
      } catch (err) {
        alert('Failed to reject booking.');
      }
    }
  };

  const handleComplete = async (bookingId) => {
    if (window.confirm('Mark this session as completed?')) {
      try {
        await completeSession(bookingId);
        fetchBookings();
      } catch (err) {
        alert('Failed to complete session.');
      }
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'PENDING');
  const confirmedSessions = bookings.filter(b => b.status === 'CONFIRMED');
  const pastSessions = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">Action Required</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 bg-emerald-500/10">Upcoming</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10">Cancelled</Badge>;
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Mentor Dashboard</h1>
            <p className="text-slate-400 mt-2">Manage your coaching schedule</p>
          </div>
          <Button variant="outline" onClick={logoutContext} className="border-slate-700 hover:bg-slate-800 text-slate-200">
            Logout
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading your schedule...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 bg-red-400/10 p-6 rounded-lg border border-red-400/20">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="bg-slate-900 border-slate-800 border p-1 rounded-lg">
              <TabsTrigger value="requests" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                Requests {pendingRequests.length > 0 && <span className="ml-2 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-xs font-bold">{pendingRequests.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                Upcoming ({confirmedSessions.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                History ({pastSessions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="requests" className="mt-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                  You have no pending session requests.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map((booking) => (
                    <Card key={booking.id} className="bg-slate-900 border-yellow-500/30 flex flex-col shadow-lg shadow-yellow-500/5">
                      <CardHeader className="pb-4 border-b border-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" /> Student #{booking.studentId}
                            </CardTitle>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 space-y-4 flex-1">
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Calendar className="h-4 w-4 text-emerald-400" /></div>
                          <span>{new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Clock className="h-4 w-4 text-emerald-400" /></div>
                          <span>{booking.startTime} ({booking.durationMinutes} mins)</span>
                        </div>
                        {booking.notes && (
                          <div className="mt-4 p-3 bg-slate-950 rounded-md border border-slate-800 text-sm text-slate-400 italic">
                            "{booking.notes}"
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-800/50 flex gap-2">
                        <Button 
                          onClick={() => handleAccept(booking.id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                        >
                          <Check className="mr-1 h-4 w-4" /> Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleReject(booking.id)}
                          className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <X className="mr-1 h-4 w-4" /> Decline
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-6">
              {confirmedSessions.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                  You have no upcoming sessions.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {confirmedSessions.map((booking) => (
                    <Card key={booking.id} className="bg-slate-900 border-emerald-500/30 flex flex-col shadow-lg shadow-emerald-500/5">
                      <CardHeader className="pb-4 border-b border-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" /> Student #{booking.studentId}
                            </CardTitle>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 space-y-4 flex-1">
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Calendar className="h-4 w-4 text-emerald-400" /></div>
                          <span>{new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="bg-slate-800 p-2 rounded-md"><Clock className="h-4 w-4 text-emerald-400" /></div>
                          <span>{booking.startTime} ({booking.durationMinutes} mins)</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-800/50">
                        <Button 
                          onClick={() => handleComplete(booking.id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {pastSessions.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                  No session history found.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastSessions.map((booking) => (
                    <Card key={booking.id} className="bg-slate-900 border-slate-800">
                      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-100">Session with Student #{booking.studentId}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.durationMinutes} mins</span>
                          </div>
                        </div>
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

export default MentorDashboardPage;
