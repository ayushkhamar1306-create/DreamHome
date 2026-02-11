export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-card via-card to-secondary/20 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl text-foreground">DreamHome</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted platform for finding premium real estate. Discover your perfect home today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Browse</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Buy Properties</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Rent Properties</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">New Listings</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Featured</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition font-medium">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground font-medium">
            © 2024 DreamHome. All rights reserved. | Premium Real Estate Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
