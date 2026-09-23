"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function ProfileDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (open) {
      // Fetch user data when dialog opens
      supabase.auth.getUser().then(async ({ data }) => {
        if (data?.user) {
          setUserId(data.user.id);
          setEmail(data.user.email || "");
          
          // Try to get from database first
          try {
            const dbUser = await api.get(`/users/${data.user.id}`);
            if (dbUser) {
              setName(dbUser.name || data.user.user_metadata?.full_name || "");
              setPhone(dbUser.phone || data.user.user_metadata?.phone_number || "");
              setRole(dbUser.role || data.user.user_metadata?.role || "");
              return;
            }
          } catch (e) {
            console.error("User not found in DB, using Auth metadata");
          }
          
          // Fallback to Auth metadata
          setName(data.user.user_metadata?.full_name || data.user.user_metadata?.name || "");
          setPhone(data.user.user_metadata?.phone_number || "");
          setRole(data.user.user_metadata?.role || "");
        }
      });
    }
  }, [open]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: email, // Warning: if email changes, they need to verify
        data: {
          full_name: name,
          phone_number: phone
        }
      });

      if (authError) throw authError;

      // 2. Sync to public.users table (API)
      await api.post('/users', {
        id: userId,
        name: name,
        email: email,
        phone: phone,
        role: role
      });

      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error.message || "An error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer" 
        title="Edit Profile"
      >
        <UserCircle className="h-5 w-5 text-slate-600" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your contact information. This syncs across your AgroSetu account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                placeholder="+91..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
