'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, LogIn, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { EasyFileLogo } from '@/components/logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';


  const handleAuthAction = (action: 'login' | 'signup') => {
    startTransition(async () => {
      try {
        let userCredential;
        if (action === 'login') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        }
        
        toast({
          title: `Successfully ${action === 'login' ? 'logged in' : 'signed up'}!`,
          description: `Welcome, ${userCredential.user.email}!`,
        });
        router.push(redirectUrl);

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: error.message || 'An unknown error occurred.',
        });
      }
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            toast({
                title: 'Successfully logged in!',
                description: `Welcome, ${result.user.displayName}!`,
            });
            router.push(redirectUrl);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Google Sign-In Failed',
                description: error.message || 'Could not sign in with Google.',
            });
        }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <EasyFileLogo width={80} height={80} />
            </div>
          <CardTitle className="text-3xl font-bold tracking-tighter">Welcome to EasyFile</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                 <Button onClick={() => handleAuthAction('login')} disabled={isPending || !email || !password} className="flex-1">
                    {isPending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                    Sign In
                </Button>
                <Button onClick={() => handleAuthAction('signup')} disabled={isPending || !email || !password} variant="secondary" className="flex-1">
                    Sign Up
                </Button>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
             <Button variant="outline" onClick={handleGoogleSignIn} disabled={isPending} className="w-full">
                {isPending ? (
                    <LoaderCircle className="animate-spin" />
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 8.4 244 8.4c77.9 0 144.3 31.4 190.4 78.4l-62.8 56.4c-24.3-23-57.5-38.4-94.5-38.4-82.3 0-149.3 66.8-149.3 148.9s67 148.9 149.3 148.9c98.2 0 135-70.4 140.8-106.9H244v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 42.4z"></path></svg>
                        Sign in with Google
                    </>
                )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
