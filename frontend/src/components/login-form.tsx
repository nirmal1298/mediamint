import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/api/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const formData = new FormData()
        formData.append("username", email)
        formData.append("password", password)

        try {
            const { data } = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })
            await login(data.access_token)
            navigate("/")
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed. Please check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-sm text-balance">
                                    Enter your credentials to access your account
                                </p>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link to="#" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Field>

                            {error && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Field>
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? "Signing in..." : "Sign in"}
                                </Button>
                            </Field>

                            <FieldDescription className="text-center">
                                Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/images/signup-cover.png"
                            alt="IssueHub Collaborative Workspace"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}
