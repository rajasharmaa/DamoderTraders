// pages/Account.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, MessageSquare, LogOut, ChevronRight, Calendar, FileText, Shield, Mail, Phone, UserCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (activeTab === 'inquiries' && user) {
        try {
          setIsLoading(true);
          const data = await api.inquiries.getUserInquiries();
          setInquiries(data || []);
        } catch (error: any) {
          toast({
            title: 'Error',
            description: 'Failed to load inquiries',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInquiries();
  }, [activeTab, user, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null; // ProtectedRoute will handle redirection
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-700 border border-yellow-500/30';
      case 'responded':
        return 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-700 border border-green-500/30';
      case 'resolved':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-700 border border-blue-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/10 text-gray-700 border border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'responded':
        return <Mail className="w-4 h-4" />;
      case 'resolved':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>My Account - Damodar Traders</title>
        <meta name="description" content="Manage your Damodar Traders account" />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Account Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Manage your account and track your inquiries</p>
          </div>
          
          <motion.button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground rounded-xl hover:from-destructive/90 hover:to-destructive transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold">Logout</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* User Profile Card */}
              <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <UserCircle className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-2">
                {[
                  { id: 'profile', label: 'Profile Details', icon: User, description: 'View account information' },
                  { id: 'inquiries', label: 'My Inquiries', icon: MessageSquare, description: 'Track your requests' },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between w-full p-4 text-left rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary text-primary shadow-sm'
                        : 'hover:bg-muted/50'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-primary/20' : 'bg-muted'}`}>
                        <tab.icon size={20} className={activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <div>
                        <p className="font-medium">{tab.label}</p>
                        <p className="text-xs text-muted-foreground">{tab.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={`transition-transform ${activeTab === tab.id ? 'text-primary' : 'text-border'}`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden h-full">
              <div className="p-6 md:p-8">
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Account Details</h2>
                        <p className="text-muted-foreground">Personal information and account settings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Full Name', value: user.name, icon: UserCircle, color: 'text-blue-500' },
                        { label: 'Email Address', value: user.email, icon: Mail, color: 'text-red-500' },
                        { label: 'Phone Number', value: user.phone || 'Not provided', icon: Phone, color: 'text-green-500' },
                        { label: 'Account Role', value: user.role, icon: Shield, color: 'text-purple-500' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="group bg-gradient-to-br from-card to-muted/30 p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${item.color.replace('text', 'bg')}/10`}>
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                              <p className="font-semibold text-lg">{item.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'inquiries' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">My Inquiries</h2>
                        <p className="text-muted-foreground">Track the status of your requests</p>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
                        <p className="text-muted-foreground">Loading your inquiries...</p>
                      </div>
                    ) : inquiries.length > 0 ? (
                      <div className="space-y-4">
                        {inquiries.map((inquiry, index) => (
                          <motion.div
                            key={inquiry._id}
                            className="group bg-gradient-to-br from-card to-muted/30 rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="p-6">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                    <h4 className="font-bold text-lg">{inquiry.subject}</h4>
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2">{inquiry.message}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(inquiry.status)}
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  Submitted on {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:underline">
                                  View Details
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                          <MessageSquare className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No inquiries yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          You haven't submitted any inquiries yet. Start by contacting us about our products or services.
                        </p>
                        <motion.button
                          className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/contact')}
                        >
                          Submit Your First Inquiry
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Account;