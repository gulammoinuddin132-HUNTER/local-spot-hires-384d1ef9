-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('job_seeker', 'job_provider', 'professional');

-- Create enum for job categories
CREATE TYPE public.job_category AS ENUM (
  'carpenter', 'electrician', 'plumber', 'cleaner', 
  'gardener', 'babysitter', 'tutor', 'handyman'
);

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'selected', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create professionals table
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  category job_category NOT NULL,
  experience_years INTEGER DEFAULT 0,
  specialties TEXT[],
  hourly_rate INTEGER,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category job_category NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  pay_rate INTEGER NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professional_id, reviewer_id, job_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Professionals policies
CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Professionals can update own profile" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Professionals can insert own profile" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view open jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "Job seekers can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Employers can update application status" ON public.applications FOR UPDATE USING (auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id));

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update professional ratings
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.professionals
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE professional_id = NEW.professional_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE professional_id = NEW.professional_id)
  WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings after review
CREATE TRIGGER update_rating_after_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_professional_rating();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::user_role);
  
  -- If role is professional, create professional profile
  IF (NEW.raw_user_meta_data->>'role')::user_role = 'professional' THEN
    INSERT INTO public.professionals (user_id, category, hourly_rate)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'category')::job_category,
      COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::INTEGER, 500)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();