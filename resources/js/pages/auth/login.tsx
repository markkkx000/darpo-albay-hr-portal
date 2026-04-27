import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                action="/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid animate-fade-up gap-2">
                                <Label htmlFor="login">
                                    Email or Employee Number
                                </Label>
                                <div className="focus-glow rounded-md transition-all">
                                    <Input
                                        id="login"
                                        type="text"
                                        name="login"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="email@example.com or EMP-0001"
                                    />
                                </div>
                                <InputError message={errors.login} />
                            </div>

                            <div className="grid animate-fade-up-delay-1 gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="focus-glow rounded-md transition-all">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex animate-fade-up-delay-2 items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <div className="animate-fade-up-delay-3">
                                <Button
                                    type="submit"
                                    className="mt-4 w-full bg-linear-to-br from-[hsl(142,70%,48%)] to-[hsl(52,95%,55%)] font-bold text-[#030f04] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3),0_0_20px_rgba(110,210,100,0.3)] transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description:
        'Enter your email or employee number and password to log in',
};
