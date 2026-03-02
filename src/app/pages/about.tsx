import { Layout } from '../components/layout';
import { Card, CardContent } from '../components/ui/card';
import { Building2, Users, Award, Heart } from 'lucide-react';

export function About() {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-warm-beige to-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About Skyway Suites</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your trusted partner for property rentals in Kenya. We're dedicated to 
              connecting people with their perfect homes and investment opportunities.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-accent/20">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 text-accent">Our Mission</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  At Skyway Suites, we strive to revolutionize the Kenyan rental market by 
                  providing a seamless, transparent, and modern platform that makes finding 
                  and managing properties effortless. We believe everyone deserves access to 
                  quality housing and exceptional service.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality Properties</h3>
                <p className="text-muted-foreground">
                  We curate only the finest properties that meet our high standards 
                  for comfort and safety.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Your satisfaction is our priority. We provide 24/7 support to 
                  ensure your needs are met.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We maintain the highest standards in every aspect of our service 
                  and operations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community</h3>
                <p className="text-muted-foreground">
                  We're building more than rentals—we're creating vibrant 
                  communities across Kenya.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Story Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
            <Card>
              <CardContent className="p-8 space-y-4">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Founded in 2026, Skyway Suites was born from a simple observation: 
                  Kenya's rental market needed a modern, transparent, and user-friendly platform. 
                  Our founders, having experienced the challenges of finding quality rentals 
                  firsthand, set out to create something better.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Today, we're proud to serve thousands of customers across Kenya, from Nairobi 
                  to Mombasa, Kisumu to Eldoret. We've helped families find their dream homes, 
                  professionals secure convenient apartments, and investors discover lucrative 
                  opportunities.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  As we continue to grow, our commitment remains unchanged: to provide exceptional 
                  service, quality properties, and a seamless rental experience for every customer 
                  who trusts us with their housing needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2 text-accent">500+</div>
                <div className="text-lg opacity-90">Properties Listed</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2 text-accent">2,000+</div>
                <div className="text-lg opacity-90">Happy Customers</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2 text-accent">15+</div>
                <div className="text-lg opacity-90">Cities Covered</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2 text-accent">24/7</div>
                <div className="text-lg opacity-90">Support Available</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
