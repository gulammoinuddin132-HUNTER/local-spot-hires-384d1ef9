import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Briefcase, MapPin, Phone, Mail, User as UserIcon } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(500, 'Bio must be less than 500 characters').optional(),
});

const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: '',
  });

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (profile?.role === 'professional' && user?.id) {
        const { data } = await supabase
          .from('professionals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setProfessionalData(data);
          setFormData(prev => ({ ...prev, bio: data.bio || '' }));
        }
      }
    };

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: '',
      });
    }

    fetchProfessionalData();
  }, [profile, user]);

  const handleSave = async () => {
    try {
      const validated = profileSchema.parse(formData);
      setLoading(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: validated.full_name,
          phone: validated.phone || null,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      if (profile?.role === 'professional' && professionalData) {
        const { error: professionalError } = await supabase
          .from('professionals')
          .update({
            bio: validated.bio || null,
          })
          .eq('user_id', user?.id);

        if (professionalError) throw professionalError;
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleDisplay = (role: string) => {
    return {
      job_seeker: 'Job Seeker',
      job_provider: 'Job Provider',
      professional: 'Professional',
    }[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile?.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.full_name}</CardTitle>
                  <CardDescription>{getRoleDisplay(profile?.role)}</CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="gradient">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>

              {profile?.role === 'professional' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about your experience..."
                      rows={4}
                    />
                  </div>

                  {professionalData && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="font-semibold">{professionalData.rating || '0.00'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({professionalData.total_reviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Jobs Completed</p>
                        <p className="font-semibold">{professionalData.jobs_completed || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Hourly Rate</p>
                        <p className="font-semibold">₹{professionalData.hourly_rate || 0}/hr</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-semibold">{professionalData.experience_years || 0} years</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={loading} variant="gradient">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
