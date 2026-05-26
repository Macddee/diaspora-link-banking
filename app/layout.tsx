import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiasporaLink Banking",
  description: "Secure remittance platform.",
};

// Surface password rules *inside* the sign-up form's password input via
// Clerk's localization keys, so the format is shown up-front as a placeholder.
const clerkLocalization = {
  formFieldInputPlaceholder__password: 'Min 8 chars: upper, lower, number & symbol',
  formFieldInputPlaceholder__confirmPassword: 'Re-enter the same password',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="en">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}