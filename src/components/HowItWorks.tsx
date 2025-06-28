import { Upload, Search, HandHeart } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Post Your Items",
      description: "Upload photos and descriptions of items you want to donate. Our team verifies quality and authenticity.",
      step: "01",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-300"
    },
    {
      icon: Search,
      title: "Request & Connect",
      description: "People in need can browse and request items they require. Get matched instantly.",
      step: "02",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-300"
    },
    {
      icon: HandHeart,
      title: "Complete the Loop",
      description: "Arrange pickup or delivery through our secure chat system. Earn credit points for future requests.",
      step: "03",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-400"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">How KindLoop Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Creating meaningful connections through donation has never been easier. Follow these simple steps to make a difference.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center group">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className={`absolute -top-4 -right-4 bg-gradient-to-r ${step.gradient} text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-xl animate-pulse`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full">
                  <div className="border-t-4 border-dashed bg-gradient-to-r from-purple-400 to-pink-400 h-1 w-full rounded-full opacity-60"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;