import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Categories from "@/components/Categories";
import FeaturedDonations from "@/components/FeaturedDonations";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
        <Navigation/>
        <Hero />
        <HowItWorks />
        <Categories />
        <FeaturedDonations />
        <Contact />
        <Footer />
    </div>
  );
};

export default Index;
