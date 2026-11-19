import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const MediaFocusSection: React.FC = () => {
  const stories = [
    {
      category: 'Tactical Analysis',
      title: "Overlapping Midfield Blueprint: Tactical Analysis of Modern Formations",
      excerpt: "Modern 3-4-2-1 hybrid tactical setups are dominating possession metrics and offensive clearances.",
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
    },
    {
      category: 'Squad Depth',
      title: 'The Freshmen Phenomenon: 6 Underclassmen Fueling the Championship Charge',
      excerpt: 'From decisive stoppage-time strikes to impenetrable defensive tackles, first-year recruits are rewriting varsity records.',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    },
    {
      category: 'Goalkeeping',
      title: 'Clean Sheet Masters: The Shot-Stoppers Controlling the 18-Yard Box',
      excerpt: 'Statistical breakdown of save percentages, high-claim dominance, and penalty shootout metrics heading into the semi-finals.',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80',
    },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm mb-12 border border-surface-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2 border-b border-surface-container">
        <div>
          <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider font-extrabold">
            Tournament Media & Focus
          </span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold tracking-tight">
            The Road to the Collegiate National Cup
          </h3>
        </div>
        <Link
          href="/fixtures"
          className="font-headline-sm text-headline-sm text-primary-container hover:underline flex items-center gap-1 font-bold group"
        >
          <span>View Full Media Dispatch</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, idx) => (
          <div key={idx} className="flex flex-col group cursor-pointer">
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 bg-surface-container shadow-xs">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-on-background/80 backdrop-blur-md text-on-primary font-label-caps text-label-caps uppercase font-bold tracking-wider">
                {story.category}
              </div>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary-container transition-colors line-clamp-2 font-bold leading-snug">
              {story.title}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
              {story.excerpt}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
