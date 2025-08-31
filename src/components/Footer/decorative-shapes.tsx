/**
 * Footer Decorative Shapes Component
 * 
 * Background decorative elements and patterns
 */

import Image from 'next/image'

export function DecorativeShapes() {
  return (
    <div>
      {/* Left shape */}
      <span className="absolute left-0 top-0 z-[-1] aspect-[95/82] w-full max-w-[570px]">
        <Image src="/images/footer/shape-1.svg" alt="shape" fill />
      </span>

      {/* Bottom right shape */}
      <span className="absolute bottom-0 right-0 z-[-1] aspect-[31/22] w-full max-w-[372px]">
        <Image src="/images/footer/shape-3.svg" alt="shape" fill />
      </span>

      {/* Top right dots pattern */}
      <span className="absolute right-0 top-0 z-[-1]">
        <DotsPattern />
      </span>
    </div>
  )
}

function DotsPattern() {
  return (
    <svg
      width="102"
      height="102"
      viewBox="0 0 102 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Row 1 */}
      <circle cx="1.8667" cy="35.0633" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="35.0633" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="35.0626" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="35.0626" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="35.0633" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="35.0633" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="35.0633" r="1.8667" fill="white" fillOpacity="0.08" />

      {/* Row 2 */}
      <circle cx="1.8667" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="18.6281" r="1.8667" fill="white" fillOpacity="0.08" />

      {/* Row 3 */}
      <circle cx="1.8667" cy="2.19261" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="2.19261" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="2.19293" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="2.19293" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="2.19261" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="2.19261" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="2.19261" r="1.8667" fill="white" fillOpacity="0.08" />

      {/* Additional rows following same pattern */}
      <circle cx="1.8667" cy="84.0705" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="84.0705" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="84.0702" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="84.0702" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="84.0705" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="84.0705" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="84.0705" r="1.8667" fill="white" fillOpacity="0.08" />

      <circle cx="1.8667" cy="67.6353" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="67.6353" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="67.635" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="67.635" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="67.635" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="67.6353" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="67.6353" r="1.8667" fill="white" fillOpacity="0.08" />

      <circle cx="1.8667" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="100.132" r="1.8667" fill="white" fillOpacity="0.08" />

      <circle cx="1.8667" cy="51.1998" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="18.2939" cy="51.1998" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="34.7209" cy="51.2002" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="50.9341" cy="51.2002" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="66.9037" cy="51.1998" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="83.3307" cy="51.1998" r="1.8667" fill="white" fillOpacity="0.08" />
      <circle cx="99.7576" cy="51.1998" r="1.8667" fill="white" fillOpacity="0.08" />
    </svg>
  )
}