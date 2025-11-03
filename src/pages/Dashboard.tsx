import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Users, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    myApplications: 0,
    myJobs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (profile?.role === 'job_seeker') {
        const { count: myApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('applicant_id', user.id);
        
        setStats({ totalJobs: totalJobs || 0, myApplications: myApplications || 0, myJobs: 0 });
      } else if (profile?.role === 'job_provider') {
        const { count: myJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('employer_id', user.id);
        
        setStats({ totalJobs: totalJobs || 0, myApplications: 0, myJobs: myJobs || 0 });
      }
    };

    fetchStats();
  }, [user, profile]);

  const getRoleDisplay = (role: string) => {
    return {
      job_seeker: 'Job Seeker',
      job_provider: 'Job Provider',
      professional: 'Professional',
    }[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">
            Role: {getRoleDisplay(profile?.role)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Open Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">Available positions</p>
            </CardContent>
          </Card>

          {profile?.role === 'job_seeker' && (
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Applications</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myApplications}</div>
                <p className="text-xs text-muted-foreground">Total applications</p>
              </CardContent>
            </Card>
          )}

          {profile?.role === 'job_provider' && (
            <Card className="shadow-soft hover:shadow-medium transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Job Posts</CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myJobs}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with these options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.role === 'job_seeker' && (
                <Link to="/jobs">
                  <Button variant="gradient" className="w-full justify-start" size="lg">
                    <Search className="mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
              )}
              
              {profile?.role === 'job_provider' && (
                <Link to="/post-job">
                  <Button variant="gradient" className="w-full justify-start" size="lg">
                    <Briefcase className="mr-2" />
                    Post a Job
                  </Button>
                </Link>
              )}

              <Link to="/professionals">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="mr-2" />
                  Browse Professionals
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p>{getRoleDisplay(profile?.role)}</p>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
