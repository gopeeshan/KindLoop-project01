import { Shirt, Laptop, Book, Volleyball, Gamepad2, Home, Baby, Sofa, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();
  const categories = [
    {
      icon: Shirt,
      title: "Clothing & Accessories",
      description: "Clothes, shoes, bags, and accessories for all ages",
      filterValue: "Clothing & Accessories",
      gradient: "from-pink-400 to-purple-500",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: Laptop,
      title: "Electronics",
      description: "Phones, laptops, tablets, and home appliances",
      filterValue: "Electronics",
      gradient: "from-blue-400 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Book,
      title: "Books & Education",
      description: "Books, educational materials, and learning resources",
      filterValue: "Books & Education",
      gradient: "from-green-400 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Sofa,
      title: "Furniture",
      description: "Chairs, tables, storage solutions, and home decor",
      filterValue: "Furniture",
      gradient: "from-indigo-400 to-purple-600",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Volleyball,
      title: "Sports & Outdoors",
      description: "Sports equipment, outdoor gear, and fitness items",
      filterValue: "Sports & Outdoors",
      gradient: "from-purple-400 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Utensils,
      title: "Kitchen & Dining",
      description: "Cookware, appliances, dinnerware, and kitchen tools",
      filterValue: "Kitchen & Dining",
      gradient: "from-yellow-400 to-orange-500",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      icon: Home,
      title: "Home & Garden",
      description: "Decorations, plants, garden tools, and household items",
      filterValue: "Home & Garden",
      gradient: "from-teal-400 to-green-500",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600"
    },
    {
      icon: Gamepad2,
      title: "Toys & Games",
      description: "For Gamers of all ages, from toddlers to adults",
      filterValue: "Toys & Games",
      gradient: "from-orange-400 to-red-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: Baby,
      title: "Baby & Kids",
      description: "Baby gear, strollers, cribs, and children's items",
      filterValue: "Baby & Kids",
      gradient: "from-rose-400 to-pink-500",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600"
    }
  ];

  const handleCategoryClick = (filterValue: string) => {
    navigate(`/donations?category=${encodeURIComponent(filterValue)}`);
  };

  return (
    <section id="browse" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Browse Categories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover various categories of items available for donation. Filter by verified items for guaranteed quality.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-9">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative"
              onClick={() => handleCategoryClick(category.filterValue)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="text-center">
                  <div className={`${category.iconBg} rounded-2xl p-4 group-hover:scale-110 transition-transform inline-flex items-center justify-center mb-4 shadow-md`}>
                    <category.icon className={`h-8 w-8 ${category.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className={`font-bold mb-2 ${category.iconColor}`}></p>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
