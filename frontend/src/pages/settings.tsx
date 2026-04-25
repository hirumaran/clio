
import type React from "react"
import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useTheme } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Upload } from "lucide-react"

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const { theme, setTheme } = useTheme()

  const [form, setForm] = useState({
    name: user?.name || "",
    school: user?.school || "",
    bio: user?.bio || "",
  })

  if (!user) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(form)
    toast.success("Profile updated successfully")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, profile, and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Public profile</CardTitle>
                <CardDescription>This information is visible to other educators on Skēnē</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value })}
                    />
                  </div>
                </div>



                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell other educators a bit about yourself..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end mt-4">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your login credentials and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={user.email} />
              </div>
              <div className="space-y-2">
                <Label>Current password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => toast.success("Password updated")}>Update password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Skēnē looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose between light and dark appearance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control what you get notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Borrow requests", desc: "When someone requests your resources" },
                { label: "Messages", desc: "When you receive a direct message" },
                { label: "Reviews", desc: "When someone leaves you a review" },
                { label: "Weekly digest", desc: "Summary of new resources in your area" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              ))}
              <Button onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
