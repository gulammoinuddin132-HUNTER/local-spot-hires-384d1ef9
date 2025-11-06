import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Briefcase } from 'lucide-react';

const JobSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add confetti effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#004aad', '#ff7b00', '#111827'];

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Create confetti elements
      for (let i = 0; i < 5; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${randomInRange(0, 100)}%;
          top: -10px;
          opacity: 1;
          pointer-events: none;
          z-index: 9999;
          animation: confettiFall ${randomInRange(2, 4)}s linear;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
      }
    }, 50);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      clearInterval(confettiInterval);
      style.remove();
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="shadow-accent max-w-2xl w-full animate-scale-in">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <CheckCircle className="w-24 h-24 text-primary relative animate-float" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                🎉 Your Job Has Been Successfully Posted!
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Your job listing is now live and visible to talented professionals in your area.
              </p>
            </div>

            <div className="bg-secondary/10 rounded-lg p-6 space-y-3">
              <p className="text-sm font-medium text-secondary-foreground">What happens next?</p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Qualified candidates will start applying to your job</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>You'll receive notifications for new applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Review applicants and manage your job in "My Jobs"</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={() => navigate('/my-jobs')} 
                variant="gradient" 
                size="lg"
                className="gap-2"
              >
                <Briefcase className="w-5 h-5" />
                Go to My Jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline" 
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobSuccess;
