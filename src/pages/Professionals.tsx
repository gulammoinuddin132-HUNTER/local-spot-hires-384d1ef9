import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Star, Search, Briefcase, MapPin } from 'lucide-react';

interface Professional {
  id: string;
  user_id: string;
  category: string;
  rating: number;
  total_reviews: number;
  jobs_completed: number;
  hourly_rate: number;
  bio: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const Professionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const profsWithProfiles = await Promise.all(
        (data || []).map(async (prof) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', prof.user_id)
            .maybeSingle();
          
          return { ...prof, profiles: profileData };
        })
      );
      
      setProfessionals(profsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = professionals.filter((prof) =>
    prof.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCategory = (category: string) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'P';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading professionals...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Professionals</h1>
          <p className="text-muted-foreground">Find skilled professionals for your needs</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredProfessionals.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No professionals found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'Try adjusting your search' : 'No professionals have registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="shadow-soft hover:shadow-medium transition-all hover-lift">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(professional.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {professional.profiles?.full_name}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mt-1">
                          {formatCategory(professional.category)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-semibold">{professional.rating || '0.00'}</span>
                      <span className="text-sm text-muted-foreground">
                        ({professional.total_reviews || 0})
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      ₹{professional.hourly_rate}/hr
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{professional.jobs_completed || 0} jobs</span>
                    </div>
                  </div>

                  {professional.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {professional.bio}
                    </p>
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

export default Professionals;
