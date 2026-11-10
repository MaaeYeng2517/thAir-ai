"use client"

import { useFormState } from "react-dom"
import { signIn as signInAction } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  async function action(prevState: { error: string } | null, formData: FormData) {
    return signInAction(formData)
  }

  const [state, formAction, isPending] = useFormState(action, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {state.error}
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full"
              disabled={isPending}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full"
              disabled={isPending}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
