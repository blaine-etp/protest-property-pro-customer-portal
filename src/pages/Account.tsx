import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock } from "lucide-react";
import { useCustomerData } from "@/hooks/useCustomerData";
import { useTokenCustomerData } from "@/hooks/useTokenCustomerData";

const accountInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const addressSchema = z.object({
  mailingAddress: z.string().min(1, "Address is required"),
  mailingAddress2: z.string().optional(),
  mailingCity: z.string().min(1, "City is required"),
  mailingState: z.string().min(1, "State is required"),
  mailingZip: z.string().min(1, "ZIP code is required"),
});

type AccountInfoForm = z.infer<typeof accountInfoSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type AddressForm = z.infer<typeof addressSchema>;

interface Profile {
  first_name: string;
  last_name: string;
  mailing_address?: string;
  mailing_address_2?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_zip?: string;
}

interface VerificationCode {
  code: string;
  expires_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verificationCode, setVerificationCode] = useState<VerificationCode | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Get URL parameters for token-based access
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  // Use appropriate data hook based on access method
  const tokenData = useTokenCustomerData(token || '');
  const emailData = useCustomerData(email || '');
  
  // Determine which data source to use
  const customerData = token ? tokenData : emailData;
  const { profile: customerProfile, loading: customerLoading, error: customerError } = customerData;

  const accountForm = useForm<AccountInfoForm>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      mailingAddress: "",
      mailingAddress2: "",
      mailingCity: "",
      mailingState: "",
      mailingZip: "",
    },
  });

  useEffect(() => {
    if (token || email) {
      // Use token/email based access - profile data comes from customerData
      if (customerProfile && !customerLoading) {
        setProfile({
          first_name: customerProfile.first_name || '',
          last_name: customerProfile.last_name || '',
          mailing_address: '',
          mailing_address_2: '',
          mailing_city: '',
          mailing_state: '',
          mailing_zip: '',
        });
        
        accountForm.reset({
          firstName: customerProfile.first_name || '',
          lastName: customerProfile.last_name || '',
        });
      }
    } else {
      // Use standard auth-based access
      fetchProfile();
      fetchActiveVerificationCode();
    }
  }, [customerProfile, customerLoading, token, email]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationCode && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setVerificationCode(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationCode, timeLeft]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Only redirect if we don't have token/email access
        if (!token && !email) {
          navigate("/");
          return;
        }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      accountForm.reset({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
      });
      addressForm.reset({
        mailingAddress: data.mailing_address || "",
        mailingAddress2: data.mailing_address_2 || "",
        mailingCity: data.mailing_city || "",
        mailingState: data.mailing_state || "",
        mailingZip: data.mailing_zip || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    }
  };

  const fetchActiveVerificationCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("verification_codes")
        .select("code, expires_at")
        .eq("user_id", user.id)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVerificationCode(data);
        const expiresAt = new Date(data.expires_at).getTime();
        const now = new Date().getTime();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(secondsLeft);
      }
    } catch (error) {
      console.error("Error fetching verification code:", error);
    }
  };

  const onAccountInfoSubmit = async (data: AccountInfoForm) => {
    setLoading(true);
    try {
      let userId: string;
      
      if (token || email) {
        // Use customer profile user_id for token/email access
        if (!customerProfile) throw new Error("No customer profile found");
        userId = customerProfile.user_id;
      } else {
        // Use auth user for standard access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account information updated successfully",
      });

      if (!token && !email) {
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update account information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      passwordForm.reset();
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onAddressSubmit = async (data: AddressForm) => {
    setLoading(true);
    try {
      let userId: string;
      
      if (token || email) {
        // Use customer profile user_id for token/email access
        if (!customerProfile) throw new Error("No customer profile found");
        userId = customerProfile.user_id;
      } else {
        // Use auth user for standard access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          mailing_address: data.mailingAddress,
          mailing_address_2: data.mailingAddress2 || null,
          mailing_city: data.mailingCity,
          mailing_state: data.mailingState,
          mailing_zip: data.mailingZip,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mailing address updated successfully",
      });

      if (!token && !email) {
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description: "Failed to update mailing address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateVerificationCode = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const { error } = await supabase
        .from("verification_codes")
        .insert({
          user_id: user.id,
          code: code,
        });

      if (error) throw error;

      toast({
        title: "Code Generated",
        description: "Your verification code has been generated",
      });

      fetchActiveVerificationCode();
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              const params = new URLSearchParams();
              if (email) params.set('email', email);
              if (token) params.set('token', token);
              const queryString = params.toString();
              navigate(`/customer-portal${queryString ? `?${queryString}` : ''}`);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Portal
          </Button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal information and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountInfoSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Update Information
                  </Button>
                </form>
              </Form>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="oldPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      Reset Password
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>

          {/* Mailing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Mailing Address</CardTitle>
              <CardDescription>Update your mailing address information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...addressForm}>
                <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                  <FormField
                    control={addressForm.control}
                    name="mailingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addressForm.control}
                    name="mailingAddress2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={addressForm.control}
                      name="mailingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="mailingState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="mailingZip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Update Address
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Verification Code */}
          <Card>
            <CardHeader>
              <CardTitle>Phone Support Verification</CardTitle>
              <CardDescription>
                For your security, a one-time verification code is required to help our customer care agents assist you over the phone. Click the 'Generate Code' button below to get your verification code. Code expires in 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationCode ? (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your verification code:</p>
                      <p className="text-2xl font-mono font-bold">{verificationCode.code}</p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      Expires in {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={generateVerificationCode} disabled={loading}>
                  Generate Code
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;