import DashboardAuthButtons from "@/components/DashboardAuthButtons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardAuthButtons />
      {children}
    </>
  );
} 