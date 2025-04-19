
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { TaskProLogo } from "@/components/ui/taskpro-logo";

export default function AdminAuth() {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <TaskProLogo size="large" className="mb-2" />
          <h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">
            Enter your admin credentials to access the dashboard
          </p>
        </div>
        
        <AdminLoginForm />
        
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            Return to main application
          </button>
        </div>
      </div>
    </div>
  );
}
