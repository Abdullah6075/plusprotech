import React from 'react';
import award2025 from '../assets/award-2025.png';
import award2026 from '../assets/award-2026.png';

const awards = [
  {
    img: award2025,
    year: '2025',
    title: 'Best of 2025',
    body: 'Recognised by BusinessRate as the top-rated Mobile Phone Repair Shop in Moline, Illinois.',
  },
  {
    img: award2026,
    year: '2026',
    title: 'Best of 2026',
    body: 'Named a Benchmark Award Winner by BusinessRate — powered by verified Google Reviews.',
  },
];

const AwardsSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-20 sm:py-28">
      {/* Subtle radial glow behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(236,68,33,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.22em] text-[#EC4421]">
            Recognition &amp; Awards
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Award-Winning Repair Shop
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/45">
            Trusted by our community and consistently recognised as the best mobile
            repair service in Moline, Illinois.
          </p>
        </div>

        {/* Award cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          {awards.map((award) => (
            <div
              key={award.year}
              className="group relative flex flex-col items-center rounded-2xl border border-white/8 bg-white/4 p-8 text-center transition-all duration-300 hover:border-[#EC4421]/40 hover:bg-white/6 hover:shadow-[0_0_40px_rgba(236,68,33,0.12)]"
            >
              {/* Thin top accent line */}
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-[#EC4421] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Award plaque image */}
              <div className="relative mb-6 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-2xl blur-2xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(236,68,33,0.18) 0%, transparent 70%)',
                  }}
                />
                <img
                  src={award.img}
                  alt={award.title}
                  className="relative h-64 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:h-72"
                />
              </div>

              {/* Year badge */}
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#EC4421]/30 bg-[#EC4421]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#EC4421]">
                {award.year}
              </span>

              <h3 className="mb-2 text-lg font-bold text-white">{award.title}</h3>
              <p className="text-sm leading-relaxed text-white/45">{award.body}</p>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mx-auto mt-14 max-w-2xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-8 py-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EC4421]/15">
              <svg className="h-5 w-5 text-[#EC4421]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Back-to-back award winner — 2025 &amp; 2026
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Awards are based on recent customer reviews, verified and ranked by BusinessRate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardsSection;
