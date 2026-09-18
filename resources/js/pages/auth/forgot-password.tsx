import { useForm, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="animate-fade-up grid gap-2">
                        <Label htmlFor="email">Registered Email Address</Label>
                        <div className="focus-glow rounded-md transition">
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                placeholder="email@example.com"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        tabIndex={2}
                        className="animate-fade-up-delay-2 mt-4"
                    >
                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                        Confirm
                    </Button>
                </div>
            </form>
        </>
    );
}

ForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Reset password"
        description="Enter your registered email address to receive a password reset link."
    >
        {page}
    </AuthLayout>
);
