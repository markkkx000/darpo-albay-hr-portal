import { useForm, Head } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    email: string;
    token: string;
};

export default function ResetPassword({ email, token }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, [reset]);

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <>
            <Head title="Reset Password" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid animate-fade-up gap-2">
                        <Label htmlFor="email">
                            Email Address
                        </Label>
                        <div className="focus-glow rounded-md transition">
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                readOnly
                                className="bg-muted"
                                tabIndex={1}
                                autoComplete="username"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid animate-fade-up-delay-1 gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="focus-glow rounded-md transition">
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                autoFocus
                                tabIndex={2}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid animate-fade-up-delay-2 gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <div className="focus-glow rounded-md transition">
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" disabled={processing} tabIndex={4} className="animate-fade-up-delay-3 mt-4">
                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                        Reset Password
                    </Button>
                </div>
            </form>
        </>
    );
}

ResetPassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="Reset Password" description="Please choose a new password. Ensure it's at least 8 characters long and contains a mix of characters.">
        {page}
    </AuthLayout>
);
