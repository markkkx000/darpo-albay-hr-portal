import { useForm, Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function MfaVerify() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        trust_device: false,
    });

    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const resendCode = () => {
        if (countdown > 0) {
            return;
        }

        router.post(
            '/mfa/resend',
            {},
            {
                onSuccess: () => setCountdown(60),
                preserveScroll: true,
            },
        );
    };

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/mfa/verify');
    };

    return (
        <>
            <Head title="MFA Verify" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="animate-fade-up grid gap-2">
                        <Label htmlFor="code">Authentication Code</Label>
                        <div className="focus-glow rounded-md transition">
                            <Input
                                id="code"
                                type="text"
                                name="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                required
                                autoFocus
                                maxLength={6}
                                placeholder="123456"
                                className="text-center text-lg tracking-widest"
                            />
                        </div>
                        <InputError message={errors.code} />
                    </div>

                    <div className="animate-fade-up-delay-1 flex items-center space-x-3">
                        <Checkbox
                            id="trust_device"
                            name="trust_device"
                            checked={data.trust_device}
                            onCheckedChange={(checked) =>
                                setData('trust_device', checked === true)
                            }
                        />
                        <Label
                            htmlFor="trust_device"
                            className="font-normal text-muted-foreground"
                        >
                            Don't ask again on this device for 90 days
                        </Label>
                    </div>

                    <div className="animate-fade-up-delay-2 flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Verify Code
                        </Button>
                        <Button
                            type="button"
                            variant="link"
                            className="w-full text-muted-foreground hover:text-foreground hover:no-underline"
                            disabled={countdown > 0}
                            onClick={resendCode}
                        >
                            {countdown > 0
                                ? `Resend code in ${countdown}s`
                                : 'Resend code'}
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}

MfaVerify.layout = {
    title: 'Two-Factor Authentication',
    description: 'Enter the 6-digit code sent to your email',
};
