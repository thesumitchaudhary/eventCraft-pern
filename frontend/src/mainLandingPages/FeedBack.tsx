import { useState } from "react";
import AuthModal from "./AuthModel";
import {
  Calendar,
  Calendar as Calenders,
  MapPin,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const FeedBack = () => {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  return (
    <>
      <div className="relative h-20 overflow-hidden">
        <header className="fixed top-0 z-50 h-20 w-full border-b border-border bg-background/80 py-5 backdrop-blur-md shadow-sm">
          <div className="flex justify-between max-w-6xl mx-auto">
            <h1 className="flex gap-2">
              <Calendar className="mt-1 text-primary" />
              <span className="text-xl mt-1 font-bold">Eventify</span>
            </h1>
            <div>
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
            </div>
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
      </div>

      {open && <AuthModal setOpen={setOpen} defaultMode={authMode} />}

      <main className="mx-5 my-10">
        <section className="bg-gray-50 p-5 rounded-2xl">
          <div>
            <h4 className="font-bold">Customer Reviews</h4>
            <p className="text-gray-500 text-sm">
              Read what our customers have to say
            </p>
          </div>

          <div className="max-w-sm mx-auto text-center my-8">
            <h2 className="text-3xl font-bold">What Our Customers Say</h2>
            <div className="flex gap-2 justify-center m-3">
              <div className="flex mt-1">
                <Star className="text-yellow-500 fill-yellow-500" />
                <Star className="text-yellow-500 fill-yellow-500" />
                <Star className="text-yellow-500 fill-yellow-500" />
                <Star className="text-yellow-500 fill-yellow-500" />
                <Star className="text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex gap-2">
                <span className="text-2xl font-bold">4.8</span>
                <span className="mt-1">
                  (<span className="text-gray-600">6 reviews</span>)
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    SJ
                  </span>
                  <div>
                    <h3 className="font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600 text-sm">12/15/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Wedding
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Absolutely amazing service! They made our wedding day perfect.
                Every detail was taken care of and the team was so professional.
              </p>
            </div>

            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    MC
                  </span>
                  <div>
                    <h3 className="font-semibold">Michael Chen</h3>
                    <p className="text-gray-600 text-sm">11/20/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Corporate
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Our corporate event was a huge success thanks to Eventify.
                Highly recommended for any professional gathering.
              </p>
            </div>

            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    ER
                  </span>
                  <div>
                    <h3 className="font-semibold">Emily Rodriguez</h3>
                    <p className="text-gray-600 text-sm">10/5/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Birthday
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Best birthday party ever! My daughter was so happy. The
                decorations were stunning and everything ran smoothly.
              </p>
            </div>

            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    DT
                  </span>
                  <div>
                    <h3 className="font-semibold">David Thompson</h3>
                    <p className="text-gray-600 text-sm">9/12/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Anniversary
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Great experience overall. The team was responsive and delivered
                exactly what we asked for. Would definitely use again.
              </p>
            </div>

            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    LA
                  </span>
                  <div>
                    <h3 className="font-semibold">Lisa Anderson</h3>
                    <p className="text-gray-600 text-sm">8/30/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Wedding
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Exceptional service from start to finish. They understood our
                vision and brought it to life beautifully.
              </p>
            </div>

            <div className="border border-gray-300 hover:shadow-xl px-6 py-4 rounded-2xl bg-white transition-shadow">
              <div className="flex justify-between my-4 gap-2">
                <div className="flex gap-3">
                  <span className="px-4 py-3 rounded-full bg-[#f3e8ff] text-purple-600">
                    JW
                  </span>
                  <div>
                    <h3 className="font-semibold">James Wilson</h3>
                    <p className="text-gray-600 text-sm">7/18/2025</p>
                  </div>
                </div>
                <span className="bg-gray-50 border border-gray-300 p-2 rounded-3xl text-xs h-fit">
                  Corporate
                </span>
              </div>
              <div className="flex my-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-700">
                Professional, creative, and reliable. Eventify exceeded all our
                expectations for our product launch event.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-foreground p-10 text-background mt-16">
        <div className="flex gap-40">
          <div className="w-70 flex flex-col gap-4">
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
            <h3 className="text-lg font-semibold whitespace-nowrap">
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
            <div className="flex flex-col gap-4 my-5">
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

export default FeedBack;
