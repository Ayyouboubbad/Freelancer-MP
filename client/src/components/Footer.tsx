import { Link } from 'react-router-dom';
import { Zap, ExternalLink, MessageSquare, Globe, Mail } from 'lucide-react';

const LINKS = {
  Platform: [
    { label: 'Browse Gigs', to: '/' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Become a Seller', to: '/register' },
    { label: 'Pricing', to: '/#pricing' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'Report a Bug', to: '#' },
    { label: 'Dispute Resolution', to: '#' },
  ],
  Legal: [
    { label: 'Terms of Service', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Cookie Policy', to: '#' },
  ],
};

const Footer = () => (
  <footer className="border-t border-white/5 bg-surface-900 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              Freelancer<span className="text-gradient">MP</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            The premium marketplace connecting world-class freelance talent with ambitious businesses.
          </p>
          <div className="flex gap-3">
            {[ExternalLink, MessageSquare, Globe, Mail].map((Icon, i) => (
              <a key={i} href="#" className="btn-icon btn-secondary !p-2">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group}>
            <h4 className="font-semibold text-white mb-4 text-sm">{group}</h4>
            <ul className="flex flex-col gap-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-brand-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} FreelancerMP. All rights reserved.</p>
        <p>Built with ❤️ using React, Node.js & MongoDB</p>
      </div>
    </div>
  </footer>
);

export default Footer;
