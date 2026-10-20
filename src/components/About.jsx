import Section from "./Section.jsx";
import DonationMeter from "./DonationMeter.jsx";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-3 py-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">About</h1>

      <div className="space-y-4 sm:space-y-6">
        <Section title="Developed By">
          <p className="text-base text-white font-medium mb-3">
            Jake Artang &amp; Calvin DeBellis
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            <span className="font-bold">Jake Artang:</span> Hey! I'm a 3-event waterskier from U of Wisconsin-Madison.
            In addition to TrickSkiCalc, I'm also contracting with USA Water Ski for their livescoring and officials
            management systems. I'm currently graduating with a degree in computer science this spring and looking for
            places to ski in Florida and/or roommates to ski bum with. HMU at{" "}
            <a href="mailto:jake.artang@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
              jake.artang@gmail.com
            </a>{" "}
            if you know of any opportunities. If you like the app and want to support future developments or help me
            out, consider donating using the link below.
          </p>
        </Section>

        <Section title="Help me buy a new trick handle!">
          <DonationMeter />
        </Section>

        <Section title="Privacy Policy">
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            TrickSki Calculator is designed to respect your privacy. We do not collect, store,
            or transmit any personal information.
          </p>
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            Your preferences (such as skill level and custom tricks) are stored locally on your
            device and are never sent to any server. The trick prediction model runs entirely
            on-device, so your trick data never leaves your phone or browser.
          </p>
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            The About page fetches an anonymous running total for the donation meter from our server.
            Donations are processed by Stripe on Stripe's website; this app never sees or stores payment details.
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            This app does not use any third-party analytics, advertising, or tracking services.
          </p>
          <p className="text-sm text-slate-400 mt-3">Last updated: October 19, 2026</p>
        </Section>
      </div>
    </div>
  );
}
