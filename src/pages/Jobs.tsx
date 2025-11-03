import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MapPin, Briefcase, IndianRupee, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    phone: '',
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, categoryFilter, jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(job => job.category === categoryFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId: string) => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        applicant_id: user.id,
        applicant_name: profile.full_name,
        applicant_email: profile.email,
        applicant_phone: applicationData.phone,
        cover_letter: applicationData.coverLetter,
      });

    if (error) {
      if (error.message.includes('duplicate')) {
        toast({
          title: 'Already Applied',
          description: 'You have already applied to this job',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Success!',
        description: 'Your application has been submitted',
      });
      setApplicationData({ coverLetter: '', phone: '' });
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      carpenter: '🔨',
      electrician: '⚡',
      plumber: '🔧',
      cleaner: '🧹',
      gardener: '🌱',
      babysitter: '👶',
      tutor: '📚',
      handyman: '🛠️',
    };
    return icons[category] || '💼';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Jobs</h1>
          <p className="text-muted-foreground">Find your next opportunity</p>
        </div>

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="carpenter">Carpenter</SelectItem>
                  <SelectItem value="electrician">Electrician</SelectItem>
                  <SelectItem value="plumber">Plumber</SelectItem>
                  <SelectItem value="cleaner">Cleaner</SelectItem>
                  <SelectItem value="gardener">Gardener</SelectItem>
                  <SelectItem value="babysitter">Babysitter</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="handyman">Handyman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{getCategoryIcon(job.category)}</div>
                      <div>
                        <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                        <CardDescription className="text-base">{job.company_name}</CardDescription>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="gradient">Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                          <DialogDescription>
                            Submit your application to {job.company_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Phone Number</Label>
                            <Input
                              placeholder="+91 1234567890"
                              value={applicationData.phone}
                              onChange={(e) =>
                                setApplicationData({ ...applicationData, phone: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label>Cover Letter (Optional)</Label>
                            <Textarea
                              placeholder="Tell the employer why you're a great fit..."
                              rows={5}
                              value={applicationData.coverLetter}
                              onChange={(e) =>
                                setApplicationData({ ...applicationData, coverLetter: e.target.value })
                              }
                            />
                          </div>
                          <Button
                            variant="gradient"
                            className="w-full"
                            onClick={() => handleApply(job.id)}
                          >
                            Submit Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="w-4 h-4" />
                      <span>₹{job.pay_rate}/hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{job.duration}</span>
                    </div>
                  </div>
                  <p className="text-foreground mb-3">{job.description}</p>
                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Requirements:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {job.requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
