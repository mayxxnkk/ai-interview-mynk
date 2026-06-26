"use client"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { signUp, signIn } from "@/lib/actions/auth_action";

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        Password: z.string().min(6),
    });
};

const features = [
    { icon: "🎙️", title: "AI Voice Interviews", desc: "Practice with a real-time AI interviewer that speaks and listens" },
    { icon: "📊", title: "Instant Feedback", desc: "Get detailed scores on communication, technical skills, and more" },
    { icon: "🎯", title: "Role-Specific Questions", desc: "Tailored questions for your exact role, level, and tech stack" },
    { icon: "📈", title: "Track Progress", desc: "Review past interviews and feedback to improve over time" },
];

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const isSign = type === "sign-in";
    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", Password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (type === "sign-up") {
                const { name, email, Password } = values;
                const userCredentials = await createUserWithEmailAndPassword(auth, email, Password);
                const result = await signUp({ uid: userCredentials.user.uid, name: name!, email, password: Password });
                if (!result?.success) { toast.error(result?.message); return; }
                toast.success("Account created! Please sign in.");
                router.push("/sign-in");
            } else {
                const { email, Password } = values;
                const userCredentials = await signInWithEmailAndPassword(auth, email, Password);
                const idToken = await userCredentials.user.getIdToken();
                if (!idToken) { toast.error("Sign in failed"); return; }
                await signIn({ email, idToken });
                toast.success("Signed in successfully");
                router.push("/");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left side — branding & features */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 blue-gradient-dark px-16 py-12">
                <div className="flex items-center gap-3">
                    <Image src="/logo.svg" alt="logo" height={40} width={46} />
                    <span className="text-2xl font-bold text-primary-100">PrepWise</span>
                </div>

                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Ace Your Next<br />
                            <span className="text-primary-200">Job Interview</span>
                        </h1>
                        <p className="text-light-400 text-lg">
                            Practice with AI-powered mock interviews and get instant detailed feedback to land your dream job.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5">
                        {features.map((f) => (
                            <div key={f.title} className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200/20 text-xl shrink-0">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{f.title}</p>
                                    <p className="text-light-400 text-sm">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-light-600 text-sm">© 2025 PrepWise. All rights reserved.</p>
            </div>

            {/* Right side — form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 bg-dark-100">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
                        <Image src="/logo.svg" alt="logo" height={32} width={38} />
                        <span className="text-xl font-bold text-primary-100">PrepWise</span>
                    </div>

                    <div className="card-border">
                        <div className="card px-8 py-10 flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {isSign ? "Welcome back" : "Create your account"}
                                </h2>
                                <p className="text-light-400 mt-1 text-sm">
                                    {isSign
                                        ? "Sign in to continue your interview practice"
                                        : "Start practicing interviews for free today"}
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 form">
                                    {!isSign && (
                                        <FormField control={form.control} name="name" label="Full Name" placeholder="Your full name" />
                                    )}
                                    <FormField control={form.control} name="email" label="Email" placeholder="you@example.com" type="email" />
                                    <FormField control={form.control} name="Password" label="Password" placeholder="Min. 6 characters" type="password" />
                                    <Button className="btn w-full mt-2" type="submit">
                                        {isSign ? "Sign In" : "Create Account"}
                                    </Button>
                                </form>
                            </Form>

                            <p className="text-center text-sm text-light-400">
                                {isSign ? "Don't have an account?" : "Already have an account?"}
                                <Link
                                    href={isSign ? "/sign-up" : "/sign-in"}
                                    className="font-bold text-primary-200 ml-1 hover:underline"
                                >
                                    {isSign ? "Sign up" : "Sign in"}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
