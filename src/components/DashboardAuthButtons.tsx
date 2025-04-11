'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function DashboardAuthButtons() {
  return (
    <div className="flex justify-end p-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 ease-in-out cursor-pointer">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
} 