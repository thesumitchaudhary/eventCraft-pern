import React, { useState } from "react";
import {
  Calendar,
  CircleQuestionMark,
  ChevronUp,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";

const FAQ = () => {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "How far in advance should I book my event?",
      answer:
        "We recommend booking at least 3-6 months in advance for major events like weddings and corporate functions. For smaller events, 4-8 weeks notice is usually sufficient. However, we can accommodate last-minute bookings based on availability.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, bank transfers, and online payment methods. A deposit is typically required to confirm your booking, with the remaining balance due before the event date.",
    },
    {
      question: "Can I customize my event package?",
      answer:
        "Absolutely! All our packages are fully customizable. You can add or remove services, choose different themes, and adjust the guest count. Our team will work with you to create a package that fits your vision and budget.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Cancellations made 60+ days before the event receive a full refund minus a 10% processing fee. Cancellations 30-59 days before receive 50% refund. Unfortunately, cancellations less than 30 days before the event are non-refundable, though we offer rescheduling options.",
    },
    {
      question: "Do you provide vendors for catering, photography, etc.?",
      answer:
        "Yes! We have a network of trusted vendors for catering, photography, videography, entertainment, and more. You can choose from our recommended vendors or bring your own. We coordinate with all vendors to ensure everything runs smoothly.",
    },
    {
      question: "Can I visit the venue before booking?",
      answer:
        "Of course! We encourage site visits. Contact us to schedule a venue tour. During the visit, you can see the space, discuss your requirements, and ask any questions. Virtual tours are also available for out-of-town clients.",
    },
    {
      question: "What happens if there is bad weather on my event day?",
      answer:
        "For outdoor events, we always have a backup plan. This may include indoor alternatives, tent arrangements, or rescheduling options. We monitor weather forecasts closely and communicate with you well in advance if changes are needed.",
    },
    {
      question: "Do you handle event permits and licenses?",
      answer:
        "Yes, we take care of all necessary permits, licenses, and insurance requirements for your event. This includes venue permits, music licenses, alcohol permits (if applicable), and any other regulatory requirements.",
    },
    {
      question: "Can I make changes to my booking after confirmation?",
      answer:
        "Yes, changes can be made up to 30 days before the event date. Changes may affect pricing depending on the nature of the modification. Major changes made less than 30 days before may incur additional fees.",
    },
    {
      question: "What COVID-19 safety measures do you have in place?",
      answer:
        "We follow all local health guidelines and can implement additional safety measures as requested. This includes capacity limits, sanitization stations, mask requirements, social distancing arrangements, and outdoor venue options.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#eeeeef] flex flex-col">
        {/* Header */}
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

        {/* Main Content */}
        <main className="flex-1 pt-20">
          <section className="border bg-gray-50 border-gray-400  rounded-md p-1 max-w-6xl my-10 mx-auto">
            <div className="p-4">
              <h1 className="font-bold text-2xl">Frequently Asked Questions</h1>
              <p className="text-gray-400 text-sm mb-3">
                Find answers to common questions
              </p>

              <div className="rounded-xl">
                <div>
                  {faqItems.map((item, index) => (
                    <div key={index} className="p-1 border-b border-gray-400">
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="hover:underline flex justify-between font-medium text-base w-full py-2"
                      >
                        {item.question}
                        {openFaq === index ? (
                          <ChevronUp className="text-gray-500" />
                        ) : (
                          <ChevronDown className="text-gray-500" />
                        )}
                      </button>

                      {openFaq === index && (
                        <p className="text-sm text-gray-600 pb-2">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full bg-foreground p-10 text-background mt-10">
          <div className="flex gap-40 max-w-6xl mx-auto">
            <div className="w-70 flex flex-col gap-4">
              <h1 className="flex gap-3 text-xl font-semibold">
                <Calendar className="text-primary" /> Eventify
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
          <div className="flex justify-between max-w-6xl mx-auto">
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
      </div>
    </>
  );
};

export default FAQ;
