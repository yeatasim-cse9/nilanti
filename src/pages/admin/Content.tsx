import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen, Home, Info, User } from "lucide-react";
import BlogTab from "@/components/admin/content/BlogTab";
import PolicyTab from "@/components/admin/content/PolicyTab";
import HomeSectionsTab from "@/components/admin/content/HomeSectionsTab";
import GeneralInfoTab from "@/components/admin/content/GeneralInfoTab";
import AboutTab from "@/components/admin/content/AboutTab";

const AdminContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">কন্টেন্ট ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">ব্লগ, পলিসি, ওয়েবসাইট কন্টেন্ট এবং হোম সেকশন পরিচালনা করুন</p>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="blog" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">ব্লগ</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">পলিসি</span>
          </TabsTrigger>
          <TabsTrigger value="home" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">হোম সেকশন</span>
          </TabsTrigger>
           <TabsTrigger value="about" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">আমাদের সম্পর্কে</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">সাধারণ তথ্য</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <BlogTab />
        </TabsContent>

        <TabsContent value="policies">
          <PolicyTab />
        </TabsContent>

        <TabsContent value="home">
          <HomeSectionsTab />
        </TabsContent>
        
        <TabsContent value="about">
          <AboutTab />
        </TabsContent>

        <TabsContent value="general">
          <GeneralInfoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
