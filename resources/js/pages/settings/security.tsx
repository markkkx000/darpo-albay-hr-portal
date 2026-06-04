import { Form, Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { edit } from '@/routes/security';
import { update } from '@/routes/user-password';

export default function Security({ mfaEnabled, isMfaForced, loginHistory }: { mfaEnabled: boolean, isMfaForced: boolean, loginHistory: Array<{ip: string, browser: string, os: string, time: string}> }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    
    const [mfaProcessing, setMfaProcessing] = useState(false);
    const [showMfaDialog, setShowMfaDialog] = useState(false);
    const [mfaAction, setMfaAction] = useState<'enable' | 'disable'>('enable');
    const mfaForm = useForm({ code: '' });

    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (showMfaDialog && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown, showMfaDialog]);

    const resendCode = () => {
        if (countdown > 0) {
return;
}
        
        router.post('/settings/mfa/resend', { action: mfaAction }, {
            preserveScroll: true,
            onSuccess: () => setCountdown(60),
        });
    };

    const handleMfaToggle = (checked: boolean) => {
        if (isMfaForced) {
return;
}

        setMfaAction(checked ? 'enable' : 'disable');
        setMfaProcessing(true);
        
        router.post('/settings/mfa/setup', { action: checked ? 'enable' : 'disable' }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowMfaDialog(true);
                setCountdown(60);
            },
            onFinish: () => setMfaProcessing(false),
        });
    };

    const verifyMfa = (e: React.FormEvent) => {
        e.preventDefault();
        mfaForm.post(`/settings/mfa/verify-${mfaAction}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowMfaDialog(false);
                mfaForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-10">
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Two-Factor Authentication"
                        description="Secure your account with MFA."
                    />

                    <div className="flex flex-col gap-2 rounded-lg border p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="mfa_enabled" className="text-base font-medium">
                                Two-Factor Authentication (Email OTP)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account by requiring a code sent to your email upon login.
                                {isMfaForced && <span className="block mt-1 text-primary/80 font-medium">MFA is mandatory for your role and cannot be disabled.</span>}
                            </p>
                        </div>
                        <Switch
                            id="mfa_enabled"
                            checked={isMfaForced ? true : mfaEnabled}
                            disabled={isMfaForced || mfaProcessing}
                            onCheckedChange={handleMfaToggle}
                        />
                    </div>
                    {errors.mfa && (
                        <div className="mt-2 text-sm font-medium text-destructive">
                            {errors.mfa}
                        </div>
                    )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <Form
                    {...update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Current password
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    Save password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
                </div>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Recent Logins"
                        description="Review your recent login activity across different devices."
                    />
                    
                    <div className="rounded-lg border shadow-sm">
                        <div className="divide-y">
                            {loginHistory && loginHistory.length > 0 ? (
                                loginHistory.map((history, i) => (
                                    <div key={i} className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-medium">{history.os} - {history.browser}</p>
                                            <p className="text-sm text-muted-foreground">{history.ip}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {history.time}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-muted-foreground">No recent logins found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showMfaDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowMfaDialog(false);
                    mfaForm.reset();
                    mfaForm.clearErrors();
                }
            }}>
                <DialogContent>
                    <form onSubmit={verifyMfa}>
                        <DialogHeader>
                            <DialogTitle>{mfaAction === 'enable' ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}</DialogTitle>
                            <DialogDescription>
                                We've sent a 6-digit verification code to your email address. Please enter it below to confirm.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                value={mfaForm.data.code}
                                onChange={(e) => mfaForm.setData('code', e.target.value)}
                                maxLength={6}
                                className="mt-2 text-center text-2xl tracking-widest"
                                autoFocus
                            />
                            <InputError message={mfaForm.errors.code} className="mt-2" />
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:justify-between">
                            <div className="flex items-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground text-sm px-2"
                                    disabled={countdown > 0}
                                    onClick={resendCode}
                                >
                                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                                </Button>
                            </div>
                            <div className="flex gap-2 sm:justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowMfaDialog(false)}>Cancel</Button>
                                <Button type="submit" disabled={mfaForm.processing}>Verify</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
