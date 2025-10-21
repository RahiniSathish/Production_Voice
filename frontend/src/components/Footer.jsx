export default function Footer() {
  return (
    <footer className="bg-night text-white p-6 mt-12">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Attar Travel. Your AI Travel Companion to Saudi Arabia.
        </p>
        <div className="mt-2 space-x-4 text-xs">
          <a href="#" className="hover:text-gold">Privacy Policy</a>
          <a href="#" className="hover:text-gold">Terms of Service</a>
          <a href="#" className="hover:text-gold">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

