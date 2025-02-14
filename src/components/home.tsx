import React from "react";
import { Map, Calendar, Navigation2, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";

const features = [
  {
    icon: Map,
    title: "Interactive Maps",
    description:
      "Explore destinations with detailed maps and points of interest",
  },
  {
    icon: Calendar,
    title: "Trip Organization",
    description: "Keep all your travel plans organized in one place",
  },
  {
    icon: Navigation2,
    title: "Real-time Navigation",
    description: "Get turn-by-turn directions and discover nearby attractions",
  },
  {
    icon: Shield,
    title: "Secure Planning",
    description: "Your travel plans and data are always protected",
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-[800px] bg-background overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:via-cyan-500/20 dark:to-indigo-500/20" />
          <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        {/* Content */}
        <div className="relative pt-24 pb-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Your Next Adventure
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 animate-text-gradient bg-300% text-transparent bg-clip-text">
                Starts Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Discover and plan your perfect trip with our intelligent travel
              companion. From hidden gems to popular destinations.
            </p>

            <div className="flex gap-4 justify-center mb-12">
              <Link to="/search">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white"
                >
                  Start Exploring
                </Button>
              </Link>
            </div>

            {/* Auth Buttons */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex gap-4 justify-center mb-16"
              >
                <Link to="/auth/signin">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Gradient Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-100/50 dark:from-purple-900/50 to-transparent pointer-events-none" />

        {/* Features Section */}
        <div className="relative bg-background/50 backdrop-blur-sm py-24 sm:py-32 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Plan Faster
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to plan your perfect trip
              </p>
            </div>
            <div className="mx-auto max-w-2xl sm:max-w-none">
              <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1,
                      duration: 0.8,
                    }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="mb-6 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-4 shadow-lg transform transition-transform duration-300 hover:scale-110">
                      <feature.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Section */}
      <section className="py-24 bg-gradient-to-b from-background via-purple-100/20 dark:via-purple-900/20 to-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Plan Your Journey with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Interactive Maps
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore destinations, find attractions, and get real-time
                navigation all in one place. Our interactive maps make trip
                planning easier than ever.
              </p>
              <Link to="/search">
                <Button
                  size="lg"
                  className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-border"
                >
                  Try it now
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20 transform rotate-6" />
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                alt="Interactive Map"
                className="rounded-2xl shadow-xl relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trip Planning Section */}
      <section className="py-24 bg-gradient-to-b from-background via-cyan-100/20 dark:via-cyan-900/20 to-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-2xl opacity-20 transform -rotate-6" />
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"
                alt="Trip Planning"
                className="rounded-2xl shadow-xl relative z-10"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-1 md:order-2 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Organize Your Trips
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Like Never Before
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Keep track of your itineraries, bookings, and expenses in one
                place. Share plans with travel companions and make real-time
                updates.
              </p>
              <Link to="/auth/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-border"
                >
                  Start Planning
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                <h3 className="text-xl font-bold text-foreground">
                  TravelEase
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your ultimate travel companion for planning and organizing trips
                around the world. Discover new destinations and create
                unforgettable memories.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  Features
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Search Places",
                    "Trip Planning",
                    "Navigation",
                    "Travel Guides",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        to="#"
                        className="hover:text-foreground transition-colors duration-200"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "About Us",
                    "Careers",
                    "Privacy Policy",
                    "Terms of Service",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        to="#"
                        className="hover:text-foreground transition-colors duration-200"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              © {new Date().getFullYear()} TravelEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
