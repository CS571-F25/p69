import Section from "./Section.jsx";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-3 py-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">About</h1>

      <div className="space-y-4 sm:space-y-6">
        <Section title="What is Trick Water Skiing?">
          <p className="text-base text-white font-medium leading-relaxed">
            Trick water skiing is a competitive discipline where skiers perform a series of spins, flips, and other
            acrobatic maneuvers while being towed behind a boat. Athletes have two 20-second passes to complete as
            many tricks as possible, with each trick assigned a point value based on difficulty. The same trick
            cannot be scored twice across both passes, making strategic planning essential.
          </p>
        </Section>

        <Section title="About This App">
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            This trick calculator helps water ski athletes and coaches plan and track trick runs. Based on the
            official IWWF 2025 rules, it provides:
          </p>
          <ul className="text-base text-white font-medium space-y-1.5 ml-4 list-disc">
            <li>Real-time point calculation as you build your pass</li>
            <li>Automatic tracking of which tricks have been used</li>
            <li>Support for all modifiers including wake, toe, and stepover variations</li>
            <li>Two-pass system with duplicate detection</li>
            <li>Shareable text formatting for your trick runs</li>
            <li>Smart predictions for the most likely next trick</li>
            <li>Quick reference guide to all trick values</li>
          </ul>
        </Section>

        <Section title="Developed By">
          <p className="text-base text-white font-medium">
            Jake Artang & Calvin DeBellis
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            TrickSki Calculator is designed to respect your privacy. We do not collect, store,
            or transmit any personal information. All app data stays on your device.
          </p>
          <p className="text-base text-white font-medium leading-relaxed mb-3">
            Your preferences (such as skill level and custom tricks) are stored locally on your
            device and are never sent to any server. The trick prediction model runs entirely
            on-device, so no data leaves your phone or browser.
          </p>
          <p className="text-base text-white font-medium leading-relaxed">
            This app does not use any third-party analytics, advertising, or tracking services.
          </p>
          <p className="text-sm text-slate-400 mt-3">Last updated: March 5, 2026</p>
        </Section>
      </div>
    </div>
  );
}
