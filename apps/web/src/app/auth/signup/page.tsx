"use client"

import { useFormState } from "react-dom"
import { signUp as signUpAction } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  async function action(prevState: { error: string } | null, formData: FormData) {
    return signUpAction(formData)
  }

  const [state, formAction, isPending] = useFormState(action, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join thAir-AI and start building AI agents</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 p-2 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {state.error}
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <Input
              name="full_name"
              placeholder="Full name"
              required
              className="w-full"
              disabled={isPending}
            />
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
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <a href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
