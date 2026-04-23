import NvHeader from "@/components/NvHeader";
import NvHero from "@/components/NvHero";
import NvFooter from "@/components/NvFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NvHeader />
      <main id="overview" className="flex-1">
        <NvHero />
      </main>
      <NvFooter />
    </div>
  );
};

export default Index;
