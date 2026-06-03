import { useState } from "react";
import {
  Calendar,
  Calendar as Calenders,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModel";

import anniversary from "../images/Anniversary.jpg";
import anniversary2 from "../images/Anniversary2.jpg";
import birthday from "../images/birthday.jpg";
import birthday2 from "../images/birthday2.jpg";
import corporate from "../images/corporate.jpg";
import corporate2 from "../images/corporate2.jpg";
import wedding from "../images/wedding.jpg";
import wedding2 from "../images/wedding-2.jpg";
import wedding3 from "../images/Wedding3.jpg";

const galleryItems = [
  {
    category: "Wedding",
    image: wedding,
    title: "Elegant Garden Wedding",
    description: "Beautiful outdoor wedding with floral arrangements",
  },
  {
    category: "Corporate",
    image: corporate,
    title: "Modern Corporate Event",
    description: "Professional business conference setup",
  },
  {
    category: "Birthday",
    image: birthday,
    title: "Magical Birthday Party",
    description: "Colorful and fun birthday celebration",
  },
  {
    category: "Anniversary",
    image: anniversary,
    title: "Romantic Anniversary",
    description: "Intimate anniversary dinner setup",
  },
  {
    category: "Wedding",
    image: wedding2,
    title: "Beach Wedding Ceremony",
    description: "Stunning beachside wedding celebration",
  },
  {
    category: "Corporate",
    image: corporate2,
    title: "Product Launch Event",
    description: "High-tech product unveiling event",
  },
  {
    category: "Birthday",
    image: birthday2,
    title: "Kids Birthday Extravaganza",
    description: "Fun-filled childrens party with activities",
  },
  {
    category: "Anniversary",
    image: anniversary2,
    title: "Golden Anniversary",
    description: "50th anniversary celebration",
  },
  {
    category: "Wedding",
    image: wedding3,
    title: "Rustic Wedding",
    description: "Charming barn wedding setup",
  },
];

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  return (
    <>
      <header className="fixed top-0 z-50 h-20 w-full border-b border-border bg-background/80 py-5 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl justify-between">
          <h1 className="flex gap-2">
            <Calendar className="mt-1 text-primary" />
            <span className="mt-1 text-xl font-bold">Eventify</span>
          </h1>
          <nav>
            <ul className="flex gap-5">
              <li>
                <Link to={"/"}>Home</Link>
              </li>
              <li>
                <Link to={"/Gallery"}>Gallery</Link>
              </li>
              <li>
                <Link to={"/feedBack"}>Feedback</Link>
              </li>
              <li>
                <Link to={"/FAQ"}> FAQ</Link>
              </li>
            </ul>
          </nav>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOpen(true);
                setAuthMode("signin");
              }}
              className="flex h-8 gap-1 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setOpen(true);
                setAuthMode("signup");
              }}
              className="flex h-8 gap-1 rounded-md bg-primary px-2 py-1 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              GetStart
            </button>
          </div>
        </div>
      </header>

      {open && <AuthModal setOpen={setOpen} defaultMode={authMode} />}

      <main className="bg-[#eeeeef] pt-28">
        <section className="mx-auto my-10 max-w-6xl rounded-xl border border-gray-300 bg-gray-50">
          <div className="p-6">
            <div className="grid gap-2">
              <h4 className="text-xl font-semibold">Event Gallery</h4>
              <p className="text-sm text-gray-500">
                View photos from our events
              </p>
            </div>
            <div>
              <h2 className="mt-2 text-center text-2xl font-bold">
                Our Event Gallery
              </h2>
              <p className="mt-4 text-center text-gray-700">
                Browse through our collection of beautifully executed events
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm"
              >
                <div className="relative">
                  <span className="absolute right-4 top-4 rounded-md bg-gray-100 px-2 py-1 text-xs">
                    {item.category}
                  </span>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-64 w-full object-cover"
                  />
                </div>
                <div className="mt-4 grid gap-2 px-4 pb-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-foreground p-10 text-background">
        <div className="flex gap-40">
          <div className="flex w-70 flex-col gap-4">
            <h1 className="flex gap-3 text-xl font-semibold">
              <Calenders className="text-primary" /> Eventify
            </h1>
            <p className="my-2 w-90 text-base text-background/75">
              Creating unforgettable moments through professional event
              management and planning services.
            </p>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-background/10 p-1 transition-colors hover:bg-primary/30 ">
                <FaFacebookF className="h-8 w-8 rounded-full bg-[#1e2939] p-2" />
              </div>
              <div className="h-10 w-10 rounded-full bg-background/10 p-1">
                <FaTwitter className="h-8 w-8 rounded-full bg-[#1e2939] p-2" />
              </div>
              <div className="h-10 w-10 rounded-full bg-background/10 p-1">
                <FaInstagram className="h-8 w-8 rounded-full bg-[#1e2939] p-2" />
              </div>
              <div className="h-10 w-10 rounded-full bg-background/10 p-2">
                <FaLinkedin className="h-6 w-6 rounded-full bg-[#1e2939] p-1" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="whitespace-nowrap text-lg font-semibold">
              Quick Links
            </h3>
            <ul className="my-4 flex flex-col gap-2 text-base text-background/75">
              <li>About us</li>
              <li>Our Services</li>
              <li>Portfolio</li>
              <li>Testimonials</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="my-4 flex flex-col gap-2 text-base text-background/75">
              <li className="whitespace-nowrap">Wedding Planning</li>
              <li className="whitespace-nowrap">Corporate Events</li>
              <li className="whitespace-nowrap">Birthday Parties</li>
              <li className="whitespace-nowrap">Social Gatherings</li>
              <li className="whitespace-nowrap">Special Occasions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">contact us</h3>
            <div className="my-5 flex flex-col gap-4">
              <div className="flex gap-2">
                <MapPin className="text-primary" />
                <span className="mr-10">
                  123 Event Street, New York, NY 10001
                </span>
              </div>
              <div className="flex gap-2">
                <Phone className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex gap-2">
                <Mail className="text-primary" />
                <span>info@eventify.com</span>
              </div>
            </div>
          </div>
        </div>
        <br />
        <hr />
        <div className="flex justify-between">
          <div>
            &copy; <span>2026 Eventify. All rights reserved.</span>
          </div>
          <div>
            <ul className="flex gap-5">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Gallery;
