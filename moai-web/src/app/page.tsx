import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Zap, Users, ArrowRight, Play } from "lucide-react";
import { MoaiIcon } from "@/components/icons";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MoaiIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">MOAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/models">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="outline" className="mb-4">
            Mathematical Optimization AI Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Build & Solve Optimization Models
          </h1>
          <p className="text-xl text-muted-foreground">
            Create, edit, and solve Mixed Integer Linear Programming (MILP)
            models with an intuitive visual interface powered by AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/models">
              <Button size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Building Models
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose MOAI?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your optimization workflow with modern tools designed for
            efficiency and clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual Model Builder</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build complex optimization models with an intuitive
                drag-and-drop interface. Define variables, constraints, and
                objectives without writing code.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Assistance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent suggestions for model structure, constraint
                formulation, and optimization strategies powered by advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Collaborative Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share models with your team, collaborate in real-time, and
                maintain version control for your optimization projects.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Optimize?</h2>
            <p className="text-xl text-muted-foreground">
              Join researchers, analysts, and engineers who trust MOAI for their
              optimization needs.
            </p>
            <Link href="/models">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                Get Started for Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 MOAI </p>
        </div>
      </footer>
    </div>
  );
}
