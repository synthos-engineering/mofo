import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Lock,
  Heart,
  CheckCircle2,
  Smartphone,
  Bot,
  Eye,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Dating with <span className="underline">Brainwaves</span>
          </h1>
          <p className="text-l mx-auto max-w-2xl text-gray-600">
            Privacy-first dating app that turns a short EEG session into emotional preference traits, then launches your personal AI agent to find meaningful connections.
          </p>
          <p className="text-l mx-auto mb-8 max-w-2xl text-gray-600">
            Your <span className="font-semibold">uAgent</span> does the searching, screening, and scheduling while you stay in control.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800"
            >
              <Brain className="mr-2 h-5 w-5" />
              Start EEG Session
            </Button>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500 mb-10">
            <strong>How it works:</strong> Verify with World ID, scan QR on Mofo Hub, 
            <span className="mx-1 rounded bg-white px-1 py-1 font-mono font-bold">
              EEG for 60s
            </span>
            while viewing prompts, then your uAgent takes over.
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Why Mofo?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="px-6 py-8 text-center">
                <Brain className="mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-3 text-xl font-semibold">Emotion-Aware</h3>
                <p className="text-sm text-gray-600">
                  Real-time EEG-derived traits complement your profile.
                  <br />
                  No raw brain data ever leaves your device.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-6 py-8 text-center">
                <Bot className="mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-3 text-xl font-semibold">
                  Agentic Workflow
                </h3>
                <p className="text-sm text-gray-600">
                  Your uAgent does the searching, screening, and scheduling.
                  <br />
                  You review summaries and tap Accept.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How Mofo Works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            How Mofo Works
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
            From EEG session to meaningful connections in 4 simple steps
          </p>

          {/* Visual Flow Diagram */}
          <div className="relative mb-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {/* Step 1: KYC */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <Shield className="h-10 w-10 text-blue-700" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">1. Verify</h3>
                <p className="text-sm text-gray-600">World ID KYC</p>
              </div>

              {/* Step 2: EEG */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                  <Brain className="h-10 w-10 text-purple-700" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">2. EEG Session</h3>
                <p className="text-sm text-gray-600">60s brainwave scan</p>
              </div>

              {/* Step 3: uAgent */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <Bot className="h-10 w-10 text-green-700" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">3. uAgent Deploy</h3>
                <p className="text-sm text-gray-600">AI agent with your traits</p>
              </div>

              {/* Step 4: Match */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
                  <Heart className="h-10 w-10 text-pink-700" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">4. Match & Meet</h3>
                <p className="text-sm text-gray-600">Stake commitment</p>
              </div>
            </div>

            {/* Connection Arrows */}
            <div className="absolute top-10 right-1/4 left-1/4 hidden md:block">
              <div className="flex items-center justify-between">
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Detailed Process Steps */}
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black font-bold text-white">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold">
                    Verify with World ID
                  </h4>
                  <p className="ml-1 text-sm text-gray-600">
                    Complete KYC verification to ensure authentic users. Your identity is verified without compromising privacy.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black font-bold text-white">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold">
                    EEG Session & Trait Extraction
                  </h4>
                  <p className="ml-1 text-sm text-gray-600">
                    Scan QR on Mofo Hub, connect EEG device, and complete a 60-second session while viewing emotional prompts. 
                    We compute lightweight features locally - no raw brain data ever leaves your device.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black font-bold text-white">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold">
                    uAgent Deployment & Auto-Swiping
                  </h4>
                  <p className="ml-1 text-sm text-gray-600">
                    Your uAgent (with ENS handle like viman.mofo.eth) auto-swipes, runs agent-to-agent chats to test vibe, 
                    and proposes first meets. You get privacy-preserving summaries with no transcripts.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black font-bold text-white">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold">
                    Match Acceptance & Staking
                  </h4>
                  <p className="ml-1 text-sm text-gray-600">
                    If you like the match, tap Accept. Both agents stake a small amount to lock commitment, 
                    reducing no-shows without shaming. Policies deter flakes through aligned incentives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Safety */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Privacy & Safety
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <Lock className="mb-3 h-8 w-8 text-gray-700" />
                <h4 className="mb-2 font-semibold">What We Collect</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• EEG features → trait commitment (hash)</li>
                  <li>• User-set preferences</li>
                  <li>• Opt-in consent flags</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <Eye className="mb-3 h-8 w-8 text-gray-700" />
                <h4 className="mb-2 font-semibold">What We Don't</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Raw EEG data</li>
                  <li>• Identifiable chat content</li>
                  <li>• Your contacts</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <Shield className="mb-3 h-8 w-8 text-gray-700" />
                <h4 className="mb-2 font-semibold">Your Controls</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Spending/staking caps</li>
                  <li>• Opt-out anytime</li>
                  <li>• Revoke proofs</li>
                  <li>• Pause/stop agent</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-gray-700" />
                <h4 className="mb-2 font-semibold">Key Concepts</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>uAgent:</strong> Your autonomous dating agent</li>
                  <li>• <strong>ENS:</strong> Human-readable identity (name.mofo.eth)</li>
                  <li>• <strong>Stake:</strong> Commitment mechanism</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-2 bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Ready to revolutionize dating with AI?
          </h2>
          <p className="mb-6 text-gray-300">
            Join the privacy-first dating revolution where your brainwaves power meaningful connections.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100"
            >
              <Brain className="mr-2 h-5 w-5" />
              Start EEG Session
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-gray-500">
          <p className="italic">
            Mofo • Privacy-first dating with AI agents •{' '}
            <a
              href="https://github.com/0xYudhishthra/mofo"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}